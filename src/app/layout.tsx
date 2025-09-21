import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import AuthStatus from "@/components/AuthStatus";
import { AudioProvider } from "@/contexts/AudioContext";
import PersistentPlayer from "@/components/PersistentPlayer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tây Phương Cực Lạc - Tam Thánh Đường",
  description: "Chân Thành, Thanh Tịnh, Bình Đẳng, Chánh Giác, Từ Bi. Nhìn Thấu, Buông Bỏ, Tự Tại, Tùy Duyên, Niệm Phật.",
  keywords: ["a di đà phật", "kinh sách", "âm thanh", "tây phương cực lạc", "phật giáo", "tâm linh", "meditation"],
  authors: [{ name: "Tam Thánh Đường" }],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <AudioProvider>
        <header className="serene-card mx-2 sm:mx-4 mt-2 sm:mt-4 mb-4 sm:mb-8 sticky top-2 sm:top-4 z-50">
          <div className="mx-auto max-w-6xl px-3 sm:px-6 py-3 sm:py-4">
            {/* Mobile Header */}
            <div className="flex items-center justify-between lg:hidden">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 lotus-gradient rounded-full flex items-center justify-center peaceful-transition group-hover:scale-110">
                  <span className="text-white text-sm">🪷</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-base bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
                    Kinh Sách
                  </span>
                  <span className="text-xs text-amber-700/70">Tây Phương Cực Lạc</span>
                </div>
              </Link>
              <AuthStatus />
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 lotus-gradient rounded-full flex items-center justify-center peaceful-transition group-hover:scale-110">
                  <span className="text-white text-lg">🪷</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xl bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
                    Kinh Sách Âm Thanh
                  </span>
                  <span className="text-xs text-amber-700/70">Tây Phương Cực Lạc</span>
                </div>
              </Link>
              <nav className="flex items-center gap-6 text-sm font-medium">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm kinh sách..."
                    className="px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm min-w-[250px]"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-amber-600">🔍</span>
                  </div>
                </div>
                <Link href="/gop-y" className="wisdom-text hover:text-amber-600 peaceful-transition">Góp ý</Link>
                <AuthStatus />
              </nav>
            </div>

            {/* Mobile Navigation */}
            <nav className="lg:hidden mt-3 pt-3 border-t border-amber-200/50">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-amber-600">🔍</span>
                  </div>
                </div>
                <Link href="/gop-y" className="wisdom-text hover:text-amber-600 peaceful-transition px-3 py-2 rounded-lg hover:bg-amber-50 text-xs whitespace-nowrap">
                  💬 Góp ý
                </Link>
              </div>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-3 sm:px-6 pb-24 sm:pb-32">
          {children}
        </main>
        <footer className="mt-12 sm:mt-20 border-t border-amber-200/50 bg-gradient-to-r from-amber-50/50 to-orange-50/50">
          <div className="mx-auto max-w-6xl px-3 sm:px-6 py-8 sm:py-12">
            <div className="flex flex-col items-center justify-center gap-4 sm:gap-8 text-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 lotus-gradient rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🪷</span>
                </div>
                <div>
                  <p className="wisdom-text font-medium text-sm sm:text-base">© {new Date().getFullYear()} Các học trò của Tam Thánh Đường</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm">
                {/* Footer links removed */}
              </div>
            </div>
          </div>
        </footer>
        <PersistentPlayer />
        </AudioProvider>
      </body>
    </html>
  );
}
