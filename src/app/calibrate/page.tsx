"use client";

import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout/Layout";
import CharacterGrid from "@/components/Calibrate/CharacterGrid";
import {
    HandwritingProfile,
    createProfile,
    addCharacterSample,
    saveProfile,
    getAllProfiles,
    getCompletionPercentage,
    SAMPLE_CHARACTERS
} from "@/lib/characterProfiles";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Pencil, Trash2, Upload, Download, Loader2 } from "lucide-react";
import { generateTemplate } from "@/lib/templateGenerator";
import { processTemplate } from "@/lib/templateProcessor";

export default function Calibrate() {
    const [profiles, setProfiles] = useState<HandwritingProfile[]>([]);
    const [activeProfile, setActiveProfile] = useState<HandwritingProfile | null>(null);
    const [profileName, setProfileName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isProcessingTemplate, setIsProcessingTemplate] = useState(false);

    // Load existing profiles
    useEffect(() => {
        getAllProfiles().then(setProfiles);
    }, []);

    const handleCreateProfile = async () => {
        if (!profileName.trim()) return;

        const newProfile = createProfile(profileName.trim());
        await saveProfile(newProfile);
        setProfiles([...profiles, newProfile]);
        setActiveProfile(newProfile);
        setProfileName("");
        setIsCreating(false);
    };

    const handleCharacterCapture = async (
        char: string,
        imageData: string,
        width: number,
        height: number
    ) => {
        if (!activeProfile) return;

        const updated = addCharacterSample(activeProfile, char, imageData, width, height);
        setActiveProfile(updated);

        // Auto-save
        setIsSaving(true);
        await saveProfile(updated);
        setIsSaving(false);

        // Update profiles list
        setProfiles(profiles.map((p) => (p.id === updated.id ? updated : p)));
    };

    const getSampledChars = (profile: HandwritingProfile): string[] => {
        return Object.keys(profile.characters).filter(
            (char) => profile.characters[char].length > 0
        );
    };

    const handleDownloadTemplate = () => {
        const dataUrl = generateTemplate();
        // Create an temporary link to download
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "handwriting_template.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleProcessTemplate = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;

        setIsProcessingTemplate(true);
        try {
            const file = e.target.files[0];
            const chars = await processTemplate(file);

            // Create new profile
            const name = `Imported Profile ${new Date().toLocaleDateString()}`;
            let newProfile = createProfile(name);

            // Add chars with approx dimensions
            Object.entries(chars).forEach(([char, dataUrl]) => {
                newProfile = addCharacterSample(newProfile, char, dataUrl, 228, 243);
            });

            await saveProfile(newProfile);
            setProfiles([...profiles, newProfile]);
            setActiveProfile(newProfile);
        } catch (err: any) {
            console.error(err);
            alert("Failed to process template. Please ensure the image is clear and alignment markers are visible.");
        } finally {
            setIsProcessingTemplate(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 p-4">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold holo-gradient-text">
                        Custom Handwriting Generator
                    </h1>
                    <p className="text-gray-400">
                        Draw your characters to create a unique digital handwriting style.
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {!activeProfile ? (
                        /* Profile Selection / Creation */
                        <motion.div
                            key="profile-select"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-xl mx-auto space-y-6"
                        >
                            {/* Existing Profiles */}
                            {profiles.length > 0 && (
                                <div className="frosted-panel rounded-2xl p-6 space-y-4">
                                    <h2 className="text-lg font-semibold text-paperWhite">
                                        Your Handwriting Profiles
                                    </h2>
                                    <div className="space-y-2">
                                        {profiles.map((profile) => (
                                            <button
                                                key={profile.id}
                                                onClick={() => setActiveProfile(profile)}
                                                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Pencil size={18} className="text-holoCyan" />
                                                    <span className="text-paperWhite font-medium">
                                                        {profile.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-500">
                                                        {getCompletionPercentage(profile)}% complete
                                                    </span>
                                                    <ChevronRight
                                                        size={18}
                                                        className="text-gray-500 group-hover:text-holoCyan transition-colors"
                                                    />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Create New Profile */}
                            <div className="frosted-panel rounded-2xl p-6 space-y-4">
                                <h2 className="text-lg font-semibold text-paperWhite">
                                    {profiles.length > 0 ? "Create New Profile" : "Start Your First Profile"}
                                </h2>

                                {isCreating ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={profileName}
                                            onChange={(e) => setProfileName(e.target.value)}
                                            placeholder="Enter profile name..."
                                            className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-paperWhite placeholder:text-gray-500 focus:border-holoCyan outline-none"
                                            autoFocus
                                        />
                                        <button
                                            onClick={handleCreateProfile}
                                            className="px-4 py-2 bg-holoCyan text-black rounded-lg font-medium hover:bg-holoMint transition-colors"
                                        >
                                            Create
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsCreating(true)}
                                        className="w-full py-4 border-2 border-dashed border-white/20 rounded-xl text-gray-400 hover:text-holoCyan hover:border-holoCyan transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Pencil size={18} />
                                        Create New Handwriting Profile
                                    </button>
                                )}
                            </div>

                            {/* Template Section */}
                            <div className="frosted-panel rounded-2xl p-6 space-y-4">
                                <h2 className="text-lg font-semibold text-paperWhite">
                                    Import from Template
                                </h2>
                                <p className="text-sm text-gray-400">
                                    Download the template, fill it out, and upload a photo to create a profile instantly.
                                </p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleDownloadTemplate}
                                        className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 hover:border-white/20 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Download size={18} />
                                        Download Template
                                    </button>
                                    <label className="flex-1 py-3 bg-holoCyan/10 border border-holoCyan/30 rounded-xl text-holoCyan hover:bg-holoCyan/20 cursor-pointer transition-colors flex items-center justify-center gap-2 relative overflow-hidden">
                                        {isProcessingTemplate ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={18} />
                                                Upload Filled Template
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleProcessTemplate}
                                            className="hidden"
                                            disabled={isProcessingTemplate}
                                        />
                                    </label>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        /* Character Grid Drawing */
                        <motion.div
                            key="character-grid"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Profile Header */}
                            <div className="frosted-panel rounded-2xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setActiveProfile(null)}
                                        className="text-gray-400 hover:text-paperWhite transition-colors"
                                    >
                                        ← Back
                                    </button>
                                    <div>
                                        <h2 className="text-lg font-semibold text-paperWhite">
                                            {activeProfile.name}
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            {getSampledChars(activeProfile).length} / {SAMPLE_CHARACTERS.length} characters
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {isSaving && (
                                        <span className="text-sm text-gray-500">Saving...</span>
                                    )}
                                    <div className="text-right">
                                        <div className="text-2xl font-bold holo-gradient-text">
                                            {getCompletionPercentage(activeProfile)}%
                                        </div>
                                        <p className="text-xs text-gray-500">Complete</p>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-holoCyan to-holoMint"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${getCompletionPercentage(activeProfile)}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>

                            {/* Character Grid */}
                            <div className="frosted-panel rounded-2xl p-6">
                                <CharacterGrid
                                    sampledCharacters={getSampledChars(activeProfile)}
                                    onCapture={handleCharacterCapture}
                                />
                            </div>

                            {/* Completion Message */}
                            {getCompletionPercentage(activeProfile) === 100 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-6 text-center"
                                >
                                    <Check size={48} className="text-emerald-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-emerald-400">
                                        Profile Complete!
                                    </h3>
                                    <p className="text-gray-400 mt-2">
                                        Your handwriting is ready to use. Select this profile in the main app.
                                    </p>
                                    <button
                                        onClick={() => window.location.href = "/"}
                                        className="mt-4 px-6 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
                                    >
                                        Start Writing
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Layout>
    );
}
