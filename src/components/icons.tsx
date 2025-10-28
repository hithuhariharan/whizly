import type { SVGProps } from 'react';

export function WhizlyLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3.5 9.5L8 20l4-10.5L16 20l4.5-10.5" />
    </svg>
  );
}

export function RazorpayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
      <polyline points="2 17 12 22 22 17"></polyline>
      <polyline points="2 12 12 17 22 12"></polyline>
    </svg>
  );
}

export function MetaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2z" />
      <path
        fill="hsl(var(--background))"
        stroke="hsl(var(--background))"
        d="M16.14 14.11c-.39 1.52-2.1 3.5-4.14 3.5s-3.75-1.98-4.14-3.5c-.12-.47.16-1.11.8-1.11h6.68c.64 0 .92.64.8 1.11z"
      />
      <path
        fill="hsl(var(--background))"
        stroke="hsl(var(--background))"
        d="M18.88 9.1c-1.18 2.3-3.48 3.56-6.88 3.56s-5.7-1.26-6.88-3.56c-.4-.77.1-1.6.88-1.6h12c.78 0 1.28.83.88 1.6z"
      />
    </svg>
  );
}
