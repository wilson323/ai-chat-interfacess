'use client';

import type React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface FormErrors {
  username: string;
  password: string;
}

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({
    username: '',
    password: '',
  });

  const validateForm = (): boolean => {
    const errors: FormErrors = {
      username: '',
      password: '',
    };

    if (username.length < 3) {
      errors.username = '用户名至少需要3个字符';
    }

    if (password.length < 3) {
      errors.password = '密码至少需要3个字符';
    }

    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '登录失败');
      }

      // 跳转到管理页面，强制刷新，确保不留在登录页
      window.location.replace('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-background'>
      <Card className='w-[400px]'>
        <CardHeader>
          <CardTitle className='text-2xl'>管理员登录</CardTitle>
          <CardDescription>
            请输入您的管理员凭据以访问管理控制台
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className='space-y-4'>
            {error && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className='space-y-2'>
              <Label htmlFor='username'>用户名</Label>
              <Input
                id='username'
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete='username'
                className={formErrors.username ? 'border-red-500' : ''}
              />
              {formErrors.username && (
                <p className='text-sm text-red-500'>{formErrors.username}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='password'>密码</Label>
              <Input
                id='password'
                type='password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete='current-password'
                className={formErrors.password ? 'border-red-500' : ''}
              />
              {formErrors.password && (
                <p className='text-sm text-red-500'>{formErrors.password}</p>
              )}
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='rememberMe'
                checked={rememberMe}
                onCheckedChange={checked => setRememberMe(checked as boolean)}
              />
              <Label htmlFor='rememberMe' className='text-sm font-normal'>
                记住我
              </Label>
            </div>
          </CardContent>

          <CardFooter className='flex flex-col gap-4'>
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? '登录中...' : '登录'}
            </Button>
            <Button
              type='button'
              variant='link'
              className='text-sm'
              onClick={() => router.push('/admin/reset-password')}
            >
              忘记密码？
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
