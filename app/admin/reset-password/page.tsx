'use client';

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

export default function ResetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '重置密码请求失败');
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '发送重置密码邮件失败，请稍后重试'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-background'>
      <Card className='w-[400px]'>
        <CardHeader>
          <CardTitle className='text-2xl'>重置密码</CardTitle>
          <CardDescription>
            请输入您的管理员邮箱地址，我们将向您发送重置密码的链接
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleResetPassword}>
          <CardContent className='space-y-4'>
            {error && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>
                  重置密码链接已发送到您的邮箱，请查收
                </AlertDescription>
              </Alert>
            )}

            <div className='space-y-2'>
              <Label htmlFor='email'>邮箱地址</Label>
              <Input
                id='email'
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder='请输入管理员邮箱地址'
              />
            </div>
          </CardContent>

          <CardFooter className='flex flex-col gap-4'>
            <Button
              type='submit'
              className='w-full'
              disabled={isLoading || success}
            >
              {isLoading ? '发送中...' : '发送重置链接'}
            </Button>
            <Button
              type='button'
              variant='link'
              className='text-sm'
              onClick={() => router.push('/admin/login')}
            >
              返回登录
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
