// Type definitions cho Google One-Tap
declare module 'google-one-tap' {
  export interface CredentialResponse {
    credential: string
    select_by: string
  }

  export interface IdConfiguration {
    client_id: string
    callback: (credentialResponse: CredentialResponse) => void
    auto_select?: boolean
    cancel_on_tap_outside?: boolean
    nonce?: string
    use_fedcm_for_prompt?: boolean
  }

  export interface MomentListener {
    type: string
    reason?: string
  }

  export interface ButtonOptions {
    theme?: 'outline' | 'filled_blue' | 'filled_black'
    size?: 'large' | 'medium' | 'small'
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
    shape?: 'rectangular' | 'pill' | 'circle' | 'square'
    logo_alignment?: 'left' | 'center'
    width?: string | number
  }

  export interface accounts {
    id: {
      initialize: (config: IdConfiguration) => void
      prompt: (momentListener?: (notification: MomentListener) => void) => void
      cancel: () => void
      disableAutoSelect: () => void
      storeCredential: (credential: { id: string; password: string }) => void
      renderButton: (parent: HTMLElement, options: ButtonOptions) => void
    }
  }
}

declare global {
  interface Window {
    google?: {
      accounts: import('google-one-tap').accounts
    }
  }
}
