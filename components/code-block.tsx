'use client';

import { SimpleCodeBlock } from './simple-code-block';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock(props: CodeBlockProps) {
  return <SimpleCodeBlock {...props} />;
}
