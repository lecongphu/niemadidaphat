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

  export interface accounts {
    id: {
      initialize: (config: IdConfiguration) => void
      prompt: (momentListener?: (notification: any) => void) => void
      cancel: () => void
      disableAutoSelect: () => void
      storeCredential: (credential: { id: string; password: string }) => void
      renderButton: (parent: HTMLElement, options: any) => void
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
