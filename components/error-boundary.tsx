'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        this.props.fallback || (
          <div className='p-6 flex flex-col items-center justify-center min-h-[300px]'>
            <Alert variant='destructive' className='mb-4 max-w-md'>
              <AlertTriangle className='h-4 w-4' />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>
                <p className='mb-2'>
                  An error occurred while processing your request.
                </p>
                <p className='text-xs font-mono bg-background/80 p-2 rounded overflow-auto max-h-[100px]'>
                  {this.state.error?.message || 'Unknown error'}
                </p>
              </AlertDescription>
            </Alert>
            <Button
              variant='outline'
              className='flex items-center gap-2'
              onClick={() =>
                this.setState({ hasError: false, error: null, errorInfo: null })
              }
            >
              <RefreshCw className='h-4 w-4' />
              Try Again
            </Button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
