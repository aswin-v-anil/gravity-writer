"use client";

import React, { useRef, useState, useEffect } from "react";
import { Eraser, Pen, Circle, Square, Minus, Undo, Redo, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface CanvasInteractionLayerProps {
    width: number;
    height: number;
    scale: number;
}

type DrawAction =
    | { type: "path"; points: { x: number; y: number }[]; color: string; width: number }
    | { type: "shape"; shape: "line" | "rect" | "circle"; start: { x: number; y: number }; end: { x: number; y: number }; color: string; width: number };

export default function CanvasInteractionLayer({ width, height, scale }: CanvasInteractionLayerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentTool, setCurrentTool] = useState<"pen" | "eraser" | "line" | "rect" | "circle">("pen");
    const [brushColor, setBrushColor] = useState("#000000");
    const [brushSize, setBrushSize] = useState(2);

    const [actions, setActions] = useState<DrawAction[]>([]);
    const [redoStack, setRedoStack] = useState<DrawAction[]>([]);
    const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
    const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);

    // Re-draw all actions
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        actions.forEach(action => {
            ctx.beginPath();
            ctx.strokeStyle = action.color;
            ctx.lineWidth = action.width;

            if (action.type === "path") {
                if (action.points.length < 2) return;
                ctx.moveTo(action.points[0].x, action.points[0].y);
                for (let i = 1; i < action.points.length; i++) {
                    ctx.lineTo(action.points[i].x, action.points[i].y);
                }
                ctx.stroke();
            } else if (action.type === "shape") {
                const { start, end } = action;
                if (action.shape === "line") {
                    ctx.moveTo(start.x, start.y);
                    ctx.lineTo(end.x, end.y);
                } else if (action.shape === "rect") {
                    ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
                } else if (action.shape === "circle") {
                    const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
                    ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
                }
                ctx.stroke();
            }
        });
    }, [actions, width, height]);

    const getPos = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        // Calculate position relative to canvas size, accounting for CSS scaling
        return {
            x: (clientX - rect.left) * (width / rect.width),
            y: (clientY - rect.top) * (height / rect.height)
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault(); // Prevent scrolling on touch
        setIsDrawing(true);
        const pos = getPos(e);

        if (currentTool === "pen" || currentTool === "eraser") {
            setCurrentPath([pos]);
        } else {
            setStartPoint(pos);
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const pos = getPos(e);

        if (currentTool === "pen" || currentTool === "eraser") {
            setCurrentPath(prev => [...prev, pos]);
            // Live render for current path
            const ctx = canvasRef.current?.getContext("2d");
            if (ctx && currentPath.length > 0) {
                ctx.beginPath();
                ctx.lineWidth = currentTool === "eraser" ? 20 : brushSize;
                ctx.strokeStyle = currentTool === "eraser" ? "rgba(255,255,255,1)" : brushColor;
                if (currentTool === "eraser") ctx.globalCompositeOperation = "destination-out";
                else ctx.globalCompositeOperation = "source-over";

                const last = currentPath[currentPath.length - 1];
                ctx.moveTo(last.x, last.y);
                ctx.lineTo(pos.x, pos.y);
                ctx.stroke();
                ctx.globalCompositeOperation = "source-over"; // Reset
            }
        } else {
            // Live render shape preview (needs overlay or clear/redraw loop - implementing simple version)
            // For simplicity in this step, we just track end point, actual render happens on mouse up
        }
    };

    const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        setIsDrawing(false);
        const pos = getPos(e);

        if (currentTool === "pen" || currentTool === "eraser") {
            const newAction: DrawAction = {
                type: "path",
                points: [...currentPath, pos],
                color: currentTool === "eraser" ? "#ffffff" : brushColor, // Eraser just draws white for now to keep simple logic in array
                width: currentTool === "eraser" ? 20 : brushSize
            };
            setActions(prev => [...prev, newAction]);
        } else if (startPoint) {
            const newAction: DrawAction = {
                type: "shape",
                shape: currentTool,
                start: startPoint,
                end: pos,
                color: brushColor,
                width: brushSize
            };
            setActions(prev => [...prev, newAction]);
        }

        setRedoStack([]);
        setCurrentPath([]);
        setStartPoint(null);
    };

    const undo = () => {
        if (actions.length === 0) return;
        const last = actions[actions.length - 1];
        setActions(prev => prev.slice(0, -1));
        setRedoStack(prev => [...prev, last]);
    };

    const redo = () => {
        if (redoStack.length === 0) return;
        const next = redoStack[redoStack.length - 1];
        setRedoStack(prev => prev.slice(0, -1));
        setActions(prev => [...prev, next]);
    };

    const clear = () => {
        setActions([]);
        setRedoStack([]);
    };

    return (
        <div className="absolute inset-0 pointer-events-none">
            {/* Toolbar - Floats above canvas */}
            <div className="absolute top-4 right-4 bg-gray-900/90 border border-white/20 p-2 rounded-xl backdrop-blur-md flex flex-col gap-2 shadow-2xl pointer-events-auto z-50">
                <div className="grid grid-cols-2 gap-2">
                    <ToolBtn active={currentTool === "pen"} onClick={() => setCurrentTool("pen")} icon={Pen} />
                    <ToolBtn active={currentTool === "eraser"} onClick={() => setCurrentTool("eraser")} icon={Eraser} />
                    <ToolBtn active={currentTool === "line"} onClick={() => setCurrentTool("line")} icon={Minus} className="rotate-45" />
                    <ToolBtn active={currentTool === "rect"} onClick={() => setCurrentTool("rect")} icon={Square} />
                    <ToolBtn active={currentTool === "circle"} onClick={() => setCurrentTool("circle")} icon={Circle} />
                </div>

                <div className="h-px bg-white/20 my-1" />

                <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="w-full h-8 rounded cursor-pointer bg-transparent"
                />
                <input
                    type="range"
                    min="1" max="10"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />

                <div className="h-px bg-white/20 my-1" />

                <div className="flex justify-between gap-1">
                    <ActionBtn onClick={undo} icon={Undo} />
                    <ActionBtn onClick={redo} icon={Redo} />
                    <ActionBtn onClick={clear} icon={Trash2} color="text-red-400" />
                </div>
            </div>

            {/* Drawing Canvas */}
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="absolute inset-0 pointer-events-auto touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />
        </div>
    );
}

const ToolBtn = ({ active, onClick, icon: Icon, className = "" }: any) => (
    <button
        onClick={onClick}
        className={`p-2 rounded-lg transition-all ${active ? "bg-holoCyan text-deepSpace" : "bg-white/5 text-gray-400 hover:bg-white/10"} ${className}`}
    >
        <Icon size={18} />
    </button>
);

const ActionBtn = ({ onClick, icon: Icon, color = "text-gray-400" }: any) => (
    <button
        onClick={onClick}
        className={`p-2 rounded-lg hover:bg-white/10 ${color}`}
    >
        <Icon size={16} />
    </button>
);
