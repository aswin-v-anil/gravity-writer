"use client";

import React, { useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface GravityWellUploadProps {
    onFileSelect: (file: File | null) => void;
    file: File | null;
}

export default function GravityWellUpload({ onFileSelect, file }: GravityWellUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setIsAnimating(true);
            setTimeout(() => {
                onFileSelect(e.dataTransfer.files[0]);
                setIsAnimating(false);
            }, 1000);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div className="relative w-full">
            <motion.div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "relative overflow-hidden rounded-2xl transition-all duration-500",
                    isDragging ? "scale-105" : "scale-100"
                )}
                style={{ minHeight: "320px" }}
            >
                <input
                    type="file"
                    accept=".pdf,image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    onChange={handleFileChange}
                />

                {/* Gravity Well Background */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {/* Radial gradient well */}
                    <motion.div
                        className="absolute w-64 h-64 rounded-full"
                        style={{
                            background: `radial-gradient(circle, 
                rgba(0, 217, 255, ${isDragging ? 0.3 : 0.1}) 0%, 
                rgba(0, 217, 255, ${isDragging ? 0.15 : 0.05}) 40%, 
                transparent 70%
              )`,
                        }}
                        animate={{
                            scale: isDragging ? [1, 1.1, 1] : 1,
                        }}
                        transition={{
                            duration: 2,
                            repeat: isDragging ? Infinity : 0,
                        }}
                    />

                    {/* Ripple rings */}
                    {isDragging && [...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-32 h-32 rounded-full border-2 border-holoCyan/30"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{
                                scale: [0.8, 2],
                                opacity: [0.6, 0],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.5,
                                ease: "easeOut",
                            }}
                        />
                    ))}

                    {/* Center area */}
                    <AnimatePresence mode="wait">
                        {file ? (
                            <motion.div
                                key="file"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="frosted-panel p-8 rounded-2xl text-center z-10 relative"
                            >
                                <div className="w-16 h-16 rounded-full bg-holoCyan/20 flex items-center justify-center mx-auto mb-4 gravity-glow">
                                    <FileText className="w-8 h-8 text-holoCyan" />
                                </div>
                                <p className="text-lg font-semibold text-paperWhite mb-1">{file.name}</p>
                                <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        onFileSelect(null);
                                    }}
                                    className="mt-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 mx-auto"
                                >
                                    <X size={16} />
                                    Remove
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="upload"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="frosted-panel p-12 rounded-2xl text-center z-10 relative"
                            >
                                <motion.div
                                    className="w-20 h-20 rounded-full bg-gradient-to-br from-holoCyan/20 to-holoCyanBright/20 flex items-center justify-center mx-auto mb-6"
                                    animate={{
                                        y: isDragging ? -10 : [0, -5, 0],
                                        scale: isDragging ? 1.1 : 1,
                                    }}
                                    transition={{
                                        y: { duration: 2, repeat: Infinity },
                                        scale: { duration: 0.3 },
                                    }}
                                >
                                    <Upload className="w-10 h-10 text-holoCyan" />
                                </motion.div>
                                <p className="text-xl font-semibold text-paperWhite mb-2">
                                    {isDragging ? "Release to Upload" : "Drop into the Gravity Well"}
                                </p>
                                <p className="text-sm text-gray-400">or click to browse</p>
                                <p className="text-xs text-gray-500 mt-4">Supports PDF, PNG, JPG</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Particle effect during drop */}
                {isAnimating && (
                    <div className="absolute inset-0 pointer-events-none z-30">
                        {[...Array(15)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 bg-holoCyan rounded-full"
                                style={{
                                    left: "50%",
                                    top: "50%",
                                }}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                    x: (Math.random() - 0.5) * 150,
                                    y: (Math.random() - 0.5) * 150,
                                    scale: [0, 1, 0],
                                    opacity: [0, 1, 0],
                                }}
                                transition={{
                                    duration: 1,
                                    delay: i * 0.05,
                                    ease: "easeOut",
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Shimmer effect */}
                {!file && (
                    <div className="absolute inset-0 shimmer opacity-30 pointer-events-none" />
                )}
            </motion.div>
        </div>
    );
}
