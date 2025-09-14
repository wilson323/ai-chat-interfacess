'use client';

import { useState } from 'react';
import { useAgent } from '@/context/agent-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { safeStringify } from '@/lib/debug-utils';
import { useAgentStore } from '@/lib/store/agentStore';

export function DebugPanel() {
  const { agents, selectedAgent, updateAgent } = useAgent();
  const [isVisible, setIsVisible] = useState(false);
  const [storageData, setStorageData] = useState<string | null>(null);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
    if (!isVisible) {
      const storedAgents = useAgentStore.getState().agents;
      setStorageData(safeStringify(storedAgents, 2));
    }
  };

  const forceRefresh = () => {
    if (selectedAgent) {
      // 强制刷新当前选中的智能体
      updateAgent({ ...selectedAgent });
    }

    // 刷新存储数据显示
    const storedAgents = useAgentStore.getState().agents;
    setStorageData(safeStringify(storedAgents, 2));
  };

  if (!isVisible) {
    return (
      <div className='fixed bottom-4 right-4 z-50'>
        <Button
          variant='outline'
          size='sm'
          onClick={toggleVisibility}
          className='bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300'
        >
          调试面板
        </Button>
      </div>
    );
  }

  return (
    <div className='fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-auto'>
      <Card className='border-yellow-300 bg-yellow-50 shadow-lg'>
        <CardHeader className='bg-yellow-100 py-2'>
          <CardTitle className='text-sm font-medium text-yellow-800 flex justify-between items-center'>
            <span>调试面板</span>
            <div className='flex gap-2'>
              <Button
                variant='ghost'
                size='sm'
                onClick={forceRefresh}
                className='h-6 text-xs'
              >
                刷新
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={toggleVisibility}
                className='h-6 text-xs'
              >
                关闭
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className='p-2 text-xs'>
          <div className='mb-2'>
            <h3 className='font-bold mb-1'>内存中的智能体 ({agents.length})</h3>
            <pre className='bg-white p-2 rounded text-[10px] max-h-40 overflow-auto'>
              {safeStringify(
                agents.map(({ icon, ...rest }) => rest),
                2
              )}
            </pre>
          </div>

          <div className='mb-2'>
            <h3 className='font-bold mb-1'>当前选中的智能体</h3>
            <pre className='bg-white p-2 rounded text-[10px] max-h-40 overflow-auto'>
              {selectedAgent
                ? safeStringify(
                    { ...selectedAgent, icon: '[React Element]' },
                    2
                  )
                : '无选中智能体'}
            </pre>
          </div>

          <div>
            <h3 className='font-bold mb-1'>本地存储中的智能体</h3>
            <pre className='bg-white p-2 rounded text-[10px] max-h-40 overflow-auto'>
              {storageData || '未加载'}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
