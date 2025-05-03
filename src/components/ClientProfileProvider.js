'use client';
import { useState, useEffect } from 'react';
import { ProfileFetcher, useProfile } from './ProfileFetcher';

// A default context is now provided by ProfileContext in ProfileFetcher.js
// So no need to create another default here

export default function ClientProfileProvider({ children }) {
  const [mounted, setMounted] = useState(false);
  
  // Set mounted to true after the component has mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // On the server or during client-side hydration, render children without ProfileFetcher
  // This is important to avoid hydration mismatches between server and client
  if (!mounted) {
    // PassThrough the children as-is for server-side rendering
    return <>{children}</>;
  }
  
  // Once mounted on the client, render with ProfileFetcher
  // At this point, all client-side components can safely use useProfile()
  return (
    <ProfileFetcher>
      {children}
    </ProfileFetcher>
  );
} 