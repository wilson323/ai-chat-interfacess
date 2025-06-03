// 设备检测工具
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const isIOSDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const supportsSpeechRecognition = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

export const supportsMediaRecorder = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return 'MediaRecorder' in window;
}; 