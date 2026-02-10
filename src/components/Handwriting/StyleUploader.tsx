"use client";

import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { extractStyleFromImage, HandwritingStyleProfile } from '@/lib/styleExtraction';

interface StyleUploaderProps {
    onStyleGenerated: (style: HandwritingStyleProfile) => void;
}

export const StyleUploader: React.FC<StyleUploaderProps> = ({ onStyleGenerated }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onload = async (event) => {
            const dataUrl = event.target?.result as string;
            setPreviewUrl(dataUrl);

            // Process
            setIsProcessing(true);
            try {
                const profile = await extractStyleFromImage(dataUrl, file.name);
                onStyleGenerated(profile);
            } catch (error) {
                console.error("Style extraction failed", error);
                alert("Failed to analyze handwriting style.");
            } finally {
                setIsProcessing(false);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="flex flex-col items-center justify-center text-center">
                <div
                    className="w-full h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="h-full w-full object-contain p-2 opacity-50" />
                    ) : (
                        <>
                            <Upload className="w-8 h-8 text-slate-400 mb-2" />
                            <p className="text-sm text-slate-500 font-medium">Upload Handwriting Sample</p>
                            <span className="text-xs text-slate-400">.jpg, .png</span>
                        </>
                    )}

                    {isProcessing && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                            <span className="ml-2 text-sm font-semibold text-indigo-800">Analyzing...</span>
                        </div>
                    )}
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    title="Upload handwriting sample"
                />

                <div className="mt-4 flex gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" /> Auto-Slant
                    </div>
                    <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" /> Stroke Width
                    </div>
                    <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" /> Pressure
                    </div>
                </div>
            </div>
        </div>
    );
};
