"use client";

import React from "react";
import { motion } from "framer-motion";
import { Pen, Type, AlignLeft, RotateCcw, Palette, FileText } from "lucide-react";

export interface HandwritingControls {
    fontSize: number;
    lineSpacing: number;
    messiness: number;
    rotation: number;
    inkColor: string;
    paperType: "plain" | "ruled" | "grid";
}

interface ControlsPanelProps {
    controls: HandwritingControls;
    onChange: (controls: HandwritingControls) => void;
}

const Slider = ({
    label,
    value,
    min,
    max,
    step = 1,
    icon: Icon,
    onChange,
    unit = ""
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    icon: any;
    onChange: (v: number) => void;
    unit?: string;
}) => (
    <div className="space-y-2">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-400">
                <Icon size={14} />
                {label}
            </div>
            <span className="text-sm font-medium holo-gradient-text">{value}{unit}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
            style={{
                background: `linear-gradient(to right, #00D9FF 0%, #00FFE0 ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) 100%)`,
            }}
        />
    </div>
);

export default function ControlsPanel({ controls, onChange }: ControlsPanelProps) {
    const update = (key: keyof HandwritingControls, value: any) => {
        onChange({ ...controls, [key]: value });
    };

    const inkColors = [
        { name: "Blue", value: "#1a365d" },
        { name: "Black", value: "#1a1a1a" },
        { name: "Dark Blue", value: "#0d47a1" },
    ];

    const paperTypes = [
        { name: "Plain", value: "plain" as const },
        { name: "Ruled", value: "ruled" as const },
        { name: "Grid", value: "grid" as const },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="frosted-panel p-6 rounded-2xl space-y-6"
        >
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <Pen className="w-5 h-5 text-holoCyan" />
                Handwriting Controls
            </h3>

            <div className="space-y-5">
                {/* Font Size */}
                <Slider
                    label="Font Size"
                    icon={Type}
                    value={controls.fontSize}
                    min={16}
                    max={48}
                    onChange={(v) => update("fontSize", v)}
                    unit="px"
                />

                {/* Line Spacing */}
                <Slider
                    label="Line Spacing"
                    icon={AlignLeft}
                    value={controls.lineSpacing}
                    min={1}
                    max={2.5}
                    step={0.1}
                    onChange={(v) => update("lineSpacing", v)}
                    unit="x"
                />

                {/* Messiness */}
                <Slider
                    label="Messiness"
                    icon={Pen}
                    value={controls.messiness}
                    min={0}
                    max={100}
                    onChange={(v) => update("messiness", v)}
                    unit="%"
                />

                {/* Rotation */}
                <Slider
                    label="Rotation Variance"
                    icon={RotateCcw}
                    value={controls.rotation}
                    min={0}
                    max={15}
                    onChange={(v) => update("rotation", v)}
                    unit="°"
                />
            </div>

            {/* Ink Color */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Palette size={14} />
                    Ink Color
                </div>
                <div className="flex gap-2">
                    {inkColors.map((color) => (
                        <motion.button
                            key={color.value}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => update("inkColor", color.value)}
                            className={`w-10 h-10 rounded-full border-2 transition-all ${controls.inkColor === color.value
                                    ? "border-holoCyan gravity-glow"
                                    : "border-white/20"
                                }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                        />
                    ))}
                </div>
            </div>

            {/* Paper Type */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <FileText size={14} />
                    Paper Type
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {paperTypes.map((paper) => (
                        <motion.button
                            key={paper.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => update("paperType", paper.value)}
                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${controls.paperType === paper.value
                                    ? "bg-holoCyan/20 border border-holoCyan text-paperWhite"
                                    : "bg-white/5 border border-white/10 text-gray-400"
                                }`}
                        >
                            {paper.name}
                        </motion.button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
