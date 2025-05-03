'use client';
import { useRouter } from 'next/navigation';

export default function NotAuthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">Access Denied</h1>
        <p className="text-secondary mb-8">
          You don't have permission to access this page.
        </p>
        <button
          onClick={() => router.push('/')}
          className="btn-primary px-6 py-2 rounded"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
} 