"use client";

import { useViewTracking } from '@/hooks/useViewTracking';

interface ProductViewTrackerProps {
  productId: string;
  children: React.ReactNode;
}

export default function ProductViewTracker({ productId, children }: ProductViewTrackerProps) {
  useViewTracking({ productId });

  return <>{children}</>;
}
