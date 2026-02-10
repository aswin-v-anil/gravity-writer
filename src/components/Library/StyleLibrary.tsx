"use client";

import React, { useEffect, useState } from 'react';
import { storageService } from '@/lib/storageService';
import { HandwritingStyleProfile } from '@/lib/styleExtraction';
import { Trash2, Check, User } from 'lucide-react';

interface StyleLibraryProps {
    onSelect: (style: HandwritingStyleProfile) => void;
    activeStyleId?: string;
}

export const StyleLibrary: React.FC<StyleLibraryProps> = ({ onSelect, activeStyleId }) => {
    const [styles, setStyles] = useState<HandwritingStyleProfile[]>([]);

    useEffect(() => {
        loadStyles();
    }, []);

    const loadStyles = async () => {
        const list = await storageService.getStyles();
        setStyles(list);
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        await storageService.deleteStyle(id);
        loadStyles();
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {styles.length === 0 ? (
                <div className="col-span-full py-8 text-center bg-white/5 rounded-xl border border-dashed border-white/10 text-gray-500">
                    <p>No custom styles saved yet.</p>
                </div>
            ) : (
                styles.map((style) => (
                    <div 
                        key={style.id}
                        onClick={() => onSelect(style)}
                        className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${
                            activeStyleId === style.id 
                            ? "bg-holoCyan/10 border-holoCyan shadow-[0_0_15px_rgba(0,255,242,0.1)]" 
                            : "bg-white/5 border-white/10 hover:bg-white/20"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeStyleId === style.id ? "bg-holoCyan text-deepSpace" : "bg-white/10 text-gray-400"}`}>
                                <User size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-paperWhite truncate">{style.name}</h4>
                                <p className="text-[10px] text-gray-500">Slant: {style.detectedSlant.toFixed(1)}°</p>
                            </div>
                            {activeStyleId === style.id && <Check className="text-holoCyan w-4 h-4" />}
                        </div>

                        <button 
                            onClick={(e) => handleDelete(e, style.id)}
                            className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 text-red-400 hover:bg-red-500/10 rounded-md transition-all"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))
            )}
        </div>
    );
};
