"use client";

import React, { useState } from "react";
import { Upload, FileText, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface InputSectionProps {
    onSolve: (input: string | File) => void;
}

export default function InputSection({ onSolve }: InputSectionProps) {
    const [text, setText] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);

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
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            {/* File Upload Area */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "relative group overflow-hidden rounded-2xl transition-all duration-300",
                    isDragging
                        ? "bg-purple-500/20 border-2 border-purple-500"
                        : "bg-white/5 border-2 border-white/10 hover:border-purple-500/50",
                    file && "bg-purple-500/10 border-purple-500"
                )}
            >
                <input
                    type="file"
                    accept=".pdf,image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleFileChange}
                />

                <div className="p-12 flex flex-col items-center justify-center min-h-[300px]">
                    <AnimatePresence mode="wait">
                        {file ? (
                            <motion.div
                                key="file"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="text-center w-full"
                            >
                                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-8 h-8 text-purple-400" />
                                </div>
                                <p className="text-lg font-semibold text-white mb-1">{file.name}</p>
                                <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                <button
                                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); setFile(null); }}
                                    className="mt-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 mx-auto"
                                >
                                    <X size={16} />
                                    Remove File
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="upload"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="text-center"
                            >
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <Upload className="w-8 h-8 text-purple-400" />
                                </div>
                                <p className="text-lg font-semibold text-white mb-2">Drop your files here</p>
                                <p className="text-sm text-gray-400">or click to browse</p>
                                <p className="text-xs text-gray-500 mt-4">Supports PDF, PNG, JPG</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Animated border gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-xl" />
            </motion.div>

            {/* Text Input & Action */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col gap-4"
            >
                <div className="relative group rounded-2xl overflow-hidden">
                    <textarea
                        placeholder="Or paste your question here..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full h-[240px] p-6 bg-white/5 border-2 border-white/10 rounded-2xl focus:border-purple-500 focus:ring-0 transition-all resize-none text-white placeholder:text-gray-500 font-medium"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-xl" />
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSolve(file || text)}
                    disabled={!text && !file}
                    className={cn(
                        "relative w-full py-5 rounded-2xl font-semibold text-lg transition-all overflow-hidden group",
                        (!text && !file)
                            ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
                    )}
                >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                        <Sparkles size={20} />
                        Generate Solution
                    </span>
                    {(text || file) && (
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                </motion.button>
            </motion.div>
        </div>
    );
}
