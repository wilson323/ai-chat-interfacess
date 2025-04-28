"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { X, Zap, Sparkles, Gauge, Thermometer, Brain } from "lucide-react"

interface ChatOptionsProps {
  onClose: () => void
}

export function ChatOptions({ onClose }: ChatOptionsProps) {
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(1000)
  const [streamResponse, setStreamResponse] = useState(true)
  const [enhancedMode, setEnhancedMode] = useState(false)

  return (
    <Card className="absolute bottom-24 right-4 w-80 p-4 shadow-lg z-10 border border-zinc-200 dark:border-zinc-800 animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 font-medium">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>Chat Options</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1.5">
              <Thermometer className="h-3.5 w-3.5 text-orange-500" />
              Temperature: {temperature.toFixed(1)}
            </Label>
          </div>
          <Slider
            value={[temperature]}
            min={0}
            max={1}
            step={0.1}
            onValueChange={(value) => setTemperature(value[0])}
          />
          <p className="text-xs text-muted-foreground">Higher values produce more creative results</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 text-blue-500" />
              Max Tokens: {maxTokens}
            </Label>
          </div>
          <Slider
            value={[maxTokens]}
            min={100}
            max={4000}
            step={100}
            onValueChange={(value) => setMaxTokens(value[0])}
          />
          <p className="text-xs text-muted-foreground">Maximum length of the generated response</p>
        </div>

        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1.5" htmlFor="stream-toggle">
            <Zap className="h-3.5 w-3.5 text-yellow-500" />
            Stream Response
          </Label>
          <Switch id="stream-toggle" checked={streamResponse} onCheckedChange={setStreamResponse} />
        </div>

        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1.5" htmlFor="enhanced-toggle">
            <Brain className="h-3.5 w-3.5 text-purple-500" />
            Enhanced Mode
          </Label>
          <Switch id="enhanced-toggle" checked={enhancedMode} onCheckedChange={setEnhancedMode} />
        </div>

        <Button className="w-full" size="sm">
          Apply Settings
        </Button>
      </div>
    </Card>
  )
}
