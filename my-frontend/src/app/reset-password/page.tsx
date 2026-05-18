'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';

const resetSchema = z
  .object({
    password: z.string().trim().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type ResetFormData = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState('');
  const [code, setCode] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get('code');
    if (!token) {
      toast.error('Không tìm thấy mã xác nhận. Vui lòng thử lại.');
      router.push('/forgot-password');
    } else {
      setCode(token);
    }
  }, [searchParams, router]);

  const form = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: 
    { 
      password: '',
      confirmPassword: '' 
    },
  });

  const onSubmit = async (data: ResetFormData) => {
    if (!code) return;
    setApiError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code,
          password: data.password,
          passwordConfirmation: data.confirmPassword,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error?.message || 'Đặt lại mật khẩu thất bại');
      }

      toast.success('Mật khẩu đã được thay đổi thành công!');
      router.push('/login');
    } catch (err: any) {
      setApiError(err.message);
      toast.error(`Lỗi: ${err.message}`);
    }
  };

  if (!code) {
    return (
      <main className="page">
        <div className="card">Đang kiểm tra mã xác nhận...</div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="card">
        <h3>ĐẶT LẠI MẬT KHẨU</h3>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          {apiError && <p className="error" style={{ color: 'red' }}>{apiError}</p>}

          <label htmlFor="new-password">Mật khẩu mới <span style={{color: '#ef4444'}}>*</span></label>
          <div className="password-wrap">
            <input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu mới"
              {...form.register('password')}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeSlashIcon className="password-icon" /> : <EyeIcon className="password-icon" />}
            </button>
          </div>
          <p className="error">{form.formState.errors.password?.message}</p>

          <label htmlFor="confirm-password">Xác nhận mật khẩu <span style={{color: '#ef4444'}}>*</span></label>
          <div className="password-wrap">
            <input
              id="confirm-password"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Nhập lại mật khẩu mới"
              {...form.register('confirmPassword')}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirm((prev) => !prev)}
            >
              {showConfirm ? <EyeSlashIcon className="password-icon" /> : <EyeIcon className="password-icon" />}
            </button>
          </div>
          <p className="error">{form.formState.errors.confirmPassword?.message}</p>

          <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
            <Link href="/login" style={{ fontSize: '0.9rem', color: '#0070f3' }}>
              ← Quay lại đăng nhập
            </Link>
          </div>

          <button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>
        </form>
      </div>
    </main>
  );
}