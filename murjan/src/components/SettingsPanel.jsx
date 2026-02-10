import React, { useState } from 'react';

/**
 * SettingsPanel Component
 * Provides user controls for theme and preferences
 */
const SettingsPanel = ({ isOpen, onClose, onClearChat, theme, onThemeChange }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Settings</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Theme Toggle */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Theme
                        </label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => onThemeChange('light')}
                                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${theme === 'light'
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                                    }`}
                            >
                                ☀️ Light
                            </button>
                            <button
                                onClick={() => onThemeChange('dark')}
                                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${theme === 'dark'
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                                    }`}
                            >
                                🌙 Dark
                            </button>
                        </div>
                    </div>

                    {/* Clear Chat */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Chat History
                        </label>
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to clear all messages?')) {
                                    onClearChat();
                                    onClose();
                                }
                            }}
                            className="w-full py-3 px-4 rounded-xl border-2 border-red-300 text-red-600 hover:bg-red-50 transition-all font-medium"
                        >
                            🗑️ Clear All Messages
                        </button>
                    </div>

                    {/* About */}
                    <div className="pt-4 border-t border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">About Murjan</h3>
                        <p className="text-xs text-gray-600 leading-relaxed">
                            Murjan is an advanced AI system with cognitive reasoning, emotional awareness,
                            and multimodal perception capabilities. Powered by Google Gemini AI.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;
