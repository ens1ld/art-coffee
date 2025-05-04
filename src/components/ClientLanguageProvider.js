'use client';
import { LanguageProvider } from '@/context/LanguageContext';

export default function ClientLanguageProvider({ children }) {
  return <LanguageProvider>{children}</LanguageProvider>;
} 