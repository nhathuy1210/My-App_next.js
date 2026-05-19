// app/settings/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    twoFactorAuth: false,
    privacy: 'public',
    language: 'vi',
  });

  if (loading) {
    return (
      <main className="page">
        <div className="card" style={{ textAlign: 'center' }}>Đang tải...</div>
      </main>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = () => {
    toast.success('Cài đặt đã được lưu!');
  };

  return (
    <main className="page">
      <div className="card">
        <h1>⚙️ Cài Đặt</h1>

        <div style={{ marginTop: '30px' }}>
          {/* Thông báo */}
          <section style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
            <h2>🔔 Thông báo</h2>
            
            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '15px' }}>Nhận thông báo qua email</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={() => handleToggle('pushNotifications')}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '15px' }}>Nhận thông báo đẩy (Push)</span>
              </label>
            </div>
          </section>

          {/* Bảo mật */}
          <section style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
            <h2>🔒 Bảo Mật</h2>
            
            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={() => handleToggle('twoFactorAuth')}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '15px' }}>Bật xác thực 2 lớp (2FA)</span>
              </label>

              <Link href="/forgot-password" style={{ color: '#0d9488', textDecoration: 'none', fontSize: '14px' }}>
                ↳ Đổi mật khẩu
              </Link>
            </div>
          </section>

          {/* Quyền riêng tư */}
          <section style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
            <h2>👁️ Quyền Riêng Tư</h2>
            
            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '15px', fontWeight: '600' }}>
                Ai có thể nhìn thấy hồ sơ của bạn?
              </label>
              <select
                value={settings.privacy}
                onChange={(e) => handleSelectChange('privacy', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '14px',
                  marginTop: '8px',
                  cursor: 'pointer',
                }}
              >
                <option value="public">🌍 Công khai</option>
                <option value="friends">👥 Chỉ bạn bè</option>
                <option value="private">🔒 Riêng tư</option>
              </select>
            </div>
          </section>

          {/* Ngôn ngữ */}
          <section style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
            <h2>🌐 Ngôn Ngữ & Địa Phương</h2>
            
            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '15px', fontWeight: '600' }}>
                Chọn ngôn ngữ
              </label>
              <select
                value={settings.language}
                onChange={(e) => handleSelectChange('language', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '14px',
                  marginTop: '8px',
                  cursor: 'pointer',
                }}
              >
                <option value="vi">🇻🇳 Tiếng Việt</option>
                <option value="en">🇬🇧 English</option>
                <option value="zh">🇨🇳 中文</option>
              </select>
            </div>
          </section>

          {/* Nguy hiểm */}
          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#dc2626' }}>⚠️ Khu Vực Nguy Hiểm</h2>
            
            <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#fee2e2', borderRadius: '8px', border: '1px solid #fecaca' }}>
              <p style={{ fontSize: '14px', color: '#991b1b', marginBottom: '12px' }}>
                Các hành động này không thể hoàn tác. Hãy cẩn thận!
              </p>
              
              <button
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginRight: '10px',
                }}
                onClick={() => {
                  if (confirm('Bạn có chắc muốn xóa tài khoản của mình?')) {
                    toast.error('Xóa tài khoản sẽ được triển khai sau');
                  }
                }}
              >
                ❌ Xóa Tài Khoản
              </button>
            </div>
          </section>

          {/* Nút lưu */}
          <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSaveSettings}
              style={{
                padding: '12px 24px',
                backgroundColor: '#0d9488',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
              }}
            >
              💾 Lưu Cài Đặt
            </button>
            
            <Link href="/profile">
              <button
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#94a3b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                }}
              >
                ← Quay Lại
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
