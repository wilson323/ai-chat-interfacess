import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface InteractiveNodeProps {
  options: {
    value: string;
    key: string;
  }[];
  description?: string;
  onSelect: (value: string) => void;
}

export function InteractiveNode({
  options,
  description,
  onSelect,
}: InteractiveNodeProps) {
  return (
    <Card className='p-4 mb-4 border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800'>
      <div className='mb-3 text-sm font-medium'>
        {description || '请选择一个选项继续:'}
      </div>
      <div className='flex flex-wrap gap-2'>
        {options.map(option => (
          <Button
            key={option.key}
            variant='outline'
            onClick={() => onSelect(option.value)}
            className='bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'
          >
            {option.value}
          </Button>
        ))}
      </div>
    </Card>
  );
}
