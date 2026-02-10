"use client";

import React, { useState } from "react";
import QuillEditor from "./QuillEditor";
import { motion } from "framer-motion";
import { Type, Wand2, FileText } from "lucide-react";

interface RichTextInputProps {
    onGenerate: (content: string) => void;
    isGenerating?: boolean;
}

export default function RichTextInput({ onGenerate, isGenerating }: RichTextInputProps) {
    const [content, setContent] = useState("");
    const [mode, setMode] = useState<"write" | "paste">("write");

    const handleGenerate = () => {
        if (content.trim()) {
            onGenerate(content);
        }
    };

    // Strip HTML tags for plain text mode (SSR-safe, no document usage)
    const getPlainText = (html: string) => {
        return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    };

    const wordCount = getPlainText(content).split(/\s+/).filter(Boolean).length;

    return (
        <div className="space-y-4">
            {/* Mode Toggle */}
            <div className="flex gap-2">
                <button
                    onClick={() => setMode("write")}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${mode === "write"
                        ? "bg-holoCyan/20 text-holoCyan border border-holoCyan"
                        : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                        }`}
                >
                    <Type size={16} />
                    Write / Paste Text
                </button>
                <button
                    onClick={() => setMode("paste")}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${mode === "paste"
                        ? "bg-holoCyan/20 text-holoCyan border border-holoCyan"
                        : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                        }`}
                >
                    <FileText size={16} />
                    Upload Document
                </button>
            </div>

            {/* Editor */}
            {mode === "write" && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <QuillEditor
                        value={content}
                        onChange={setContent}
                        placeholder="Enter your text here. Use formatting for bold, italic, lists, headers..."
                    />

                    {/* Word Count */}
                    <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                        <span>{wordCount} words</span>
                        <span>{content.length} characters</span>
                    </div>
                </motion.div>
            )}

            {/* Paste Mode Placeholder */}
            {mode === "paste" && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-2 border-dashed border-white/20 rounded-xl p-12 flex flex-col items-center justify-center gap-4 bg-white/5"
                >
                    <FileText size={48} className="text-gray-500" />
                    <p className="text-gray-400">Drag & drop a document or paste text</p>
                    <p className="text-xs text-gray-600">Supports .txt, .docx, .md files</p>
                </motion.div>
            )}

            {/* Generate Button */}
            <motion.button
                onClick={handleGenerate}
                disabled={!content.trim() || isGenerating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3 ${content.trim() && !isGenerating
                    ? "holo-gradient text-deepSpace gravity-glow cursor-pointer"
                    : "bg-white/10 text-gray-500 cursor-not-allowed"
                    }`}
            >
                <Wand2 size={20} />
                {isGenerating ? "Generating..." : "Generate Handwriting"}
            </motion.button>
        </div>
    );
}
