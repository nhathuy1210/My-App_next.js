// app/home/page.tsx
'use client';

export default function HomePage() {
  return (
    <main className="page">
      <div className="card">
        <h1>Trang Chủ</h1>
        <p>Chào mừng đến với MyApp</p>
        <p>Ứng dụng quản lý người dùng hiện đại và an toàn.</p>
        
        <div style={{ marginTop: '20px', lineHeight: '1.8' }}>
          <h2>Tính năng chính:</h2>
          <ul>
            <li>✅ Đăng ký và đăng nhập an toàn</li>
            <li>✅ Quản lý hồ sơ cá nhân</li>
            <li>✅ Hệ thống phân quyền (Staff/Employee)</li>
            <li>✅ Upload avatar</li>
            <li>✅ Quản lý người dùng (cho Staff)</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
