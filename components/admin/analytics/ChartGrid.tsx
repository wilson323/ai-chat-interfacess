'use client';

import React from 'react';

interface ChartGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2;
}

export function ChartGrid({
  children,
  className = '',
  cols = 2,
}: ChartGridProps) {
  const gridCols = cols === 1 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2';

  return (
    <div className={`grid ${gridCols} gap-6 ${className}`}>{children}</div>
  );
}

interface ChartCardProps {
  title: string;
  description: string;
  height?: number;
  children?: React.ReactNode;
}

export function ChartCard({
  title,
  description,
  height = 300,
  children,
}: ChartCardProps) {
  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-lg font-semibold text-gray-900'>{title}</h3>
        <p className='text-sm text-gray-600'>{description}</p>
      </div>
      <div style={{ height: `${height}px` }}>{children}</div>
    </div>
  );
}
