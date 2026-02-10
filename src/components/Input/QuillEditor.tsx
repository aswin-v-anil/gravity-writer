"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";

// Quill styles - import in component to avoid SSR issues
const QUILL_SNOW_CSS = "https://cdn.quilljs.com/1.3.7/quill.snow.css";

interface QuillEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
    className?: string;
}

function QuillEditorComponent({ value, onChange, placeholder, className }: QuillEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load Quill dynamically (client-side only)
    useEffect(() => {
        // Add Quill CSS
        if (!document.querySelector(`link[href="${QUILL_SNOW_CSS}"]`)) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = QUILL_SNOW_CSS;
            document.head.appendChild(link);
        }

        // Dynamically import Quill
        import("quill").then((QuillModule) => {
            const Quill = QuillModule.default;

            if (editorRef.current && !quillRef.current) {
                // Initialize Quill
                quillRef.current = new Quill(editorRef.current, {
                    theme: "snow",
                    placeholder: placeholder || "Start writing...",
                    modules: {
                        toolbar: [
                            [{ header: [1, 2, 3, false] }],
                            ["bold", "italic", "underline", "strike"],
                            [{ list: "ordered" }, { list: "bullet" }],
                            [{ indent: "-1" }, { indent: "+1" }],
                            [{ color: [] }, { background: [] }],
                            ["blockquote", "code-block"],
                            ["clean"],
                        ],
                    },
                });

                // Set initial content
                if (value) {
                    quillRef.current.root.innerHTML = value;
                }

                // Handle text changes
                quillRef.current.on("text-change", () => {
                    const html = quillRef.current.root.innerHTML;
                    onChange(html);
                });

                setIsLoaded(true);
            }
        });

        return () => {
            // Cleanup
            if (quillRef.current) {
                quillRef.current = null;
            }
        };
    }, [placeholder]);

    // Sync external value changes
    useEffect(() => {
        if (quillRef.current && isLoaded) {
            const currentContent = quillRef.current.root.innerHTML;
            if (value !== currentContent) {
                quillRef.current.root.innerHTML = value;
            }
        }
    }, [value, isLoaded]);

    return (
        <div className={`quill-editor-wrapper ${className || ""}`}>
            <style jsx global>{`
                .quill-editor-wrapper .ql-toolbar {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px 8px 0 0;
                }
                .quill-editor-wrapper .ql-container {
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-top: none;
                    border-radius: 0 0 8px 8px;
                    color: #FFFEF5;
                    min-height: 200px;
                    font-family: inherit;
                }
                .quill-editor-wrapper .ql-editor {
                    min-height: 200px;
                    font-size: 16px;
                    line-height: 1.6;
                }
                .quill-editor-wrapper .ql-editor.ql-blank::before {
                    color: rgba(255, 255, 255, 0.4);
                    font-style: normal;
                }
                .quill-editor-wrapper .ql-snow .ql-stroke {
                    stroke: rgba(255, 255, 255, 0.7);
                }
                .quill-editor-wrapper .ql-snow .ql-fill {
                    fill: rgba(255, 255, 255, 0.7);
                }
                .quill-editor-wrapper .ql-snow .ql-picker {
                    color: rgba(255, 255, 255, 0.7);
                }
                .quill-editor-wrapper .ql-snow .ql-picker-options {
                    background: #1a1a1a;
                    border-color: rgba(255, 255, 255, 0.1);
                }
                .quill-editor-wrapper .ql-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-label {
                    border-color: rgba(0, 217, 255, 0.5);
                }
                .quill-editor-wrapper .ql-snow.ql-toolbar button:hover,
                .quill-editor-wrapper .ql-snow .ql-toolbar button:hover {
                    color: #00D9FF;
                }
                .quill-editor-wrapper .ql-snow.ql-toolbar button:hover .ql-stroke,
                .quill-editor-wrapper .ql-snow .ql-toolbar button:hover .ql-stroke {
                    stroke: #00D9FF;
                }
                .quill-editor-wrapper .ql-snow.ql-toolbar button.ql-active .ql-stroke {
                    stroke: #00D9FF;
                }
                .quill-editor-wrapper .ql-snow.ql-toolbar button.ql-active {
                    color: #00D9FF;
                }
            `}</style>

            {!isLoaded && (
                <div className="flex items-center justify-center h-48 bg-white/5 rounded-lg border border-white/10">
                    <div className="animate-pulse text-gray-400">Loading editor...</div>
                </div>
            )}

            <div
                ref={editorRef}
                className={isLoaded ? "" : "hidden"}
            />
        </div>
    );
}

// Export with dynamic import to avoid SSR issues
export default dynamic(() => Promise.resolve(QuillEditorComponent), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-48 bg-white/5 rounded-lg border border-white/10">
            <div className="animate-pulse text-gray-400">Loading editor...</div>
        </div>
    ),
});
