// 全局浏览器与测试环境声明（最小集）

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognition;
    webkitSpeechRecognition?: SpeechRecognition;
    webkitRTCPeerConnection?: RTCPeerConnection;
  }

  // 最小化 SpeechRecognition 类型占位，避免 TS 缺失
  interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
    onend: ((this: SpeechRecognition, ev: Event) => void) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
    onerror: ((this: SpeechRecognition, ev: Event) => void) | null;
  }

  interface LayoutShift extends PerformanceEntry {
    value: number;
    hadRecentInput: boolean;
  }

  // 地理位置相关类型
  interface GeoLocation {
    latitude: number;
    longitude: number;
    country: string;
    city?: string;
    region?: string;
    type: 'public' | 'private';
  }

  // 语音识别事件类型
  interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
  }

  // 电池管理API类型
  interface BatteryManager extends EventTarget {
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
    level: number;
    addEventListener(type: string, listener: EventListener): void;
    removeEventListener(type: string, listener: EventListener): void;
  }

  // 扩展Navigator接口以包含getBattery方法
  interface Navigator {
    getBattery?: () => Promise<BatteryManager>;
  }
}

export {};

declare module 'pg';
