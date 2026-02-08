"use client";

import React, { useEffect, useRef } from "react";
import { HandwritingEngine, HandwritingStyle, PageConfig } from "@/lib/handwritingEngine";
import { HandwritingControls } from "@/components/Controls/ControlsPanel";

interface PaperPreviewProps {
    content: string;
    controls: HandwritingControls;
}

export default function PaperPreview({ content, controls }: PaperPreviewProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !content) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Map controls to HandwritingStyle
        const style: HandwritingStyle = {
            font: "Caveat",
            size: controls.fontSize,
            color: controls.inkColor,
            wordSpacing: 8,
            lineHeight: controls.lineSpacing,
            perturbation: controls.messiness / 50, // Scale 0-100 to 0-2
            rotation: controls.rotation,
        };

        const pageConfig: PageConfig = {
            paperType: controls.paperType,
            width: canvas.width,
            height: canvas.height,
            marginLeft: 60,
            marginTop: 80,
        };

        const engine = new HandwritingEngine(ctx, canvas.width, canvas.height);

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw paper and render text
        requestAnimationFrame(() => {
            engine.drawPaper(pageConfig);
            engine.renderText(
                content,
                style,
                pageConfig.marginLeft + 20,
                pageConfig.marginTop
            );
        });

    }, [content, controls]);

    return (
        <div className="flex justify-center p-4 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl border border-white/20 overflow-auto">
            <canvas
                ref={canvasRef}
                width={794}
                height={1123}
                className="shadow-2xl bg-white scale-[0.45] origin-top md:scale-[0.55] lg:scale-[0.7] transition-transform"
            />
        </div>
    );
}
