"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout/Layout";
import { BookOpen, Clock, User, Trash2, FileDown } from "lucide-react";
import { motion } from "framer-motion";
import { storageService } from "@/lib/storageService";
import { StyleLibrary } from "@/components/Library/StyleLibrary";
import { HandwritingStyleProfile } from "@/lib/styleExtraction";

export default function LibraryPage() {
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        const list = await storageService.getHistory();
        // Sort by newest first
        setHistory(list.sort((a, b) => b.timestamp - a.timestamp));
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto p-8 space-y-12">
                {/* Header */}
                <header className="flex items-end gap-4 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-holoCyan/10 flex items-center justify-center gravity-glow">
                        <BookOpen size={32} className="text-holoCyan" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold gradient-text">Library</h1>
                        <p className="text-gray-400">Manage your handwriting styles and previous work history.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left: Work History */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock size={20} className="text-holoCyan" />
                            <h2 className="text-xl font-bold text-paperWhite">Work History</h2>
                        </div>

                        {history.length === 0 ? (
                            <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/5">
                                <p className="text-gray-500">No generated work found.</p>
                                <p className="text-sm text-gray-600">Start by generating an exam in the dashboard.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {history.map((work) => (
                                    <div key={work.id} className="p-5 rounded-2xl border border-white/10 bg-black/20 hover:bg-black/30 transition-all flex flex-col gap-4">
                                        <div className="flex justify-between items-start">
                                            <span className="px-3 py-1 bg-holoCyan/10 text-holoCyan text-[10px] font-bold rounded-full uppercase tracking-widest border border-holoCyan/20">
                                                {work.subject}
                                            </span>
                                            <span className="text-[10px] text-gray-500">
                                                {new Date(work.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-paperWhite line-clamp-1">{work.plan.totalPages} Page Exam</h3>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">Detailed handwritten solution generated from document.</p>
                                        </div>
                                        <div className="flex gap-2 mt-auto">
                                            <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2">
                                                <FileDown size={14} /> Open
                                            </button>
                                            <button className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Styles */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <User size={20} className="text-holoCyan" />
                            <h2 className="text-xl font-bold text-paperWhite">Handwriting Styles</h2>
                        </div>
                        <StyleLibrary onSelect={() => { }} />

                        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                            <p className="text-xs text-orange-200 leading-relaxed font-medium">
                                <span className="font-bold">Tip:</span> You can create new styles by uploading a sample image in the main editor.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
