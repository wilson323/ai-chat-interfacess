'use client';

import React from 'react';

interface ErrorAlertProps {
  type: 'error' | 'success';
  message: string;
  details?: string;
  className?: string;
}

export function ErrorAlert({
  type,
  message,
  details,
  className = '',
}: ErrorAlertProps) {
  const isError = type === 'error';
  const bgColor = isError ? 'bg-red-50' : 'bg-green-50';
  const borderColor = isError ? 'border-red-200' : 'border-green-200';
  const textColor = isError ? 'text-red-700' : 'text-green-700';

  const iconPath = isError
    ? 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
    : 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z';

  return (
    <div
      className={`${bgColor} border ${borderColor} ${textColor} px-4 py-3 rounded mb-4 flex items-start ${className}`}
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        className='h-5 w-5 mr-2 mt-0.5 flex-shrink-0'
        viewBox='0 0 20 20'
        fill='currentColor'
      >
        <path fillRule='evenodd' d={iconPath} clipRule='evenodd' />
      </svg>
      <div>
        <div className='font-medium'>{message}</div>
        {details && <div className='text-sm mt-1'>{details}</div>}
      </div>
    </div>
  );
}
