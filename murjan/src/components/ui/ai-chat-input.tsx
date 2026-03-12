"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react";
import { Lightbulb, Mic, Globe, Paperclip, Send } from "lucide-react";
import { AnimatePresence, motion, type Variants } from "motion/react";

const PLACEHOLDERS = [
    "Generate website with HextaUI",
    "Create a new project with Next.js",
    "What is the meaning of life?",
    "What is the best way to learn React?",
    "How to cook a delicious meal?",
    "Summarize this article",
];

const AIChatInput = () => {
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [showPlaceholder, setShowPlaceholder] = useState(true);
    const [isActive, setIsActive] = useState(false);
    const [thinkActive, setThinkActive] = useState(false);
    const [deepSearchActive, setDeepSearchActive] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Cycle placeholder text when input is inactive
    useEffect(() => {
        if (isActive || inputValue) return;

        const interval = setInterval(() => {
            setShowPlaceholder(false);
            setTimeout(() => {
                setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
                setShowPlaceholder(true);
            }, 400);
        }, 3000);

        return () => clearInterval(interval);
    }, [isActive, inputValue]);

    // Close input when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                if (!inputValue) setIsActive(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [inputValue]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [inputValue]);

    const handleActivate = () => setIsActive(true);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            // Submit action can be handled here
        }
    };

    const containerVariants: Variants = {
        collapsed: {
            height: 72,
            boxShadow: "0 2px 12px 0 rgba(0,0,0,0.10)",
            transition: { type: "spring", stiffness: 120, damping: 18 },
        },
        expanded: {
            height: 148,
            boxShadow: "0 8px 40px 0 rgba(0,0,0,0.18)",
            transition: { type: "spring", stiffness: 120, damping: 18 },
        },
    };

    const placeholderContainerVariants: Variants = {
        initial: {},
        animate: { transition: { staggerChildren: 0.025 } },
        exit: { transition: { staggerChildren: 0.015, staggerDirection: -1 } },
    };

    const letterVariants: Variants = {
        initial: {
            opacity: 0,
            filter: "blur(12px)",
            y: 10,
        },
        animate: {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            transition: {
                opacity: { duration: 0.25 },
                filter: { duration: 0.4 },
                y: { type: "spring", stiffness: 80, damping: 20 },
            },
        },
        exit: {
            opacity: 0,
            filter: "blur(12px)",
            y: -10,
            transition: {
                opacity: { duration: 0.2 },
                filter: { duration: 0.3 },
                y: { type: "spring", stiffness: 80, damping: 20 },
            },
        },
    };

    return (
        <div className="w-full min-h-screen flex justify-center items-center text-black bg-gray-50">
            <motion.div
                ref={wrapperRef}
                className="w-full max-w-3xl"
                variants={containerVariants}
                animate={isActive || inputValue ? "expanded" : "collapsed"}
                initial="collapsed"
                style={{
                    overflow: "hidden",
                    borderRadius: 28,
                    background: "#ffffff",
                    border: "1px solid rgba(0,0,0,0.08)",
                }}
                onClick={handleActivate}
            >
                <div className="flex flex-col items-stretch w-full h-full">
                    {/* Input Row */}
                    <div className="flex items-start gap-2 px-4 pt-3 pb-2 w-full">
                        {/* Attach Button */}
                        <button
                            className="mt-1 p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800 shrink-0"
                            title="Attach file"
                            type="button"
                            tabIndex={-1}
                        >
                            <Paperclip size={19} />
                        </button>

                        {/* Textarea & Placeholder */}
                        <div className="relative flex-1 min-h-[36px]">
                            <textarea
                                ref={textareaRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onFocus={handleActivate}
                                rows={1}
                                className="w-full resize-none border-0 outline-none bg-transparent text-base text-gray-900 font-normal leading-relaxed py-1.5 px-1 placeholder-transparent"
                                style={{
                                    position: "relative",
                                    zIndex: 1,
                                    minHeight: "36px",
                                    maxHeight: "120px",
                                    overflowY: "auto",
                                    lineHeight: "1.6",
                                }}
                            />
                            {/* Animated Placeholder */}
                            <div className="absolute left-1 top-0 w-full h-full pointer-events-none flex items-center py-1.5">
                                <AnimatePresence mode="wait">
                                    {showPlaceholder && !isActive && !inputValue && (
                                        <motion.span
                                            key={placeholderIndex}
                                            className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 select-none pointer-events-none text-base font-normal"
                                            style={{
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                zIndex: 0,
                                                lineHeight: "1.6",
                                            }}
                                            variants={placeholderContainerVariants}
                                            initial="initial"
                                            animate="animate"
                                            exit="exit"
                                        >
                                            {PLACEHOLDERS[placeholderIndex]
                                                .split("")
                                                .map((char, i) => (
                                                    <motion.span
                                                        key={i}
                                                        variants={letterVariants}
                                                        style={{ display: "inline-block" }}
                                                    >
                                                        {char === " " ? "\u00A0" : char}
                                                    </motion.span>
                                                ))}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 shrink-0 mt-1">
                            <button
                                className="p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800"
                                title="Voice input"
                                type="button"
                                tabIndex={-1}
                            >
                                <Mic size={19} />
                            </button>
                            <motion.button
                                className="flex items-center gap-1 bg-gray-900 hover:bg-gray-700 text-white p-2.5 rounded-full font-medium justify-center transition-colors"
                                title="Send"
                                type="button"
                                tabIndex={-1}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Send size={17} />
                            </motion.button>
                        </div>
                    </div>

                    {/* Expanded Controls */}
                    <motion.div
                        className="w-full flex justify-start px-4 pb-3 items-center text-sm"
                        variants={{
                            hidden: {
                                opacity: 0,
                                y: 16,
                                pointerEvents: "none" as const,
                                transition: { duration: 0.2 },
                            },
                            visible: {
                                opacity: 1,
                                y: 0,
                                pointerEvents: "auto" as const,
                                transition: { duration: 0.3, delay: 0.06 },
                            },
                        } as Variants}
                        initial="hidden"
                        animate={isActive || inputValue ? "visible" : "hidden"}
                    >
                        <div className="flex gap-2 items-center">
                            {/* Think Toggle */}
                            <motion.button
                                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all font-medium group text-sm ${thinkActive
                                    ? "bg-amber-50 outline outline-amber-400 text-amber-800"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                                    }`}
                                title="Think"
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setThinkActive((a) => !a);
                                }}
                                whileTap={{ scale: 0.96 }}
                            >
                                <Lightbulb
                                    size={16}
                                    className={`transition-all ${thinkActive ? "fill-amber-400 text-amber-500" : "group-hover:fill-yellow-300"}`}
                                />
                                Think
                            </motion.button>

                            {/* Deep Search Toggle */}
                            <motion.button
                                className={`flex items-center gap-1.5 py-1.5 rounded-full transition-colors font-medium whitespace-nowrap overflow-hidden justify-start text-sm ${deepSearchActive
                                    ? "bg-blue-50 outline outline-blue-400 text-blue-800"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                                    }`}
                                title="Deep Search"
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDeepSearchActive((a) => !a);
                                }}
                                initial={false}
                                animate={{
                                    width: deepSearchActive ? 128 : 36,
                                    paddingLeft: deepSearchActive ? 10 : 9,
                                    paddingRight: deepSearchActive ? 12 : 9,
                                }}
                                transition={{ type: "spring", stiffness: 200, damping: 22 }}
                            >
                                <Globe
                                    size={16}
                                    className={`shrink-0 transition-colors ${deepSearchActive ? "text-blue-600" : ""}`}
                                />
                                <motion.span
                                    initial={false}
                                    animate={{ opacity: deepSearchActive ? 1 : 0 }}
                                    transition={{ duration: 0.18 }}
                                    className="ml-1"
                                >
                                    Deep Search
                                </motion.span>
                            </motion.button>

                            {/* Shift+Enter hint */}
                            <span className="text-xs text-gray-400 ml-1">
                                Shift+Enter for new line
                            </span>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export { AIChatInput };
