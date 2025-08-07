'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Pause, Play, Stop } from 'lucide-react';

interface TimerWidgetProps {
  entryId: string;
  onStop: () => void;
}

export default function TimerWidget({ entryId, onStop }: TimerWidgetProps) {
  const [time, setTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (!isPaused && startTime) {
      const interval = setInterval(() => {
        setTime(Date.now() - startTime);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isPaused, startTime]);

  useEffect(() => {
    // Start the timer when component mounts
    setStartTime(Date.now());
  }, []);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    const displaySeconds = seconds % 60;
    const displayMinutes = minutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${displayMinutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`;
  };

  const handlePauseResume = () => {
    if (isPaused) {
      // Resume
      setStartTime(Date.now() - time);
      setIsPaused(false);
    } else {
      // Pause
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    onStop();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
      <div className="flex items-center space-x-3">
        {/* Timer Display */}
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-mono font-medium text-gray-900">
            {formatTime(time)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handlePauseResume}
            className={`p-1.5 rounded-md transition-colors ${
              isPaused 
                ? 'text-blue-600 hover:bg-blue-50' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? (
              <Play className="h-3.5 w-3.5" />
            ) : (
              <Pause className="h-3.5 w-3.5" />
            )}
          </button>
          
          <button
            onClick={handleStop}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Stop Timer"
          >
            <Stop className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-600">Recording</span>
        </div>
      </div>
    </div>
  );
}
