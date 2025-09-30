// Global type declarations for Next.js project

// CSS Module declarations
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.sass' {
  const content: { [className: string]: string };
  export default content;
}

// Image and asset declarations
declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

// Global CSS imports (like Tailwind)
declare module '../styles/globals.css';
declare module '../../styles/globals.css';
declare module '@/styles/globals.css';
declare module '@/assets/styles/globals.css';

// Environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_APP_NAME: string;
    NEXT_PUBLIC_APP_DESCRIPTION: string;
    NEXT_PUBLIC_SERVER_URL: string;
    DATABASE_URL: string;
    NEXTAUTH_SECRET: string;
    NEXTAUTH_URL: string;
    NEXTAUTH_URL_INTERNAL: string;
  }
}