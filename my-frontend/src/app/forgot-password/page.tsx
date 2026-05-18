'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { toast } from 'react-hot-toast/headless';

const forgotSchema = z.object({
  email: z.string().trim().min(1, 'Email là bắt buộc').email('Email không hợp lệ')
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  const form = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotFormData) => {
    setApiError('');
    setSuccess(false);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await res.json();

      if (!res.ok) {
        // Xử lý lỗi rate limit (429)
        if (res.status === 429) {
          throw toast.error('Bạn đã gửi quá 3 yêu cầu trong 1 giờ. Vui lòng thử lại sau.');
        }
        throw toast.error(result.error?.message || 'Gửi yêu cầu thất bại');
      }

      setSuccess(true);
      toast.success('Yêu cầu đặt lại mật khẩu đã được ghi nhận! Vui lòng kiểm tra email để lấy link reset.');
      form.reset();
    } catch (err: any) {
      setApiError(err.message);
      toast.error(`Lỗi: ${err.message}`);
    }
  };

  return (
    <main className="page">
      <div className="card">
        <h3>QUÊN MẬT KHẨU</h3>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          {apiError && <p className="error" style={{ color: 'red' }}>{apiError}</p>}
          {success && (
            <p style={{ color: 'green' }}>
              Yêu cầu đã gửi, kiểm tra link reset đã được gửi đến email của bạn.
            </p>
          )}

          <label htmlFor="email">Email <span style={{color: '#ef4444'}}>*</span></label>
          <input
            id="email"
            type="email"
            placeholder="Nhập email đã đăng ký"
            {...form.register('email')}
          />
          <p className="error">{form.formState.errors.email?.message}</p>

          <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
            <Link href="/login" style={{ fontSize: '0.9rem', color: '#0070f3' }}>
              ← Quay lại đăng nhập
            </Link>
          </div>

          <button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </button>
        </form>
      </div>
    </main>
  );
}