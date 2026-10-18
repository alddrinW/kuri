import React from "react";

export function FacebookIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.05 7.42C8.84 7.42 8.61 7.46 8.41 7.87C8.2 8.29 7.62 8.87 7.62 10.04C7.62 11.21 8.47 12.33 8.59 12.49C8.71 12.65 10.23 15.08 12.62 16C14.61 16.77 15.02 16.58 15.45 16.54C16.03 16.48 17.18 15.82 17.42 15.15C17.66 14.48 17.66 13.9 17.59 13.78C17.52 13.66 17.34 13.59 17.07 13.45C16.8 13.31 15.48 12.66 15.23 12.57C14.98 12.48 14.8 12.44 14.62 12.71C14.44 12.98 13.92 13.59 13.76 13.78C13.6 13.97 13.44 13.99 13.17 13.85C12.9 13.71 12.03 13.43 11 12.51C10.2 11.79 9.66 10.91 9.5 10.64C9.34 10.37 9.48 10.22 9.62 10.08C9.74 9.96 9.89 9.76 10.03 9.6C10.17 9.44 10.22 9.32 10.31 9.14C10.4 8.96 10.35 8.81 10.28 8.67C10.21 8.53 9.67 7.21 9.45 6.67C9.23 6.15 9.01 6.22 8.85 6.21L8.35 6.2C8.17 6.2 7.88 6.27 7.64 6.53C7.4 6.79 6.73 7.42 6.73 8.71C6.73 10 7.67 11.24 7.8 11.41L9.05 7.42Z" />
    </svg>
  );
}

export function GoogleMapsIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" x2="9" y1="3" y2="18" />
      <line x1="15" x2="15" y1="6" y2="21" />
    </svg>
  );
}
