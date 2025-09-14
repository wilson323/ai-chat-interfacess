/**
 * 分页组件
 * 基于 shadcn/ui Pagination 组件实现，减少自定义代码
 */

'use client';

import React from 'react';
import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { PaginationProps } from './types';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  showSizeChanger = true,
  showQuickJumper = true,
  showTotal = true,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  disabled = false,
  className,
  style,
  ...props
}: PaginationProps) => {
  // 处理页码变化
  const handlePageChange = (page: number) => {
    if (disabled || page < 1 || page > totalPages || page === currentPage)
      return;
    onPageChange?.(page);
  };

  // 处理每页数量变化
  const handlePageSizeChange = (size: string) => {
    if (disabled) return;
    onPageSizeChange?.(parseInt(size, 10));
  };

  // 处理快速跳转
  const handleQuickJump = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const target = e.currentTarget;
      const page = parseInt(target.value, 10);
      if (page >= 1 && page <= totalPages) {
        handlePageChange(page);
        target.value = '';
      }
    }
  };

  // 如果没有数据，不显示分页
  if (totalItems === 0) {
    return null;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4',
        className
      )}
      style={style}
      {...props}
    >
      {/* 总数信息 */}
      {showTotal && (
        <div className='text-sm text-muted-foreground'>
          共 {totalItems} 条记录，第 {startItem}-{endItem} 条
        </div>
      )}

      {/* 分页控件 */}
      <div className='flex items-center gap-4'>
        {/* 每页数量选择 */}
        {showSizeChanger && (
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>每页</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={handlePageSizeChange}
              disabled={disabled}
            >
              <SelectTrigger className='w-20 h-8'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className='text-sm text-muted-foreground'>条</span>
          </div>
        )}

        {/* 使用shadcn/ui Pagination组件 */}
        <ShadcnPagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href='#'
                onClick={e => {
                  e.preventDefault();
                  handlePageChange(currentPage - 1);
                }}
                className={
                  disabled || currentPage === 1
                    ? 'pointer-events-none opacity-50'
                    : ''
                }
              />
            </PaginationItem>

            {/* 页码 */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    href='#'
                    onClick={e => {
                      e.preventDefault();
                      handlePageChange(page);
                    }}
                    isActive={currentPage === page}
                    className={disabled ? 'pointer-events-none opacity-50' : ''}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {totalPages > 5 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                href='#'
                onClick={e => {
                  e.preventDefault();
                  handlePageChange(currentPage + 1);
                }}
                className={
                  disabled || currentPage === totalPages
                    ? 'pointer-events-none opacity-50'
                    : ''
                }
              />
            </PaginationItem>
          </PaginationContent>
        </ShadcnPagination>

        {/* 快速跳转 */}
        {showQuickJumper && (
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>跳至</span>
            <Input
              type='number'
              min={1}
              max={totalPages}
              placeholder={currentPage.toString()}
              onKeyDown={handleQuickJump}
              disabled={disabled}
              className='w-16 h-8 text-center'
            />
            <span className='text-sm text-muted-foreground'>页</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagination;
