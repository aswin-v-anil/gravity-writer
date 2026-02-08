"use client";

import React from "react";
import { motion } from "framer-motion";

export default function FloatingStylus() {
    return (
        <motion.div
            className="relative w-32 h-32"
            animate={{
                y: [0, -15, 0],
                rotateY: [0, 360],
                rotateZ: [-5, 5, -5],
            }}
            transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        >
            {/* Stylus Body */}
            <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-2xl"
            >
                {/* Pen body */}
                <defs>
                    <linearGradient id="stylusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#E5E7EB" />
                        <stop offset="100%" stopColor="#9CA3AF" />
                    </linearGradient>
                    <linearGradient id="tipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00FFE0" />
                        <stop offset="100%" stopColor="#00D9FF" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Pen barrel */}
                <rect
                    x="45"
                    y="20"
                    width="30"
                    height="70"
                    rx="15"
                    fill="url(#stylusGrad)"
                    stroke="#D1D5DB"
                    strokeWidth="1"
                />

                {/* Pen tip (holographic cyan) */}
                <path
                    d="M 60 90 L 50 105 L 70 105 Z"
                    fill="url(#tipGrad)"
                    filter="url(#glow)"
                    className="gravity-glow"
                />

                {/* Highlight */}
                <ellipse
                    cx="55"
                    cy="40"
                    rx="8"
                    ry="20"
                    fill="rgba(255,255,255,0.3)"
                />
            </svg>

            {/* Floating particles around stylus */}
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-holoCyan rounded-full"
                    style={{
                        left: `${20 + i * 20}%`,
                        top: `${30 + (i % 2) * 40}%`,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        opacity: [0.3, 1, 0.3],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: 2 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                    }}
                />
            ))}
        </motion.div>
    );
}
