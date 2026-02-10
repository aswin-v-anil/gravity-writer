"use client";

import React, { useEffect, useRef, useState } from 'react';
import { HandwritingEngine, HandwritingStyle, PageConfig } from '@/lib/handwritingEngine';
import { ExamPlan, PageContent } from '@/lib/examPlanner';
import { HandDrawnDiagram } from '@/components/Diagrams/HandDrawnDiagram';
import { Download, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface ExamRendererProps {
    plan: ExamPlan;
    baseStyle: HandwritingStyle;
    pageConfig: PageConfig;
}

export const ExamRenderer: React.FC<ExamRendererProps> = ({ plan, baseStyle, pageConfig }) => {
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        renderAllPages();
    }, [plan, baseStyle, pageConfig]);

    const renderAllPages = async () => {
        setIsGenerating(true);
        for (let i = 0; i < plan.pages.length; i++) {
            const canvas = canvasRefs.current[i];
            if (!canvas) continue;

            const ctx = canvas.getContext('2d');
            if (!ctx) continue;

            const engine = new HandwritingEngine(ctx, pageConfig.width, pageConfig.height);

            // 1. Fatigue Simulation
            // Increase messiness and slant slightly per page
            const fatigueMultiplier = 1 + (i * 0.15);
            const pageStyle: HandwritingStyle = {
                ...baseStyle,
                perturbation: baseStyle.perturbation * fatigueMultiplier,
                baselineShift: baseStyle.baselineShift * fatigueMultiplier,
                slant: baseStyle.slant + (i * 0.5), // Subtle lean change
                wordSpacing: baseStyle.wordSpacing * (1 + i * 0.05), // Writing faster spreads words
            };

            // 2. Draw Paper
            engine.drawPaper(pageConfig);

            // 3. Render Header (Exam Subject)
            const headerY = pageConfig.marginTop;
            await engine.renderText(plan.subject.toUpperCase(), { ...pageStyle, size: pageStyle.size * 0.8, color: "#64748b" }, pageConfig.marginLeft, headerY - 40);

            // 4. Render Page Content
            const page = plan.pages[i];
            await engine.renderRichText(page.content, pageStyle, pageConfig.marginLeft + 20, headerY);

            // 5. Ink flow variation (subtle opacity changes)
            applyInkVaration(ctx, pageConfig);
        }
        setIsGenerating(false);
    };

    const applyInkVaration = (ctx: CanvasRenderingContext2D, config: PageConfig) => {
        // Overlay very subtle noise to simulate ink flow/pressure
        const imageData = ctx.getImageData(0, 0, config.width, config.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            if (data[i] < 200) { // If not background
                const pressure = Math.random() * 20;
                data[i] = Math.max(0, data[i] + pressure);
                data[i + 1] = Math.max(0, data[i + 1] + pressure);
                data[i + 2] = Math.max(0, data[i + 2] + pressure);
            }
        }
        ctx.putImageData(imageData, 0, 0);
    };

    const exportPDF = async () => {
        const doc = new jsPDF({
            orientation: pageConfig.width > pageConfig.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [pageConfig.width, pageConfig.height]
        });

        for (let i = 0; i < plan.pages.length; i++) {
            const canvas = canvasRefs.current[i];
            if (!canvas) continue;

            if (i > 0) doc.addPage();
            const imgData = canvas.toDataURL('image/jpeg', 0.9);
            doc.addImage(imgData, 'JPEG', 0, 0, pageConfig.width, pageConfig.height);
        }

        doc.save(`${plan.subject}_Exam_Paper.pdf`);
    };

    return (
        <div className="flex flex-col items-center gap-6 p-8 bg-slate-100 min-h-screen">
            <div className="flex items-center justify-between w-full max-w-4xl bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                    <FileText className="text-indigo-600" />
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">{plan.subject}</h2>
                        <p className="text-xs text-slate-500">{plan.totalPages} Pages • {isGenerating ? 'Rendering...' : 'Ready'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPageIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentPageIndex === 0}
                        className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"
                        title="Previous Page"
                        aria-label="Previous Page"
                    >
                        <ChevronLeft />
                    </button>
                    <span className="text-sm font-medium text-slate-600 px-4">
                        Page {currentPageIndex + 1} of {plan.totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPageIndex(prev => Math.min(plan.totalPages - 1, prev + 1))}
                        disabled={currentPageIndex === plan.totalPages - 1}
                        className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"
                        title="Next Page"
                        aria-label="Next Page"
                    >
                        <ChevronRight />
                    </button>
                </div>

                <button
                    onClick={exportPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                >
                    <Download className="w-4 h-4" />
                    <span>Export PDF</span>
                </button>
            </div>

            <div className="relative shadow-2xl rounded-sm border border-slate-300 bg-white">
                {plan.pages.map((page, idx) => (
                    <div key={idx} className={idx === currentPageIndex ? 'block' : 'hidden'}>
                        <canvas
                            ref={el => { canvasRefs.current[idx] = el; }}
                            width={pageConfig.width}
                            height={pageConfig.height}
                            className="bg-white max-w-full h-auto"
                        />

                        {/* Overlay Diagram if needed */}
                        {page.hasDiagram && (
                            <div className="absolute top-[30%] right-[10%] w-[300px]">
                                <HandDrawnDiagram type={page.diagramType as any} width={300} height={200} />
                                <p className="text-center text-[10px] text-slate-400 italic">Fig 1.1: {page.diagramType} diagram integrated into flow</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex gap-4 overflow-x-auto p-4 w-full justify-center">
                {plan.pages.map((_, idx) => (
                    <div
                        key={idx}
                        onClick={() => setCurrentPageIndex(idx)}
                        className={`w-12 h-16 border-2 cursor-pointer rounded-sm overflow-hidden transition-all ${idx === currentPageIndex ? 'border-indigo-600 scale-110 shadow-lg' : 'border-slate-300 hover:border-indigo-300'}`}
                    >
                        <div className="w-full h-full bg-white flex items-center justify-center text-[10px] font-bold text-slate-400">
                            {idx + 1}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
