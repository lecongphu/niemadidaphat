'use client'

import { useState, useEffect } from 'react'
import JwtAuth, { type AuthUser } from '@/lib/jwtAuth'

export default function AuthStatusJWT() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true)
      
      // Lấy user từ cache trước
      const cachedUser = JwtAuth.getCachedUser()
      if (cachedUser) {
        setUser(cachedUser)
      }

      // Verify với server
      const currentUser = await JwtAuth.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Error checking auth status:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      const result = await JwtAuth.signOut()
      
      if (result.success) {
        setUser(null)
        console.log('Đăng xuất thành công')
      } else {
        console.error('Lỗi đăng xuất:', result.error)
      }
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-gray-600">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span>Đang kiểm tra...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-gray-600">Chưa đăng nhập</span>
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-3">
      {/* User Avatar */}
      {user.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user.full_name}
          className="w-8 h-8 rounded-full border-2 border-gray-200"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
          {user.full_name.charAt(0).toUpperCase()}
        </div>
      )}

      {/* User Info */}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">
          {user.full_name}
        </span>
        <span className="text-xs text-gray-500">
          {user.email} • {user.provider || 'unknown'}
        </span>
      </div>

      {/* Sign Out Button */}
      <button
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSigningOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
      </button>

      {/* Status Indicator */}
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
    </div>
  )
}
