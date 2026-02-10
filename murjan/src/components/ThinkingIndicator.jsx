import React from 'react';

/**
 * ThinkingIndicator Component
 * Shows AI processing state with animated layers
 */
const ThinkingIndicator = ({ currentLayer = 'cognitive' }) => {
    const layers = [
        { name: 'Cognitive Reasoning', key: 'cognitive', color: 'from-blue-500 to-purple-500' },
        { name: 'Emotional Awareness', key: 'emotional', color: 'from-pink-500 to-rose-500' },
        { name: 'Multimodal Perception', key: 'multimodal', color: 'from-green-500 to-teal-500' },
    ];

    return (
        <div className="flex flex-col items-start mb-4 animate-fadeIn">
            <span className="text-xs text-gray-500 ml-2 mb-2">Murjan is thinking...</span>

            <div className="bg-white/80 backdrop-blur-md border border-gray-200 text-gray-800 px-5 py-4 rounded-2xl rounded-tl-none shadow-lg">
                {/* Animated thinking dots */}
                <div className="flex gap-1 mb-3">
                    <span className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-bounce"></span>
                </div>

                {/* Processing layers */}
                <div className="space-y-2">
                    {layers.map((layer) => (
                        <div key={layer.key} className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${currentLayer === layer.key
                                    ? `bg-gradient-to-r ${layer.color} animate-pulse`
                                    : 'bg-gray-300'
                                }`}></div>
                            <span className={`text-xs ${currentLayer === layer.key
                                    ? 'text-gray-800 font-semibold'
                                    : 'text-gray-400'
                                }`}>
                                {layer.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ThinkingIndicator;
