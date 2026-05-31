package vu.vpn.lib.map.internal.shapes

import android.opengl.GLES20
import java.nio.ByteBuffer
import java.nio.ByteOrder
import vu.vpn.lib.map.internal.VERTEX_COMPONENT_SIZE
import vu.vpn.lib.map.internal.initArrayBuffer
import vu.vpn.lib.map.internal.initIndexBuffer
import vu.vpn.lib.map.internal.initShaderProgram

/**
 * PSYCO · esfera SÓLIDA invisível (cor do background deep-space) que escreve no
 * depth buffer ANTES do globo de pontos. Sem ela, os GL_POINTS do GlobeMesh
 * deixam "buracos" entre pixels · o usuário vê estrelas e países do hemisfério
 * oposto vazando, ficando confuso.
 *
 * Renderizada slight smaller que o globo (radius 0.985) pra os points ficarem
 * "fora" dela na superfície sem z-fighting.
 */
internal class GlobeBase(radius: Float = 0.985f, segments: Int = 64, rings: Int = 64) {

    private val shaderProgram: Int
    private val attribLocations: AttribLocations
    private val uniformLocation: UniformLocation

    private val vertexBuffer: Int
    private val indices: vu.vpn.lib.map.internal.IndexBufferWithLength

    init {
        val (positions, idxs) = buildSphere(radius, segments, rings)

        val posBuf = ByteBuffer.allocateDirect(positions.size * Float.SIZE_BYTES)
            .order(ByteOrder.nativeOrder())
        for (f in positions) posBuf.putFloat(f)
        posBuf.position(0)
        vertexBuffer = initArrayBuffer(posBuf.asFloatBuffer())

        val idxBuf = ByteBuffer.allocateDirect(idxs.size * Int.SIZE_BYTES)
            .order(ByteOrder.nativeOrder())
        for (i in idxs) idxBuf.putInt(i)
        idxBuf.position(0)
        indices = initIndexBuffer(idxBuf)

        shaderProgram = initShaderProgram(VERTEX_SHADER, FRAGMENT_SHADER)
        attribLocations = AttribLocations(GLES20.glGetAttribLocation(shaderProgram, "aVertexPosition"))
        uniformLocation = UniformLocation(
            color = GLES20.glGetUniformLocation(shaderProgram, "uColor"),
            projectionMatrix = GLES20.glGetUniformLocation(shaderProgram, "uProjectionMatrix"),
            modelViewMatrix = GLES20.glGetUniformLocation(shaderProgram, "uModelViewMatrix"),
        )
    }

    fun draw(projectionMatrix: FloatArray, viewMatrix: FloatArray, colorRgb: FloatArray) {
        GLES20.glUseProgram(shaderProgram)
        // PSYCO · desabilita cull face TEMPORARIAMENTE · garante que ambos lados da
        // esfera sejam desenhados (orientação CCW/CW da geometria gerada).
        GLES20.glDisable(GLES20.GL_CULL_FACE)
        // Escreve depth · solid sphere · default depth mask=true
        GLES20.glBindBuffer(GLES20.GL_ARRAY_BUFFER, vertexBuffer)
        GLES20.glVertexAttribPointer(
            attribLocations.vertexPosition,
            VERTEX_COMPONENT_SIZE,
            GLES20.GL_FLOAT,
            false,
            0,
            0,
        )
        GLES20.glEnableVertexAttribArray(attribLocations.vertexPosition)

        GLES20.glBindBuffer(GLES20.GL_ELEMENT_ARRAY_BUFFER, indices.indexBuffer)
        GLES20.glUniform3f(uniformLocation.color, colorRgb[0], colorRgb[1], colorRgb[2])
        GLES20.glUniformMatrix4fv(uniformLocation.projectionMatrix, 1, false, projectionMatrix, 0)
        GLES20.glUniformMatrix4fv(uniformLocation.modelViewMatrix, 1, false, viewMatrix, 0)

        GLES20.glDrawElements(GLES20.GL_TRIANGLES, indices.length, GLES20.GL_UNSIGNED_INT, 0)
        GLES20.glDisableVertexAttribArray(attribLocations.vertexPosition)
        // Restaurar cull face pra default · outras shapes esperam isso ON
        GLES20.glEnable(GLES20.GL_CULL_FACE)
    }

    private data class AttribLocations(val vertexPosition: Int)
    private data class UniformLocation(val color: Int, val projectionMatrix: Int, val modelViewMatrix: Int)

    companion object {
        private val VERTEX_SHADER =
            """
            attribute vec3 aVertexPosition;
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;

            void main(void) {
                gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
            }
            """.trimIndent()

        private val FRAGMENT_SHADER =
            """
            precision mediump float;
            uniform vec3 uColor;
            void main(void) {
                // Solid · alpha 1.0 · escreve depth full · bloqueia tudo atras
                gl_FragColor = vec4(uColor, 1.0);
            }
            """.trimIndent()

        private fun buildSphere(radius: Float, segments: Int, rings: Int): Pair<FloatArray, IntArray> {
            val positions = mutableListOf<Float>()
            val indices = mutableListOf<Int>()

            for (y in 0..rings) {
                val v = y.toFloat() / rings
                val phi = v * Math.PI.toFloat()
                for (x in 0..segments) {
                    val u = x.toFloat() / segments
                    val theta = u * 2f * Math.PI.toFloat()
                    val px = radius * Math.sin(phi.toDouble()).toFloat() * Math.cos(theta.toDouble()).toFloat()
                    val py = radius * Math.cos(phi.toDouble()).toFloat()
                    val pz = radius * Math.sin(phi.toDouble()).toFloat() * Math.sin(theta.toDouble()).toFloat()
                    positions.add(px); positions.add(py); positions.add(pz)
                }
            }

            for (y in 0 until rings) {
                for (x in 0 until segments) {
                    val a = y * (segments + 1) + x
                    val b = a + segments + 1
                    indices.add(a); indices.add(b); indices.add(a + 1)
                    indices.add(b); indices.add(b + 1); indices.add(a + 1)
                }
            }

            return positions.toFloatArray() to indices.toIntArray()
        }
    }
}
