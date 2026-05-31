package vu.vpn.lib.map.internal

import android.content.res.Resources
import android.opengl.GLES20
import android.opengl.GLSurfaceView
import android.opengl.Matrix
import androidx.collection.LruCache
import javax.microedition.khronos.egl.EGLConfig
import javax.microedition.khronos.opengles.GL10
import kotlin.math.tan
import vu.vpn.lib.map.data.CameraPosition
import vu.vpn.lib.map.data.LocationMarkerColors
import vu.vpn.lib.map.data.MapViewState
import vu.vpn.lib.map.internal.shapes.Atmosphere
import vu.vpn.lib.map.internal.shapes.Globe
import vu.vpn.lib.map.internal.shapes.GlobeBase
import vu.vpn.lib.map.internal.shapes.LocationMarker
import vu.vpn.lib.map.internal.shapes.Stars
import vu.vpn.lib.model.toRadians

internal class MapGLRenderer(private val resources: Resources) : GLSurfaceView.Renderer {

    private lateinit var globe: Globe
    private lateinit var globeBase: GlobeBase
    private lateinit var atmosphere: Atmosphere
    private lateinit var stars: Stars

    // Deep space color usado pelo GlobeBase pra "matar" o que está atrás do globo.
    // Igual ao glClearColor (componentes lineares 0..1).
    private val deepSpaceRgb = floatArrayOf(0.012f, 0.047f, 0.059f)

    // Due to location markers themselves containing colors we cache them to avoid recreating them
    // for every draw call.
    private val markerCache: LruCache<LocationMarkerColors, LocationMarker> =
        object : LruCache<LocationMarkerColors, LocationMarker>(100) {
            override fun entryRemoved(
                evicted: Boolean,
                key: LocationMarkerColors,
                oldValue: LocationMarker,
                newValue: LocationMarker?,
            ) {
                oldValue.onRemove()
            }
        }

    private lateinit var viewState: MapViewState

    override fun onSurfaceCreated(unused: GL10, config: EGLConfig) {
        globe = Globe(resources)
        globeBase = GlobeBase()
        atmosphere = Atmosphere()
        stars = Stars()
        markerCache.evictAll()
        initGLOptions()
    }

    private fun initGLOptions() {
        // Enable cull face (To not draw the backside of triangles)
        GLES20.glEnable(GLES20.GL_CULL_FACE)
        GLES20.glCullFace(GLES20.GL_BACK)

        // Enable blend
        GLES20.glEnable(GLES20.GL_BLEND)
        GLES20.glBlendFunc(GLES20.GL_SRC_ALPHA, GLES20.GL_ONE_MINUS_SRC_ALPHA)
    }

    private val projectionMatrix = newIdentityMatrix()

    override fun onDrawFrame(gl10: GL10) {
        // Clear canvas
        clear()

        val viewMatrix = newIdentityMatrix()

        // Adjust zoom & vertical bias
        val yOffset = toOffsetY(viewState.cameraPosition)
        Matrix.translateM(viewMatrix, 0, 0f, yOffset, -viewState.cameraPosition.zoom)

        // PSYCO · stars · parallax 1/3 da rotação do globo · sensação de profundidade
        val starsViewMatrix = newIdentityMatrix()
        Matrix.translateM(starsViewMatrix, 0, 0f, yOffset, -viewState.cameraPosition.zoom)
        Matrix.rotateM(
            starsViewMatrix,
            0,
            viewState.cameraPosition.latLong.latitude.value * 0.33f,
            1f,
            0f,
            0f,
        )
        Matrix.rotateM(
            starsViewMatrix,
            0,
            viewState.cameraPosition.latLong.longitude.value * 0.33f,
            0f,
            -1f,
            0f,
        )
        // Stars NÃO usam culling · esfera vista de dentro
        GLES20.glDisable(GLES20.GL_CULL_FACE)
        stars.draw(projectionMatrix, starsViewMatrix)
        GLES20.glEnable(GLES20.GL_CULL_FACE)

        // Rotate to match the camera position
        Matrix.rotateM(viewMatrix, 0, viewState.cameraPosition.latLong.latitude.value, 1f, 0f, 0f)
        Matrix.rotateM(viewMatrix, 0, viewState.cameraPosition.latLong.longitude.value, 0f, -1f, 0f)

        // PSYCO · GlobeBase · esfera sólida deep-space que escreve depth ANTES dos
        // points · oclui o hemisfério oposto (paises + stars que tavam vazando entre
        // os pontos da landmass).
        globeBase.draw(projectionMatrix, viewMatrix, deepSpaceRgb)

        // PSYCO · atmosphere shell · halo cyan ao redor antes do globo
        atmosphere.draw(projectionMatrix, viewMatrix, viewState.globeColors.contourColorArray)

        globe.draw(projectionMatrix, viewMatrix, viewState.globeColors)

        // Draw location markers
        viewState.locationMarker.forEach {
            val marker =
                markerCache[it.colors]
                    ?: LocationMarker(it.colors).also { markerCache.put(it.colors, it) }

            marker.draw(projectionMatrix, viewMatrix, it.latLong, it.size)
        }
    }

    private fun toOffsetY(cameraPosition: CameraPosition): Float {
        val percent = cameraPosition.verticalBias
        val z = cameraPosition.zoom - 1f
        // Calculate the size of the plane at the current z position
        val planeSizeY = tan(FIELD_OF_VIEW.toRadians() / 2f) * z * 2f

        // Calculate the start of the plane
        val planeStartY = planeSizeY / 2f

        // Return offset based on the bias
        return planeStartY - planeSizeY * percent
    }

    private fun clear() {
        // PSYCO · deep-space bg #030C0F (era preto puro 0,0,0)
        GLES20.glClearColor(0.012f, 0.047f, 0.059f, 1.0f)
        GLES20.glClearDepthf(1.0f)
        GLES20.glEnable(GLES20.GL_DEPTH_TEST)
        GLES20.glDepthFunc(GLES20.GL_LEQUAL)

        GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT or GLES20.GL_DEPTH_BUFFER_BIT)
    }

    override fun onSurfaceChanged(unused: GL10, width: Int, height: Int) {
        GLES20.glViewport(0, 0, width, height)

        val ratio: Float = width.toFloat() / height.toFloat()

        if (ratio.isFinite()) {
            Matrix.perspectiveM(
                projectionMatrix,
                0,
                FIELD_OF_VIEW,
                ratio,
                PERSPECTIVE_Z_NEAR,
                PERSPECTIVE_Z_FAR,
            )
        }
    }

    fun setViewState(viewState: MapViewState) {
        this.viewState = viewState
    }

    companion object {
        private const val PERSPECTIVE_Z_NEAR = 0.05f
        // PSYCO · aumentado de 10f pra 25f pra que o starfield (radius 9) caiba no frustum
        private const val PERSPECTIVE_Z_FAR = 25f
        private const val FIELD_OF_VIEW = 70f
    }
}
