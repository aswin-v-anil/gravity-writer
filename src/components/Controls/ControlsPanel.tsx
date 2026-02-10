"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pen, Type, AlignLeft, RotateCcw, Palette, FileText, MoveHorizontal, ArrowUpFromLine, Layers, Droplet } from "lucide-react";

export interface HandwritingControls {
    // Handwriting Style
    fontFamily: string;
    fontSize: number;
    inkColor: string;
    messiness: number;
    rotation: number;

    // Spacing
    lineSpacing: number;
    wordSpacing: number;
    letterSpacing: number;
    baselineShift: number;

    // Paper
    paperType: "plain" | "ruled" | "grid" | "vintage";
    paperColor: string;
    marginColor: string;

    // Advanced Effects (HW Settings)
    inkBlur: number;
    inkFlow: number;
    paperTexture: number;
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
            <span className="text-sm font-medium holo-gradient-text">{Math.round(value * 10) / 10}{unit}</span>
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
    const [activeTab, setActiveTab] = useState<"style" | "spacing" | "paper" | "effects">("style");

    const update = (key: keyof HandwritingControls, value: any) => {
        onChange({ ...controls, [key]: value });
    };

    const fonts = [
        // Casual / Everyday
        { name: "Caveat (Default)", value: "Caveat" },
        { name: "Indie Flower", value: "Indie Flower" },
        { name: "Patrick Hand", value: "Patrick Hand" },
        { name: "Kalam", value: "Kalam" },
        { name: "Coming Soon", value: "Coming Soon" },
        { name: "Reenie Beanie", value: "Reenie Beanie" },
        { name: "Gloria Hallelujah", value: "Gloria Hallelujah" },
        { name: "Just Another Hand", value: "Just Another Hand" },
        { name: "Nothing You Could Do", value: "Nothing You Could Do" },
        { name: "Covered By Your Grace", value: "Covered By Your Grace" },

        // Cursive / Elegant
        { name: "Dancing Script", value: "Dancing Script" },
        { name: "Shadows Into Light", value: "Shadows Into Light" },
        { name: "Sacramento", value: "Sacramento" },
        { name: "Zeyada", value: "Zeyada" },
        { name: "Homemade Apple", value: "Homemade Apple" },

        // Bold / Marker
        { name: "Permanent Marker", value: "Permanent Marker" },
        { name: "Walter Turncoat", value: "Walter Turncoat" },

        // Academic / Clean
        { name: "Architects Daughter", value: "Architects Daughter" },
        { name: "Schoolbell", value: "Schoolbell" },

        // Additional Handwriting Fonts
        { name: "Satisfy", value: "Satisfy" },
        { name: "Amatic SC", value: "Amatic SC" },
        { name: "Rock Salt", value: "Rock Salt" },
        { name: "Handlee", value: "Handlee" },
        { name: "Gochi Hand", value: "Gochi Hand" },
        { name: "Bad Script", value: "Bad Script" },
        { name: "Yellowtail", value: "Yellowtail" },
        { name: "Loved by the King", value: "Loved by the King" },
    ];

    const paperTypes = [
        { name: "Plain", value: "plain" as const },
        { name: "Ruled", value: "ruled" as const },
        { name: "Grid", value: "grid" as const },
        { name: "Vintage", value: "vintage" as const },
    ];

    return (
        <div className="frosted-panel rounded-2xl overflow-hidden border border-white/10 flex flex-col h-full">
            {/* Tabs */}
            <div className="flex border-b border-white/10">
                {[
                    { id: "style", icon: Pen, label: "Style" },
                    { id: "spacing", icon: AlignLeft, label: "Spacing" },
                    { id: "paper", icon: FileText, label: "Paper" },
                    { id: "effects", icon: Droplet, label: "Effects" },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === tab.id
                            ? "bg-white/10 text-holoCyan border-b-2 border-holoCyan"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                    {activeTab === "style" && (
                        <motion.div
                            key="style"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-6"
                        >
                            {/* Font Family */}
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 flex items-center gap-2">
                                    <Type size={14} /> Font Style
                                </label>
                                <select
                                    value={controls.fontFamily}
                                    onChange={(e) => update("fontFamily", e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-sm text-paperWhite focus:border-holoCyan outline-none"
                                >
                                    {fonts.map((f) => (
                                        <option key={f.value} value={f.value}>{f.name}</option>
                                    ))}
                                </select>
                            </div>

                            <Slider
                                label="Font Size"
                                icon={Type}
                                value={controls.fontSize}
                                min={10}
                                max={100}
                                onChange={(v) => update("fontSize", v)}
                                unit="px"
                            />

                            <Slider
                                label="Messiness"
                                icon={Pen}
                                value={controls.messiness}
                                min={0}
                                max={100}
                                onChange={(v) => update("messiness", v)}
                                unit="%"
                            />

                            <Slider
                                label="Rotation"
                                icon={RotateCcw}
                                value={controls.rotation}
                                min={0}
                                max={45}
                                onChange={(v) => update("rotation", v)}
                                unit="°"
                            />

                            {/* Ink Color */}
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 flex items-center gap-2">
                                    <Palette size={14} /> Ink Color
                                </label>
                                <input
                                    type="color"
                                    value={controls.inkColor}
                                    onChange={(e) => update("inkColor", e.target.value)}
                                    className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-white/10"
                                />
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "spacing" && (
                        <motion.div
                            key="spacing"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-6"
                        >
                            <Slider
                                label="Line Spacing"
                                icon={AlignLeft}
                                value={controls.lineSpacing}
                                min={0.5}
                                max={3.0}
                                step={0.1}
                                onChange={(v) => update("lineSpacing", v)}
                                unit="x"
                            />

                            <Slider
                                label="Word Spacing"
                                icon={MoveHorizontal}
                                value={controls.wordSpacing}
                                min={0}
                                max={50}
                                onChange={(v) => update("wordSpacing", v)}
                                unit="px"
                            />

                            <Slider
                                label="Letter Spacing"
                                icon={MoveHorizontal}
                                value={controls.letterSpacing}
                                min={-5}
                                max={20}
                                onChange={(v) => update("letterSpacing", v)}
                                unit="px"
                            />

                            <Slider
                                label="Baseline Shift"
                                icon={ArrowUpFromLine}
                                value={controls.baselineShift}
                                min={0}
                                max={20}
                                onChange={(v) => update("baselineShift", v)}
                                unit="px"
                            />
                        </motion.div>
                    )}

                    {activeTab === "paper" && (
                        <motion.div
                            key="paper"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: "plain", name: "Plain" },
                                    { id: "ruled", name: "Ruled" },
                                    { id: "grid", name: "Grid" },
                                    { id: "vintage", name: "Vintage" },
                                ].map((paper) => (
                                    <button
                                        key={paper.id}
                                        onClick={() => update("paperType", paper.id)}
                                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-all border ${controls.paperType === paper.id
                                                ? "bg-holoCyan/20 text-holoCyan border-holoCyan"
                                                : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                                            }`}
                                    >
                                        {paper.name}
                                    </button>
                                ))}
                            </div>

                            {/* Colors */}
                            <div className="space-y-4 pt-4 border-t border-white/10">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 flex items-center gap-2">
                                        <Palette size={14} /> Paper Color
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={controls.paperColor}
                                            onChange={(e) => update("paperColor", e.target.value)}
                                            className="h-10 w-12 rounded bg-transparent border border-white/10 cursor-pointer"
                                        />
                                        <span className="text-xs text-gray-500 font-mono">{controls.paperColor}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 flex items-center gap-2">
                                        <AlignLeft size={14} /> Margin Color
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={controls.marginColor}
                                            onChange={(e) => update("marginColor", e.target.value)}
                                            className="h-10 w-12 rounded bg-transparent border border-white/10 cursor-pointer"
                                        />
                                        <span className="text-xs text-gray-500 font-mono">{controls.marginColor}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "effects" && (
                        <motion.div
                            key="effects"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-6"
                        >
                            <Slider
                                label="Ink Blur"
                                icon={Droplet}
                                value={controls.inkBlur}
                                min={0}
                                max={2}
                                step={0.1}
                                onChange={(v) => update("inkBlur", v)}
                                unit="px"
                            />

                            <Slider
                                label="Ink Flow Variation"
                                icon={Droplet}
                                value={controls.inkFlow}
                                min={0}
                                max={1}
                                step={0.05}
                                onChange={(v) => update("inkFlow", v)}
                            />

                            <Slider
                                label="Paper Texture"
                                icon={Layers}
                                value={controls.paperTexture}
                                min={0}
                                max={1}
                                step={0.05}
                                onChange={(v) => update("paperTexture", v)}
                            />

                            <div className="text-xs text-gray-500 mt-4 p-3 bg-white/5 rounded-lg">
                                These effects add realism by simulating pen pressure and paper grain.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    );
}
