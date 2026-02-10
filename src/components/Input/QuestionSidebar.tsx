"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, CheckSquare, Square, ChevronRight, File } from "lucide-react";

import { SubjectDetectionResult } from "@/lib/subjectDetector";

export interface Question {
    id: string;
    number: string;
    text: string;
    selected: boolean;
    detection?: SubjectDetectionResult;
}

interface QuestionSidebarProps {
    questions: Question[];
    onToggleQuestion: (id: string) => void;
    onGenerate: () => void;
    isGenerating: boolean;
}

export default function QuestionSidebar({
    questions,
    onToggleQuestion,
    onGenerate,
    isGenerating
}: QuestionSidebarProps) {
    const selectedCount = questions.filter(q => q.selected).length;

    return (
        <div className="frosted-panel w-full h-full rounded-2xl flex flex-col overflow-hidden border border-white/10">
            {/* Header */}
            <div className="p-5 border-b border-white/10 bg-black/20">
                <h3 className="text-lg font-bold flex items-center gap-2 text-paperWhite">
                    <FileText className="text-holoCyan" size={20} />
                    Document Questions
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                    Select questions to generate answers
                </p>
            </div>

            {/* Question List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {questions.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                        <File className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No document loaded</p>
                        <p className="text-xs mt-1">Upload a PDF or Image first</p>
                    </div>
                ) : (
                    questions.map((q) => (
                        <motion.div
                            key={q.id}
                            onClick={() => onToggleQuestion(q.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${q.selected
                                ? "bg-holoCyan/10 border-holoCyan/50"
                                : "bg-white/5 border-white/5 hover:bg-white/10"
                                }`}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`mt-1 ${q.selected ? "text-holoCyan" : "text-gray-500"}`}>
                                    {q.selected ? <CheckSquare size={18} /> : <Square size={18} />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-xs font-bold text-gray-400">
                                            {q.number}
                                        </div>
                                        {q.detection && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-holoCyan/20 text-holoCyan border border-holoCyan/30">
                                                {q.detection.subject}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-200 line-clamp-3 leading-relaxed mt-1">
                                        {q.text}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Footer / Action */}
            <div className="p-5 border-t border-white/10 bg-black/20">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-400">Selected:</span>
                    <span className="text-lg font-bold holo-gradient-text">
                        {selectedCount} / {questions.length}
                    </span>
                </div>

                <button
                    onClick={onGenerate}
                    disabled={selectedCount === 0 || isGenerating}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${selectedCount > 0 && !isGenerating
                        ? "holo-gradient text-deepSpace gravity-glow shadow-lg hover:shadow-holoCyan/20"
                        : "bg-gray-800 text-gray-500 cursor-not-allowed"
                        }`}
                >
                    {isGenerating ? (
                        <>Generating...</>
                    ) : (
                        <>
                            Generate Answers <ChevronRight size={18} />
                        </>
                    )}
                </button>
            </div>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
        </div>
    );
}
