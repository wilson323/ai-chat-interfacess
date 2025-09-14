export interface ImageEditorModelConfig {
  name: string;
  apiKey: string;
  backupKeys?: string[];
}

export interface ImageEditorConfig {
  enabled: boolean;
  models: ImageEditorModelConfig[];
  defaultModel: string;
  maxImageSizeMB: number;
  supportedFormats: string[];
  editParams: {
    brushSize: number;
    markerColor: string;
    maxEditSteps: number;
  };
  historyRetentionDays: number;
  description?: string;
}
