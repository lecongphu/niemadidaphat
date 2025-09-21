export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Quản trị</h1>
        <p className="text-gray-600">Quản lý ấn phẩm</p>
      </header>
      {children}
    </section>
  );
}


