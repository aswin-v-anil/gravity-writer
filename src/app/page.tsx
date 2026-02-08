"use client";

import React, { useState } from "react";
import Layout from "@/components/Layout/Layout";
import GravityWellUpload from "@/components/Input/GravityWellUpload";
import ControlsPanel, { HandwritingControls } from "@/components/Controls/ControlsPanel";
import SolutionStream from "@/components/Solver/SolutionStream";
import PaperPreview from "@/components/Handwriting/PaperPreview";
import ZeroGravityHero from "@/components/Hero/ZeroGravityHero";
import FloatingStylus from "@/components/Hero/FloatingStylus";
import { motion } from "framer-motion";
import { Download, RefreshCw, Sparkles, ChevronRight } from "lucide-react";

const defaultControls: HandwritingControls = {
    fontSize: 24,
    lineSpacing: 1.5,
    messiness: 40,
    rotation: 5,
    inkColor: "#1a365d",
    paperType: "ruled",
};

export default function Home() {
    const [step, setStep] = useState<"input" | "solving" | "result">("input");
    const [solverSteps, setSolverSteps] = useState<any[]>([]);
    const [solutionText, setSolutionText] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [textInput, setTextInput] = useState("");
    const [controls, setControls] = useState<HandwritingControls>(defaultControls);

    const handleSolve = async () => {
        if (!file && !textInput) return;

        setStep("solving");
        setSolverSteps([]);

        const mockSteps = [
            "Reading and analyzing question...",
            "Identifying key concepts...",
            "Setting up solution framework...",
            "Calculating step-by-step...",
            "Verifying final answer...",
        ];

        for (let i = 0; i < mockSteps.length; i++) {
            await new Promise(r => setTimeout(r, 800));
            setSolverSteps(prev => [...prev, { id: i, content: mockSteps[i], isComplete: false }]);

            if (i > 0) {
                setSolverSteps(prev => prev.map((s, idx) => idx === i - 1 ? { ...s, isComplete: true } : s));
            }
        }

        await new Promise(r => setTimeout(r, 800));
        setSolverSteps(prev => prev.map(s => ({ ...s, isComplete: true })));

        // Exam-style formatted answer
        const examAnswer = `Given:
f(x) = x² + 2x

To Find:
f'(x) = ?

Solution:
Using the power rule: d/dx(xⁿ) = nxⁿ⁻¹

Step 1: Differentiate x²
d/dx(x²) = 2x

Step 2: Differentiate 2x
d/dx(2x) = 2

Step 3: Combine the results
f'(x) = 2x + 2

Therefore, f'(x) = 2x + 2

Final Answer: f'(x) = 2x + 2`;

        setSolutionText(examAnswer);
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
            <div className="space-y-12">

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-4xl mx-auto space-y-6"
                >
                    <div className="flex items-center justify-center gap-6 mb-6">
                        <FloatingStylus />
                        <ZeroGravityHero />
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                        <span className="holo-gradient-text">Antigravity</span>
                    </h1>
                    <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
                        Transform digital documents into authentic handwritten exam solutions
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
                            {/* Gravity Well Upload */}
                            <div className="lg:col-span-2">
                                <GravityWellUpload file={file} onFileSelect={setFile} />
                            </div>

                            {/* Text Input */}
                            <div className="frosted-panel p-6 rounded-2xl flex flex-col">
                                <label className="text-sm font-medium text-gray-400 mb-3">Or paste your question</label>
                                <textarea
                                    placeholder="Enter your question here..."
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    className="flex-1 w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:border-holoCyan focus:ring-0 transition-all resize-none text-paperWhite placeholder:text-gray-600 min-h-[200px]"
                                />
                            </div>
                        </div>

                        {/* Controls Panel */}
                        <ControlsPanel controls={controls} onChange={setControls} />

                        {/* Live Preview */}
                        {(textInput || file) && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="space-y-4"
                            >
                                <h3 className="text-xl font-semibold flex items-center gap-2">
                                    <ChevronRight className="text-holoCyan" />
                                    Live Preview
                                </h3>
                                <PaperPreview
                                    content={textInput || "Sample text will appear here..."}
                                    controls={controls}
                                />
                            </motion.div>
                        )}

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
                                Generate Handwritten Solution
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
                        className="space-y-8"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* AI Solution */}
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold">AI Solution</h3>
                                <div className="frosted-panel p-6 rounded-2xl font-mono text-sm whitespace-pre-wrap text-gray-300 leading-relaxed max-h-[500px] overflow-auto">
                                    {solutionText}
                                </div>
                            </div>

                            {/* Handwritten Preview */}
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold">Handwritten Output</h3>
                                <PaperPreview content={solutionText} controls={controls} />
                            </div>
                        </div>

                        {/* Controls for adjustment */}
                        <ControlsPanel controls={controls} onChange={setControls} />

                        {/* Action Buttons */}
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
                                onClick={handleReset}
                                className="py-4 frosted-panel rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={20} />
                                New Question
                            </motion.button>
                        </div>
                    </motion.div>
                )}

            </div>
        </Layout>
    );
}
