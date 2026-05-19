// app/about/page.tsx
'use client';

export default function AboutPage() {
  return (
    <main className="page">
      <div className="card">
        <h1>Về Chúng Tôi</h1>
        
        <div style={{ marginTop: '20px', lineHeight: '1.8' }}>
          <h2>Giới thiệu MyApp</h2>
          <p>
            MyApp là một ứng dụng quản lý người dùng hiện đại, được xây dựng bằng:
          </p>
          
          <h3>Frontend:</h3>
          <ul>
            <li>React</li>
            <li>Next.js</li>
            <li>TypeScript</li>
            <li>React Hook Form</li>
            <li>Zod (validation)</li>
          </ul>
          
          <h3>Backend:</h3>
          <ul>
            <li>Strapi (Headless CMS)</li>
            <li>Node.js</li>
            <li>PostgreSQL</li>
          </ul>
          
          <h2>Mục đích</h2>
          <p>
            Cung cấp một nền tảng an toàn, hiệu quả để quản lý người dùng 
            với tính năng phân quyền, xác thực an toàn và giao diện thân thiện.
          </p>
        </div>
      </div>
    </main>
  );
}
