"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, FileText, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const navItems = [
        { name: "Create", href: "/", icon: Sparkles },
        { name: "Library", href: "/notes", icon: FileText },
        { name: "Settings", href: "/calibrate", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-deepSpace text-paperWhite relative overflow-hidden">
            {/* Animated background */}
            <div className="fixed inset-0 bg-gradient-to-br from-deepSpace via-deepSpace to-black pointer-events-none" />
            <div
                className="fixed inset-0 opacity-30 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0, 217, 255, 0.15) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(0, 255, 224, 0.1) 0%, transparent 50%)`,
                }}
            />

            {/* Navbar */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="fixed top-0 left-0 right-0 z-50 frosted-panel border-b border-white/10"
            >
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <motion.div
                            className="w-9 h-9 rounded-lg holo-gradient flex items-center justify-center gravity-glow"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Sparkles size={20} className="text-deepSpace" />
                        </motion.div>
                        <span className="text-xl font-bold holo-gradient-text">
                            Antigravity
                        </span>
                    </Link>

                    <div className="flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "relative px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                        isActive
                                            ? "text-paperWhite"
                                            : "text-gray-400 hover:text-paperWhite"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-white/10 rounded-lg"
                                            transition={{ type: "spring", duration: 0.5 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        <item.icon size={16} />
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-5 py-2 holo-gradient rounded-full text-sm font-semibold text-deepSpace gravity-glow transition-all"
                    >
                        Sign In
                    </motion.button>
                </div>
            </motion.nav>

            {/* Main Content */}
            <main className="relative z-10 pt-24 pb-16 px-6 max-w-7xl mx-auto">
                {children}
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 frosted-panel mt-20">
                <div className="max-w-7xl mx-auto px-6 py-8 text-center text-sm text-gray-400">
                    <p>© 2026 Antigravity. Defying gravity, one note at a time.</p>
                </div>
            </footer>
        </div>
    );
}
