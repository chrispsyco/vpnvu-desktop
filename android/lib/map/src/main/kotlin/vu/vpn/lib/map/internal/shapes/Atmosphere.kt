package vu.vpn.lib.map.internal.shapes

import android.opengl.GLES20
import java.nio.ByteBuffer
import java.nio.ByteOrder
import vu.vpn.lib.map.internal.VERTEX_COMPONENT_SIZE
import vu.vpn.lib.map.internal.initArrayBuffer
import vu.vpn.lib.map.internal.initIndexBuffer
import vu.vpn.lib.map.internal.initShaderProgram

/**
 * PSYCO · halo cyan ao redor do globo. Porta direta do Atmosphere.tsx (R3F desktop):
 * esfera maior renderizada de dentro pra fora (BackSide via culling GL_FRONT) com
 * fragment shader fresnel · pixels rasantes recebem mais alpha, dando o efeito de
 * ozonio brilhante difundindo no fundo.
 *
 * Cor: #5BC8DA (brand glow VPN.vu).
 */
internal class Atmosphere(radius: Float = 1.7f, segments: Int = 64, rings: Int = 64) {

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

        // Atmosphere é renderizado de DENTRO pra fora (BackSide) · culling vira GL_FRONT
        GLES20.glCullFace(GLES20.GL_FRONT)
        // Não escreve depth · não bloqueia o que vem depois (globe, markers)
        GLES20.glDepthMask(false)

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

        // Restaurar estado padrão
        GLES20.glCullFace(GLES20.GL_BACK)
        GLES20.glDepthMask(true)
    }

    private data class AttribLocations(val vertexPosition: Int)
    private data class UniformLocation(val color: Int, val projectionMatrix: Int, val modelViewMatrix: Int)

    companion object {
        private val VERTEX_SHADER =
            """
            attribute vec3 aVertexPosition;
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            varying vec3 vViewPos;

            void main(void) {
                vec4 viewPos = uModelViewMatrix * vec4(aVertexPosition, 1.0);
                vViewPos = viewPos.xyz;
                gl_Position = uProjectionMatrix * viewPos;
            }
            """.trimIndent()

        private val FRAGMENT_SHADER =
            """
            precision mediump float;
            uniform vec3 uColor;
            varying vec3 vViewPos;

            void main(void) {
                // Pixels rasantes (z perto de 0) recebem mais halo · expoente 5 dá curva suave.
                vec3 dir = normalize(vViewPos);
                float rim = pow(1.0 - abs(dir.z), 5.0);
                gl_FragColor = vec4(uColor, rim * 0.85);
            }
            """.trimIndent()

        /** Gera UV sphere com `segments` colunas e `rings` linhas. */
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
