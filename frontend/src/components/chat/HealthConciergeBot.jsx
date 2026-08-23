import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  ChevronDown, 
  RotateCcw,
  Shield,
  Activity,
  HeartPulse
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const QUICK_PROMPTS = [
  "Which doctors are available?",
  "How does Telemedicine video consultation work?",
  "What is AES-256 Encrypted EHR?",
  "I have a fever and headache, what should I do?"
];

const HealthConciergeBot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: "👋 Hi there! I'm your **24/7 Health Concierge powered by Gemini AI**.\n\nAsk me anything about finding specialists, booking telemedicine calls, or understanding health records!",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInputText('');
    setLoading(true);

    try {
      // Build history payload for multi-turn conversational context
      const historyPayload = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        text: m.text
      }));

      const res = await api.post('/ai-chat/message', {
        message: text.trim(),
        history: historyPayload
      });

      const botReply = res.data?.reply || "I am here to help you navigate Smart HealthSphere. What would you like to explore?";
      
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: botReply,
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: "I'm having a brief connection hiccup. You can browse our doctors list or try sending your message again shortly.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        text: "👋 Chat reset! How can I assist your healthcare needs today?",
        timestamp: new Date()
      }
    ]);
  };

  // Helper to render formatted text with bold and linebreaks
  const renderFormattedText = (text) => {
    return text.split('\n').map((line, idx) => {
      // Parse bold **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={idx} className={line.startsWith('•') || line.startsWith('-') ? 'pl-2 my-0.5' : 'my-1'}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-bold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          id="btn-health-concierge"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border border-white/20"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-white animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-indigo-600 animate-pulse"></span>
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-black tracking-wide leading-tight">AI Health Concierge</p>
            <p className="text-[10px] text-indigo-200 font-medium">24/7 Gemini Assistant</p>
          </div>
        </button>
      )}

      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl shadow-indigo-950/20 border border-indigo-100 dark:border-slate-800 w-[92vw] sm:w-[410px] h-[580px] max-h-[85vh] flex flex-col overflow-hidden animate-scale-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-4 px-5 text-white flex items-center justify-between relative shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/15 backdrop-blur-md rounded-xl border border-white/20">
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm tracking-tight">HealthSphere Concierge</h3>
                  <span className="px-1.5 py-0.5 bg-emerald-400/20 border border-emerald-300/30 text-[9px] font-black rounded uppercase text-emerald-200">
                    Gemini 1.5
                  </span>
                </div>
                <p className="text-[11px] text-indigo-100/90 font-medium">24/7 AI Medical Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={handleReset}
                title="Restart conversation"
                className="p-1.5 hover:bg-white/20 rounded-xl text-indigo-100 hover:text-white transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                title="Minimize chat"
                className="p-1.5 hover:bg-white/20 rounded-xl text-indigo-100 hover:text-white transition cursor-pointer"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 dark:bg-slate-900/50 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-indigo-200 dark:border-indigo-800">
                    <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] p-3.5 rounded-2xl leading-relaxed shadow-sm ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-sm font-medium'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700 rounded-tl-sm'
                  }`}
                >
                  {renderFormattedText(m.text)}
                  <span className={`block text-[9px] mt-1.5 text-right ${m.role === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs shadow-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-start">
                <div className="w-7 h-7 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center flex-shrink-0 border border-indigo-200">
                  <Bot className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-sm border border-slate-200/60 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestion Chips */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 bg-white dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Quick Suggestions</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-200/60 transition active:scale-95 cursor-pointer text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask HealthSphere Concierge..."
              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-xs font-medium text-slate-800 dark:text-slate-100 transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="p-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default HealthConciergeBot;
