// components/AvatarUpload.tsx
'use client';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AvatarUpload() {
  const { user, setAuth } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('files', file);
    // Các tham số "ref", "refId", "field" để liên kết ảnh với user model.
    formData.append('ref', 'plugin::users-permissions.user');
    formData.append('refId', String(user.id));
    formData.append('field', 'avatar'); 

    try {
      const jwt = localStorage.getItem('jwt');
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;

      const res = await fetch(`${strapiUrl}/api/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Upload avatar thất bại');
      const data = await res.json();
      // data là một mảng chứa object của file vừa upload.
      const uploadedFile = data[0];

      // Cập nhật user với ID của file vừa upload
      await fetch(`${strapiUrl}/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ avatar: uploadedFile.id }),
      });

      // Lấy lại user data đầy đủ từ server
      const getUserRes = await fetch(`${strapiUrl}/api/users/${user.id}?populate=*`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });

      if (getUserRes.ok) {
        const updatedUser = await getUserRes.json();
        setAuth(jwt, updatedUser);
      }

      alert('Upload avatar thành công!');
    } catch (err) {
      setError(err.message);
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label htmlFor="avatar-upload" className="cursor-pointer">
        {uploading ? 'Đang tải...' : 'Chọn ảnh đại diện'}
      </label>
      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        disabled={uploading}
        className="hidden"
      />
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}