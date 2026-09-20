import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

// Floating skill-to-requirement network nodes & particles
function NeuralParticles() {
  const count = 45
  const pointsRef = useRef<THREE.Points>(null)
  const linesRef = useRef<THREE.LineSegments>(null)

  const [positions, linePositions] = useMemo(() => {
    const coords: number[] = []
    for (let i = 0; i < count; i++) {
      coords.push(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6
      )
    }

    // Connect close nodes to form a neural skill graph
    const lines: number[] = []
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = coords[i * 3] - coords[j * 3]
        const dy = coords[i * 3 + 1] - coords[j * 3 + 1]
        const dz = coords[i * 3 + 2] - coords[j * 3 + 2]
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
        if (dist < 3.2) {
          lines.push(
            coords[i * 3], coords[i * 3 + 1], coords[i * 3 + 2],
            coords[j * 3], coords[j * 3 + 1], coords[j * 3 + 2]
          )
        }
      }
    }

    return [new Float32Array(coords), new Float32Array(lines)]
  }, [count])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.04
      pointsRef.current.rotation.x = Math.sin(time * 0.03) * 0.1
    }
    if (linesRef.current) {
      linesRef.current.rotation.y = time * 0.04
      linesRef.current.rotation.x = Math.sin(time * 0.03) * 0.1
    }
  })

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          color="#38bdf8"
          transparent
          opacity={0.85}
          sizeAttenuation
        />
      </points>

      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#6366f1"
          transparent
          opacity={0.25}
        />
      </lineSegments>
    </group>
  )
}

export function ThreeBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-60">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 60 }}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      >
        <ambientLight intensity={0.6} />
        <NeuralParticles />
      </Canvas>
    </div>
  )
}
