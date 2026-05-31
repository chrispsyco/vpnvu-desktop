package vu.vpn.lib.map.internal.shapes

import android.opengl.GLES20
import java.nio.ByteBuffer
import java.nio.ByteOrder
import vu.vpn.lib.map.internal.initArrayBuffer
import vu.vpn.lib.map.internal.initShaderProgram

/**
 * PSYCO · starfield distante atrás do globo. Porta do Stars.tsx (R3F desktop):
 * dois passes (dim 1100 pontos · hero 80 pontos) gerados com seeded RNG, posicionados
 * em uma esfera grande, rotacionando lento (parallax) atrás do globo.
 *
 * Sem additive blending por enquanto · usa o alpha blending padrão do MapGLRenderer.
 */
internal class Stars(
    private val radius: Float = 9f,
    dimCount: Int = 1100,
    heroCount: Int = 80,
) {

    private val shaderProgram: Int
    private val attribPosition: Int
    private val attribSize: Int
    private val attribColor: Int
    private val uniformProj: Int
    private val uniformView: Int
    private val uniformOpacity: Int
    private val uniformSizeScale: Int

    private val dimVbo: Int
    private val heroVbo: Int
    private val dimCountValue: Int = dimCount
    private val heroCountValue: Int = heroCount

    init {
        // Build dim + hero fields com seeds fixos · layout idêntico cada launch.
        val dim = buildSpherePoints(dimCount, radius, 0xa53f01u)
        val hero = buildSpherePoints(heroCount, radius * 0.95f, 0x57c19du)

        dimVbo = uploadInterleaved(dim)
        heroVbo = uploadInterleaved(hero)

        shaderProgram = initShaderProgram(VERTEX_SHADER, FRAGMENT_SHADER)
        attribPosition = GLES20.glGetAttribLocation(shaderProgram, "aVertexPosition")
        attribSize = GLES20.glGetAttribLocation(shaderProgram, "aSize")
        attribColor = GLES20.glGetAttribLocation(shaderProgram, "aColor")
        uniformProj = GLES20.glGetUniformLocation(shaderProgram, "uProjectionMatrix")
        uniformView = GLES20.glGetUniformLocation(shaderProgram, "uModelViewMatrix")
        uniformOpacity = GLES20.glGetUniformLocation(shaderProgram, "uOpacity")
        uniformSizeScale = GLES20.glGetUniformLocation(shaderProgram, "uSizeScale")
    }

    fun draw(projectionMatrix: FloatArray, viewMatrix: FloatArray) {
        GLES20.glUseProgram(shaderProgram)
        GLES20.glDepthMask(false)
        GLES20.glUniformMatrix4fv(uniformProj, 1, false, projectionMatrix, 0)
        GLES20.glUniformMatrix4fv(uniformView, 1, false, viewMatrix, 0)

        // Pass 1: dim field
        drawCloud(dimVbo, dimCountValue, opacity = 0.55f, sizeScale = 1.4f)
        // Pass 2: hero stars
        drawCloud(heroVbo, heroCountValue, opacity = 0.95f, sizeScale = 2.6f)

        GLES20.glDepthMask(true)
    }

    private fun drawCloud(vbo: Int, count: Int, opacity: Float, sizeScale: Float) {
        GLES20.glBindBuffer(GLES20.GL_ARRAY_BUFFER, vbo)
        val stride = (3 + 1 + 3) * Float.SIZE_BYTES  // position(3) + size(1) + color(3)

        GLES20.glVertexAttribPointer(attribPosition, 3, GLES20.GL_FLOAT, false, stride, 0)
        GLES20.glEnableVertexAttribArray(attribPosition)

        GLES20.glVertexAttribPointer(attribSize, 1, GLES20.GL_FLOAT, false, stride, 3 * Float.SIZE_BYTES)
        GLES20.glEnableVertexAttribArray(attribSize)

        GLES20.glVertexAttribPointer(attribColor, 3, GLES20.GL_FLOAT, false, stride, 4 * Float.SIZE_BYTES)
        GLES20.glEnableVertexAttribArray(attribColor)

        GLES20.glUniform1f(uniformOpacity, opacity)
        GLES20.glUniform1f(uniformSizeScale, sizeScale)

        GLES20.glDrawArrays(GLES20.GL_POINTS, 0, count)

        GLES20.glDisableVertexAttribArray(attribPosition)
        GLES20.glDisableVertexAttribArray(attribSize)
        GLES20.glDisableVertexAttribArray(attribColor)
    }

    private fun uploadInterleaved(data: FloatArray): Int {
        val buf = ByteBuffer.allocateDirect(data.size * Float.SIZE_BYTES)
            .order(ByteOrder.nativeOrder())
        for (f in data) buf.putFloat(f)
        buf.position(0)
        return initArrayBuffer(buf.asFloatBuffer())
    }

    companion object {
        private val VERTEX_SHADER =
            """
            attribute vec3 aVertexPosition;
            attribute float aSize;
            attribute vec3 aColor;
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            uniform float uSizeScale;

            varying vec3 vColor;

            void main(void) {
                vColor = aColor;
                vec4 viewPos = uModelViewMatrix * vec4(aVertexPosition, 1.0);
                gl_Position = uProjectionMatrix * viewPos;
                // Tamanho diminui com distância (size attenuation)
                gl_PointSize = aSize * uSizeScale * (300.0 / max(1.0, -viewPos.z));
            }
            """.trimIndent()

        private val FRAGMENT_SHADER =
            """
            precision mediump float;
            varying vec3 vColor;
            uniform float uOpacity;

            void main(void) {
                vec2 cxy = 2.0 * gl_PointCoord - 1.0;
                float r2 = dot(cxy, cxy);
                if (r2 > 1.0) discard;
                float alpha = 1.0 - smoothstep(0.4, 1.0, r2);
                gl_FragColor = vec4(vColor, alpha * uOpacity);
            }
            """.trimIndent()

        // Seeded RNG mulberry32 (igual ao desktop · layout idêntico)
        private class Mulberry32(seed: UInt) {
            private var state = seed
            fun nextFloat(): Float {
                state = (state + 0x6d2b79f5u)
                var t = state
                t = (t xor (t shr 15)) * (t or 1u)
                t = t xor (t + ((t xor (t shr 7)) * (t or 61u)))
                return ((t xor (t shr 14)).toLong() and 0xFFFFFFFFL).toFloat() / 4294967296f
            }
        }

        /** Build interleaved [px,py,pz, size, r,g,b] · count points em esfera de radius. */
        private fun buildSpherePoints(count: Int, radius: Float, seed: UInt): FloatArray {
            val rng = Mulberry32(seed)
            val out = FloatArray(count * 7)
            for (i in 0 until count) {
                val u = rng.nextFloat()
                val v = rng.nextFloat()
                val theta = 2.0 * Math.PI * u
                val phi = Math.acos((2 * v - 1).toDouble())
                val x = (radius * Math.sin(phi) * Math.cos(theta)).toFloat()
                val y = (radius * Math.sin(phi) * Math.sin(theta)).toFloat()
                val z = (radius * Math.cos(phi)).toFloat()

                val size = 0.5f + rng.nextFloat() * 1.6f

                val warm = rng.nextFloat() < 0.15f
                val r: Float; val g: Float; val b: Float
                if (warm) {
                    r = 1.0f
                    g = 0.92f + rng.nextFloat() * 0.05f
                    b = 0.78f + rng.nextFloat() * 0.1f
                } else {
                    r = 0.72f + rng.nextFloat() * 0.12f
                    g = 0.86f + rng.nextFloat() * 0.1f
                    b = 0.95f + rng.nextFloat() * 0.05f
                }

                val base = i * 7
                out[base] = x; out[base + 1] = y; out[base + 2] = z
                out[base + 3] = size
                out[base + 4] = r; out[base + 5] = g; out[base + 6] = b
            }
            return out
        }
    }
}
