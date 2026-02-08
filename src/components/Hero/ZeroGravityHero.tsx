"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles } from "lucide-react";

export default function ZeroGravityHero() {
    const [stage, setStage] = useState<"pdf" | "particles" | "notes">("pdf");

    React.useEffect(() => {
        const timeline = async () => {
            await new Promise(r => setTimeout(r, 2000));
            setStage("particles");
            await new Promise(r => setTimeout(r, 2000));
            setStage("notes");
            await new Promise(r => setTimeout(r, 3000));
            setStage("pdf");
        };
        timeline();
    }, [stage]);

    return (
        <div className="relative h-[300px] flex items-center justify-center">
            <AnimatePresence mode="wait">
                {/* Stage 1: Floating PDF */}
                {stage === "pdf" && (
                    <motion.div
                        key="pdf"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2 }}
                        className="relative"
                    >
                        <motion.div
                            className="w-32 h-40 bg-gradient-to-br from-holoCyan to-holoCyanBright rounded-lg shadow-2xl gravity-glow-strong flex items-center justify-center"
                            animate={{
                                y: [0, -20, 0],
                                rotateZ: [-2, 2, -2],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        >
                            <FileText className="w-16 h-16 text-deepSpace" />
                        </motion.div>
                    </motion.div>
                )}

                {/* Stage 2: Particle Explosion */}
                {stage === "particles" && (
                    <motion.div
                        key="particles"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative w-64 h-64"
                    >
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 bg-holoCyan rounded-full gravity-glow"
                                style={{
                                    left: "50%",
                                    top: "50%",
                                }}
                                initial={{ x: 0, y: 0, scale: 0 }}
                                animate={{
                                    x: (Math.random() - 0.5) * 200,
                                    y: (Math.random() - 0.5) * 200,
                                    scale: [0, 1, 0],
                                    opacity: [0, 1, 0],
                                }}
                                transition={{
                                    duration: 1.5,
                                    delay: i * 0.05,
                                    ease: "easeOut",
                                }}
                            />
                        ))}
                    </motion.div>
                )}

                {/* Stage 3: Handwritten Note */}
                {stage === "notes" && (
                    <motion.div
                        key="notes"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative"
                    >
                        <motion.div
                            className="w-40 h-48 bg-paperWhite rounded-lg shadow-2xl p-4 relative overflow-hidden"
                            animate={{
                                y: [0, -15, 0],
                                rotateZ: [1, -1, 1],
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        >
                            {/* Ruled lines */}
                            <div className="absolute inset-0 p-4">
                                {[...Array(8)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-[1px] bg-gray-300 mb-5"
                                    />
                                ))}
                            </div>

                            {/* Handwritten text simulation */}
                            <div className="relative z-10 font-['Caveat'] text-gray-800 space-y-4 text-lg">
                                <div className="opacity-70">f'(x) = 2x + 2</div>
                                <div className="opacity-60">Step 1: ...</div>
                                <div className="opacity-50">Step 2: ...</div>
                            </div>

                            {/* Sparkle effect */}
                            <motion.div
                                className="absolute top-4 right-4"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 180, 360],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                }}
                            >
                                <Sparkles className="w-6 h-6 text-holoCyan" />
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
