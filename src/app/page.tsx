"use client";

import React, { useState, useRef } from "react";
import Layout from "@/components/Layout/Layout";
import GravityWellUpload from "@/components/Input/GravityWellUpload";
import ControlsPanel, { HandwritingControls } from "@/components/Controls/ControlsPanel";
import QuestionSidebar, { Question } from "@/components/Input/QuestionSidebar";
import PaperPreview, { PaperPreviewHandle } from "@/components/Handwriting/PaperPreview";
import ZeroGravityHero from "@/components/Hero/ZeroGravityHero";
import FloatingStylus from "@/components/Hero/FloatingStylus";
import { motion, AnimatePresence } from "framer-motion";
import { Download, RefreshCw, ChevronLeft, ChevronRight, FileDown, Image, Type, Upload } from "lucide-react";
import { exportToPDF, exportToPNG } from "@/lib/exportUtils";
import RichTextInput from "@/components/Input/RichTextInput";

export default function Home() {
    const paperRef = useRef<PaperPreviewHandle>(null);
    const [step, setStep] = useState<"input" | "exam">("input");
    const [inputMode, setInputMode] = useState<"upload" | "write">("write");
    const [file, setFile] = useState<File | null>(null);
    const [textContent, setTextContent] = useState("");
    const [questions, setQuestions] = useState<Question[]>([]);
    const defaultControls: HandwritingControls = {
        // Style
        fontFamily: "Caveat",
        fontSize: 24,
        inkColor: "#1a365d",
        messiness: 30,
        rotation: 5,

        // Spacing
        lineSpacing: 1.5,
        wordSpacing: 10,
        letterSpacing: 2,
        baselineShift: 2,

        // Paper
        paperType: "ruled",
        paperColor: "#FFFEF5",
        marginColor: "#f87171",

        // Effects
        inkBlur: 0.3,
        inkFlow: 0.9,
        paperTexture: 0.15,
    };
    const [controls, setControls] = useState<HandwritingControls>(defaultControls);

    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPages, setGeneratedPages] = useState<string[]>([]); // Content for each page
    const [currentPage, setCurrentPage] = useState(0);

    // Real Question Extraction from File
    const handleFileSelect = async (uploadedFile: File | null) => {
        setFile(uploadedFile);
        if (uploadedFile) {
            setIsGenerating(true);
            try {
                // Dynamically import to avoid SSR issues with pdfjs-dist
                const { parseDocument } = await import("@/lib/documentParser");
                const text = await parseDocument(uploadedFile);

                // Split text into paragraphs as "questions"
                // Heuristic: split by double newlines or number+dot patterns
                const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 10);

                const newQuestions = paragraphs.map((para, i) => ({
                    id: `q-${Date.now()}-${i}`,
                    number: `Q${i + 1}`,
                    text: para.trim(),
                    selected: true,
                }));

                if (newQuestions.length === 0) {
                    setQuestions([{ id: "empty", number: "Info", text: "No text extracted. Try a different file.", selected: false }]);
                } else {
                    setQuestions(newQuestions);
                }
            } catch (error) {
                console.error("Failed to parse file:", error);
                setQuestions([{ id: "err", number: "Error", text: "Failed to read file content.", selected: false }]);
            } finally {
                setIsGenerating(false);
            }
        } else {
            setQuestions([]);
        }
    };

    const toggleQuestion = (id: string) => {
        setQuestions(prev => prev.map(q => q.id === id ? { ...q, selected: !q.selected } : q));
    };

    const handleGenerateValues = async () => {
        setIsGenerating(true);

        // Simulate generation delay
        await new Promise(r => setTimeout(r, 2000));

        // Generate content for pages
        const selectedQs = questions.filter(q => q.selected);
        const pages = [];

        // Simplified pagination: 1 question per page for now
        for (const q of selectedQs) {
            const answer = generateMockAnswer(q.text);
            pages.push(JSON.stringify({ qNum: q.number, qText: q.text, ans: answer }));
        }

        setGeneratedPages(pages);
        setCurrentPage(0);
        setStep("exam");
        setIsGenerating(false);
    };

    const generateMockAnswer = (question: string) => {
        return `Given: Problem statement parameters...

Step 1: Conceptual Understanding
Analyze the core principles involved.

Step 2: Mathematical Formulation
Apply the relevant formulas.
Equation: F = ma

Step 3: Calculation & Derivation
Substitute values and solve.
(Detailed calculation steps here...)

Therefore, the result matches theoretical predictions.

Final Answer: The derived value is 42 units.`;
    };

    const handleDownloadPDF = () => {
        const canvas = paperRef.current?.getCanvas();
        if (canvas) {
            exportToPDF([canvas], "handwritten_notes.pdf");
        }
    };

    const handleDownloadPNG = () => {
        const canvas = paperRef.current?.getCanvas();
        if (canvas) {
            exportToPNG(canvas, `page_${currentPage + 1}.png`);
        }
    };

    return (
        <Layout>
            <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">

                {/* Header (condensed if in exam mode) */}
                {step === "input" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4 mb-4">
                        <div className="flex justify-center gap-4"><FloatingStylus /><ZeroGravityHero /></div>
                        <h1 className="text-4xl font-bold holo-gradient-text">Gravity: AntiGravity Text to Handwriting</h1>
                    </motion.div>
                )}

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

                    {/* LEFT SIDEBAR: Controls & Document */}
                    <div className="lg:col-span-4 flex flex-col gap-4 min-h-0 overflow-y-auto">
                        {/* Input Mode Toggle */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setInputMode("write")}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${inputMode === "write"
                                    ? "bg-holoCyan/20 text-holoCyan border border-holoCyan"
                                    : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                                    }`}
                            >
                                <Type size={16} />
                                Write Text
                            </button>
                            <button
                                onClick={() => setInputMode("upload")}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${inputMode === "upload"
                                    ? "bg-holoCyan/20 text-holoCyan border border-holoCyan"
                                    : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                                    }`}
                            >
                                <Upload size={16} />
                                Upload Doc
                            </button>
                        </div>

                        {/* Write Mode: RichTextInput */}
                        {inputMode === "write" && (
                            <div className="frosted-panel p-4 rounded-xl">
                                <RichTextInput
                                    onGenerate={(content) => {
                                        setTextContent(content);
                                        // Generate pages from text content
                                        setIsGenerating(true);
                                        setTimeout(() => {
                                            setGeneratedPages([content]);
                                            setStep("exam");
                                            setIsGenerating(false);
                                        }, 1500);
                                    }}
                                    isGenerating={isGenerating}
                                />
                            </div>
                        )}

                        {/* Upload Mode */}
                        {inputMode === "upload" && (
                            <>
                                {!file ? (
                                    <GravityWellUpload file={file} onFileSelect={handleFileSelect} />
                                ) : (
                                    <div className="frosted-panel p-4 rounded-xl flex items-center justify-between">
                                        <span className="font-bold text-paperWhite truncate">{file.name}</span>
                                        <button onClick={() => setFile(null)} className="text-red-400 text-xs">Change</button>
                                    </div>
                                )}

                                {/* Questions List */}
                                {inputMode === "upload" && file && (
                                    <div className="flex-1 min-h-[300px]">
                                        <QuestionSidebar
                                            questions={questions}
                                            onToggleQuestion={toggleQuestion}
                                            onGenerate={handleGenerateValues}
                                            isGenerating={isGenerating}
                                        />
                                    </div>
                                )}

                                {/* Styling Controls */}
                                <ControlsPanel controls={controls} onChange={setControls} />
                            </>
                        )}
                    </div>

                    {/* RIGHT PANEL: Preview / Output */}
                    <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">
                        {step === "exam" && generatedPages.length > 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col h-full">
                                {/* Toolbar */}
                                <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl mb-2 backdrop-blur-md">
                                    <div className="flex items-center gap-4">
                                        <button
                                            aria-label="Previous Page"
                                            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                            disabled={currentPage === 0}
                                            className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-30"
                                        >
                                            <ChevronLeft />
                                        </button>
                                        <span className="font-mono font-bold">Page {currentPage + 1} of {generatedPages.length}</span>
                                        <button
                                            aria-label="Next Page"
                                            onClick={() => setCurrentPage(p => Math.min(generatedPages.length - 1, p + 1))}
                                            disabled={currentPage === generatedPages.length - 1}
                                            className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-30"
                                        >
                                            <ChevronRight />
                                        </button>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleDownloadPNG}
                                            className="px-4 py-2 bg-holoCyan/20 text-holoCyan rounded-lg hover:bg-holoCyan/30 transition-colors flex items-center gap-2"
                                            title="Download current page as PNG"
                                        >
                                            <Image size={16} /> PNG
                                        </button>
                                        <button
                                            onClick={handleDownloadPDF}
                                            className="px-4 py-2 holo-gradient text-deepSpace font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                                            title="Download all pages as PDF"
                                        >
                                            <FileDown size={16} /> Download PDF
                                        </button>
                                    </div>
                                </div>

                                {/* Writing Canvas */}
                                <div className="flex-1 overflow-hidden relative bg-gray-800/50 rounded-xl border border-white/10 flex items-center justify-center p-4">
                                    <PaperPreview
                                        ref={paperRef}
                                        content={generatedPages[currentPage]}
                                        controls={controls}
                                        isExamMode={true}
                                    />
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
                                <div className="text-center text-gray-500">
                                    <p className="text-xl font-bold mb-2">Preview Area</p>
                                    <p>Upload a document and select questions to start.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
