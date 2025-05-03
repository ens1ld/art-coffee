declare module 'tailwindcss' {
  export default function tailwindcss(config?: object): object;
}

declare module '*.css' {
  const content: any;
  export default content;
} 