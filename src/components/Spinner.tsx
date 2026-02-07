interface SpinnerProps {
  size?: number;
  label?: string;
}

export function Spinner({ size = 24, label }: SpinnerProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '24px' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        style={{ animation: 'spin 0.8s linear infinite' }}
      >
        <circle cx="12" cy="12" r="10" stroke="var(--md-sys-color-outline-variant)" stroke-width="3" />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="var(--md-sys-color-primary)"
          stroke-width="3"
          stroke-linecap="round"
        />
      </svg>
      {label && <span style={{ font: 'var(--md-sys-typescale-body-medium)', color: 'var(--md-sys-color-on-surface-variant)' }}>{label}</span>}
    </div>
  );
}
