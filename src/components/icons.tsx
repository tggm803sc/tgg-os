import type { SVGProps } from 'react';

type Props = SVGProps<SVGSVGElement>;

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function ChatIcon(props: Props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
      <path d="M20.5 11.4a7.9 7.9 0 0 1-8.4 7.9 9 9 0 0 1-2.1-.3L5 21l1.1-3.7a7.7 7.7 0 0 1-1.6-5.9 7.9 7.9 0 0 1 8-7.9 7.9 7.9 0 0 1 8 7.9Z" />
    </svg>
  );
}

export function StoriesIcon(props: Props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
      <circle cx="12" cy="12" r="8.2" />
      <circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CameraIcon(props: Props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
      <path d="M4.2 8.6h2l1.5-2.4h8.6l1.5 2.4h2A1.6 1.6 0 0 1 21.4 10v7.6a1.6 1.6 0 0 1-1.6 1.6H4.2a1.6 1.6 0 0 1-1.6-1.6V10a1.6 1.6 0 0 1 1.6-1.4Z" />
      <circle cx="12" cy="13.4" r="3.4" />
    </svg>
  );
}

export function ProfileIcon(props: Props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
      <circle cx="12" cy="8.2" r="3.6" />
      <path d="M4.8 20c.7-3.6 3.6-5.5 7.2-5.5s6.5 1.9 7.2 5.5" />
    </svg>
  );
}

export function FlameIcon(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.4 2.2c.4 3.6 2.1 4.9 3.6 6.6 1.3 1.5 2.4 3.1 2.4 5.4a6.4 6.4 0 0 1-12.8 0c0-2.4 1.1-4 2.4-5.4.3 1.3 1 2.1 1.9 2.6-.3-3.6.7-6.7 2.5-9.2Z" />
    </svg>
  );
}

export function TimerIcon(props: Props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
      <circle cx="12" cy="13.2" r="7.4" />
      <path d="M12 9.6v3.8l2.4 1.5M9.2 2.6h5.6" />
    </svg>
  );
}

export function FlipIcon(props: Props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
      <path d="M3.6 9A4.6 4.6 0 0 1 8.2 5.4h7.6" />
      <path d="m13 2.6 2.8 2.8-2.8 2.8" />
      <path d="M20.4 15a4.6 4.6 0 0 1-4.6 3.6H8.2" />
      <path d="m11 21.4-2.8-2.8 2.8-2.8" />
    </svg>
  );
}

export function FlashIcon(props: Props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
      <path d="M13.4 2.6 6.4 13.2h4.6l-1 8.2 8-11.2h-4.7l1.1-7.6Z" />
    </svg>
  );
}

export function UploadIcon(props: Props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
      <rect x="3" y="4.6" width="18" height="14.8" rx="2.6" />
      <circle cx="8.4" cy="9.4" r="1.5" />
      <path d="m4 17 4.4-4.4 4 3.5 3-3L20 17.4" />
    </svg>
  );
}

export function CloseIcon(props: Props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function SendIcon(props: Props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
      <path d="M21 3 3 10.5l7 2.6 2.6 7L21 3Z" />
      <path d="m10 13.1 4.6-4.6" />
    </svg>
  );
}

export function PlusIcon(props: Props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function BackIcon(props: Props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
      <path d="m14.5 5-7 7 7 7" />
    </svg>
  );
}

export function EyeIcon(props: Props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
      <path d="M2.6 12S6.2 5.9 12 5.9 21.4 12 21.4 12 17.8 18.1 12 18.1 2.6 12 2.6 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

export function CheckIcon(props: Props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
      <path d="m5 12.6 4.6 4.6L19 7.2" />
    </svg>
  );
}

export function ChevronRightIcon(props: Props) {
  return (
    <svg viewBox="0 0 24 24" {...stroke} {...props}>
      <path d="m9.5 5 7 7-7 7" />
    </svg>
  );
}
