'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// Schema validation cho update profile
const updateProfileSchema = z.object({
  username: z.string().trim().min(1, 'Username là bắt buộc'),
  email: z.string().trim().email('Email không hợp lệ').min(1, 'Email là bắt buộc'),
  sex: z.string().optional(),
});

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

export default function EditProfilePage() {
  const { user, setAuth, loading: authLoading } = useAuth();
  const router = useRouter();
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      username: '',
      email: '',
      sex: '',
    },
  });

  // Load thông tin user hiện tại vào form
  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        email: user.email,
        sex: user.sex || '',
      });
    }
  }, [user, form]);

  const onSubmit = async (data: UpdateProfileFormData) => {
    setApiError('');
    setSuccessMsg('');
    try {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) throw new Error('Chưa đăng nhập');

      // Gọi Strapi API update user (chính user đang đăng nhập)
      const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        throw toast.error(result.error?.message || 'Cập nhật thất bại');
      }

      const updatedUser = await res.json();

      // Cập nhật lại context và localStorage
      setAuth(jwt, updatedUser); // dùng lại hàm setAuth để đồng bộ

      toast.success('Cập nhật thông tin thành công!');
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (err: any) {
      setApiError(err.message);
      toast.error(`Lỗi: ${err.message}`);    
    }
  };

  if (authLoading || !user) return <main className="page"><div className="card">Đang tải...</div></main>;

  return (
    <main className="page">
      <div className="card">
        <h3>Chỉnh sửa hồ sơ</h3>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          {apiError && <p className="error" style={{ color: 'red' }}>{apiError}</p>}
          {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}

          <label htmlFor="username">Username</label>
          <input id="username" type="text" {...form.register('username')} />
          <p className="error">{form.formState.errors.username?.message}</p>

          <label htmlFor="email">Email</label>
          <input id="email" type="email" {...form.register('email')} />
          <p className="error">{form.formState.errors.email?.message}</p>

          <label>Giới tính</label>
          <div className="radio-group">
            <label>
              <input type="radio" value="male" {...form.register('sex')} /> Nam
            </label>
            <label>
              <input type="radio" value="female" {...form.register('sex')} /> Nữ
            </label>
            <label>
              <input type="radio" value="other" {...form.register('sex')} /> Khác
            </label>
          </div>
          <p className="error">{form.formState.errors.sex?.message}</p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
            <button type="button" onClick={() => router.back()} style={{ background: '#94a3b8' }}>
              Hủy
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}