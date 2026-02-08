"use client";

import React from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";

interface Step {
    id: number;
    content: string;
    isComplete: boolean;
}

interface SolutionStreamProps {
    steps: Step[];
    isThinking: boolean;
}

export default function SolutionStream({ steps, isThinking }: SolutionStreamProps) {
    return (
        <div className="w-full max-w-2xl mx-auto space-y-4 p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">AI Thinking</h3>
                    <p className="text-sm text-gray-400">Solving your question step-by-step...</p>
                </div>
            </div>

            <div className="space-y-3">
                {steps.map((step, index) => (
                    <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10"
                    >
                        <div className="mt-0.5">
                            {step.isComplete ? (
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                            ) : (
                                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm font-medium ${step.isComplete ? 'text-gray-300' : 'text-white'}`}>
                                {step.content}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
