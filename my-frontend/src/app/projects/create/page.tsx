// app/projects/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CreateProjectPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Planning',
    startDate: '',
    endDate: '',
  });

  if (authLoading) {
    return (
      <main className="page">
        <div className="card" style={{ textAlign: 'center' }}>Đang tải...</div>
      </main>
    );
  }

  if (!user || role !== 'staff') {
    router.push('/projects');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.startDate || !formData.endDate) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error('Ngày bắt đầu phải trước ngày kết thúc');
      return;
    }

    setLoading(true);
    try {
      const jwt = localStorage.getItem('jwt');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/projects`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              name: formData.name,
              description: formData.description,
              status: formData.status,
              startDate: formData.startDate,
              endDate: formData.endDate,
              createdBy: user.id,
            },
          }),
        }
      );

      if (!response.ok) throw new Error('Không thể tạo dự án');

      const data = await response.json();
      toast.success('Dự án đã được tạo thành công!');
      router.push('/projects');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page" style={{ maxWidth: '600px' }}>
      <div className="card">
        <h1 style={{ marginBottom: '30px' }}>📁 Tạo Dự Án Mới</h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Tên dự án *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên dự án..."
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Mô tả *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả dự án..."
              rows={5}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Trạng thái *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              <option value="Planning">📋 Lập kế hoạch</option>
              <option value="In Progress">⚙️ Đang thực hiện</option>
              <option value="Completed">✓ Hoàn thành</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Ngày bắt đầu *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Ngày kết thúc *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button type="submit" disabled={loading} style={{ flex: 1 }}>
              {loading ? '⏳ Đang tạo...' : '✓ Tạo Dự Án'}
            </button>
            <Link href="/projects" style={{ flex: 1 }}>
              <button
                type="button"
                style={{
                  width: '100%',
                  backgroundColor: '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                ← Quay Lại
              </button>
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
