"use client";

import React, { useState } from "react";
import Layout from "@/components/Layout/Layout";
import GravityWellUpload from "@/components/Input/GravityWellUpload";
import InkPressureSlider from "@/components/Controls/InkPressureSlider";
import SolutionStream from "@/components/Solver/SolutionStream";
import PaperPreview from "@/components/Handwriting/PaperPreview";
import ZeroGravityHero from "@/components/Hero/ZeroGravityHero";
import FloatingStylus from "@/components/Hero/FloatingStylus";
import { motion } from "framer-motion";
import { Download, RefreshCw, Sparkles } from "lucide-react";

export default function Home() {
    const [step, setStep] = useState<"input" | "solving" | "result">("input");
    const [solverSteps, setSolverSteps] = useState<any[]>([]);
    const [solutionText, setSolutionText] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [textInput, setTextInput] = useState("");
    const [inkPressure, setInkPressure] = useState(50);

    const handleSolve = async () => {
        if (!file && !textInput) return;

        setStep("solving");
        setSolverSteps([]);

        const mockSteps = [
            "Analyzing question structure...",
            "Identifying mathematical equations...",
            "Calculating derivatives for step 1...",
            "Solving quadratic equation...",
            "Verifying final answer...",
        ];

        for (let i = 0; i < mockSteps.length; i++) {
            await new Promise(r => setTimeout(r, 1000));
            setSolverSteps(prev => [...prev, { id: i, content: mockSteps[i], isComplete: false }]);

            if (i > 0) {
                setSolverSteps(prev => prev.map((s, idx) => idx === i - 1 ? { ...s, isComplete: true } : s));
            }
        }

        await new Promise(r => setTimeout(r, 1000));
        setSolverSteps(prev => prev.map(s => ({ ...s, isComplete: true })));
        setSolutionText("Therefore, the derivative of the function f(x) = x^2 + 2x is f'(x) = 2x + 2.\n\nThis is calculated using the power rule:\nFor f(x) = x^n, f'(x) = nx^(n-1)\n\nStep 1: d/dx(x^2) = 2x\nStep 2: d/dx(2x) = 2\nStep 3: Combine: f'(x) = 2x + 2");
        setStep("result");
    };

    const handleReset = () => {
        setStep("input");
        setSolverSteps([]);
        setSolutionText("");
        setFile(null);
        setTextInput("");
    };

    return (
        <Layout>
            <div className="space-y-16">

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-4xl mx-auto space-y-8"
                >
                    <div className="flex items-center justify-center gap-8 mb-8">
                        <FloatingStylus />
                        <ZeroGravityHero />
                    </div>

                    <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-tight">
                        <span className="holo-gradient-text">Antigravity</span>
                    </h1>
                    <p className="text-2xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
                        Transform digital PDFs into authentic handwritten notes. Your questions float through AI, reformed as organic ink on paper.
                    </p>
                </motion.div>

                {/* Input Stage */}
                {step === "input" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Gravity Well - spans 2 columns */}
                            <div className="lg:col-span-2">
                                <GravityWellUpload file={file} onFileSelect={setFile} />
                            </div>

                            {/* Text Input */}
                            <div className="frosted-panel p-6 rounded-2xl flex flex-col">
                                <label className="text-sm font-medium text-gray-400 mb-3">Or paste text</label>
                                <textarea
                                    placeholder="Type your question here..."
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    className="flex-1 w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:border-holoCyan focus:ring-0 transition-all resize-none text-paperWhite placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        {/* Ink Pressure Control */}
                        <InkPressureSlider value={inkPressure} onChange={setInkPressure} />

                        {/* Generate Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSolve}
                            disabled={!textInput && !file}
                            className={`relative w-full py-6 rounded-2xl font-bold text-xl transition-all overflow-hidden group ${(!textInput && !file)
                                    ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                                    : "holo-gradient gravity-glow-strong text-deepSpace shadow-2xl"
                                }`}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                <Sparkles size={24} />
                                Generate Solution
                            </span>
                        </motion.button>
                    </motion.div>
                )}

                {/* Solver Stage */}
                {step === "solving" && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <SolutionStream steps={solverSteps} isThinking={true} />
                    </motion.div>
                )}

                {/* Result Stage */}
                {step === "result" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                    >
                        <div className="space-y-6">
                            <h3 className="text-3xl font-bold">AI Solution</h3>
                            <div className="frosted-panel p-6 rounded-2xl font-mono text-sm whitespace-pre-wrap text-gray-300 leading-relaxed min-h-[300px]">
                                {solutionText}
                            </div>

                            {/* Ink Pressure for result */}
                            <InkPressureSlider value={inkPressure} onChange={setInkPressure} />

                            <button
                                onClick={handleReset}
                                className="text-holoCyan font-medium hover:text-holoCyanBright transition-colors flex items-center gap-2"
                            >
                                <RefreshCw size={16} />
                                Solve Another Question
                            </button>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-3xl font-bold">Handwritten Preview</h3>
                            <PaperPreview
                                content={solutionText}
                                handwritingStyle={{ perturbation: inkPressure / 100 * 2 }}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="py-4 holo-gradient rounded-xl font-semibold gravity-glow text-deepSpace transition-all flex items-center justify-center gap-2"
                                >
                                    <Download size={20} />
                                    Download PDF
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="py-4 frosted-panel rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                                >
                                    <RefreshCw size={20} />
                                    Regenerate
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}

            </div>
        </Layout>
    );
}
