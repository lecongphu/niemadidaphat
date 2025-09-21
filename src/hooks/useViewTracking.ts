"use client";

import { useEffect, useRef } from 'react';
import { SupabaseAuth } from '@/lib/supabaseAuth';
import type { Session } from '@supabase/supabase-js';

interface UseViewTrackingProps {
  productId: string;
  enabled?: boolean;
}

export function useViewTracking({ productId, enabled = true }: UseViewTrackingProps) {
  const startTimeRef = useRef<number>(Date.now());
  const hasTrackedRef = useRef<boolean>(false);
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Get current user from Supabase Auth
    const { data: { subscription } } = SupabaseAuth.onAuthStateChange((event, session: Session | null) => {
      currentUserIdRef.current = session?.user?.id || null;
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!enabled || !productId || hasTrackedRef.current) {
      return;
    }

    startTimeRef.current = Date.now();
    hasTrackedRef.current = true;

    // Track view on component mount
    const trackView = async () => {
      try {
        await fetch('/api/analytics/view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: productId,
            userId: currentUserIdRef.current,
            viewDuration: 0 // Initial view
          })
        });
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    trackView();

    // Track view duration on page unload
    const trackViewDuration = async () => {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      
      if (duration > 5) { // Only track if viewed for more than 5 seconds
        try {
          // Use sendBeacon for reliability on page unload
          const data = JSON.stringify({
            productId: productId,
            userId: currentUserIdRef.current,
            viewDuration: duration
          });

          if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/analytics/view', data);
          } else {
            // Fallback for browsers without sendBeacon
            await fetch('/api/analytics/view', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: data,
              keepalive: true
            });
          }
        } catch (error) {
          console.error('Error tracking view duration:', error);
        }
      }
    };

    // Track on various page unload events
    const handleBeforeUnload = () => trackViewDuration();
    const handleVisibilityChange = () => {
      if (document.hidden) {
        trackViewDuration();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      trackViewDuration();
    };
  }, [productId, enabled]);

  // Reset tracking when productId changes
  useEffect(() => {
    hasTrackedRef.current = false;
  }, [productId]);
}
