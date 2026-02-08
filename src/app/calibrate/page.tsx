"use client";

import React, { useState } from "react";
import Layout from "@/components/Layout/Layout";
import { Upload, Camera, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Calibrate() {
    const [samples, setSamples] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [calibrationComplete, setCalibrationComplete] = useState(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSamples([...samples, ...Array.from(e.target.files)]);
        }
    };

    const startCalibration = async () => {
        setIsProcessing(true);
        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 3000));
        setIsProcessing(false);
        setCalibrationComplete(true);
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900">Calibrate Your Handwriting</h1>
                    <p className="text-slate-600">
                        Upload a photo of your handwriting to create a custom digital replica.
                    </p>
                </div>

                {!calibrationComplete ? (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center gap-4 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-indigo-600">
                                <Camera size={32} />
                            </div>
                            <div className="text-center">
                                <p className="font-medium text-slate-900">Upload Handwriting Samples</p>
                                <p className="text-sm text-slate-500">Take a clear photo of a page of text</p>
                            </div>
                        </div>

                        {samples.length > 0 && (
                            <div className="mt-6 space-y-4">
                                <p className="text-sm font-medium text-slate-700">{samples.length} image(s) selected</p>
                                <button
                                    onClick={startCalibration}
                                    disabled={isProcessing}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? "Analyzing Strokes..." : "Generate My Font"}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center space-y-4">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                            <Check size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-emerald-900">Calibration Complete!</h2>
                        <p className="text-emerald-700">
                            Your unique handwriting profile has been created. You can now use it to generate notes.
                        </p>
                        <button
                            onClick={() => window.location.href = "/"}
                            className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                        >
                            Start Writing
                        </button>
                    </div>
                )}
            </div>
        </Layout>
    );
}
