import React from 'react';
import ReactMarkdown from 'react-markdown';
import { getEmotionColor, getEmotionEmoji } from '../utils/emotionDetector';

const BubbleChat = ({ text, sender, isAi, isError, metadata, imagePreview }) => {
  return (
    <div className={`flex w-full mb-4 ${isAi ? 'justify-start' : 'justify-end'} animate-fadeIn`}>
      <div className={`max-w-[85%] ${isError
        ? 'bg-red-50/90 backdrop-blur-sm text-red-900 rounded-2xl rounded-tl-none border border-red-200 shadow-md'
        : isAi
          ? 'bg-white/90 backdrop-blur-sm text-gray-800 rounded-2xl rounded-tl-none border border-gray-200 shadow-lg'
          : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl rounded-tr-none shadow-lg'
        } p-4 relative`}>

        {/* Sender info */}
        <div className="flex items-center gap-2 mb-2">
          {isError && (
            <span className="text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
            </span>
          )}
          <p className={`text-[10px] font-bold uppercase tracking-wider opacity-70 ${isError ? 'text-red-700' : ''}`}>
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
            <div className="text-sm leading-relaxed">
              <ReactMarkdown>{text}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
          )}
        </div>

        {/* Metadata badges for AI responses */}
        {isAi && !isError && metadata?.hasImage && (
          <div className="mt-2 flex items-center gap-1">
            <span className="text-[9px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
              🖼️ Multimodal Analysis
            </span>
          </div>
        )}

        {isError && (
          <div className="mt-2 text-[10px] text-red-500/80 font-medium">
            System automatically attempted fallback routes before failing.
          </div>
        )}
      </div>
    </div>
  );
};

export default BubbleChat;
