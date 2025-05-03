'use client';
import Link from 'next/link';

export default function Logo({ size = 'default' }) {
  const sizeClasses = {
    small: 'text-xl',
    default: 'text-2xl',
    large: 'text-3xl md:text-4xl'
  };

  return (
    <Link href="/" className={`flex items-center gap-2 ${sizeClasses[size]}`}>
      <div className="relative flex items-center justify-center">
        <span className="text-primary-dark font-serif font-bold">Art</span>
        <span className="text-accent-DEFAULT font-serif font-bold ml-1">Coffee</span>
      </div>
    </Link>
  );
} 