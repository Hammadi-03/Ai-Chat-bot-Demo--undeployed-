import React from 'react';
import ReactMarkdown from 'react-markdown';
import { getEmotionColor, getEmotionEmoji } from '../utils/emotionDetector';

const BubbleChat = ({ text, sender, isAi, metadata, imagePreview }) => {
  return (
    <div className={`flex w-full mb-4 ${isAi ? 'justify-start' : 'justify-end'} animate-fadeIn`}>
      <div className={`max-w-[85%] ${isAi
          ? 'bg-white/90 backdrop-blur-sm text-gray-800 rounded-2xl rounded-tl-none border border-gray-200 shadow-lg'
          : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl rounded-tr-none shadow-lg'
        } p-4`}>

        {/* Sender info */}
        <div className="flex items-center gap-2 mb-2">
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
            {sender}
          </p>

          {/* Emotion indicator for user messages */}
          {!isAi && metadata?.userEmotion && metadata.userEmotion !== 'neutral' && (
            <span
              className={`text-xs ${getEmotionColor(metadata.userEmotion)} flex items-center gap-1`}
              title={`Detected emotion: ${metadata.userEmotion}`}
            >
              {getEmotionEmoji(metadata.userEmotion)}
            </span>
          )}

          {/* Processing time for AI messages */}
          {isAi && metadata?.processingTime && (
            <span className="text-[9px] text-gray-400 ml-auto">
              {(metadata.processingTime / 1000).toFixed(1)}s
            </span>
          )}
        </div>

        {/* Image preview for user messages */}
        {!isAi && imagePreview && (
          <img
            src={imagePreview}
            alt="User uploaded"
            className="rounded-lg mb-2 max-h-48 border border-white/30"
          />
        )}

        {/* Message text */}
        <div className="prose prose-sm max-w-none">
          {isAi ? (
            <ReactMarkdown className="text-sm leading-relaxed">{text}</ReactMarkdown>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
          )}
        </div>

        {/* Metadata badges for AI responses */}
        {isAi && metadata?.hasImage && (
          <div className="mt-2 flex items-center gap-1">
            <span className="text-[9px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
              🖼️ Multimodal Analysis
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BubbleChat;
