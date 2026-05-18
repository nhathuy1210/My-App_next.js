// app/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username là bắt buộc'),
  password: z.string().trim().min(1, 'Password là bắt buộc'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (searchParams.get('confirmed') === 'true') {
      toast.success('Tài khoản đã được xác nhận! Bạn có thể đăng nhập ngay.');
    }
  }, [searchParams]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmitLogin = async (data: LoginFormData) => {
    setApiError('');
    setSuccessMsg('');
    try {
      // Bước 1: Đăng nhập lấy jwt
      const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: data.username,
          password: data.password,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        if (res.status === 429) throw toast.error('Quá nhiều yêu cầu, vui lòng thử lại sau 1 giờ.');
        throw toast.error(result.error?.message || 'Đăng nhập thất bại');
      }

      const { jwt, user: initialUser } = result;

      // Bước 2: Gọi API lấy thông tin user kèm role và avatar
      const meRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me?populate=*`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!meRes.ok) throw toast.error('Không thể lấy thông tin user');
      const fullUser = await meRes.json(); // { id, username, email, role: { name, ... }, avatar: { url, ... }, ... }

      // Bước 3: Lưu vào context và localStorage/cookie
      setAuth(jwt, fullUser);

      toast.success(`Đăng nhập thành công! Chào mừng ${fullUser.username}`);
      router.push('/dashboard');
    } catch (err: any) {
      setApiError(err.message);
      toast.error(`Lỗi: ${err.message}`);
    }
  };

  return (
    <main className="page">
      <div className="card">
        <h3>LOGIN FORM</h3>
        {successMsg && <p style={{ color: 'green', marginBottom: '1rem' }}>{successMsg}</p>}
        <form onSubmit={loginForm.handleSubmit(onSubmitLogin)} noValidate>
          {apiError && <p className="error" style={{ color: 'red' }}>{apiError}</p>}

          <label htmlFor="login-username">Username / Email <span style={{color: '#ef4444'}}>*</span></label>
          <input
            id="login-username"
            type="text"
            placeholder="Nhập username"
            {...loginForm.register('username')}
          />
          <p className="error">{loginForm.formState.errors.username?.message}</p>

          <label htmlFor="login-password">Password <span style={{color: '#ef4444'}}>*</span></label>
          <div className="password-wrap">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập password"
              {...loginForm.register('password')}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeSlashIcon className="password-icon" /> : <EyeIcon className="password-icon" />}
            </button>
          </div>
          <p className="error">{loginForm.formState.errors.password?.message}</p>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <Link href="/forgot-password" style={{ fontSize: '0.9rem', color: '#0070f3' }}>
              Quên mật khẩu?
            </Link>
            <Link href="/signup" style={{ fontSize: '0.9rem', color: '#0070f3' }}>
              Chưa có tài khoản? Đăng ký
            </Link>
          </div>

          <button type="submit" disabled={loginForm.formState.isSubmitting}>
            {loginForm.formState.isSubmitting ? 'Đang gửi' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </main>
  );
}