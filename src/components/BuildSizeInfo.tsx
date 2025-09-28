"use client";

import { useState, useEffect } from 'react';
import prettyBytes from 'pretty-bytes';

interface BuildSizeInfoProps {
  className?: string;
}

const CLOUDFLARE_LIMIT = 25 * 1024 * 1024; // 25MB in bytes

export default function BuildSizeInfo({ className = "" }: BuildSizeInfoProps) {
  const [buildInfo, setBuildInfo] = useState<{
    totalSize: number;
    percentage: number;
    status: 'safe' | 'warning' | 'danger';
    message: string;
  } | null>(null);

  useEffect(() => {
    // Simulate build size check (in real app, this would come from API or build process)
    const checkBuildSize = () => {
      // This is a mock - in production, you'd get this from your build process
      const mockTotalSize = 15 * 1024 * 1024; // 15MB mock size
      const percentage = (mockTotalSize / CLOUDFLARE_LIMIT) * 100;
      
      let status: 'safe' | 'warning' | 'danger' = 'safe';
      let message = 'Build size is within limits';
      
      if (percentage > 90) {
        status = 'danger';
        message = 'Build size exceeds Cloudflare limit!';
      } else if (percentage > 80) {
        status = 'warning';
        message = 'Build size is close to limit';
      }
      
      setBuildInfo({
        totalSize: mockTotalSize,
        percentage,
        status,
        message
      });
    };

    checkBuildSize();
  }, []);

  if (!buildInfo) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        Loading build info...
      </div>
    );
  }

  const getStatusColor = () => {
    switch (buildInfo.status) {
      case 'danger': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getStatusIcon = () => {
    switch (buildInfo.status) {
      case 'danger': return '🚨';
      case 'warning': return '⚠️';
      default: return '✅';
    }
  };

  return (
    <div className={`border rounded-lg p-3 ${getStatusColor()} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getStatusIcon()}</span>
          <div>
            <div className="font-medium text-sm">Build Size</div>
            <div className="text-xs opacity-75">{buildInfo.message}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-sm font-bold">
            {prettyBytes(buildInfo.totalSize)}
          </div>
          <div className="text-xs opacity-75">
            {buildInfo.percentage.toFixed(1)}% of limit
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              buildInfo.status === 'danger' ? 'bg-red-500' : 
              buildInfo.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(buildInfo.percentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>0 MB</span>
          <span className="font-medium">Cloudflare Limit: {prettyBytes(CLOUDFLARE_LIMIT)}</span>
        </div>
      </div>
      
      {buildInfo.status !== 'safe' && (
        <div className="mt-2 text-xs">
          <div className="font-medium mb-1">💡 Suggestions:</div>
          <ul className="list-disc list-inside space-y-1 text-xs opacity-75">
            <li>Disable webpack cache in next.config.js</li>
            <li>Add .next/cache/** to .gitignore</li>
            <li>Use output: "standalone" for smaller builds</li>
            <li>Run <code className="bg-gray-100 px-1 rounded">npm run check-size</code> to analyze</li>
          </ul>
        </div>
      )}
    </div>
  );
}
