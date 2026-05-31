package vu.vpn.lib.map.internal.shapes

import android.content.res.Resources
import android.opengl.GLES20
import java.nio.ByteBuffer
import vu.vpn.lib.map.R
import vu.vpn.lib.map.data.GlobeColors
import vu.vpn.lib.map.internal.IndexBufferWithLength
import vu.vpn.lib.map.internal.VERTEX_COMPONENT_SIZE
import vu.vpn.lib.map.internal.initArrayBuffer
import vu.vpn.lib.map.internal.initIndexBuffer
import vu.vpn.lib.map.internal.initShaderProgram

/**
 * PSYCO · porta visual do GlobeMesh.tsx (R3F desktop). Renderiza a landmass
 * como pontos brilhantes com glow circular, fresnel na borda, fade no
 * hemisfério oposto · sem contour line, sem ocean (GlobeBase cobre por baixo).
 */
internal class Globe(resources: Resources) {

    private val landShaderProgram: Int
    private val attribLocations: AttribLocations
    private val uniformLocation: UniformLocation

    private val landIndices: IndexBufferWithLength
    private val landVertexBuffer: Int

    init {
        val landPosStream = resources.openRawResource(R.raw.land_positions)
        val landVertByteArray = landPosStream.use { it.readBytes() }
        val landVertByteBuffer = ByteBuffer.wrap(landVertByteArray)
        landVertexBuffer = initArrayBuffer(landVertByteBuffer)

        val landTriangleIndicesStream = resources.openRawResource(R.raw.land_triangle_indices)
        val landTriangleIndicesByteArray = landTriangleIndicesStream.use { it.readBytes() }
        val landTriangleIndicesBuffer = ByteBuffer.wrap(landTriangleIndicesByteArray)
        landIndices = initIndexBuffer(landTriangleIndicesBuffer)

        landShaderProgram = initShaderProgram(landVertexShader, landFragmentShader)

        attribLocations =
            AttribLocations(GLES20.glGetAttribLocation(landShaderProgram, "aVertexPosition"))
        uniformLocation =
            UniformLocation(
                brand = GLES20.glGetUniformLocation(landShaderProgram, "uBrand"),
                brandGlow = GLES20.glGetUniformLocation(landShaderProgram, "uBrandGlow"),
                pointSize = GLES20.glGetUniformLocation(landShaderProgram, "uPointSize"),
                projectionMatrix = GLES20.glGetUniformLocation(landShaderProgram, "uProjectionMatrix"),
                modelViewMatrix = GLES20.glGetUniformLocation(landShaderProgram, "uModelViewMatrix"),
            )
    }

    fun draw(
        projectionMatrix: FloatArray,
        viewMatrix: FloatArray,
        colors: GlobeColors,
        @Suppress("UNUSED_PARAMETER") contourWidth: Float = 1f,
    ) {
        GLES20.glUseProgram(landShaderProgram)

        GLES20.glBindBuffer(GLES20.GL_ARRAY_BUFFER, landVertexBuffer)
        GLES20.glVertexAttribPointer(
            attribLocations.vertexPosition,
            VERTEX_COMPONENT_SIZE,
            GLES20.GL_FLOAT,
            false,
            0,
            0,
        )
        GLES20.glEnableVertexAttribArray(attribLocations.vertexPosition)

        GLES20.glBindBuffer(GLES20.GL_ELEMENT_ARRAY_BUFFER, landIndices.indexBuffer)
        GLES20.glUniform3f(
            uniformLocation.brand,
            colors.landColorArray[0],
            colors.landColorArray[1],
            colors.landColorArray[2],
        )
        GLES20.glUniform3f(
            uniformLocation.brandGlow,
            colors.contourColorArray[0],
            colors.contourColorArray[1],
            colors.contourColorArray[2],
        )
        GLES20.glUniform1f(uniformLocation.pointSize, POINT_SIZE)
        GLES20.glUniformMatrix4fv(uniformLocation.projectionMatrix, 1, false, projectionMatrix, 0)
        GLES20.glUniformMatrix4fv(uniformLocation.modelViewMatrix, 1, false, viewMatrix, 0)

        GLES20.glDrawElements(
            GLES20.GL_POINTS,
            landIndices.length,
            GLES20.GL_UNSIGNED_INT,
            0,
        )
        GLES20.glDisableVertexAttribArray(attribLocations.vertexPosition)
    }

    private data class AttribLocations(val vertexPosition: Int)

    private data class UniformLocation(
        val brand: Int,
        val brandGlow: Int,
        val pointSize: Int,
        val projectionMatrix: Int,
        val modelViewMatrix: Int,
    )

    companion object {
        // Point size em pixels · grande o suficiente pra cobrir a landmass sem deixar
        // buracos enormes mas pequeno o suficiente pra preservar detalhe nas costas.
        private const val POINT_SIZE = 8.0f

        // Vertex: deriva o normal da view position. Como o globo é uma esfera centrada
        // na origem em model space, a posição do vertex (normalizada) JÁ É o normal.
        // Aplicamos mat3 do modelView pra rotacionar o normal pra view space.
        private val landVertexShader =
            """
            attribute vec3 aVertexPosition;
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            uniform float uPointSize;
            varying vec3 vNormalView;

            void main(void) {
                vec4 viewPos = uModelViewMatrix * vec4(aVertexPosition, 1.0);
                vNormalView = normalize(mat3(uModelViewMatrix) * normalize(aVertexPosition));
                gl_Position = uProjectionMatrix * viewPos;
                gl_PointSize = uPointSize;
            }
            """
                .trimIndent()

        // Fragment: ponto circular com borda suave, mix brand → glow no fresnel,
        // fade total no hemisfério oposto (vNormalView.z negativo · face traseira).
        private val landFragmentShader =
            """
            precision mediump float;
            uniform vec3 uBrand;
            uniform vec3 uBrandGlow;
            varying vec3 vNormalView;

            void main(void) {
                vec2 cxy = 2.0 * gl_PointCoord - 1.0;
                float r2 = dot(cxy, cxy);
                if (r2 > 1.0) discard;
                float alpha = 1.0 - smoothstep(0.55, 1.0, r2);

                float fresnel = pow(1.0 - abs(vNormalView.z), 2.0);
                vec3 color = mix(uBrand, uBrandGlow, 0.4);
                color += uBrandGlow * fresnel * 0.5;

                // Hemisfério oposto · descarta · vNormalView.z negativo = face de tras
                if (vNormalView.z < 0.0) discard;
                float front = smoothstep(0.0, 0.35, vNormalView.z);

                gl_FragColor = vec4(color, alpha * front);
            }
            """
                .trimIndent()
    }
}
