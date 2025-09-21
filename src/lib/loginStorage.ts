// Utility functions để quản lý thông tin đăng nhập đã lưu

export interface SavedLoginInfo {
  email: string;
  rememberMe: boolean;
  savedAt: string;
}

const LOGIN_STORAGE_KEY = 'niemadidaphat_saved_login';

// Lưu thông tin đăng nhập
export function saveLoginInfo(email: string, rememberMe: boolean): void {
  if (typeof window === 'undefined') return; // SSR safety
  
  if (rememberMe) {
    const loginInfo: SavedLoginInfo = {
      email,
      rememberMe: true,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(LOGIN_STORAGE_KEY, JSON.stringify(loginInfo));
  } else {
    // Nếu không chọn ghi nhớ, xóa thông tin cũ
    localStorage.removeItem(LOGIN_STORAGE_KEY);
  }
}

// Lấy thông tin đăng nhập đã lưu
export function getSavedLoginInfo(): SavedLoginInfo | null {
  if (typeof window === 'undefined') return null; // SSR safety
  
  try {
    const saved = localStorage.getItem(LOGIN_STORAGE_KEY);
    if (!saved) return null;
    
    const loginInfo: SavedLoginInfo = JSON.parse(saved);
    
    // Kiểm tra xem thông tin có hợp lệ không (không quá 30 ngày)
    const savedDate = new Date(loginInfo.savedAt);
    const now = new Date();
    const daysDiff = (now.getTime() - savedDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > 30) {
      // Thông tin quá cũ, xóa đi
      localStorage.removeItem(LOGIN_STORAGE_KEY);
      return null;
    }
    
    return loginInfo;
  } catch (error) {
    console.error('Error getting saved login info:', error);
    return null;
  }
}

// Xóa thông tin đăng nhập đã lưu
export function clearSavedLoginInfo(): void {
  if (typeof window === 'undefined') return; // SSR safety
  localStorage.removeItem(LOGIN_STORAGE_KEY);
}

// Kiểm tra xem có thông tin đăng nhập đã lưu không
export function hasSavedLoginInfo(): boolean {
  return getSavedLoginInfo() !== null;
}
