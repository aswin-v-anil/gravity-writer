"use client";

import React from "react";
import Layout from "@/components/Layout/Layout";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function LibraryPage() {
    return (
        <Layout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-24 h-24 rounded-full bg-holoCyan/10 flex items-center justify-center mb-6 gravity-glow"
                >
                    <BookOpen size={48} className="text-holoCyan" />
                </motion.div>
                <h1 className="text-3xl font-bold mb-4 gradient-text">Library</h1>
                <p className="text-gray-400 max-w-md">
                    Your saved documents and generated handwriting styles will appear here.
                    <br />
                    <span className="text-sm opacity-60">(Coming Soon)</span>
                </p>
            </div>
        </Layout>
    );
}
