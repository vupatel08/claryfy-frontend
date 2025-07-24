'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to landing page instead of dashboard
    router.push('/landing');
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">
          <span className="text-[#EFEEE7]">CLARYFY</span>
        </h1>
        <p className="text-[#EFEEE7]/70">Loading...</p>
      </div>
    </div>
  );
}
