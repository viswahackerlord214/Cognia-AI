import React from 'react';
import { ChatAssistant } from '../../components/ChatAssistant';

export const StudentAssistant: React.FC = () => {
  return (
    <div className="space-y-6">
      <ChatAssistant title="Student AI Assistant — Learn Yourself" initialMode="docs" />
    </div>
  );
};
