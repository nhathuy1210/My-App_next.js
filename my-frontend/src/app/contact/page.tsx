// app/contact/page.tsx
'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kiểm tra form
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // TODO: Gửi đến backend nếu có
    toast.success('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <main className="page">
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1>Liên Hệ</h1>
        <p style={{ marginBottom: '30px', color: '#666' }}>
          Có câu hỏi? Hãy liên hệ với chúng tôi bằng form dưới đây.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Tên của bạn
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên của bạn"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email của bạn"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label htmlFor="subject" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Chủ đề
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Chủ đề liên hệ"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label htmlFor="message" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Tin nhắn
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Nhập tin nhắn của bạn"
              rows={5}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              marginTop: '10px',
            }}
          >
            Gửi Liên Hệ
          </button>
        </form>

        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
          <h3>Thông tin liên hệ trực tiếp:</h3>
          <p>📧 Email: support@myapp.com</p>
          <p>📱 Điện thoại: +84 123 456 789</p>
          <p>📍 Địa chỉ: TP. Hồ Chí Minh, Việt Nam</p>
        </div>
      </div>
    </main>
  );
}
