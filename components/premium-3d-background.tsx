"use client"

import { useEffect, useRef } from "react"

interface Particle3D {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  size: number
  opacity: number
  color: string
  type: "sphere" | "ring" | "blob"
  phase: number
}

export function Premium3DBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle3D[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: false })
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const boldColors = [
      "rgba(99, 102, 241, 0.8)", // Indigo
      "rgba(139, 92, 246, 0.8)", // Purple
      "rgba(236, 72, 153, 0.8)", // Pink
      "rgba(251, 146, 60, 0.8)", // Orange
      "rgba(59, 130, 246, 0.8)", // Blue
      "rgba(16, 185, 129, 0.8)", // Emerald
    ]

    particlesRef.current = Array.from({ length: 25 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 800 - 400,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      vz: (Math.random() - 0.5) * 0.3,
      size: 60 + Math.random() * 180,
      opacity: 0.4 + Math.random() * 0.4,
      color: boldColors[Math.floor(Math.random() * boldColors.length)],
      type: (["sphere", "ring", "blob"] as const)[Math.floor(Math.random() * 3)],
      phase: Math.random() * Math.PI * 2,
    }))

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 100
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 100
    }
    window.addEventListener("mousemove", handleMouseMove)

    const animate = () => {
      timeRef.current += 0.01

      const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      bgGradient.addColorStop(0, "#e0e7ff") // Light indigo
      bgGradient.addColorStop(0.25, "#ddd6fe") // Light purple
      bgGradient.addColorStop(0.5, "#fae8ff") // Light pink
      bgGradient.addColorStop(0.75, "#fef3c7") // Light yellow
      bgGradient.addColorStop(1, "#e0f2fe") // Light blue
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.strokeStyle = "rgba(99, 102, 241, 0.15)"
      ctx.lineWidth = 1
      const gridSize = 60
      const offsetX = (timeRef.current * 20) % gridSize
      const offsetY = (timeRef.current * 15) % gridSize

      for (let x = -gridSize; x < canvas.width + gridSize; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x + offsetX, 0)
        ctx.lineTo(x + offsetX, canvas.height)
        ctx.stroke()
      }
      for (let y = -gridSize; y < canvas.height + gridSize; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y + offsetY)
        ctx.lineTo(canvas.width, y + offsetY)
        ctx.stroke()
      }

      const sorted = [...particlesRef.current].sort((a, b) => b.z - a.z)

      sorted.forEach((p) => {
        p.x += p.vx + mouseRef.current.x * 0.02
        p.y += p.vy + mouseRef.current.y * 0.02
        p.z += p.vz
        p.phase += 0.015

        // Wrap around screen
        if (p.x < -p.size) p.x = canvas.width + p.size
        if (p.x > canvas.width + p.size) p.x = -p.size
        if (p.y < -p.size) p.y = canvas.height + p.size
        if (p.y > canvas.height + p.size) p.y = -p.size
        if (p.z < -400) p.z = 400
        if (p.z > 400) p.z = -400

        const scale = 1 + p.z / 600
        const size = p.size * scale * (1 + Math.sin(p.phase) * 0.2)
        const opacity = p.opacity * (1 - Math.abs(p.z) / 600)

        ctx.save()
        ctx.globalAlpha = opacity

        if (p.type === "sphere") {
          const gradient = ctx.createRadialGradient(p.x - size * 0.3, p.y - size * 0.3, 0, p.x, p.y, size)
          gradient.addColorStop(0, p.color.replace("0.8", "1"))
          gradient.addColorStop(0.5, p.color)
          gradient.addColorStop(1, p.color.replace("0.8", "0.2"))
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
          ctx.fill()

          // White highlight
          const highlight = ctx.createRadialGradient(
            p.x - size * 0.4,
            p.y - size * 0.4,
            0,
            p.x - size * 0.3,
            p.y - size * 0.3,
            size * 0.6,
          )
          highlight.addColorStop(0, "rgba(255, 255, 255, 0.6)")
          highlight.addColorStop(1, "rgba(255, 255, 255, 0)")
          ctx.fillStyle = highlight
          ctx.beginPath()
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
          ctx.fill()
        } else if (p.type === "ring") {
          ctx.strokeStyle = p.color
          ctx.lineWidth = size * 0.15
          ctx.beginPath()
          ctx.arc(p.x, p.y, size * 0.7, 0, Math.PI * 2)
          ctx.stroke()

          ctx.lineWidth = size * 0.08
          ctx.strokeStyle = p.color.replace("0.8", "0.5")
          ctx.beginPath()
          ctx.arc(p.x, p.y, size * 1.1, 0, Math.PI * 2)
          ctx.stroke()
        } else {
          ctx.fillStyle = p.color
          ctx.beginPath()
          for (let i = 0; i <= 8; i++) {
            const angle = (i / 8) * Math.PI * 2
            const wobble = Math.sin(timeRef.current * 3 + angle * 2 + p.phase) * 0.25
            const r = size * (0.8 + wobble)
            const x = p.x + Math.cos(angle) * r
            const y = p.y + Math.sin(angle) * r
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.closePath()
          ctx.fill()
        }

        ctx.restore()
      })

      ctx.save()
      ctx.globalAlpha = 0.15
      for (let i = 0; i < 3; i++) {
        const angle = timeRef.current * 0.5 + (i * Math.PI * 2) / 3
        const gradient = ctx.createLinearGradient(
          canvas.width / 2,
          canvas.height / 2,
          canvas.width / 2 + Math.cos(angle) * canvas.width,
          canvas.height / 2 + Math.sin(angle) * canvas.height,
        )
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.3)")
        gradient.addColorStop(0.5, "rgba(139, 92, 246, 0.2)")
        gradient.addColorStop(1, "rgba(236, 72, 153, 0)")
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      ctx.restore()

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        mixBlendMode: "normal",
      }}
    />
  )
}
