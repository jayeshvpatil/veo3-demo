import React, { useState, useEffect } from 'react';
import { useRateLimit } from '@/lib/rate-limiter';

interface QuotaMonitorProps {
  className?: string;
}

export default function QuotaMonitor({ className = '' }: QuotaMonitorProps) {
  const { canMakeRequest, requestsRemaining, timeUntilNext } = useRateLimit();
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(timeUntilNext());
    }, 1000);

    return () => clearInterval(interval);
  }, [timeUntilNext]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    const remaining = requestsRemaining();
    if (remaining > 3) return 'text-green-600';
    if (remaining > 1) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = () => {
    if (canMakeRequest()) return '🟢';
    return '🔴';
  };

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <span>{getStatusIcon()}</span>
      <span className={getStatusColor()}>
        {requestsRemaining()} requests remaining
      </span>
      {timeRemaining > 0 && (
        <span className="text-gray-500">
          (Next available in {formatTime(timeRemaining)})
        </span>
      )}
    </div>
  );
}