"use client";

import React, { useState, useRef, useEffect } from "react";
import Layout from "@/components/Layout/Layout";
import GravityWellUpload from "@/components/Input/GravityWellUpload";
import ControlsPanel, { HandwritingControls } from "@/components/Controls/ControlsPanel";
import QuestionSidebar, { Question } from "@/components/Input/QuestionSidebar";
import ZeroGravityHero from "@/components/Hero/ZeroGravityHero";
import FloatingStylus from "@/components/Hero/FloatingStylus";
import { motion, AnimatePresence } from "framer-motion";
import { Download, RefreshCw, ChevronLeft, ChevronRight, FileDown, Image, Type, Upload, User, PenTool, BookOpen, History as HistoryIcon } from "lucide-react";
import RichTextInput from "@/components/Input/RichTextInput";

// AI Exam Writer Modules
import { detectSubject, SubjectDetectionResult } from "@/lib/subjectDetector";
import { enhancePrompt } from "@/lib/promptEnhancer";
import { planExam, ExamPlan } from "@/lib/examPlanner";
import { HandwritingStyleProfile } from "@/lib/styleExtraction";
import { storageService } from "@/lib/storageService";
import { StyleUploader } from "@/components/Handwriting/StyleUploader";
import { StyleLibrary } from "@/components/Library/StyleLibrary";
import { ExamRenderer } from "@/components/Solver/ExamRenderer";
import { HandwritingStyle, PageConfig } from "@/lib/handwritingEngine";

export default function Home() {
    const [step, setStep] = useState<"input" | "exam">("input");
    const [activeTab, setActiveTab] = useState<"write" | "upload" | "style" | "history">("write");

    // State
    const [questions, setQuestions] = useState<Question[]>([]);
    const [sourceFile, setSourceFile] = useState<File | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [examPlan, setExamPlan] = useState<ExamPlan | null>(null);
    const [activeProfile, setActiveProfile] = useState<HandwritingStyleProfile | null>(null);

    const defaultControls: HandwritingControls = {
        fontFamily: "Inter",
        fontSize: 24,
        inkColor: "#1a1a1a",
        messiness: 20,
        rotation: 3,
        lineSpacing: 1.5,
        wordSpacing: 10,
        letterSpacing: 1.5,
        baselineShift: 2,
        paperType: "ruled",
        paperColor: "#FFFEF5",
        marginColor: "#f87171",
        inkBlur: 0.3,
        inkFlow: 0.9,
        paperTexture: 0.15,
    };
    const [controls, setControls] = useState<HandwritingControls>(defaultControls);

    // Initial Load
    useEffect(() => {
        const loadDefaultStyle = async () => {
            const styles = await storageService.getStyles();
            if (styles.length > 0) setActiveProfile(styles[0]);
        };
        loadDefaultStyle();
    }, []);

    // 1. File Upload & Subject Detection
    const handleFileSelect = async (uploadedFile: File | null) => {
        if (uploadedFile) {
            setIsGenerating(true);
            try {
                const { parseDocument } = await import("@/lib/documentParser");
                const text = await parseDocument(uploadedFile);
                const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 10);

                const newQuestions = paragraphs.map((para, i) => {
                    const detection = detectSubject(para);
                    return {
                        id: `q-${Date.now()}-${i}`,
                        number: `Q${i + 1}`,
                        text: para.trim(),
                        selected: true,
                        detection
                    };
                });

                setQuestions(newQuestions);
                setActiveTab("upload"); // Switch to view questions
            } catch (error) {
                console.error("Failed to parse file:", error);
                alert("Failed to read file content.");
            } finally {
                setIsGenerating(false);
            }
        }
    };

    // 2. Handwriting Style Extraction Callback
    const handleStyleGenerated = async (profile: HandwritingStyleProfile) => {
        await storageService.saveStyle(profile);
        setActiveProfile(profile);
        // Sync controls with profile
        setControls(prev => ({
            ...prev,
            messiness: profile.perturbation * 10,
            rotation: profile.rotation,
            baselineShift: profile.baselineShift,
            wordSpacing: profile.wordSpacing,
            letterSpacing: profile.letterSpacing
        }));
    };

    // 3. Exam Generation Flow
    const handleGenerateExam = async () => {
        setIsGenerating(true);
        const selectedQs = questions.filter(q => q.selected);
        if (selectedQs.length === 0) return;

        // Simulate AI Solving Delay
        await new Promise(r => setTimeout(r, 2000));

        let fullAnswerText = "";
        let primarySubject = selectedQs[0].detection?.subject || "General Engineering";
        let requiresDiagram = false;
        let diagramType = "";

        for (const q of selectedQs) {
            // Module 3: Prompt Enhancement
            const enhancedPrompt = q.detection ? enhancePrompt(q.text, q.detection) : q.text;

            // Simulation: Mock AI response based on enhanced prompt
            const answer = generateMockAnswer(q.text, q.detection);
            fullAnswerText += `${q.number}: ${q.text}\n\n${answer}\n\n`;

            if (q.detection?.requiresDiagram) {
                requiresDiagram = true;
                diagramType = q.detection.diagramType || "freehand";
            }
        }

        // Module 4: Page Planning
        const plan = planExam(fullAnswerText, primarySubject, requiresDiagram, diagramType);

        // Save to History
        await storageService.saveWork({
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            subject: primarySubject,
            plan
        });

        setExamPlan(plan);
        setStep("exam");
        setIsGenerating(false);
    };

    const generateMockAnswer = (question: string, detection?: SubjectDetectionResult) => {
        return `Given: ${detection?.subject} parameters...
Step 1: Apply engineering principles.
Step 2: Mathematical derivation...
Step 3: Numerical calculation...
The result confirms the hypothesis.
Final Answer: 42.069 units.`;
    };

    const hStyle: HandwritingStyle = {
        font: activeProfile?.font || "Inter",
        size: controls.fontSize,
        color: controls.inkColor,
        lineHeight: controls.lineSpacing,
        wordSpacing: controls.wordSpacing,
        letterSpacing: controls.letterSpacing,
        perturbation: controls.messiness / 10,
        rotation: controls.rotation,
        slant: activeProfile?.slant || 0,
        baselineShift: controls.baselineShift
    };

    const pageConfig: PageConfig = {
        paperType: controls.paperType as any,
        width: 842, // A4 px
        height: 1191,
        marginLeft: 80,
        marginTop: 100,
        paperColor: controls.paperColor,
        marginColor: controls.marginColor
    };

    return (
        <Layout>
            <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">

                {/* Header */}
                {step === "input" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-2 mb-4">
                        <div className="flex justify-center gap-4"><FloatingStylus /><ZeroGravityHero /></div>
                        <h1 className="text-3xl font-bold holo-gradient-text tracking-tight italic">Gravity-Writer: AI Engineering Exam Platform</h1>
                    </motion.div>
                )}

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

                    {/* LEFT SIDEBAR */}
                    <AnimatePresence mode="wait">
                        {step === "input" && (
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className="lg:col-span-4 flex flex-col gap-4 min-h-0 overflow-y-auto"
                            >
                                {/* Navigation Tabs */}
                                <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                                    <TabButton active={activeTab === "write"} onClick={() => setActiveTab("write")} icon={<PenTool size={16} />} label="Write" />
                                    <TabButton active={activeTab === "upload"} onClick={() => setActiveTab("upload")} icon={<Upload size={16} />} label="Doc" />
                                    <TabButton active={activeTab === "style"} onClick={() => setActiveTab("style")} icon={<User size={16} />} label="Style" />
                                    <TabButton active={activeTab === "history"} onClick={() => setActiveTab("history")} icon={<HistoryIcon size={16} />} label="Work" />
                                </div>

                                {/* Tab Contents */}
                                <div className="flex-1 min-h-0 flex flex-col gap-4">
                                    {activeTab === "write" && (
                                        <div className="frosted-panel p-4 rounded-xl flex-1">
                                            <RichTextInput
                                                onGenerate={(content) => {
                                                    const plan = planExam(content, "General Notes", false);
                                                    setExamPlan(plan);
                                                    setStep("exam");
                                                }}
                                                isGenerating={isGenerating}
                                            />
                                        </div>
                                    )}

                                    {activeTab === "upload" && (
                                        <div className="flex-col flex gap-4 flex-1 overflow-hidden">
                                            {questions.length === 0 ? (
                                                <GravityWellUpload
                                                    file={sourceFile}
                                                    onFileSelect={(f) => {
                                                        setSourceFile(f);
                                                        handleFileSelect(f);
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex-1 min-h-0 bg-transparent">
                                                    <QuestionSidebar
                                                        questions={questions}
                                                        onToggleQuestion={(id) => setQuestions(qs => qs.map(q => q.id === id ? { ...q, selected: !q.selected } : q))}
                                                        onGenerate={handleGenerateExam}
                                                        isGenerating={isGenerating}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === "style" && (
                                        <div className="space-y-4">
                                            <StyleUploader onStyleGenerated={handleStyleGenerated} />
                                            <h4 className="text-xs font-bold text-gray-400 px-1 uppercase tracking-wider">Style Library</h4>
                                            <StyleLibrary
                                                activeStyleId={activeProfile?.id}
                                                onSelect={setActiveProfile}
                                            />
                                        </div>
                                    )}

                                    {activeTab === "history" && (
                                        <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center text-gray-500 text-sm">
                                            <p>Work history will appear here.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Fixed Controls Component */}
                                <div className="pt-2">
                                    <ControlsPanel controls={controls} onChange={setControls} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* RIGHT PANEL */}
                    <div className={step === "exam" ? "lg:col-span-12 h-full" : "lg:col-span-8 flex flex-col gap-4 min-h-0"}>
                        {step === "exam" && examPlan ? (
                            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="h-full relative">
                                <button
                                    onClick={() => setStep("input")}
                                    className="absolute top-4 left-4 z-50 p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all shadow-xl"
                                    title="Back to input"
                                >
                                    <ChevronLeft />
                                </button>
                                <ExamRenderer
                                    plan={examPlan}
                                    baseStyle={hStyle}
                                    pageConfig={pageConfig}
                                />
                            </motion.div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl bg-white/5 p-12 text-center group transition-all hover:bg-white/[0.07]">
                                <div className="p-6 rounded-full bg-holoCyan/5 border border-holoCyan/20 mb-6 group-hover:scale-110 transition-transform">
                                    <BookOpen className="w-16 h-16 text-holoCyan opacity-40" />
                                </div>
                                <h3 className="text-2xl font-bold text-paperWhite mb-2">Exam Preview Canvas</h3>
                                <p className="text-gray-500 max-w-sm">Upload your homework or exam paper. Our AI will solve it step-by-step and render it in your unique handwriting style.</p>

                                <div className="mt-8 flex gap-4 text-xs font-mono text-holoCyan/60">
                                    <span className="px-3 py-1 bg-holoCyan/10 rounded-full">Subject Detection Active</span>
                                    <span className="px-3 py-1 bg-holoCyan/10 rounded-full">Handwriting Sync Ready</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all ${active ? "bg-holoCyan text-deepSpace font-bold" : "text-gray-400 hover:bg-white/5"
                }`}
        >
            {icon}
            <span className="text-[10px]">{label}</span>
        </button>
    );
}
