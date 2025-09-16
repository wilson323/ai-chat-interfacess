'use client';

import { Layout, Button } from 'antd';
import { MenuOutlined, PlusOutlined, HistoryOutlined } from '@ant-design/icons';
import { cn } from '../lib/utils';

interface HeaderNavProps {
  onMenuClick: () => void;
  onHistoryClick: () => void;
}

export default function HeaderNav({
  onMenuClick,
  onHistoryClick,
}: HeaderNavProps) {
  return (
    <Layout.Header className='flex justify-between items-center px-4 md:px-6 h-16 z-30 bg-glass-bg backdrop-blur-xl border-b border-border-color relative'>
      <div className='absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent-line to-transparent opacity-40'></div>

      <Button
        type='text'
        icon={<MenuOutlined />}
        className={cn(
          'flex items-center justify-center w-11 h-11 rounded-full',
          'bg-white/5 hover:bg-primary-color/10 text-text-color'
        )}
        onClick={onMenuClick}
      />

      <div className='font-semibold text-xl bg-gradient-to-r from-primary-color to-secondary-color bg-clip-text text-transparent flex items-center'>
        <span className='w-2.5 h-2.5 rounded-full bg-primary-color mr-2.5 shadow-glow animate-pulse'></span>
        NeuroGlass
      </div>

      <div className='flex gap-2.5'>
        <Button
          type='text'
          icon={<PlusOutlined />}
          className={cn(
            'flex items-center justify-center w-11 h-11 rounded-full',
            'bg-white/5 hover:bg-primary-color/10 text-text-color'
          )}
        />

        <Button
          type='text'
          icon={<HistoryOutlined />}
          className={cn(
            'flex items-center justify-center w-11 h-11 rounded-full',
            'bg-white/5 hover:bg-primary-color/10 text-text-color'
          )}
          onClick={onHistoryClick}
        />
      </div>
    </Layout.Header>
  );
}
