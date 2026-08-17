import React from 'react';
import { ChatAssistant } from '../../components/ChatAssistant';
import { GraduationCap } from 'lucide-react';

export const TeachMe: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <GraduationCap className="w-6 h-6 text-emerald-400" />
          <span>Learn Yourself — AI Learning & Tutoring Hub</span>
        </h1>
        <p className="text-xs text-[#8b949e]">
          Switch between 📚 <strong>University Documents Mode</strong> (grounded RAG) and 🌐 <strong>Web & AI Mode</strong> (general AI tutor & web search).
        </p>
      </div>

      <ChatAssistant title="Learn Yourself — AI Tutor Hub" initialMode="docs" />
    </div>
  );
};
