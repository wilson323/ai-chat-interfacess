export function CadIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="3" fill="#4CAF50" />
      <path d="M7 17L17 7" stroke="#fff" strokeWidth="2" />
      <circle cx="7" cy="17" r="1.5" fill="#fff" />
      <circle cx="17" cy="7" r="1.5" fill="#fff" />
    </svg>
  )
} 