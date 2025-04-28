import { Loader2 } from "lucide-react"

interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = "加载中..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] p-8">
      <Loader2 className="h-8 w-8 text-pantone369-500 animate-spin mb-4" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  )
}
