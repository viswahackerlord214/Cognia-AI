import React, { useState, useEffect } from 'react';
import { ChatMessage } from '../types';
import { ragApi } from '../services/api';
import { CitationCard } from './CitationCard';
import { Send, Bot, User, Sparkles, RefreshCw, BookOpen, Globe, Copy, Check, Plus, MessageSquare, Trash2, Edit2, X } from 'lucide-react';

interface ChatAssistantProps {
  title?: string;
  initialMode?: 'docs' | 'web';
}

interface Conversation {
  id: string;
  title: string;
  mode: 'docs' | 'web';
  updated_at: string;
}

// Code Block Component with Copy Button & Syntax Highlighting Header
const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language = 'code' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl border border-[#30363d] overflow-hidden bg-[#0d1117]">
      <div className="px-4 py-1.5 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between text-xs text-[#8b949e]">
        <span className="font-mono uppercase font-semibold text-[11px] text-blue-400">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 hover:text-white transition-colors py-1 px-2 rounded hover:bg-[#30363d]"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy code'}</span>
        </button>
      </div>
      <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Markdown Renderer Component
const MarkdownContent: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  const blocks = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {blocks.map((block, bIdx) => {
        if (block.startsWith('```') && block.endsWith('```')) {
          const firstLineEnd = block.indexOf('\n');
          const lang = block.slice(3, firstLineEnd).trim() || 'python';
          const code = block.slice(firstLineEnd + 1, -3).trim();
          return <CodeBlock key={bIdx} code={code} language={lang} />;
        }

        const lines = block.split('\n');
        return (
          <React.Fragment key={bIdx}>
            {lines.map((line, idx) => {
              const trimmed = line ? line.trim() : '';
              if (!trimmed) return <div key={idx} className="h-1" />;

              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-base font-bold text-white border-b border-[#30363d] pb-1 mt-2">
                    {trimmed.replace(/^###\s+/, '')}
                  </h3>
                );
              }
              if (trimmed.startsWith('#### ')) {
                return (
                  <h4 key={idx} className="text-sm font-bold text-blue-400 mt-2">
                    {trimmed.replace(/^####\s+/, '')}
                  </h4>
                );
              }
              if (trimmed.startsWith('> ')) {
                return (
                  <blockquote key={idx} className="p-3 bg-[#161b22] border-l-4 border-blue-500 rounded-r-lg text-xs italic text-[#c9d1d9] my-2">
                    {trimmed.replace(/^>\s+/, '')}
                  </blockquote>
                );
              }
              if (trimmed === '---') {
                return <hr key={idx} className="border-[#30363d] my-3" />;
              }
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                const itemText = trimmed.replace(/^[-*]\s+/, '');
                return (
                  <div key={idx} className="flex items-start space-x-2 pl-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span className="flex-1">{parseBoldText(itemText)}</span>
                  </div>
                );
              }
              return <p key={idx}>{parseBoldText(trimmed)}</p>;
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
};

function parseBoldText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  title = 'Learn Yourself — AI Learning Hub',
  initialMode = 'docs'
}) => {
  const [mode, setMode] = useState<'docs' | 'web'>(initialMode);
  
  const defaultMessages: ChatMessage[] = [
    {
      id: 'msg-1',
      sender: 'assistant',
      text: 'Hello! I am Cognia AI, your official Learning Assistant. Select **University Documents Mode** for official course documents or **Web & AI Mode** for general tutoring and code assistance.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(defaultMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusStep, setStatusStep] = useState<string | null>(null);

  // History State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const docsPrompts = [
    'What is the syllabus of Computer Networks?',
    'What are the prerequisites for Computer Architecture?',
    'What does the university document say about attendance?',
    'Explain the CS501 DBMS syllabus units.'
  ];

  const webPrompts = [
    'Explain TCP vs UDP.',
    'Write a Python binary search implementation.',
    'Explain transformers in simple terms.',
    'What is recursion in computer science?'
  ];

  const currentPrompts = mode === 'docs' ? docsPrompts : webPrompts;

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const data = await ragApi.getConversations();
      setConversations(data || []);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages(defaultMessages);
    setInput('');
  };

  const loadConversation = async (id: string) => {
    setActiveConversationId(id);
    setMessages([{
      id: 'loading',
      sender: 'assistant',
      text: 'Loading conversation...',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    
    const targetConv = conversations.find(c => c.id === id);
    if (targetConv) setMode(targetConv.mode);

    try {
      const msgs = await ragApi.getMessages(id);
      const formatted: ChatMessage[] = msgs.map((m: any) => ({
        id: m.id,
        sender: m.role === 'user' ? 'user' : 'assistant',
        text: m.content,
        citations: m.citations || [],
        timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      setMessages(formatted.length > 0 ? formatted : defaultMessages);
    } catch (err) {
      setMessages([{
        id: 'err-load',
        sender: 'assistant',
        text: 'Unable to load this conversation. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await ragApi.deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConversationId === id) handleNewChat();
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const handleRename = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }
    try {
      await ragApi.renameConversation(id, editTitle);
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title: editTitle } : c));
      setEditingId(null);
    } catch (err) {
      console.error("Failed to rename", err);
    }
  };

  const handleSend = async (queryText?: string) => {
    const query = queryText || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      if (mode === 'docs') {
        setStatusStep('Searching RBAC pre-filtered ChromaDB vectors...');
        await new Promise(r => setTimeout(r, 200));
        setStatusStep('Reranking candidates with Subject-Aware CrossEncoder...');
      } else {
        setStatusStep('Querying General AI Tutor & Web Search Engine...');
      }

      const historyPayload = messages
        .filter(m => m.id !== 'msg-1' && (m.sender === 'user' || m.sender === 'assistant'))
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }));

      const response = await ragApi.chat(query, mode, historyPayload, activeConversationId || undefined);

      if (response.conversation_id && !activeConversationId) {
        setActiveConversationId(response.conversation_id);
        fetchConversations();
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        citations: response.citations,
        correction_performed: response.correction_performed,
        grade: response.grade,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: err.response?.data?.detail || 'An error occurred while contacting the AI Assistant.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setStatusStep(null);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-2xl">
      
      {/* Sidebar - Chat History */}
      <div className="hidden md:flex flex-col w-64 bg-[#0d1117] border-r border-[#30363d] p-3">
        <button
          onClick={handleNewChat}
          className="flex items-center space-x-2 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-lg py-2.5 px-4 font-medium transition-colors mb-4 w-full shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>
        
        <div className="text-xs font-semibold text-[#8b949e] uppercase mb-2 px-1 tracking-wider">Chat History</div>
        
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          {loadingHistory ? (
            <div className="text-xs text-[#8b949e] px-2 py-3 text-center">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="text-xs text-[#8b949e] px-2 py-3 text-center border border-dashed border-[#30363d] rounded-lg mt-2">
              No previous conversations.<br/><br/>Start a new chat!
            </div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => { if (editingId !== conv.id) loadConversation(conv.id); }}
                className={`group flex flex-col p-2 rounded-lg cursor-pointer transition-colors ${
                  activeConversationId === conv.id ? 'bg-[#30363d] text-white' : 'hover:bg-[#21262d] text-[#c9d1d9]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 overflow-hidden w-full">
                    <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${conv.mode === 'web' ? 'text-indigo-400' : 'text-blue-400'}`} />
                    
                    {editingId === conv.id ? (
                      <input
                        autoFocus
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        onKeyDown={e => { if(e.key === 'Enter') handleRename(conv.id); if(e.key === 'Escape') setEditingId(null); }}
                        onClick={e => e.stopPropagation()}
                        className="flex-1 bg-black/50 border border-blue-500 rounded px-1 py-0.5 text-xs text-white outline-none w-full"
                      />
                    ) : (
                      <span className="text-xs font-medium truncate">{conv.title}</span>
                    )}
                  </div>

                  {editingId !== conv.id && (
                    <div className="hidden group-hover:flex items-center space-x-1 pl-2">
                      <button onClick={(e) => { e.stopPropagation(); setEditTitle(conv.title); setEditingId(conv.id); }} className="p-1 hover:text-white text-[#8b949e] transition-colors"><Edit2 className="w-3 h-3" /></button>
                      <button onClick={(e) => handleDelete(conv.id, e)} className="p-1 hover:text-red-400 text-[#8b949e] transition-colors"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  )}
                  {editingId === conv.id && (
                     <div className="flex items-center space-x-1 pl-2">
                       <button onClick={(e) => { handleRename(conv.id, e); }} className="p-1 text-green-400 hover:text-green-300 transition-colors"><Check className="w-3 h-3" /></button>
                       <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="p-1 text-red-400 hover:text-red-300 transition-colors"><X className="w-3 h-3" /></button>
                     </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header & Mode Selector Toggle */}
        <div className="p-4 bg-[#0d1117] border-b border-[#30363d] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{title}</h2>
              <p className="text-xs text-[#8b949e]">
                {mode === 'docs' ? 'Strict Grounded Document RAG Pipeline' : 'General AI Tutor & Web Search Engine'}
              </p>
            </div>
          </div>

          <div className="flex items-center bg-[#161b22] p-1 rounded-xl border border-[#30363d] self-start md:self-auto">
            <button
              onClick={() => { setMode('docs'); handleNewChat(); }}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'docs'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-[#8b949e] hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>📚 University Documents</span>
            </button>
            <button
              onClick={() => { setMode('web'); handleNewChat(); }}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'web'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-[#8b949e] hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>🌐 Web & AI</span>
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-[#161b22] to-[#0d1117]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div className={`p-2 rounded-xl border ${
                msg.sender === 'user'
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-900/20'
                  : mode === 'docs'
                  ? 'bg-[#161b22] border-[#30363d] text-blue-400 shadow-md shadow-black/20'
                  : 'bg-[#161b22] border-[#30363d] text-indigo-400 shadow-md shadow-black/20'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="max-w-[85%] space-y-2">
                <div className={`p-4 rounded-2xl border text-sm leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-600/20 border-blue-500/40 text-white rounded-tr-none'
                    : 'bg-[#0d1117] border-[#30363d] text-[#c9d1d9] rounded-tl-none'
                }`}>
                  {msg.sender === 'user' ? (
                    <div>{msg.text}</div>
                  ) : (
                    <MarkdownContent content={msg.text} />
                  )}

                  {msg.correction_performed && (
                    <div className="mt-3 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg flex items-center space-x-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Query reformulated automatically via CRAG.</span>
                    </div>
                  )}
                </div>

                {msg.citations && msg.citations.length > 0 && (
                  <CitationCard citations={msg.citations} />
                )}

                <span className="text-[10px] text-[#8b949e] block px-1">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-[#161b22] border border-[#30363d] text-blue-400 shadow-md">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="p-4 bg-[#0d1117] border border-[#30363d] rounded-2xl rounded-tl-none text-xs text-blue-400 flex items-center space-x-2 shadow-sm">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>{statusStep || 'Thinking...'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Prompts */}
        {messages.length <= 1 && !loading && (
          <div className="px-6 py-3 bg-[#0d1117] border-t border-[#30363d] flex flex-wrap gap-2">
            {currentPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="text-[11px] font-medium bg-[#161b22] text-[#8b949e] hover:text-white hover:border-blue-500 border border-[#30363d] px-3 py-1.5 rounded-lg transition-colors text-left flex items-center"
              >
                <span className="mr-1.5 opacity-60">💡</span> {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Form */}
        <div className="p-4 bg-[#0d1117] border-t border-[#30363d]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'docs'
                  ? 'Ask anything about your university documents...'
                  : 'Ask anything — concepts, coding, AI, current information...'
              }
              className="flex-1 bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-white placeholder-[#8b949e] focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className={`p-3 text-white rounded-xl transition-all font-medium flex items-center justify-center min-w-[48px] ${
                mode === 'docs' ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/30' : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-900/30'
              } disabled:opacity-50 disabled:shadow-none`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
