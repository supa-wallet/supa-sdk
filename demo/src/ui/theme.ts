export const darkTheme = {
  colors: {
    bg: {
      primary: '#0a0a0c',
      secondary: '#111114',
      tertiary: '#18181c',
      elevated: '#1f1f24',
      hover: '#27272e',
    },
    accent: {
      primary: '#f97316',
      hover: '#fb923c',
      muted: 'rgba(249, 115, 22, 0.12)',
    },
    success: {
      primary: '#22c55e',
      muted: 'rgba(34, 197, 94, 0.12)',
    },
    error: {
      primary: '#ef4444',
      muted: 'rgba(239, 68, 68, 0.12)',
    },
    info: {
      primary: '#3b82f6',
      muted: 'rgba(59, 130, 246, 0.12)',
    },
    text: {
      primary: '#fafafa',
      secondary: '#a1a1aa',
      muted: '#71717a',
    },
    border: {
      primary: '#27272a',
      hover: '#3f3f46',
    },
  },
  fonts: {
    sans: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
  },
  radii: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '20px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.4)',
    md: '0 4px 12px rgba(0, 0, 0, 0.5)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.6)',
    glow: '0 0 60px rgba(249, 115, 22, 0.15)',
  },
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  space: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
  },
} as const;

export const lightTheme = {
  colors: {
    bg: {
      primary: '#ffffff',
      secondary: '#f8f9fa',
      tertiary: '#f1f3f5',
      elevated: '#ffffff',
      hover: '#e9ecef',
    },
    accent: {
      primary: '#f97316',
      hover: '#ea580c',
      muted: 'rgba(249, 115, 22, 0.1)',
    },
    success: {
      primary: '#16a34a',
      muted: 'rgba(22, 163, 74, 0.1)',
    },
    error: {
      primary: '#dc2626',
      muted: 'rgba(220, 38, 38, 0.1)',
    },
    info: {
      primary: '#2563eb',
      muted: 'rgba(37, 99, 235, 0.1)',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#52525b',
      muted: '#a1a1aa',
    },
    border: {
      primary: '#e4e4e7',
      hover: '#d4d4d8',
    },
  },
  fonts: {
    sans: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
  },
  radii: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '20px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 12px rgba(0, 0, 0, 0.08)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
    glow: '0 0 60px rgba(249, 115, 22, 0.1)',
  },
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  space: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
  },
} as const;

export const theme = darkTheme;

export type Theme = typeof darkTheme;

