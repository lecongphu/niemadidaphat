"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { listProducts } from '@/lib/productsRepo';
import type { Product } from '@/lib/types';
import { useFollow } from '@/hooks/useFollow';
import { SupabaseAuth } from '@/lib/supabaseAuth';
import type { Session } from '@supabase/supabase-js';

interface PlaylistCardProps {
  product: Product;
  currentUserId?: string | null;
}

function PlaylistCard({ product, currentUserId }: PlaylistCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { isFollowing, followersCount, isLoading, toggleFollow } = useFollow({
    productId: product.id,
    userId: currentUserId
  });

  return (
    <div 
      className="group bg-amber-50/90 hover:bg-amber-100/95 border border-amber-200/50 hover:border-amber-300/70 rounded-xl p-4 transition-all duration-300 cursor-pointer backdrop-blur-sm shadow-lg hover:shadow-xl peaceful-shadow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/an-pham/${product.slug}`} className="block">
        <div className="relative mb-4">
          {/* Cover Image */}
          <div className="aspect-square rounded-lg overflow-hidden shadow-xl">
            {product.cover_url ? (
              <img 
                src={product.cover_url} 
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center">
                <span className="text-white text-4xl">🪷</span>
              </div>
            )}
          </div>
          
          {/* Play Button Overlay */}
          <div className={`absolute bottom-3 right-3 w-14 h-14 lotus-gradient hover:opacity-90 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'
          }`}>
            <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 5v10l8-5-8-5z"/>
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="font-bold text-amber-900 text-lg line-clamp-2 group-hover:underline leading-tight">
            {product.title}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm">
              <span className="text-amber-700/70">
                {isLoading ? '...' : `${followersCount} Followers`}
              </span>
            </div>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFollow();
              }}
              disabled={isLoading}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                isFollowing 
                  ? 'bg-amber-200 text-amber-900 hover:bg-amber-300 border border-amber-300' 
                  : 'bg-amber-600 text-white hover:bg-amber-700 lotus-gradient'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              title={currentUserId ? 'Follow as registered user' : 'Follow anonymously'}
            >
              {isLoading ? '...' : (isFollowing ? 'Following' : 'Follow')}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function SpotifyPlaylist() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Get products
        const data = await listProducts();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = SupabaseAuth.onAuthStateChange((event, session: Session | null) => {
      setCurrentUserId(session?.user?.id || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 p-6 rounded-xl serene-card">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 p-6 rounded-xl serene-card">
        <div className="text-center text-red-600">
          <p>Lỗi: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 rounded-xl overflow-hidden p-6 serene-card">
      {/* Simple Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lotus-gradient rounded-full flex items-center justify-center">
              <span className="text-white text-lg">🪷</span>
            </div>
            <h2 className="text-3xl font-bold wisdom-text">Tuyển tập Phật pháp</h2>
          </div>
          <Link href="/an-pham" className="text-sm text-amber-700/70 hover:text-amber-900 font-medium transition-colors lotus-button text-xs px-4 py-2">
            Hiển thị tất cả
          </Link>
        </div>
        <p className="text-amber-800/80 text-lg font-medium">
          {products.length} bài giảng âm thanh thanh tịnh từ Tây Phương Cực Lạc
        </p>
      </div>
      
      {/* Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
        {products.map((product) => (
          <PlaylistCard key={product.id} product={product} currentUserId={currentUserId} />
        ))}
      </div>
    </div>
  );
}
