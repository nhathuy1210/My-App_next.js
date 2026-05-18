'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import Image from 'next/image';

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const avatarUrl = user?.avatar?.url
    ? `${process.env.NEXT_PUBLIC_STRAPI_URL}${user.avatar.url}`
    : null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo bên trái */}
        <Link href="/dashboard" className="navbar-logo">
          <Image src="/favicon.ico" alt="Logo" width={32} height={32} />
          <span className="logo-text">MyApp</span>
        </Link>

        {/* Khu vực user bên phải */}
        {user ? (
          <div className="navbar-user" ref={dropdownRef}>
            <button className="user-button" onClick={() => setOpen(!open)}>
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  width={28}
                  height={28}
                  className="user-avatar"
                />
              ) : (
                <div className="avatar-placeholder" />
              )}
              <span className="user-name">{user.username}</span>
              <span className={`dropdown-arrow ${open ? 'open' : ''}`}>▼</span>
            </button>

            {open && (
              <div className="dropdown-menu">
                <Link href="/profile" className="dropdown-item" onClick={() => setOpen(false)}>
                  Profile
                </Link>
                <Link href="/profile/edit" className="dropdown-item" onClick={() => setOpen(false)}>
                  Chỉnh sửa hồ sơ
                </Link>
                {role === 'staff' && (
                  <Link href="/manage-users" className="dropdown-item" onClick={() => setOpen(false)}>
                    Quản lý user
                  </Link>
                )}
                <button className="dropdown-item logout-btn" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login">
            <button className="login-btn">Đăng nhập</button>
          </Link>
        )}
      </div>
    </nav>
  );
}