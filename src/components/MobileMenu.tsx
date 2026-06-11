"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "../i18n/useTranslation";

const navItems = [
  { href: "#experience", key: "nav.experience" as const },
  { href: "#projects", key: "nav.projects" as const },
  { href: "#about-me", key: "nav.about" as const },
  { href: "#contact", key: "nav.contact" as const },
];

export const HeaderNav: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div ref={menuRef} style={{ position: "relative" }} className="md:hidden">
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "40px",
          height: "40px",
          background: "transparent",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
      >
        <span
          style={{
            position: "absolute",
            width: "20px",
            height: "2px",
            background: "#22d3ee",
            borderRadius: "2px",
            transition: "all 0.3s ease",
            transform: isMenuOpen ? "rotate(45deg)" : "translateY(-6px)",
          }}
        />
        <span
          style={{
            position: "absolute",
            width: "20px",
            height: "2px",
            background: "#22d3ee",
            borderRadius: "2px",
            transition: "all 0.3s ease",
            opacity: isMenuOpen ? 0 : 1,
            transform: isMenuOpen ? "scaleX(0)" : "scaleX(1)",
          }}
        />
        <span
          style={{
            position: "absolute",
            width: "20px",
            height: "2px",
            background: "#22d3ee",
            borderRadius: "2px",
            transition: "all 0.3s ease",
            transform: isMenuOpen ? "rotate(-45deg)" : "translateY(6px)",
          }}
        />
      </button>

      {/* Dropdown Menu */}
      <div
        style={{
          position: "absolute",
          top: "calc(100% + 12px)",
          right: 0,
          width: "240px",
          background: "rgba(15, 23, 42, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "16px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
          overflow: "hidden",
          opacity: isMenuOpen ? 1 : 0,
          visibility: isMenuOpen ? "visible" : "hidden",
          transform: isMenuOpen
            ? "translateY(0) scale(1)"
            : "translateY(-10px) scale(0.95)",
          transformOrigin: "top right",
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 100,
        }}
      >
        {/* Menu Items */}
        <nav style={{ padding: "8px" }}>
          {navItems.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px",
                fontSize: "15px",
                fontWeight: "500",
                color: index === navItems.length - 1 ? "#22d3ee" : "#e2e8f0",
                textDecoration: "none",
                borderRadius: "10px",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <span>{t(item.key)}</span>
              <svg
                style={{ opacity: 0.4, width: "16px", height: "16px" }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </a>
          ))}
        </nav>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background: "rgba(255, 255, 255, 0.1)",
            margin: "0 16px",
          }}
        />

        {/* Social Links */}
        <div
          style={{
            padding: "16px",
            display: "flex",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          <a
            href="https://github.com/RodReBer"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "10px",
              color: "#94a3b8",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(34, 211, 238, 0.15)";
              e.currentTarget.style.color = "#22d3ee";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.color = "#94a3b8";
            }}
          >
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/in/rodrigorey2005/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "10px",
              color: "#94a3b8",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(34, 211, 238, 0.15)";
              e.currentTarget.style.color = "#22d3ee";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.color = "#94a3b8";
            }}
          >
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
          <a
            href="mailto:rodrigorey2005@gmail.com"
            style={{
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "10px",
              color: "#94a3b8",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(34, 211, 238, 0.15)";
              e.currentTarget.style.color = "#22d3ee";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.color = "#94a3b8";
            }}
          >
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};
