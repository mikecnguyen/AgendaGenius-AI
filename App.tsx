import React, { useState, useCallback } from 'react';
import { Loader2, Plus } from 'lucide-react';
import FileUploader from './components/FileUploader';
import AgendaTimeline from './components/AgendaTimeline';
import ChatInterface from './components/ChatInterface';
import { generateAgendaFromFiles, chatWithContext } from './services/geminiService';
import { processFiles } from './utils/fileHelpers';
import { FileData, Agenda, LoadingState, ChatMessage } from './types';

const App: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [agenda, setAgenda] = useState<Agenda | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = useCallback(async (selectedFiles: File[]) => {
    setLoadingState(LoadingState.READING_FILES);
    setError(null);
    try {
      const processed = await processFiles(selectedFiles);
      setFiles(prev => [...prev, ...processed]);
      setLoadingState(LoadingState.IDLE);
    } catch (err) {
      console.error(err);
      setError("Failed to read files. Please try again.");
      setLoadingState(LoadingState.IDLE);
    }
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const handleGenerateAgenda = async () => {
    if (files.length === 0) return;
    
    setLoadingState(LoadingState.GENERATING);
    setError(null);
    
    try {
      const result = await generateAgendaFromFiles(files);
      setAgenda(result);
      setLoadingState(LoadingState.SUCCESS);
      
      // Add initial system message to chat
      setChatMessages([{
        id: 'init',
        role: 'model',
        text: `I've analyzed your ${files.length} document(s) and created an agenda. Let me know if you'd like to adjust any times or topics!`,
        timestamp: new Date()
      }]);

    } catch (err) {
      console.error(err);
      setError("Failed to generate agenda. Please ensure your API key is valid and documents are readable.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleChatMessage = async (text: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatLoading(true);

    try {
      // Pass the previous messages context excluding the just added one (which is passed as current)
      const responseText = await chatWithContext(text, files, chatMessages);
      
      const responseMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, responseMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, I encountered an error responding to that.",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-50 font-sans">
      {/* Sidebar */}
      <FileUploader 
        files={files} 
        onFilesSelected={handleFilesSelected} 
        onRemoveFile={handleRemoveFile}
        disabled={loadingState === LoadingState.GENERATING}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Bar */}
        <div className="h-16 border-b border-zinc-200 bg-white flex items-center justify-between px-6 flex-shrink-0 z-10">
          <h1 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            AgendaGenius
          </h1>
          
          <div className="flex items-center gap-4">
            {error && <span className="text-red-500 text-sm font-medium">{error}</span>}
            
            <button
              onClick={handleGenerateAgenda}
              disabled={files.length === 0 || loadingState === LoadingState.GENERATING}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm
                ${files.length > 0 && loadingState !== LoadingState.GENERATING 
                  ? 'bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow-md' 
                  : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'}
              `}
            >
              {loadingState === LoadingState.GENERATING ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Generate Agenda
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative overflow-hidden bg-zinc-50/50">
          <AgendaTimeline agenda={agenda} />
        </div>

        {/* Chat Interface (Floating) */}
        <ChatInterface 
          messages={chatMessages} 
          onSendMessage={handleChatMessage} 
          isLoading={chatLoading}
          hasAgenda={!!agenda}
        />
      </main>
    </div>
  );
};

export default App;
