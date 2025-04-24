"use client"

import { useEffect, useRef } from "react"

export default function NetworkMap({ locationData, networkParams, throughput }) {
    const canvasRef = useRef(null)

    useEffect(() => {
        if (!canvasRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")

        // Set canvas dimensions
        const setCanvasDimensions = () => {
            const parent = canvas.parentElement
            canvas.width = parent.clientWidth
            canvas.height = parent.clientHeight
        }

        setCanvasDimensions()
        window.addEventListener("resize", setCanvasDimensions)

        // Draw the map
        const drawMap = () => {
            const { width, height } = canvas

            // Clear canvas
            ctx.clearRect(0, 0, width, height)

            // Draw hexagonal background pattern
            drawHexagonalPattern()

            // Draw network nodes
            const nodes = generateNetworkNodes()
            drawNetworkNodes(nodes)

            // Draw connections between nodes
            drawConnections(nodes)

            // Draw animated data flow
            drawDataFlow(nodes)

            // Request next frame
            requestAnimationFrame(drawMap)
        }

        // Generate network nodes
        const generateNetworkNodes = () => {
            const { width, height } = canvas
            const centerX = width / 2
            const centerY = height / 2

            // Create main nodes
            return [
                { id: "server", x: width * 0.2, y: height * 0.5, type: "server", label: "SERVER" },
                { id: "router", x: width * 0.4, y: height * 0.3, type: "router", label: "ROUTER" },
                { id: "tower", x: width * 0.6, y: height * 0.4, type: "tower", label: "TOWER" },
                { id: "device", x: width * 0.8, y: height * 0.6, type: "device", label: "DEVICE", active: true },
            ]
        }

        // Draw hexagonal background pattern
        const drawHexagonalPattern = () => {
            const { width, height } = canvas
            const hexSize = 15
            const hexHeight = hexSize * Math.sqrt(3)
            const hexWidth = hexSize * 2

            ctx.strokeStyle = "oklch(var(--primary) / 0.1)"
            ctx.lineWidth = 0.5

            for (let y = -hexHeight; y < height + hexHeight; y += hexHeight) {
                for (let x = -hexWidth; x < width + hexWidth; x += hexWidth * 1.5) {
                    const offsetY = (Math.floor(x / (hexWidth * 1.5)) % 2) * (hexHeight / 2)
                    drawHexagon(x, y + offsetY, hexSize)
                }
            }
        }

        // Draw a single hexagon
        const drawHexagon = (x, y, size) => {
            ctx.beginPath()
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i
                const hx = x + size * Math.cos(angle)
                const hy = y + size * Math.sin(angle)
                if (i === 0) ctx.moveTo(hx, hy)
                else ctx.lineTo(hx, hy)
            }
            ctx.closePath()
            ctx.stroke()
        }

        // Draw network nodes
        const drawNetworkNodes = (nodes) => {
            nodes.forEach((node) => {
                const { x, y, type, label, active } = node

                // Draw glow for active nodes
                if (active) {
                    ctx.beginPath()
                    ctx.arc(x, y, 20, 0, Math.PI * 2)
                    ctx.fillStyle = "oklch(var(--primary) / 0.2)"
                    ctx.fill()

                    // Pulsing effect
                    const time = Date.now() / 1000
                    const pulseSize = 25 + Math.sin(time * 2) * 5
                    ctx.beginPath()
                    ctx.arc(x, y, pulseSize, 0, Math.PI * 2)
                    ctx.strokeStyle = "oklch(var(--primary) / 0.3)"
                    ctx.lineWidth = 2
                    ctx.stroke()
                }

                // Draw node
                ctx.beginPath()
                ctx.arc(x, y, 12, 0, Math.PI * 2)
                ctx.fillStyle = active ? "oklch(var(--primary))" : "oklch(var(--primary) / 0.7)"
                ctx.fill()

                // Draw icon based on type
                ctx.fillStyle = "#fff"
                ctx.font = "10px Arial"
                ctx.textAlign = "center"
                ctx.textBaseline = "middle"

                let icon = ""
                switch (type) {
                    case "server":
                        icon = "⋮"
                        break
                    case "router":
                        icon = "⇄"
                        break
                    case "tower":
                        icon = "▲"
                        break
                    case "device":
                        icon = "◉"
                        break
                }

                ctx.fillText(icon, x, y)

                // Draw label
                ctx.font = "10px Arial"
                ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
                ctx.fillText(label, x, y + 25)
            })
        }

        // Draw connections between nodes
        const drawConnections = (nodes) => {
            // Define connections
            const connections = [
                { from: "server", to: "router" },
                { from: "router", to: "tower" },
                { from: "tower", to: "device" },
            ]

            connections.forEach((conn) => {
                const fromNode = nodes.find((n) => n.id === conn.from)
                const toNode = nodes.find((n) => n.id === conn.to)

                if (fromNode && toNode) {
                    // Draw connection line
                    ctx.beginPath()
                    ctx.moveTo(fromNode.x, fromNode.y)
                    ctx.lineTo(toNode.x, toNode.y)
                    ctx.strokeStyle = "oklch(var(--primary) / 0.5)"
                    ctx.lineWidth = 2
                    ctx.stroke()

                    // Draw direction arrow
                    const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x)
                    const arrowSize = 8
                    const arrowX = (fromNode.x + toNode.x) / 2
                    const arrowY = (fromNode.y + toNode.y) / 2

                    ctx.beginPath()
                    ctx.moveTo(arrowX, arrowY)
                    ctx.lineTo(
                        arrowX - arrowSize * Math.cos(angle - Math.PI / 6),
                        arrowY - arrowSize * Math.sin(angle - Math.PI / 6),
                    )
                    ctx.lineTo(
                        arrowX - arrowSize * Math.cos(angle + Math.PI / 6),
                        arrowY - arrowSize * Math.sin(angle + Math.PI / 6),
                    )
                    ctx.closePath()
                    ctx.fillStyle = "oklch(var(--primary) / 0.7)"
                    ctx.fill()
                }
            })
        }

        // Draw animated data flow
        const drawDataFlow = (nodes) => {
            // Define connections for data flow
            const connections = [
                { from: "server", to: "router" },
                { from: "router", to: "tower" },
                { from: "tower", to: "device" },
            ]

            connections.forEach((conn) => {
                const fromNode = nodes.find((n) => n.id === conn.from)
                const toNode = nodes.find((n) => n.id === conn.to)

                if (fromNode && toNode) {
                    const time = Date.now() / 1000
                    const speed = 0.5
                    const particleCount = 3

                    for (let i = 0; i < particleCount; i++) {
                        const t = (time * speed + i / particleCount) % 1

                        const x = fromNode.x + (toNode.x - fromNode.x) * t
                        const y = fromNode.y + (toNode.y - fromNode.y) * t

                        // Draw data packet
                        ctx.beginPath()
                        ctx.arc(x, y, 4, 0, Math.PI * 2)
                        ctx.fillStyle = "oklch(var(--primary))"
                        ctx.fill()

                        // Draw glow
                        ctx.beginPath()
                        ctx.arc(x, y, 6, 0, Math.PI * 2)
                        ctx.fillStyle = "oklch(var(--primary) / 0.3)"
                        ctx.fill()
                    }
                }
            })
        }

        // Start animation
        drawMap()

        return () => {
            window.removeEventListener("resize", setCanvasDimensions)
        }
    }, [locationData, networkParams, throughput])

    return <canvas ref={canvasRef} className="w-full h-full" />
}
