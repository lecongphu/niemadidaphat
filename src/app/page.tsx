import Link from "next/link";
import { Suspense } from "react";
import SpotifyPlaylist from "@/components/SpotifyPlaylist";
import OAuthErrorHandler from "@/components/OAuthErrorHandler";

export default function Home() {
  return (
    <div className="space-y-12 sm:space-y-20">
      {/* OAuth Error Handler */}
      <Suspense fallback={null}>
        <OAuthErrorHandler />
      </Suspense>
      
      {/* Hero Section */}
      <section className="text-center space-y-6 sm:space-y-8 py-8 sm:py-16 px-2">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lotus-gradient rounded-full flex items-center justify-center peaceful-shadow">
              <span className="text-white text-2xl sm:text-3xl">🪷</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 bg-clip-text text-transparent leading-tight px-2">
            Tây Phương Cực Lạc
          </h1>
          <p className="text-lg sm:text-xl wisdom-text font-medium">Nam Mô A Di Đà Phật</p>
          <p className="text-amber-700/80 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed px-4">
           Chân thành, thanh tịnh, bình đẳng, chánh giác, từ bi.<br className="hidden sm:inline" />
           <span className="block sm:inline"> Nhìn thấu, buông bỏ, tự tại, tùy duyên, niệm Phật.</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-6 sm:pt-8 px-4">
          <Link className="lotus-button text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto" href="/nhan-qua">
            ⚖️ Nhân Quả
          </Link>
          <Link className="serene-card px-6 sm:px-8 py-3 sm:py-4 text-amber-800 font-medium hover:bg-white peaceful-transition w-full sm:w-auto text-center" href="/gioi-luat">
            🛡️ Giới Luật
          </Link>
          <Link className="serene-card px-6 sm:px-8 py-3 sm:py-4 text-amber-800 font-medium hover:bg-white peaceful-transition w-full sm:w-auto text-center" href="/niem-phat">
            🙏 Niệm Phật
          </Link>
        </div>
      </section>

      {/* Spotify-style Playlist Section */}
      <section className="px-2">
        <SpotifyPlaylist />
      </section>

      {/* Wisdom Quotes Section */}
      <section className="space-y-6 sm:space-y-8 px-2">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Trí Tuệ Phật Pháp</h2>
          <p className="wisdom-text text-base sm:text-lg">Những lời dạy quý báu về giới luật và niệm Phật</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Nhân Quả */}
          <div className="serene-card p-6 sm:p-8 space-y-4 sm:space-y-6">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lotus-gradient rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <span className="text-white text-lg sm:text-xl">⚖️</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold wisdom-text">Nhân Quả</h3>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <blockquote className="text-center italic wisdom-text border-l-4 border-amber-300 pl-3 sm:pl-4 text-sm sm:text-base">
                &ldquo;Vạn pháp giai không, nhân quả bất không&rdquo;
              </blockquote>
              <blockquote className="text-center italic wisdom-text border-l-4 border-amber-300 pl-3 sm:pl-4 text-sm sm:text-base">
                &ldquo;Phật pháp xuất thế gian cũng không rời khỏi nhân quả&rdquo;
              </blockquote>
            </div>
          </div>
          {/* Giới Luật */}
          <div className="serene-card p-6 sm:p-8 space-y-4 sm:space-y-6">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lotus-gradient rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <span className="text-white text-lg sm:text-xl">⚖️</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold wisdom-text">Giới Luật</h3>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <blockquote className="text-center italic wisdom-text border-l-4 border-amber-300 pl-3 sm:pl-4 text-sm sm:text-base">
                &ldquo;Giới như đại địa, sinh trưởng thiện pháp&rdquo;
              </blockquote>
              <blockquote className="text-center italic wisdom-text border-l-4 border-amber-300 pl-3 sm:pl-4 text-sm sm:text-base">
                &ldquo;Giới luật thanh tịnh, tâm địa thanh tịnh&rdquo;
              </blockquote>
              <blockquote className="text-center italic wisdom-text border-l-4 border-amber-300 pl-3 sm:pl-4 text-sm sm:text-base">
                &ldquo;Trì giới nghiêm tịnh, phước đức vô biên&rdquo;
              </blockquote>
            </div>
          </div>

          {/* Niệm Phật */}
          <div className="serene-card p-6 sm:p-8 space-y-4 sm:space-y-6">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lotus-gradient rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <span className="text-white text-lg sm:text-xl">🙏</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold wisdom-text">Niệm Phật</h3>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <blockquote className="text-center italic wisdom-text border-l-4 border-amber-300 pl-3 sm:pl-4 text-sm sm:text-base">
                &ldquo;Niệm Phật một tiếng, phước tăng vô lượng&rdquo;
              </blockquote>
              <blockquote className="text-center italic wisdom-text border-l-4 border-amber-300 pl-3 sm:pl-4 text-sm sm:text-base">
                &ldquo;Niệm niệm không gián đoạn, tâm tâm thấy Phật&rdquo;
              </blockquote>
              <blockquote className="text-center italic wisdom-text border-l-4 border-amber-300 pl-3 sm:pl-4 text-sm sm:text-base">
                &ldquo;A Di Đà Phật, tiếng gọi từ bi&rdquo;
              </blockquote>
            </div>
          </div>
        </div>

      </section>

      {/* Daily Practice Section */}
      <section className="serene-card p-6 sm:p-12 mx-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center space-y-2 sm:space-y-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-amber-600 text-base sm:text-lg">🕯️</span>
            </div>
            <blockquote className="italic wisdom-text text-xs sm:text-sm">
              &ldquo;Sáng thức dậy niệm Phật, tâm thanh tịnh cả ngày&rdquo;
            </blockquote>
          </div>
          <div className="text-center space-y-2 sm:space-y-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-amber-600 text-base sm:text-lg">🍃</span>
            </div>
            <blockquote className="italic wisdom-text text-xs sm:text-sm">
              &ldquo;Giữ giới như giữ châu báu, không để tổn hại&rdquo;
            </blockquote>
          </div>
          <div className="text-center space-y-2 sm:space-y-3 sm:col-span-2 lg:col-span-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-amber-600 text-base sm:text-lg">🌙</span>
            </div>
            <blockquote className="italic wisdom-text text-xs sm:text-sm">
              &ldquo;Tối về hồi hướng công đức, cầu sanh Cực Lạc&rdquo;
            </blockquote>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 space-y-3 sm:space-y-4">
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-semibold wisdom-text mb-3 sm:mb-4">Thập Thiện Nghiệp</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-amber-50 p-4 sm:p-6 rounded-xl">
              <h4 className="font-semibold wisdom-text mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                <span>🌸</span> Ba nghiệp thiện của Thân
              </h4>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm wisdom-text">
                <p>Không sát sinh.</p>
                <p>Không trộm cắp.</p>
                <p>Không tà dâm.</p>
              </div>
            </div>
            <div className="bg-amber-50 p-4 sm:p-6 rounded-xl">
              <h4 className="font-semibold wisdom-text mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                <span>🗣️</span> Bốn nghiệp thiện của Khẩu (Miệng)
              </h4>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm wisdom-text">
                <p>Không nói dối.</p>
                <p>Không nói thêu dệt.</p>
                <p>Không nói lưỡi hai chiều.</p>
                <p>Không nói lời hung ác.</p>
              </div>
            </div>
            <div className="bg-amber-50 p-4 sm:p-6 rounded-xl">
              <h4 className="font-semibold wisdom-text mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                <span>🌙</span> Ba nghiệp thiện của Ý
              </h4>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm wisdom-text">
                <p>Không tham dục (Tài, sắc, danh, lợi, ăn, ngủ).</p>
                <p>Không sân hận.</p>
                <p>Không tà kiến.</p>
              </div>
            </div>
          </div>
        </div>
       
      </section>

      {/* Kệ niệm Phật */}
      <section className="space-y-6 sm:space-y-8 px-2">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Kệ Niệm Phật</h2>
          <p className="wisdom-text text-base sm:text-lg">Những bài kệ về niệm Phật để cầu sanh Cực Lạc</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* 8 câu kệ trích từ Đời Mạt Pháp ngài Thanh Sĩ */}
          <div className="serene-card p-6 sm:p-8 space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <blockquote className="text-center italic text-xs sm:text-sm wisdom-text border-l-4 border-amber-300 pl-3 sm:pl-4">
                Tám muôn bốn ngàn pháp<br />
                Vào thời kỳ mạt kiếp<br />
                Dễ tu có một môn<br />
                Niệm A Di Đà Phật<br />
                Mọi tội lỗi tiêu tan<br />
                Các vọng tâm biến mất<br />
                Niệm Phật một lòng thành<br />
                Đủ sanh về Phật quốc.<br />
              </blockquote>
            </div>
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-semibold wisdom-text">Trích phẩm: Đời Mạt Pháp</h3>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <blockquote className="text-center italic text-xs sm:text-sm wisdom-text border-l-4 border-amber-300 pl-3 sm:pl-4">
                Nhớ câu nhứt cú Di Đà<br />
                Tâm vô biệt niệm tất là qui Tây.<br />
                Tuy còn ở chốn trần ai,<br />
                Nhưng trên cửu phẩm liên đài có tên.<br />
              </blockquote>
            </div>
            <div className="text-center">
              <h3 className="text-base sm:text-lg font-semibold wisdom-text">Trích phẩm: Con Thuyền Đại Đạo</h3>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lotus-gradient rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <span className="text-white text-lg sm:text-xl">🌸</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold wisdom-text">Ngài Thanh Sĩ</h3>
            </div>
          </div>
          {/* Giới Luật */}
          <div className="serene-card p-6 sm:p-8 space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
            <blockquote className="text-center italic text-sm sm:text-base wisdom-text border-l-4 border-amber-300 pl-3 sm:pl-4">
                Quy căn kết đỉnh cao thâm xứ,<br />
                Chỉ tại hồng danh nhất cú trung.<br />
            </blockquote>
            <blockquote className="text-center italic text-sm sm:text-base wisdom-text border-l-4 border-amber-300 pl-3 sm:pl-4">
                Quay về cội nguồn, quy kết đến đỉnh cao thâm sâu nhất; chỉ tại trong một câu hồng danh A Di Đà Phật<br />
            </blockquote>
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-semibold wisdom-text">Đại sư Ấn Quang</h3>
            </div>
            <blockquote className="text-center italic text-sm sm:text-base wisdom-text border-l-4 border-amber-300 pl-3 sm:pl-4">
                Nhiếp trọn sáu căn<br />
                Tịnh niệm tương tục.<br />
            </blockquote>
            </div>
            <div className="text-center">
            <h3 className="text-base sm:text-lg font-semibold wisdom-text">Trích kinh: Đại Phật Đảnh Thủ Lăng Nghiêm</h3>
              <div className="w-10 h-10 sm:w-12 sm:h-12 lotus-gradient rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <span className="text-white text-lg sm:text-xl">🌸</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold wisdom-text">Đại Thế Chí Bồ Tát</h3>
            </div>
          </div>

          {/* Niệm Phật */}
          <div className="serene-card p-6 sm:p-8 space-y-4 sm:space-y-6">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lotus-gradient rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <span className="text-white text-lg sm:text-xl">🙏</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold wisdom-text">Niệm Phật</h3>
            </div>
            <div className="space-y-2 sm:space-y-2.5">
              <blockquote className="text-center italic text-xs sm:text-sm wisdom-text border-l-4 border-amber-300 pl-3 sm:pl-4">
                Có Thiền, có Tịnh Ðộ,<br />
                Khác nào hổ thêm sừng,<br />
                Hiện tại làm thầy người<br />
                Ðời sau làm Phật, Tổ.
              </blockquote>
              <blockquote className="text-center italic text-xs sm:text-sm wisdom-text border-l-4 border-amber-300 pl-3 sm:pl-4">
                Không Thiền, có Tịnh Ðộ,<br />
                Vạn tu, vạn cùng sanh,<br />
                Nếu được thấy Di Ðà,<br />
                Lo gì chẳng khai ngộ.
              </blockquote>
              <blockquote className="text-center italic text-xs sm:text-sm wisdom-text border-l-4 border-amber-300 pl-3 sm:pl-4">
                Có Thiền, không Tịnh Ðộ<br />
                Mười người, chín chần chừ<br />
                Ấm cảnh nếu hiện tiền<br />
                Chớp mắt đi theo nó.
              </blockquote>
              <blockquote className="text-center italic text-xs sm:text-sm wisdom-text border-l-4 border-amber-300 pl-3 sm:pl-4">
                Không Thiền, không Tịnh Ðộ<br />
                Giường sắt cùng cột đồng<br />
                Muôn kiếp với ngàn đời<br />
                Không một ai nương dựa
              </blockquote>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lotus-gradient rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <span className="text-white text-lg sm:text-xl">🌸</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold wisdom-text">Trích kệ: Tứ Liệu Giản của Vĩnh Minh Diên Thọ thiền sư</h3>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
