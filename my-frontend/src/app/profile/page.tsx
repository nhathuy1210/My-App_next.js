'use client';

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, role, loading, setAuth } = useAuth();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // app/profile/page.tsx - Cập nhật phần xử lý file

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setUploading(true);
  const formData = new FormData();
  formData.append('files', file);
  // --- Các tham số bắt buộc để Strapi hiểu đây là file cho user nào và ở field nào ---
  formData.append('ref', 'plugin::users-permissions.user'); 
  formData.append('refId', String(user?.id));         
  formData.append('field', 'avatar');
  // ----------------------------------------------------------------------------------

  try {
    const jwt = localStorage.getItem('jwt');
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;

    // 1. Xóa liên kết avatar cũ (nếu có) bằng Documents API
    if (user?.avatar) {
      await fetch(`${strapiUrl}/api/users/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ avatar: null }),
      });
    }

    // 2. Upload file ảnh mới lên Strapi
    const uploadRes = await fetch(`${strapiUrl}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${jwt}` },
      body: formData,
    });
    if (!uploadRes.ok) throw new Error('Upload ảnh thất bại');
    const uploadData = await uploadRes.json();
    const uploadedFile = uploadData[0];

    // 3. Cập nhật user với ID của file vừa upload
    const updateRes = await fetch(`${strapiUrl}/api/users/${user?.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ avatar: uploadedFile.id }),
    });
    if (!updateRes.ok) throw new Error('Cập nhật avatar thất bại');

    // Sau khi update, lấy lại user data với avatar đầy đủ
    const getUserRes = await fetch(`${strapiUrl}/api/users/${user?.id}?populate=*`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    if (!getUserRes.ok) throw new Error('Lấy dữ liệu avatar thất bại');

    const updatedUser = await getUserRes.json();
    // Đảm bảo avatar object được lưu đúng cấu trúc
    const userWithAvatar = {
      ...updatedUser,
      avatar: uploadedFile.url ? uploadedFile : updatedUser.avatar,
    };
    setAuth(jwt!, userWithAvatar);
    toast.success('Cập nhật avatar thành công!');
  } catch (err: any) {
    toast.error(err.message);
  } finally {
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }
};

  if (loading || !user) return <main className="page"><div className="card">Đang tải...</div></main>;

  const avatarUrl = user?.avatar?.url
    ? `${process.env.NEXT_PUBLIC_STRAPI_URL}${user.avatar.url}`
    : null;

  return (
    <main className="page profile-page">
      <div className="card profile-card">
        <div className="profile-header">
          <div className="avatar-wrapper">
            <div className="avatar-container" onClick={handleAvatarClick}>
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  width={100}
                  height={100}
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  <span>{user.username?.charAt(0).toUpperCase()}</span>
                </div>
              )}
              {uploading && <div className="avatar-overlay">Đang tải...</div>}
              {!uploading && (
                <div className="avatar-overlay">
                  <span>Upload</span>
                </div>
              )}
            </div>
          </div>
          <h3>Hồ sơ của tôi</h3>
        </div>

        <div className="profile-info">
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Giới tính:</strong> {user.sex === 'male' ? 'Nam' : user.sex === 'female' ? 'Nữ' : (user.sex || 'Chưa cập nhật')}</p>
          <p><strong>Role:</strong> {role === 'staff' ? 'Staff (Quản lý)' : 'Employee (Nhân viên)'}</p>
        </div>

        <div className="profile-actions">
          <Link href="/profile/edit">
            <button className="edit-btn">✏️ Chỉnh sửa hồ sơ</button>
          </Link>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: 'none' }}
        />
      </div>
    </main>
  );
}