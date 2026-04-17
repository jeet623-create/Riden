"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    document.documentElement.classList.add("custom-cursor")
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)
      const target = e.target as HTMLElement
      const isClickable =
        target.tagName === "BUTTON" || target.tagName === "A" ||
        target.closest("button") || target.closest("a") ||
        target.getAttribute("role") === "button" ||
        target.classList.contains("cursor-pointer") ||
        window.getComputedStyle(target).cursor === "pointer"
      setIsHovering(!!isClickable)
    }
    window.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseleave", () => setIsVisible(false))
    window.addEventListener("mousedown", () => setIsClicking(true))
    window.addEventListener("mouseup", () => setIsClicking(false))
    return () => {
      document.documentElement.classList.remove("custom-cursor")
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  if (!isVisible) return null

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
        style={{ backgroundColor: "#1D9E75" }}
        animate={{ x: mousePosition.x - (isHovering ? 2 : 4), y: mousePosition.y - (isHovering ? 2 : 4), width: isHovering ? 4 : 8, height: isHovering ? 4 : 8 }}
        transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}
      />
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full"
        style={{ border: `1.5px solid ${isClicking ? "#ffffff" : "rgba(29, 158, 117, 0.5)"}`, backgroundColor: "transparent" }}
        animate={{ x: mousePosition.x - (isHovering ? 20 : 14), y: mousePosition.y - (isHovering ? 20 : 14), width: isHovering ? 40 : 28, height: isHovering ? 40 : 28 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, mass: 0.8 }}
      />
    </>
  )
}