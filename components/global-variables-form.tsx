'use client';

import React, { useState, useEffect, useMemo } from 'react';
// Removed unused import
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
// Removed unused Card imports
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';
import type { GlobalVariable, Agent } from '../types/agent';

interface GlobalVariablesFormProps {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (variables: Record<string, unknown>) => void;
  initialValues?: Record<string, unknown>;
}

export function GlobalVariablesForm({
  agent,
  isOpen,
  onClose,
  onSubmit,
  initialValues,
}: GlobalVariablesFormProps) {
  const [variables, setVariables] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 获取必填的全局变量
  const requiredVariables = useMemo(
    () => agent.globalVariables?.filter(v => v.required) || [],
    [agent.globalVariables]
  );

  // 初始化变量值
  useEffect(() => {
    if (isOpen && requiredVariables.length > 0) {
      const formInitialValues: Record<string, unknown> = {};

      // 优先级：传入的初始值 > localStorage保存的值 > 变量默认值 > 空值
      const savedValues = localStorage.getItem(`agent-variables-${agent.id}`);
      const parsedSavedValues = savedValues ? JSON.parse(savedValues) : {};

      requiredVariables.forEach(variable => {
        formInitialValues[variable.key] =
          initialValues?.[variable.key] ||
          parsedSavedValues[variable.key] ||
          variable.defaultValue ||
          '';
      });

      setVariables(formInitialValues);
      setErrors({});
    }
  }, [isOpen, agent.id, initialValues, requiredVariables]);

  // 验证单个变量
  const validateVariable = (
    variable: GlobalVariable,
    value: unknown
  ): string | null => {
    if (variable.required && (!value || value.toString().trim() === '')) {
      return `${variable.label}是必填项`;
    }

    if (variable.maxLen && value && value.toString().length > variable.maxLen) {
      return `${variable.label}长度不能超过${variable.maxLen}个字符`;
    }

    if (variable.valueType === 'number' && value && isNaN(Number(value))) {
      return `${variable.label}必须是数字`;
    }

    return null;
  };

  // 处理变量值变化
  const handleVariableChange = (key: string, value: unknown) => {
    setVariables(prev => ({ ...prev, [key]: value }));

    // 清除该字段的错误
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  // 验证所有变量
  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};

    requiredVariables.forEach(variable => {
      const error = validateVariable(variable, variables[variable.key]);
      if (error) {
        newErrors[variable.key] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 保存变量值到localStorage
      localStorage.setItem(
        `agent-variables-${agent.id}`,
        JSON.stringify(variables)
      );

      // 调用回调函数
      onSubmit(variables);
      onClose();
    } catch (error) {
      console.error('提交全局变量时出错:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 渲染变量输入组件
  const renderVariableInput = (variable: GlobalVariable) => {
    const value = variables[variable.key] ?? '';
    const error = errors[variable.key];

    switch (variable.type) {
      case 'select':
      case 'text':
      case 'number':
      case 'boolean':
        return (
          <div key={variable.key} className='space-y-2'>
            <Label htmlFor={variable.key} className='flex items-center gap-1'>
              {variable.label}
              {variable.required && <span className='text-red-500'>*</span>}
            </Label>
            <Select
              value={value as string}
              onValueChange={val => handleVariableChange(variable.key, val)}
            >
              <SelectTrigger className={error ? 'border-red-500' : ''}>
                <SelectValue placeholder={`请选择${variable.label}`} />
              </SelectTrigger>
              <SelectContent>
                {(variable.list || variable.enums || []).map(
                  (option: any, index: number) => (
                    <SelectItem key={index} value={option.value}>
                      {option.label || option.value}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            {error && (
              <p className='text-xs text-red-500 flex items-center gap-1'>
                <AlertCircle className='h-3 w-3' />
                {error}
              </p>
            )}
          </div>
        );

      case 'text':
      case 'custom':
        if (variable.maxLen && variable.maxLen > 100) {
          // 长文本使用Textarea
          return (
            <div key={variable.key} className='space-y-2'>
              <Label htmlFor={variable.key} className='flex items-center gap-1'>
                {variable.label}
                {variable.required && <span className='text-red-500'>*</span>}
              </Label>
              <Textarea
                id={variable.key}
                value={value as string}
                onChange={e =>
                  handleVariableChange(variable.key, e.target.value)
                }
                placeholder={variable.description || `请输入${variable.label}`}
                className={error ? 'border-red-500' : ''}
                maxLength={variable.maxLen}
              />
              {variable.maxLen && (
                <p className='text-xs text-muted-foreground text-right'>
                  {(value as string).length}/{variable.maxLen}
                </p>
              )}
              {variable.description && (
                <p className='text-xs text-muted-foreground'>
                  {variable.description}
                </p>
              )}
              {error && (
                <p className='text-xs text-red-500 flex items-center gap-1'>
                  <AlertCircle className='h-3 w-3' />
                  {error}
                </p>
              )}
            </div>
          );
        }
        // 短文本使用Input
        return (
          <div key={variable.key} className='space-y-2'>
            <Label htmlFor={variable.key} className='flex items-center gap-1'>
              {variable.label}
              {variable.required && <span className='text-red-500'>*</span>}
            </Label>
            <Input
              id={variable.key}
              type={variable.valueType === 'number' ? 'number' : 'text'}
              value={value as string}
              onChange={e => handleVariableChange(variable.key, e.target.value)}
              placeholder={variable.description || `请输入${variable.label}`}
              className={error ? 'border-red-500' : ''}
              maxLength={variable.maxLen}
            />
            {variable.description && (
              <p className='text-xs text-muted-foreground'>
                {variable.description}
              </p>
            )}
            {error && (
              <p className='text-xs text-red-500 flex items-center gap-1'>
                <AlertCircle className='h-3 w-3' />
                {error}
              </p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={variable.key} className='space-y-2'>
            <Label htmlFor={variable.key} className='flex items-center gap-1'>
              {variable.label}
              {variable.required && <span className='text-red-500'>*</span>}
            </Label>
            <Input
              id={variable.key}
              type='number'
              value={value as string}
              onChange={e => handleVariableChange(variable.key, e.target.value)}
              placeholder={variable.description || `请输入${variable.label}`}
              className={error ? 'border-red-500' : ''}
            />
            {variable.description && (
              <p className='text-xs text-muted-foreground'>
                {variable.description}
              </p>
            )}
            {error && (
              <p className='text-xs text-red-500 flex items-center gap-1'>
                <AlertCircle className='h-3 w-3' />
                {error}
              </p>
            )}
          </div>
        );

      default:
        // 默认使用文本输入
        return (
          <div key={variable.key} className='space-y-2'>
            <Label htmlFor={variable.key} className='flex items-center gap-1'>
              {variable.label}
              {variable.required && <span className='text-red-500'>*</span>}
            </Label>
            <Input
              id={variable.key}
              value={value as string}
              onChange={e => handleVariableChange(variable.key, e.target.value)}
              placeholder={variable.description || `请输入${variable.label}`}
              className={error ? 'border-red-500' : ''}
            />
            {variable.description && (
              <p className='text-xs text-muted-foreground'>
                {variable.description}
              </p>
            )}
            {error && (
              <p className='text-xs text-red-500 flex items-center gap-1'>
                <AlertCircle className='h-3 w-3' />
                {error}
              </p>
            )}
          </div>
        );
    }
  };

  if (requiredVariables.length === 0) {
    return null;
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className='max-w-md max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <CheckCircle className='h-5 w-5 text-pantone369-600' />
            配置智能体参数
          </DialogTitle>
          <DialogDescription>
            {agent.name} 需要以下必填参数才能正常工作，请填写后继续对话。
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {requiredVariables.length > 0 && (
            <Alert>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                请填写所有必填参数，这些参数将用于个性化您的对话体验。
              </AlertDescription>
            </Alert>
          )}

          {requiredVariables.map(renderVariableInput)}

          <div className='flex gap-2 pt-4'>
            <Button variant='outline' onClick={onClose} className='flex-1'>
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className='flex-1'
            >
              {isSubmitting ? '提交中...' : '确认'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
