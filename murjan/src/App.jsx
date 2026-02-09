import { useState } from 'react';
import BubbleChat from './components/BubbleChat.jsx';

function App() {
 const [messages, setMessages] = useState([
    { text: "Halo! Saya Asisten AI. Ada yang bisa saya bantu?", sender: "Gemini AI", isAi: true }
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = { text: inputValue, sender: "You", isAi: false };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = { 
        text: "Cabutt lu MANN .", 
        sender: "Gemini AI", 
        isAi: true 
      };
      setMessages((prev) => [...prev, aiResponse]);
      
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen pb-3 mx-auto bg-white shadow-2xl border-x border-gray-200">   {/* Tambahkan max-w-lg jika diperlukan ya*/}
   
      <div className="p-4 border-b bg-indigo-600 text-white flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-xl">Q</div>
        <div>
          <h1 className="font-semibold text-lg leading-none">Al-Murjan Artificial Intelligence Demo</h1>
          <span className="text-[10px] text-green-300 font-bold tracking-widest uppercase">Online</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-2">
        {messages.map((msg, index) => (
          <BubbleChat key={index} {...msg} />
        ))}

        {isTyping && (
          <div className="flex flex-col items-start mb-4">
            <span className="text-xs text-gray-500 ml-2 mb-1">Gemini AI sedang mengetik...</span>
            <div className="bg-white border border-gray-200 text-gray-800 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 flex gap-3 bg-white">
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Tulis pesan..."
          disabled={isTyping} 
          className="flex-1 border text-black border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:bg-gray-100"
        />
        <button 
          type="submit"
          disabled={isTyping} 
          className="bg-indigo-600 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-indigo-900 active:scale-95 transition-all shadow-md disabled:bg-indigo-300"
        >
          Kirim
        </button>
      </form>
    </div>


    
  );
}

export default App;