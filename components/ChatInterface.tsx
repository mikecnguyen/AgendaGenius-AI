import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  hasAgenda: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading,
  hasAgenda
}) => {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  // Auto-open chat when agenda is ready to invite interaction
  useEffect(() => {
    if (hasAgenda && messages.length === 0) {
      setIsOpen(true);
    }
  }, [hasAgenda, messages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  if (!hasAgenda && messages.length === 0) return null;

  return (
    <div className={`fixed bottom-0 right-6 w-full md:w-96 bg-white rounded-t-2xl shadow-2xl border border-zinc-200 transition-all duration-300 z-50 flex flex-col ${isOpen ? 'h-[500px]' : 'h-14'}`}>
      
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 bg-zinc-900 text-white rounded-t-2xl cursor-pointer hover:bg-zinc-800 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>Ask AI Assistant</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </div>

      {/* Messages Area */}
      {isOpen && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50">
            {messages.length === 0 && (
              <div className="text-center text-zinc-400 text-sm mt-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p>Ask questions about the generated agenda or the uploaded documents.</p>
              </div>
            )}
            
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm
                    ${msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white text-zinc-800 border border-zinc-200 rounded-bl-none'
                    }
                  `}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                 <div className="bg-white border border-zinc-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce delay-150"></div>
                    </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-zinc-100">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about the agenda..."
                className="w-full pl-4 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                disabled={isLoading}
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-2 p-1.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatInterface;
