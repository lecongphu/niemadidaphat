export type Chapter = {
  id: string;
  title: string;
  timecode: string; // mm:ss
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  author: string;
  narrator?: string;
  duration: string; // e.g., "2h 15m"
  description: string;
  coverUrl?: string;
  sampleUrl: string; // public MP3 preview URL
  chapters: Chapter[];
};

export const products: Product[] = [
  {
    id: "p1",
    slug: "kinh-phap-cu-audio",
    title: "Kinh Pháp Cú (Audio)",
    author: "Tổng hợp",
    narrator: "Giọng đọc A",
    duration: "2h 45m",
    description:
      "Tuyển chọn các bài kệ cô đọng, dễ nhớ, phù hợp nghe hàng ngày.",
    coverUrl: "/next.svg",
    sampleUrl: "https://ph.tinhtong.vn/ftp/MP3/-%20Kinh/Chu%20Kinh%20Phat%20Thuyet%20Dia%20Nguc%20Tap%20Yeu/Ch%C6%B0%20Kinh%20Ph%E1%BA%ADt%20Thuy%E1%BA%BFt%20%C4%90%E1%BB%8Ba%20Ng%E1%BB%A5c%20T%E1%BA%ADp%20Y%E1%BA%BFu%20ph%C3%A2%CC%80n%2001.mp3",
    chapters: [
      { id: "c1", title: "Lời mở đầu", timecode: "00:00" },
      { id: "c2", title: "Phẩm Song Yếu", timecode: "02:15" },
      { id: "c3", title: "Phẩm Không Phóng Dật", timecode: "14:30" },
    ],
  },
  {
    id: "p2",
    slug: "tinh-do-kinh-trich-doan",
    title: "Tịnh Độ Kinh (Trích đoạn hình ảnh)",
    author: "Tổng hợp",
    narrator: "Giọng đọc B",
    duration: "1h 20m",
    description:
      "Trích đoạn minh họa kèm hình ảnh nhẹ nhàng, phù hợp thực tập.",
    coverUrl: "/vercel.svg",
    sampleUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    chapters: [
      { id: "c1", title: "Giới thiệu", timecode: "00:00" },
      { id: "c2", title: "Quán tưởng", timecode: "08:40" },
      { id: "c3", title: "Kết", timecode: "55:10" },
    ],
  },
  {
    id: "p3",
    slug: "thien-tap-can-ban",
    title: "Thiền Tập Căn Bản (Audiobook)",
    author: "Thiền sư X",
    narrator: "Giọng đọc C",
    duration: "3h 05m",
    description:
      "Hướng dẫn thiền tập nền tảng qua các bài đọc êm dịu, có nhạc nền nhẹ.",
    coverUrl: "/globe.svg",
    sampleUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    chapters: [
      { id: "c1", title: "Thở chánh niệm", timecode: "00:00" },
      { id: "c2", title: "Quán thân", timecode: "12:35" },
      { id: "c3", title: "Quán tâm", timecode: "41:00" },
    ],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}


