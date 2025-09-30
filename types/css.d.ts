// CSS module type declarations

// Global CSS files (like Tailwind, globals.css)
declare module '*.css' {
  const content: any;
  export default content;
}

// Specific global CSS declarations
declare module '@/styles/globals.css';
declare module '@/assets/styles/globals.css';
declare module '../styles/globals.css';
declare module '../../styles/globals.css';

// CSS Modules with typed exports
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { readonly [key: string]: string };
  export default classes;
}