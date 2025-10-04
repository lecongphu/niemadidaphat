'use client'

import Script from 'next/script'
import JwtAuth from '@/lib/jwtAuth'
import type { CredentialResponse, IdConfiguration } from 'google-one-tap'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: IdConfiguration) => void
          prompt: () => void
          cancel: () => void
        }
      }
    }
  }
}

// Generate nonce để sử dụng cho Google ID token sign-in
const generateNonce = async (): Promise<[string, string]> => {
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))))
  const encoder = new TextEncoder()
  const encodedNonce = encoder.encode(nonce)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedNonce)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

  return [nonce, hashedNonce]
}

interface GoogleOneTapJWTProps {
  onSuccess?: () => void
  onError?: (error: Error | string) => void
}

const GoogleOneTapJWT = ({ onSuccess, onError }: GoogleOneTapJWTProps) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const initializeGoogleOneTap = async () => {
    try {
      console.log('Khởi tạo Google One Tap (JWT Auth)')
      
      // Kiểm tra xem có Google Client ID không
      if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        console.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID chưa được cấu hình')
        onError?.('Google Client ID chưa được cấu hình')
        return
      }

      // Kiểm tra xem user đã đăng nhập chưa
      if (JwtAuth.isAuthenticated()) {
        console.log('Đã đăng nhập, chuyển về trang chủ')
        router.push('/')
        return
      }

      const [nonce, hashedNonce] = await generateNonce()
      console.log('Nonce được tạo:', { 
        nonce: nonce.substring(0, 10) + '...', 
        hashedNonce: hashedNonce.substring(0, 10) + '...' 
      })

      // Kiểm tra xem window.google có sẵn không
      if (!window.google) {
        console.error('Google SDK chưa được tải')
        onError?.('Google SDK chưa được tải')
        return
      }

      /* global google */
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: async (response: CredentialResponse) => {
          try {
            setIsLoading(true)
            console.log('Nhận được response từ Google One Tap')
            
            // Gửi credential đến backend API thay vì Supabase
            const result = await JwtAuth.signInWithGoogle(response.credential)

            if (!result.success) {
              const error = new Error(result.error || 'Không thể đăng nhập với Google One Tap')
              console.error('Lỗi đăng nhập với Google One Tap:', error)
              onError?.(error)
              return
            }

            console.log('Đăng nhập thành công với Google One Tap:', result.data?.user)

            // Gọi callback success nếu có
            onSuccess?.()

            // Chuyển về trang chủ
            router.push('/')
            
          } catch (error) {
            console.error('Lỗi khi đăng nhập với Google One Tap:', error)
            onError?.(error instanceof Error ? error : String(error))
          } finally {
            setIsLoading(false)
          }
        },
        nonce: hashedNonce,
        // Sử dụng FedCM thay vì third-party cookies (Chrome requirement)
        use_fedcm_for_prompt: true,
        auto_select: false,
        cancel_on_tap_outside: false,
      })
      
      // Hiển thị One Tap UI
      window.google.accounts.id.prompt()
      
    } catch (error) {
      console.error('Lỗi khởi tạo Google One Tap:', error)
      onError?.(error instanceof Error ? error : String(error))
    }
  }

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Đang đăng nhập...</span>
            </div>
          </div>
        </div>
      )}
      
      <Script 
        onReady={() => {
          initializeGoogleOneTap().catch(console.error);
        }} 
        src="https://accounts.google.com/gsi/client"
        strategy="lazyOnload"
      />
    </>
  )
}

export default GoogleOneTapJWT
