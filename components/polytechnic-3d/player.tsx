"use client"

import { useRef, useEffect, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useKeyboardControls } from "@react-three/drei"
import * as THREE from "three"

interface PlayerProps {
  controlsLocked: boolean
  onInteractionPrompt: (prompt: string | null) => void
  onPlayerMove?: (position: THREE.Vector3) => void
  onDirectionChange?: (direction: string) => void
}

export function Player({ controlsLocked, onInteractionPrompt, onPlayerMove, onDirectionChange }: PlayerProps) {
  const { camera } = useThree()
  const playerRef = useRef({
    position: new THREE.Vector3(0, 1.6, -25),
    velocity: new THREE.Vector3(),
    canJump: true,
    jumpCount: 0,
    isSliding: false,
    slideTime: 0,
  })
  const [, getKeys] = useKeyboardControls()
  const [movementState, setMovementState] = useState<"idle" | "walking" | "running" | "jumping" | "sliding">("idle")

  const walls = [
    // Main hall walls
    { minX: -15, maxX: 15, minZ: -10, maxZ: -9.5, minY: 0, maxY: 6 },
    { minX: -15, maxX: 15, minZ: 9.5, maxZ: 10, minY: 0, maxY: 6 },
    { minX: -15.5, maxX: -15, minZ: -10, maxZ: 10, minY: 0, maxY: 6 },
    { minX: 15, maxX: 15.5, minZ: -10, maxZ: 10, minY: 0, maxY: 6 },

    // Building exterior walls
    { minX: -16, maxX: 16, minZ: -15.5, maxZ: -15, minY: 0, maxY: 10 },

    // Bookshelves as obstacles
    { minX: 14.5, maxX: 15.5, minZ: 14, maxZ: 16, minY: 0, maxY: 2 },
    { minX: 14.5, maxX: 15.5, minZ: 19, maxZ: 21, minY: 0, maxY: 2 },
    { minX: 14.5, maxX: 15.5, minZ: 24, maxZ: 26, minY: 0, maxY: 2 },
  ]

  const checkCollision = (newPosition: THREE.Vector3) => {
    const playerRadius = 0.5

    for (const wall of walls) {
      const closestX = Math.max(wall.minX, Math.min(newPosition.x, wall.maxX))
      const closestZ = Math.max(wall.minZ, Math.min(newPosition.z, wall.maxZ))

      const distanceX = newPosition.x - closestX
      const distanceZ = newPosition.z - closestZ
      const distanceSquared = distanceX * distanceX + distanceZ * distanceZ

      if (distanceSquared < playerRadius * playerRadius && newPosition.y >= wall.minY && newPosition.y <= wall.maxY) {
        return true // Collision detected
      }
    }
    return false
  }

  const getCardinalDirection = (angle: number) => {
    angle = ((angle % 360) + 360) % 360

    if (angle >= 337.5 || angle < 22.5) return "N"
    if (angle >= 22.5 && angle < 67.5) return "NE"
    if (angle >= 67.5 && angle < 112.5) return "E"
    if (angle >= 112.5 && angle < 157.5) return "SE"
    if (angle >= 157.5 && angle < 202.5) return "S"
    if (angle >= 202.5 && angle < 247.5) return "SW"
    if (angle >= 247.5 && angle < 292.5) return "W"
    if (angle >= 292.5 && angle < 337.5) return "NW"
    return "N"
  }

  useEffect(() => {
    camera.position.set(0, 1.6, -25)
  }, [camera])

  useFrame((state, delta) => {
    if (controlsLocked) return

    const keys = getKeys()
    const player = playerRef.current

    const maxSpeed = keys.run ? 10 : 5
    const acceleration = keys.run ? 30 : 18
    const deceleration = 0.88

    const direction = new THREE.Vector3()
    camera.getWorldDirection(direction)
    direction.y = 0
    direction.normalize()

    const right = new THREE.Vector3()
    right.crossVectors(camera.up, direction).normalize()

    const cameraAngle = Math.atan2(direction.x, direction.z) * (180 / Math.PI)
    const cardinalDir = getCardinalDirection(cameraAngle)
    if (onDirectionChange) {
      onDirectionChange(cardinalDir)
    }

    // Handle sliding
    if (keys.run && keys.backward && !player.isSliding && player.canJump) {
      player.isSliding = true
      player.slideTime = 0.6
      player.velocity.add(direction.multiplyScalar(-18))
      setMovementState("sliding")
    }

    if (player.isSliding) {
      player.slideTime -= delta
      if (player.slideTime <= 0) {
        player.isSliding = false
      }
    }

    if (!player.isSliding) {
      const moveDir = new THREE.Vector3()

      if (keys.forward) moveDir.add(direction)
      if (keys.backward) moveDir.add(direction.clone().negate())
      if (keys.left) moveDir.add(right)
      if (keys.right) moveDir.add(right.clone().negate())

      if (moveDir.length() > 0) {
        moveDir.normalize()
        player.velocity.x += moveDir.x * acceleration * delta
        player.velocity.z += moveDir.z * acceleration * delta

        const horizontalSpeed = Math.sqrt(player.velocity.x ** 2 + player.velocity.z ** 2)
        if (horizontalSpeed > maxSpeed) {
          const scale = maxSpeed / horizontalSpeed
          player.velocity.x *= scale
          player.velocity.z *= scale
        }

        setMovementState(keys.run ? "running" : "walking")
      } else {
        setMovementState("idle")
      }
    }

    // Double jump with improved physics
    if (keys.jump && player.jumpCount < 2) {
      if (player.canJump) {
        player.velocity.y = 7
        player.jumpCount++
        player.canJump = false
        setMovementState("jumping")

        setTimeout(() => {
          player.canJump = true
        }, 180)
      }
    }

    player.velocity.y -= 22 * delta

    const newPosition = player.position.clone().add(player.velocity.clone().multiplyScalar(delta))

    // Check collisions before updating position
    if (!checkCollision(newPosition)) {
      player.position.copy(newPosition)
    } else {
      // If collision, stop horizontal movement but allow vertical
      player.velocity.x *= 0.5
      player.velocity.z *= 0.5
      player.position.y += player.velocity.y * delta
    }

    // Floor collision
    if (player.position.y < 1.6) {
      player.position.y = 1.6
      player.velocity.y = 0
      player.jumpCount = 0
      if (movementState === "jumping") {
        setMovementState("idle")
      }
    }

    player.position.x = Math.max(-40, Math.min(40, player.position.x))
    player.position.z = Math.max(-40, Math.min(40, player.position.z))
    player.position.y = Math.max(1.6, Math.min(20, player.position.y))

    player.velocity.x *= deceleration
    player.velocity.z *= deceleration

    const targetPos = player.position.clone()
    camera.position.lerp(targetPos, 0.2)

    if (onPlayerMove) {
      onPlayerMove(player.position.clone())
    }
  })

  return null
}
