"use client";

import React, { useEffect, useRef, useState } from "react";

export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const [cursorState, setCursorState] = useState<
    "default" | "hover" | "click" | "text" | "view"
  >("default");
  const [isVisible, setIsVisible] = useState(false);
  const [cursorText, setCursorText] = useState("");

  useEffect(() => {
    // Only show custom cursor on desktop
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const cursor = cursorRef.current;
    const cursorDot = cursorDotRef.current;
    if (!cursor || !cursorDot) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let dotX = 0;
    let dotY = 0;

    // Smooth cursor animation
    const animate = () => {
      // Smooth follow for outer circle
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;

      // Faster follow for inner dot
      dotX += (mouseX - dotX) * 0.35;
      dotY += (mouseY - dotY) * 0.35;
      cursorDot.style.transform = `translate(${dotX}px, ${dotY}px)`;

      requestAnimationFrame(animate);
    };
    animate();

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Detect hoverable elements
    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check for links and buttons
      if (target.closest('a, button, [role="button"]')) {
        setCursorState("hover");

        // Check for view project links
        if (
          target.closest('[data-cursor="view"]') ||
          target.textContent?.includes("View") ||
          target.textContent?.includes("Ver")
        ) {
          setCursorState("view");
          setCursorText("View");
        } else {
          setCursorText("");
        }
      }
      // Check for text inputs
      else if (target.closest('input, textarea, [contenteditable="true"]')) {
        setCursorState("text");
        setCursorText("");
      }
      // Check for project items
      else if (target.closest('[data-cursor="project"]')) {
        setCursorState("view");
        setCursorText("View");
      } else {
        setCursorState("default");
        setCursorText("");
      }
    };

    const handleMouseDown = () => {
      setCursorState("click");
    };

    const handleMouseUp = () => {
      setCursorState((prev) => (prev === "click" ? "default" : prev));
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mousemove", handleElementHover);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousemove", handleElementHover);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Cursor sizes based on state
  const getCursorSize = () => {
    switch (cursorState) {
      case "hover":
        return 50;
      case "view":
        return 80;
      case "click":
        return 30;
      case "text":
        return 4;
      default:
        return 40;
    }
  };

  const getDotSize = () => {
    switch (cursorState) {
      case "hover":
        return 6;
      case "view":
        return 0;
      case "click":
        return 4;
      case "text":
        return 20;
      default:
        return 6;
    }
  };

  const size = getCursorSize();
  const dotSize = getDotSize();

  return (
    <>
      {/* Outer circle */}
      <div
        ref={cursorRef}
        style={{
          position: "fixed",
          top: -size / 2,
          left: -size / 2,
          width: size,
          height: size,
          borderRadius: "50%",
          border:
            cursorState === "view"
              ? "none"
              : "1.5px solid rgba(34, 211, 238, 0.6)",
          backgroundColor:
            cursorState === "view" ? "rgba(34, 211, 238, 0.15)" : "transparent",
          pointerEvents: "none",
          zIndex: 999999,
          transition:
            "width 0.3s ease, height 0.3s ease, top 0.3s ease, left 0.3s ease, background-color 0.3s ease, border 0.3s ease, opacity 0.3s ease",
          opacity: isVisible ? 1 : 0,
          mixBlendMode: cursorState === "view" ? "normal" : "difference",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {cursorText && (
          <span
            style={{
              color: "#22d3ee",
              fontSize: "12px",
              fontWeight: "600",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            {cursorText}
          </span>
        )}
      </div>

      {/* Inner dot */}
      <div
        ref={cursorDotRef}
        style={{
          position: "fixed",
          top: -dotSize / 2,
          left: -dotSize / 2,
          width: dotSize,
          height: dotSize,
          borderRadius: cursorState === "text" ? "2px" : "50%",
          backgroundColor: cursorState === "text" ? "#22d3ee" : "#22d3ee",
          pointerEvents: "none",
          zIndex: 999999,
          transition:
            "width 0.2s ease, height 0.2s ease, top 0.2s ease, left 0.2s ease, border-radius 0.2s ease, opacity 0.2s ease",
          opacity: isVisible ? 1 : 0,
        }}
      />

      {/* Hide default cursor */}
      <style>{`
        @media (hover: hover) and (pointer: fine) {
          * {
            cursor: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default CustomCursor;
