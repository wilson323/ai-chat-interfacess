'use client';

import { Bot, ImageIcon, FileText } from 'lucide-react';
import type { Agent } from '@/types/agent';

interface AgentCardProps {
  agent: Agent;
  isSelected: boolean;
  onClick: () => void;
}

export function AgentCard({ agent, isSelected, onClick }: AgentCardProps) {
  // Render the appropriate icon based on iconType
  const renderIcon = () => {
    switch (agent.iconType) {
      case 'image':
        return <ImageIcon className='h-5 w-5' />;
      case 'file-text':
        return <FileText className='h-5 w-5' />;
      default:
        return <Bot className='h-5 w-5' />;
    }
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
        isSelected ? 'bg-accent' : ''
      }`}
      onClick={onClick}
    >
      <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full border'>
        {renderIcon()}
      </div>
      <div className='text-sm font-medium'>{agent.name}</div>
    </div>
  );
}
