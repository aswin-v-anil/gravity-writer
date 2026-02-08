"use client";

import React from "react";
import { motion } from "framer-motion";
import { Pen } from "lucide-react";

interface InkPressureSliderProps {
    value: number;
    onChange: (value: number) => void;
}

export default function InkPressureSlider({ value, onChange }: InkPressureSliderProps) {
    return (
        <div className="frosted-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-holoCyan/20 flex items-center justify-center">
                        <Pen className="w-5 h-5 text-holoCyan" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-paperWhite">Handwriting Pressure</h3>
                        <p className="text-xs text-gray-400">Adjust messiness level</p>
                    </div>
                </div>
                <div className="text-2xl font-bold holo-gradient-text">
                    {value}%
                </div>
            </div>

            {/* Custom slider */}
            <div className="relative">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer slider"
                    style={{
                        background: `linear-gradient(to right, 
              #00D9FF 0%, 
              #00FFE0 ${value}%, 
              rgba(255,255,255,0.1) ${value}%, 
              rgba(255,255,255,0.1) 100%
            )`,
                    }}
                />

                {/* Labels */}
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>Perfect</span>
                    <span>Natural</span>
                    <span>Messy</span>
                </div>
            </div>

            {/* Visual preview indicators */}
            <div className="flex items-center gap-2 pt-2">
                {[0, 25, 50, 75, 100].map((preset) => (
                    <motion.button
                        key={preset}
                        onClick={() => onChange(preset)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex-1 h-8 rounded-lg transition-all ${Math.abs(value - preset) < 10
                                ? "bg-holoCyan/30 border-2 border-holoCyan"
                                : "bg-white/5 border border-white/10"
                            }`}
                    >
                        <span className="text-xs font-medium">{preset}</span>
                    </motion.button>
                ))}
            </div>

            <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00D9FF, #00FFE0);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(0, 217, 255, 0.5);
          transition: transform 0.2s;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 20px rgba(0, 217, 255, 0.8);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00D9FF, #00FFE0);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(0, 217, 255, 0.5);
        }
      `}</style>
        </div>
    );
}
