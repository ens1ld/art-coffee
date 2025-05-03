'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-amber-800 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          We couldn&apos;t find the page you&apos;re looking for. It might have been moved or deleted.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-amber-800 text-white rounded-md hover:bg-amber-700 transition-colors"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
} 