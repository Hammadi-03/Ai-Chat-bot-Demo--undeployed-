import { useState, useEffect, useRef } from 'react';
import BubbleChat from './components/BubbleChat.jsx';
import ThinkingIndicator from './components/ThinkingIndicator.jsx';
import ImageUpload from './components/ImageUpload.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import { murjanService } from './services/murjanService.js';
import { detectEmotion } from './utils/emotionDetector.js';
import { AnimatePresence, motion } from 'motion/react';
import { Paperclip, Mic, Send, Lightbulb, Globe } from 'lucide-react';

const PLACEHOLDERS = [
  "Ask Murjan anything...",
  "Analyze this image for me",
  "What is the meaning of life?",
  "Summarize this article",
  "Help me write some code",
  "Explain quantum computing",
];

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

  // Chat input UI state
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [inputActive, setInputActive] = useState(false);
  const [thinkActive, setThinkActive] = useState(false);
  const [deepSearchActive, setDeepSearchActive] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const inputWrapperRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  // Cycle placeholder text
  useEffect(() => {
    if (inputActive || inputValue) return;
    const interval = setInterval(() => {
      setShowPlaceholder(false);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
        setShowPlaceholder(true);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, [inputActive, inputValue]);

  // Close expanded state when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputWrapperRef.current && !inputWrapperRef.current.contains(event.target)) {
        if (!inputValue) setInputActive(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [inputValue]);

  // Check for API key in environment
  useEffect(() => {
    try {
      const envKey = import.meta.env.VITE_NVIDIA_API_KEY;
      if (envKey && !envKey.includes('DEMO') && !envKey.includes('your_api_key')) {
        setApiKey(envKey);
        try {
          murjanService.initialize(envKey);
          setShowApiInput(false);
        } catch (err) {
          console.error('Failed to initialize with env key:', err);
          setError('Failed to initialize AI. Please enter your NVIDIA API key manually.');
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
      // If user tries to sumbit empty primary key, fall back to bypass
      handleBypassToLocal();
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

  const handleBypassToLocal = () => {
    // Allows bypassing the API screen to rely on local Ollama entirely
    setShowApiInput(false);
    setError('');
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
      await new Promise(resolve => setTimeout(resolve, 100));

      setCurrentLayer('emotional');
      await new Promise(resolve => setTimeout(resolve, 100));

      if (currentImage) {
        setCurrentLayer('multimodal');
        await new Promise(resolve => setTimeout(resolve, 100));
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

      // Do not use the generic top error box if it's an API error that goes into chat
      // setError(err.message || 'Failed to get response from Murjan AI');

      // Add specialized error message to chat history
      const errorMsg = {
        text: `**Service Disruption:**\n${err.message || 'Unknown network error. Please try again.'}\n\n*If this persists, please check your API keys or switch models in Settings.*`,
        sender: "System Diagnostics",
        isAi: true,
        isError: true
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
                NVIDIA API Key
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

            <button
              type="button"
              onClick={handleBypassToLocal}
              className="w-full bg-white text-gray-700 border border-gray-200 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm"
            >
              Continue with Local Model (Ollama)
            </button>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-2">Don't have an API key?</p>
              <a
                href="https://integrate.api.nvidia.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 hover:underline font-semibold"
              >
                Get one from NVIDIA AI Endpoints →
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
      <div className={`flex-1 overflow-y-auto p-4 flex flex-col gap-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white/50'
        }`}>
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

      {/* Animated Chat Input Area */}
      <div className={`p-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t`}>
        {/* Image Upload row */}
        <div className="flex items-center gap-2 mb-3">
          <ImageUpload onImageSelect={handleImageSelect} disabled={isProcessing} />
          {imageData.preview && (
            <span className="text-xs text-green-600 font-semibold">✓ Image ready for analysis</span>
          )}
        </div>

        {/* Animated input box */}
        <form onSubmit={handleSend}>
          <motion.div
            ref={inputWrapperRef}
            onClick={() => setInputActive(true)}
            animate={inputActive || inputValue ? 'expanded' : 'collapsed'}
            initial="collapsed"
            variants={{
              collapsed: {
                height: 64,
                boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)',
                transition: { type: 'spring', stiffness: 120, damping: 18 },
              },
              expanded: {
                height: 130,
                boxShadow: '0 8px 32px 0 rgba(0,0,0,0.14)',
                transition: { type: 'spring', stiffness: 120, damping: 18 },
              },
            }}
            style={{
              overflow: 'hidden',
              borderRadius: 24,
              background: theme === 'dark' ? '#1f2937' : '#ffffff',
              border: theme === 'dark' ? '1px solid #374151' : '1px solid rgba(0,0,0,0.09)',
              cursor: 'text',
            }}
          >
            {/* Input row */}
            <div className="flex items-start gap-2 px-3 pt-2.5 pb-1.5">
              {/* Attach */}
              <button
                className={`mt-1 p-2 rounded-full transition-colors shrink-0 ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
                title="Attach file"
                type="button"
                tabIndex={-1}
                onClick={(e) => e.stopPropagation()}
              >
                <Paperclip size={18} />
              </button>

              {/* Textarea + animated placeholder */}
              <div className="relative flex-1 min-h-[34px]">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={() => setInputActive(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                  disabled={isProcessing}
                  rows={1}
                  className={`w-full resize-none border-0 outline-none bg-transparent text-sm font-normal leading-relaxed py-1.5 px-1 disabled:opacity-50 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  style={{ minHeight: '34px', maxHeight: '120px', overflowY: 'auto', position: 'relative', zIndex: 1 }}
                />
                {/* Animated placeholder */}
                <div className="absolute left-1 top-0 w-full h-full pointer-events-none flex items-center py-1.5">
                  <AnimatePresence mode="wait">
                    {showPlaceholder && !inputActive && !inputValue && (
                      <motion.span
                        key={placeholderIndex}
                        className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 select-none pointer-events-none text-sm"
                        style={{ whiteSpace: 'nowrap', overflow: 'hidden', zIndex: 0 }}
                        variants={{
                          initial: {},
                          animate: { transition: { staggerChildren: 0.022 } },
                          exit: { transition: { staggerChildren: 0.012, staggerDirection: -1 } },
                        }}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      >
                        {PLACEHOLDERS[placeholderIndex].split('').map((char, i) => (
                          <motion.span
                            key={i}
                            style={{ display: 'inline-block' }}
                            variants={{
                              initial: { opacity: 0, filter: 'blur(10px)', y: 8 },
                              animate: {
                                opacity: 1, filter: 'blur(0px)', y: 0,
                                transition: { opacity: { duration: 0.22 }, filter: { duration: 0.35 }, y: { type: 'spring', stiffness: 80, damping: 20 } },
                              },
                              exit: {
                                opacity: 0, filter: 'blur(10px)', y: -8,
                                transition: { opacity: { duration: 0.18 }, filter: { duration: 0.28 }, y: { type: 'spring', stiffness: 80, damping: 20 } },
                              },
                            }}
                          >
                            {char === ' ' ? '\u00A0' : char}
                          </motion.span>
                        ))}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Mic + Send */}
              <div className="flex items-center gap-1 shrink-0 mt-1">
                <button
                  className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
                  title="Voice input"
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Mic size={18} />
                </button>
                <motion.button
                  type="submit"
                  disabled={isProcessing || (!inputValue.trim() && !imageData.base64)}
                  className="flex items-center justify-center bg-gray-900 hover:bg-gray-700 text-white p-2.5 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Send"
                  whileHover={{ scale: 1.07 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {isProcessing
                    ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-[17px] h-[17px] border-2 border-white/30 border-t-white rounded-full" />
                    : <Send size={17} />}
                </motion.button>
              </div>
            </div>

            {/* Expanded toolbar */}
            <motion.div
              className="w-full flex justify-start px-3 pb-2.5 items-center"
              variants={{
                hidden: { opacity: 0, y: 14, pointerEvents: 'none', transition: { duration: 0.18 } },
                visible: { opacity: 1, y: 0, pointerEvents: 'auto', transition: { duration: 0.28, delay: 0.06 } },
              }}
              initial="hidden"
              animate={inputActive || inputValue ? 'visible' : 'hidden'}
            >
              <div className="flex gap-2 items-center">
                {/* Think toggle */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setThinkActive(a => !a); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all group ${thinkActive
                    ? 'bg-amber-50 outline outline-amber-400 text-amber-800'
                    : theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  <Lightbulb size={14} className={thinkActive ? 'fill-amber-400 text-amber-500' : 'group-hover:fill-yellow-300 transition-all'} />
                  Think
                </button>

                {/* Deep Search toggle */}
                <motion.button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setDeepSearchActive(a => !a); }}
                  className={`flex items-center gap-1.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap overflow-hidden transition-colors ${deepSearchActive
                    ? 'bg-blue-50 outline outline-blue-400 text-blue-800'
                    : theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  initial={false}
                  animate={{ width: deepSearchActive ? 116 : 34, paddingLeft: deepSearchActive ? 10 : 9, paddingRight: deepSearchActive ? 10 : 9 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                >
                  <Globe size={14} className={`shrink-0 ${deepSearchActive ? 'text-blue-600' : ''}`} />
                  <motion.span
                    initial={false}
                    animate={{ opacity: deepSearchActive ? 1 : 0 }}
                    transition={{ duration: 0.16 }}
                    className="ml-0.5"
                  >
                    Deep Search
                  </motion.span>
                </motion.button>

                <span className="text-xs text-gray-400">↵ send · Shift+↵ newline</span>
              </div>
            </motion.div>
          </motion.div>
        </form>
      </div>

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