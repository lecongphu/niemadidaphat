export default function FAQPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Câu hỏi thường gặp</h1>
      <details className="border rounded p-3">
        <summary className="cursor-pointer font-medium">Làm sao để nghe thử?</summary>
        <p className="text-gray-600 mt-2">Truy cập trang ấn phẩm và chọn chương mẫu.</p>
      </details>
      <details className="border rounded p-3">
        <summary className="cursor-pointer font-medium">Tôi có thể tải xuống không?</summary>
        <p className="text-gray-600 mt-2">Bản tải xuống sẽ mở khi bạn mua (placeholder).</p>
      </details>
    </div>
  );
}


