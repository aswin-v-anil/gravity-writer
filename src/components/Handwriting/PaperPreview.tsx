"use client";

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { HandwritingEngine, HandwritingStyle, PageConfig } from "@/lib/handwritingEngine";
import { HandwritingControls } from "@/components/Controls/ControlsPanel";
import CanvasInteractionLayer from "./CanvasInteractionLayer";

interface PaperPreviewProps {
    content: string;
    controls: HandwritingControls;
    isExamMode?: boolean;
}

export interface PaperPreviewHandle {
    getCanvas: () => HTMLCanvasElement | null;
}

const PaperPreview = forwardRef<PaperPreviewHandle, PaperPreviewProps>(({ content, controls, isExamMode = false }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const WIDTH = 794;
    const HEIGHT = 1123;

    useImperativeHandle(ref, () => ({
        getCanvas: () => canvasRef.current
    }));

    useEffect(() => {
        if (!canvasRef.current || !content) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Map controls to HandwritingStyle
        const style: HandwritingStyle = {
            font: controls.fontFamily,
            size: controls.fontSize,
            color: controls.inkColor,

            lineHeight: controls.lineSpacing,
            wordSpacing: controls.wordSpacing,
            letterSpacing: controls.letterSpacing,

            perturbation: controls.messiness / 50,
            rotation: controls.rotation,
            baselineShift: controls.baselineShift,
        };

        const pageConfig: PageConfig = {
            paperType: controls.paperType,
            width: canvas.width,
            height: canvas.height,
            marginLeft: 60,
            marginTop: 80,
            paperColor: controls.paperColor,
            marginColor: controls.marginColor
        };

        const engine = new HandwritingEngine(ctx, canvas.width, canvas.height);

        // Cancellation flag to prevent stale updates
        let isCancelled = false;

        const render = async () => {
            // Draw paper (synchronous part)
            // Ideally clear canvas first
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            engine.drawPaper(pageConfig);

            if (isCancelled) return;

            if (isExamMode) {
                try {
                    const data = JSON.parse(content);
                    // Render exam question asynchronously
                    await engine.renderExamQuestion(
                        data.qNum,
                        data.qText,
                        data.ans,
                        style,
                        pageConfig,
                        pageConfig.marginTop
                    );
                } catch (e) {
                    // Fallback to rich text
                    if (!isCancelled) await engine.renderRichText(content, style, pageConfig.marginLeft + 20, pageConfig.marginTop);
                }
            } else {
                // Render rich text asynchronously
                await engine.renderRichText(content, style, pageConfig.marginLeft + 20, pageConfig.marginTop);
            }
        };

        render();

        return () => {
            isCancelled = true;
        };

    }, [content, controls, isExamMode]);

    return (
        <div className="flex justify-center p-4 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl border border-white/20 overflow-auto relative">
            <div className="relative shadow-2xl origin-top transition-transform scale-[0.45] md:scale-[0.55] lg:scale-[0.7]">
                <canvas
                    ref={canvasRef}
                    width={WIDTH}
                    height={HEIGHT}
                    className="bg-white"
                />
                <CanvasInteractionLayer width={WIDTH} height={HEIGHT} scale={1} />
            </div>
        </div>
    );
});

PaperPreview.displayName = "PaperPreview";

export default PaperPreview;
