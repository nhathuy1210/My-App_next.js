'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';

// Schema validation 
const signupSchema = z
  .object({
    username: z.string().trim().min(1, 'Username là bắt buộc'),
    password: z.string().trim().min(6, 'Password phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().trim(),
    sex: z.string().min(1, 'Vui lòng chọn giới tính'),      
    email: z.string().trim().email('Email không hợp lệ').min(1, 'Email là bắt buộc'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu nhập lại không khớp',
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      sex: '',      
      email: '',
    },
  });

  // Xử lý submit – đã cập nhật cho email confirmation
  const onSubmitSignup = async (data: SignupFormData) => {
    setApiError('');
    try {
      const { confirmPassword, ...userData } = data;

      const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw toast.error(result.error?.message || 'Đăng ký thất bại');
      }

      // Strapi đã gửi email xác nhận 
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản trước khi đăng nhập.');

      // Reset form
      signupForm.reset();
    } catch (err: any) {
      setApiError(err.message);
      toast.error(`Lỗi: ${err.message}`);
    }
  };

  const onInvalidSignup = (errors: any) => {
    console.log('Signup validation errors:', errors);
  };

  return (
    <main className="page">
      <div className="card">
        <h3>SIGNUP FORM</h3>
        <form onSubmit={signupForm.handleSubmit(onSubmitSignup, onInvalidSignup)} noValidate>
          {apiError && <p className="error" style={{ color: 'red' }}>{apiError}</p>}

          {/* Username */}
          <label htmlFor="signup-username">Username <span style={{color: '#ef4444'}}>*</span></label>
          <input
            id="signup-username"
            type="text"
            placeholder="Nhập username"
            {...signupForm.register('username')}
          />
          <p className="error">{signupForm.formState.errors.username?.message}</p>

          {/* Password */}
          <label htmlFor="signup-password">Password <span style={{color: '#ef4444'}}>*</span></label>
          <div className="password-wrap">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập password"
              {...signupForm.register('password')}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? (
                <EyeSlashIcon className="password-icon" />
              ) : (
                <EyeIcon className="password-icon" />
              )}
            </button>
          </div>
          <p className="error">{signupForm.formState.errors.password?.message}</p>

          {/* Confirm password */}
          <label htmlFor="signup-confirm-password">Password again <span style={{color: '#ef4444'}}>*</span></label>
          <div className="password-wrap">
            <input
              id="signup-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Nhập lại password"
              {...signupForm.register('confirmPassword')}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? 'Ẩn mật khẩu nhập lại' : 'Hiện mật khẩu nhập lại'}
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="password-icon" />
              ) : (
                <EyeIcon className="password-icon" />
              )}
            </button>
          </div>
          <p className="error">{signupForm.formState.errors.confirmPassword?.message}</p>

          {/* Sex radio (dùng Controller) */}
          <label>Sex <span style={{color: '#ef4444'}}>*</span></ label>
          <Controller
            name="sex"
            control={signupForm.control}
            render={({ field }) => (
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    value="male"
                    checked={field.value === 'male'}
                    onChange={() => field.onChange('male')}
                    onBlur={field.onBlur}
                  />
                  Nam
                </label>
                <label>
                  <input
                    type="radio"
                    value="female"
                    checked={field.value === 'female'}
                    onChange={() => field.onChange('female')}
                    onBlur={field.onBlur}
                  />
                  Nữ
                </label>
                <label>
                  <input
                    type="radio"
                    value="other"
                    checked={field.value === 'other'}
                    onChange={() => field.onChange('other')}
                    onBlur={field.onBlur}
                  />
                  Khác
                </label>
              </div>
            )}
          />
          <p className="error">{signupForm.formState.errors.sex?.message}</p>

          {/* Email */}
          <label htmlFor="signup-email">Email <span style={{ color: '#ef4444' }}>*</span></label>
          <input
            id="signup-email"
            type="email"
            placeholder="Nhập email"
            {...signupForm.register('email')}
          />
          <p className="error">{signupForm.formState.errors.email?.message}</p>

          {/* Link to Login */}
          <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
            <Link href="/login" style={{ fontSize: '0.9rem', color: '#0070f3' }}>
              Đã có tài khoản? Đăng nhập
            </Link>
          </div>

          <button type="submit" disabled={signupForm.formState.isSubmitting}>
            {signupForm.formState.isSubmitting ? 'Đang gửi' : 'Đăng kí'}
          </button>
        </form>
      </div>
    </main>
  );
}