import { useState, useEffect, useRef } from 'react';
import BubbleChat from './components/BubbleChat.jsx';
import ThinkingIndicator from './components/ThinkingIndicator.jsx';
import ImageUpload from './components/ImageUpload.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import { murjanService } from './services/murjanService.js';
import { detectEmotion } from './utils/emotionDetector.js';

function App() {
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm Murjan, an advanced AI system designed to think, feel, and reason with you. I can analyze text, understand emotions, and even interpret images. How can I assist you today?",
      sender: "Murjan AI",
      isAi: true
    }
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentLayer, setCurrentLayer] = useState('cognitive');
  const [imageData, setImageData] = useState({ base64: null, preview: null });
  const [apiKey, setApiKey] = useState('');
  const [showApiInput, setShowApiInput] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Check for API key in environment
  useEffect(() => {
    try {
      const envKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (envKey && !envKey.includes('DEMO') && !envKey.includes('your_api_key')) {
        setApiKey(envKey);
        try {
          murjanService.initialize(envKey);
          setShowApiInput(false);
        } catch (err) {
          console.error('Failed to initialize with env key:', err);
          setError('Failed to initialize AI. Please enter API key manually.');
          setShowApiInput(true);
        }
      }
    } catch (err) {
      console.error('Error in initialization useEffect:', err);
      setShowApiInput(true);
    }
  }, []);

  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    try {
      murjanService.initialize(apiKey);
      setShowApiInput(false);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleImageSelect = (base64, preview) => {
    setImageData({ base64, preview });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() && !imageData.base64) return;

    const userEmotion = detectEmotion(inputValue);

    const userMsg = {
      text: inputValue || "[Image uploaded]",
      sender: "You",
      isAi: false,
      imagePreview: imageData.preview,
      metadata: { userEmotion }
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = inputValue;
    const currentImage = imageData.base64;

    setInputValue("");
    setImageData({ base64: null, preview: null });
    setIsProcessing(true);
    setError('');

    try {
      // Simulate layer processing
      setCurrentLayer('cognitive');
      await new Promise(resolve => setTimeout(resolve, 300));

      setCurrentLayer('emotional');
      await new Promise(resolve => setTimeout(resolve, 300));

      if (currentImage) {
        setCurrentLayer('multimodal');
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Get AI response
      const response = await murjanService.processMessage(currentInput, currentImage);

      const aiResponse = {
        text: response.text,
        sender: "Murjan AI",
        isAi: true,
        metadata: response.metadata
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      console.error('Error getting AI response:', err);
      setError(err.message || 'Failed to get response from Murjan AI');

      // Add error message to chat
      const errorMsg = {
        text: `I apologize, but I encountered an error: ${err.message}. Please check your API key and try again.`,
        sender: "System",
        isAi: true
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        text: "Hello! I'm Murjan. How can I assist you today?",
        sender: "Murjan AI",
        isAi: true
      }
    ]);
  };

  // API Key Input Screen
  if (showApiInput) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl font-bold text-white">M</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Murjan</h1>
            <p className="text-sm text-gray-600">Advanced AI Intelligence System</p>
          </div>

          <form onSubmit={handleApiKeySubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Google Gemini API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
              />
              {error && (
                <p className="text-xs text-red-600 mt-2">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Start Murjan
            </button>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-2">Don't have an API key?</p>
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 hover:underline font-semibold"
              >
                Get one from Google AI Studio →
              </a>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Main Chat Interface
  return (
    <div className={`flex flex-col h-screen pb-3 mx-auto shadow-2xl border-x ${theme === 'dark'
      ? 'bg-gray-900 border-gray-700'
      : 'bg-gradient-to-b from-gray-50 to-gray-100 border-gray-200'
      } mx-auto max-w-4xl shadow-xl`}>

      {/* Header */}
      <div className={`p-4 border-b ${theme === 'dark'
        ? 'bg-gray-800 border-gray-700'
        : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600'
        } text-white flex items-center gap-3 shadow-lg`}>
        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center font-bold text-2xl border-2 border-white/30">
          M
        </div>
        <div className="flex-1">
          <h1 className="font-bold text-lg leading-none">Murjan AI</h1>
          <span className="text-[10px] text-green-300 font-bold tracking-widest uppercase flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Advanced Intelligence Active
          </span>
        </div>
        <button
          onClick={() => setSettingsOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-all"
          title="Settings"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className={`flex - 1 overflow - y - auto p - 4 flex flex - col gap - 2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white/50'
        } `}>
        {messages.map((msg, index) => (
          <BubbleChat key={index} {...msg} />
        ))}

        {isProcessing && <ThinkingIndicator currentLayer={currentLayer} />}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSend} className={`p - 4 flex flex - col gap - 3 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } border - t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} `}>

        {/* Image Upload */}
        <div className="flex items-center gap-2">
          <ImageUpload onImageSelect={handleImageSelect} disabled={isProcessing} />
          {imageData.preview && (
            <span className="text-xs text-green-600 font-semibold">✓ Image ready for analysis</span>
          )}
        </div>

        {/* Text Input */}
        <div className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Murjan anything..."
            disabled={isProcessing}
            className={`flex - 1 border ${theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-black'
              } rounded - full px - 5 py - 3 text - sm focus: outline - none focus: ring - 2 focus: ring - indigo - 500 transition - all disabled: opacity - 50 shadow - sm`}
          />
          <button
            type="submit"
            disabled={isProcessing || (!inputValue.trim() && !imageData.base64)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-7 py-3 rounded-full text-sm font-bold hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? '...' : 'Send'}
          </button>
        </div>
      </form>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onClearChat={handleClearChat}
        theme={theme}
        onThemeChange={setTheme}
      />
    </div>
  );
}

export default App;