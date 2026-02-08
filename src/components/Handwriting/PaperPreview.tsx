"use client";

import React, { useEffect, useRef } from "react";
import { HandwritingEngine, HandwritingStyle } from "@/lib/handwritingEngine";

interface PaperPreviewProps {
    content: string;
    handwritingStyle?: Partial<HandwritingStyle>;
}

export default function PaperPreview({ content, handwritingStyle }: PaperPreviewProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !content) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const style: HandwritingStyle = {
            font: "Caveat",
            size: 24,
            color: "#1e293b",
            wordSpacing: 10,
            lineHeight: 1.5,
            perturbation: handwritingStyle?.perturbation ?? 0.5,
            ...handwritingStyle
        };

        const engine = new HandwritingEngine(ctx, canvas.width, canvas.height);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        engine.drawPaper();

        let animationFrameId: number;

        const render = () => {
            engine.renderText(content, style);
        };

        animationFrameId = requestAnimationFrame(() => {
            requestAnimationFrame(render);
        });

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };

    }, [content, handwritingStyle]);

    return (
        <div className="flex justify-center p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl border border-white/20 overflow-hidden">
            <canvas
                ref={canvasRef}
                width={794}
                height={1123}
                className="shadow-2xl bg-white scale-[0.5] origin-top md:scale-[0.6] lg:scale-75 transition-transform"
            />
        </div>
    );
}
