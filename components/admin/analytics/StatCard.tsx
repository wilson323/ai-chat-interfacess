'use client';

import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  textColor: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  gradientFrom,
  gradientTo,
  borderColor,
  textColor,
  className = '',
}: StatCardProps) {
  return (
    <Card
      className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} border-${borderColor} ${className}`}
    >
      <CardContent className='p-4'>
        <div className='flex items-center justify-between'>
          <div>
            <p className={`text-sm ${textColor} font-medium`}>{title}</p>
            <p className='text-2xl font-bold text-gray-900'>{value}</p>
            {description && (
              <p className='text-xs text-gray-500 mt-1'>{description}</p>
            )}
          </div>
          <Icon className={`h-8 w-8 ${textColor}`} />
        </div>
      </CardContent>
    </Card>
  );
}
