"use client";

import React, { useRef, useState, useEffect } from "react";
import { SAMPLE_CHARACTERS } from "@/lib/characterProfiles";
import { motion } from "framer-motion";
import { Check, Trash2, Undo2 } from "lucide-react";

interface CharacterCanvasProps {
    character: string;
    onCapture: (char: string, imageData: string, width: number, height: number) => void;
    hasSample: boolean;
}

function CharacterCanvas({ character, onCapture, hasSample }: CharacterCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);
    const lastPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Clear and setup
        ctx.fillStyle = "#FFFEF5";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw guide character (very light)
        ctx.font = "bold 48px sans-serif";
        ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(character, canvas.width / 2, canvas.height / 2);
    }, [character]);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        const pos = getPos(e);
        lastPos.current = pos;
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        const pos = getPos(e);

        ctx.strokeStyle = "#1a365d";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();

        lastPos.current = pos;
        setHasDrawn(true);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const getPos = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();

        if ("touches" in e) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top,
            };
        }
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        ctx.fillStyle = "#FFFEF5";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Redraw guide
        ctx.font = "bold 48px sans-serif";
        ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(character, canvas.width / 2, canvas.height / 2);

        setHasDrawn(false);
    };

    const saveCharacter = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const imageData = canvas.toDataURL("image/png");
        onCapture(character, imageData, canvas.width, canvas.height);
    };

    return (
        <div className="relative group">
            <canvas
                ref={canvasRef}
                width={80}
                height={80}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className={`border rounded-lg cursor-crosshair touch-none transition-all ${hasSample
                        ? "border-emerald-400 ring-2 ring-emerald-200"
                        : hasDrawn
                            ? "border-amber-400 ring-2 ring-amber-200"
                            : "border-slate-300 hover:border-indigo-400"
                    }`}
            />

            {/* Character label */}
            <span className="absolute -top-1 -left-1 bg-slate-700 text-white text-xs px-1.5 py-0.5 rounded font-mono">
                {character}
            </span>

            {/* Action buttons (visible on hover or when drawn) */}
            {hasDrawn && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    <button
                        onClick={saveCharacter}
                        className="p-1 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors"
                        title="Save"
                    >
                        <Check size={12} />
                    </button>
                    <button
                        onClick={clearCanvas}
                        className="p-1 bg-slate-500 text-white rounded-full hover:bg-slate-600 transition-colors"
                        title="Clear"
                    >
                        <Undo2 size={12} />
                    </button>
                </div>
            )}

            {/* Checkmark for saved */}
            {hasSample && (
                <div className="absolute top-1 right-1 text-emerald-500">
                    <Check size={16} />
                </div>
            )}
        </div>
    );
}

interface CharacterGridProps {
    sampledCharacters: string[];
    onCapture: (char: string, imageData: string, width: number, height: number) => void;
}

export default function CharacterGrid({ sampledCharacters, onCapture }: CharacterGridProps) {
    // Group characters by type
    const uppercase = SAMPLE_CHARACTERS.filter((c) => c >= 'A' && c <= 'Z');
    const lowercase = SAMPLE_CHARACTERS.filter((c) => c >= 'a' && c <= 'z');
    const numbers = SAMPLE_CHARACTERS.filter((c) => c >= '0' && c <= '9');
    const punctuation = SAMPLE_CHARACTERS.filter(
        (c) => !((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9'))
    );

    const renderGroup = (title: string, chars: string[]) => (
        <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-600">{title}</h3>
            <div className="flex flex-wrap gap-4">
                {chars.map((char) => (
                    <CharacterCanvas
                        key={char}
                        character={char}
                        onCapture={onCapture}
                        hasSample={sampledCharacters.includes(char)}
                    />
                ))}
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div className="text-center text-sm text-slate-500">
                Draw each character in the boxes below. Click the checkmark to save.
            </div>

            {renderGroup("Uppercase Letters", uppercase)}
            {renderGroup("Lowercase Letters", lowercase)}
            {renderGroup("Numbers", numbers)}
            {renderGroup("Punctuation", punctuation)}
        </motion.div>
    );
}
