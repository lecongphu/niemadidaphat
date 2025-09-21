"use client";

import { useState, useEffect } from 'react';
// Removed Supabase import - using API calls now

interface UseFollowProps {
  productId: string;
  userId?: string | null;
}

interface UseFollowReturn {
  isFollowing: boolean;
  followersCount: number;
  isLoading: boolean;
  error: string | null;
  toggleFollow: () => Promise<void>;
}

export function useFollow({ productId, userId }: UseFollowProps): UseFollowReturn {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial follow status and count
  useEffect(() => {
    async function fetchFollowStatus() {
      try {
        setIsLoading(true);
        setError(null);

        // Build query params - include userId only if available (for anonymous users, API will use IP)
        const params = new URLSearchParams({ productId });
        if (userId) {
          params.set('userId', userId);
        }

        // Check if user/IP follows this product
        const response = await fetch(`/api/follow?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to check follow status');
        }

        setIsFollowing(data.isFollowing);
        setFollowersCount(data.followersCount);

      } catch (err) {
        console.error('Error fetching follow status:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchFollowStatus();
  }, [productId, userId]);

  const toggleFollow = async () => {
    try {
      setError(null);
      const method = isFollowing ? 'DELETE' : 'POST';
      
      // Send request with userId (can be null for anonymous users)
      const response = await fetch('/api/follow', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          userId: userId || null // Explicitly send null for anonymous users
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update follow status');
      }

      // Update local state
      setIsFollowing(!isFollowing);
      setFollowersCount(data.followersCount);

    } catch (err) {
      console.error('Error toggling follow:', err);
      setError(err instanceof Error ? err.message : 'Failed to update follow status');
    }
  };

  return {
    isFollowing,
    followersCount,
    isLoading,
    error,
    toggleFollow
  };
}
