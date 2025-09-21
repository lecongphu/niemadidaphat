'use client'

import Script from 'next/script'
import { supabase } from '@/lib/supabase'
import { SupabaseAuth } from '@/lib/supabaseAuth'
import type { CredentialResponse } from 'google-one-tap'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
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

interface GoogleOneTapProps {
  onSuccess?: () => void
  onError?: (error: any) => void
}

const GoogleOneTap = ({ onSuccess, onError }: GoogleOneTapProps) => {
  const router = useRouter()

  const initializeGoogleOneTap = async () => {
    try {
      console.log('Khởi tạo Google One Tap')
      
      // Kiểm tra xem có Google Client ID không
      if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        console.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID chưa được cấu hình')
        return
      }

      const [nonce, hashedNonce] = await generateNonce()
      console.log('Nonce được tạo:', { nonce: nonce.substring(0, 10) + '...', hashedNonce: hashedNonce.substring(0, 10) + '...' })

      // Kiểm tra session hiện tại trước khi hiển thị One-Tap UI
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Lỗi khi lấy session:', error)
      }
      
      if (data.session) {
        console.log('Đã có session, chuyển về trang chủ')
        router.push('/')
        return
      }

      // Kiểm tra xem window.google có sẵn không
      if (!window.google) {
        console.error('Google SDK chưa được tải')
        return
      }

      /* global google */
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: async (response: CredentialResponse) => {
          try {
            console.log('Nhận được response từ Google One Tap')
            
            // Gửi ID token đến Supabase thông qua SupabaseAuth
            const result = await SupabaseAuth.signInWithGoogleIdToken(
              response.credential,
              nonce
            )

            if (!result || !result.user) {
              const error = new Error('Không thể đăng nhập với Google One Tap')
              console.error('Lỗi đăng nhập với Google One Tap:', error)
              onError?.(error)
              throw error
            }

            console.log('Dữ liệu session:', result)
            console.log('Đăng nhập thành công với Google One Tap')

            // Gọi callback success nếu có
            onSuccess?.()

            // Chuyển về trang chủ
            router.push('/')
            
          } catch (error) {
            console.error('Lỗi khi đăng nhập với Google One Tap:', error)
            onError?.(error)
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
      onError?.(error)
    }
  }

  return (
    <Script 
      onReady={() => {
        initializeGoogleOneTap().catch(console.error);
      }} 
      src="https://accounts.google.com/gsi/client"
      strategy="lazyOnload"
    />
  )
}

export default GoogleOneTap
