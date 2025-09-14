'use client';

import { useState } from 'react';
import { Layout, Typography, List, Avatar } from 'antd';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/use-mobile';

const { Title } = Typography;

interface AgentItem {
  id: string;
  icon: string;
  name: string;
  description: string;
}

const agents: AgentItem[] = [
  {
    id: 'assistant',
    icon: 'AI',
    name: 'NeuroGlass 助手',
    description: '全能型人工智能助手',
  },
  {
    id: 'writer',
    icon: '写',
    name: '智能写作',
    description: '创作文章、诗歌、文案等',
  },
  {
    id: 'coder',
    icon: '码',
    name: '代码专家',
    description: '解决编程问题，生成代码',
  },
  {
    id: 'designer',
    icon: '设',
    name: '设计顾问',
    description: 'UI/UX设计建议与创意',
  },
  {
    id: 'business',
    icon: '商',
    name: '商业分析',
    description: '市场分析、商业策略',
  },
  {
    id: 'tutor',
    icon: '教',
    name: '学习导师',
    description: '解答学习问题，提供指导',
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [activeAgent, setActiveAgent] = useState('assistant');
  const isMobile = useMobile();

  const handleAgentSelect = (agentId: string) => {
    setActiveAgent(agentId);
    if (isMobile) {
      onClose();
    }
  };

  return (
    <Layout.Sider
      width={320}
      className={cn(
        'fixed top-0 left-0 h-full z-50 transition-transform duration-500 ease-out',
        'bg-glass-bg backdrop-blur-xl border-r border-border-color',
        'transform -translate-x-full',
        isOpen && 'transform translate-x-0',
        'lg:translate-x-0 lg:z-10'
      )}
      collapsedWidth={0}
      trigger={null}
      collapsible
      collapsed={!isOpen}
    >
      <div className='p-6 border-b border-border-color mb-4 relative'>
        <div className='absolute bottom-0 left-6 w-12 h-0.5 bg-gradient-to-r from-primary-color to-secondary-color rounded'></div>
        <Title level={5} className='flex items-center text-text-color m-0'>
          <span className='inline-block w-2 h-2 rounded-full bg-gradient-to-r from-primary-color to-secondary-color mr-3 shadow-glow'></span>
          选择智能体
        </Title>
      </div>

      <List
        className='px-3'
        dataSource={agents}
        renderItem={agent => (
          <List.Item
            className={cn(
              'p-4 flex items-center cursor-pointer transition-all duration-400 rounded-2xl mx-2 mb-2.5',
              'relative overflow-hidden bg-white/5 backdrop-blur-sm',
              'hover:bg-primary-color/12 hover:translate-x-1',
              activeAgent === agent.id && 'bg-primary-color/18'
            )}
            onClick={() => handleAgentSelect(agent.id)}
          >
            <div
              className={cn(
                'absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary-color to-secondary-color',
                'transform -translate-x-2.5 transition-transform duration-400',
                activeAgent === agent.id && 'transform translate-x-0'
              )}
            ></div>

            <Avatar
              size={40}
              className='mr-4 flex-shrink-0 bg-gradient-to-r from-primary-color to-secondary-color text-white font-medium shadow-md'
              style={{ borderRadius: 12 }}
            >
              {agent.icon}
            </Avatar>

            <div className='flex-1 min-w-0'>
              <div className='text-base font-medium mb-1 whitespace-nowrap overflow-hidden text-ellipsis'>
                {agent.name}
              </div>
              <div className='text-sm text-light-text whitespace-nowrap overflow-hidden text-ellipsis'>
                {agent.description}
              </div>
            </div>
          </List.Item>
        )}
      />
    </Layout.Sider>
  );
}
