// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface User {
  id: number;
  username: string;
  email: string;
  role?: { name: string };
  sex?: string;
  confirmed?: boolean;
  blocked?: boolean;
  createdAt?: string;
}

export default function DashboardPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [blockingId, setBlockingId] = useState<number | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (role !== 'staff') {
      router.push('/profile');
      return;
    }

    const jwt = localStorage.getItem('jwt');
    fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users?populate=role`, {
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Không thể lấy danh sách user');
        return res.json();
      })
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [authLoading, user, role, router]);

  const handleBlockUser = async (userId: number, currentBlocked: boolean) => {
    setBlockingId(userId);
    try {
      const jwt = localStorage.getItem('jwt');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/${userId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            blocked: !currentBlocked,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Không thể cập nhật trạng thái user');
      }

      // Cập nhật local state
      setUsers(users.map((u) =>
        u.id === userId ? { ...u, blocked: !currentBlocked } : u
      ));

      toast.success(
        !currentBlocked ? 'Đã block người dùng' : 'Đã unblock người dùng'
      );
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBlockingId(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (authLoading || loading) {
    return (
      <main className="page manage-users-page">
        <div className="card" style={{ textAlign: 'center' }}>Đang tải danh sách...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page manage-users-page">
        <div className="card" style={{ color: '#dc2626', textAlign: 'center' }}>
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="page manage-users-page">
      <div className="card">
        <h1>Dashboard - Quản Lý Người Dùng</h1>
        
        <div className="user-stats">
          <p className="user-count">
            Tổng số Staff: <strong>{users.filter(u => u.role?.name === 'staff').length}</strong>
          </p>
          <p className="user-count">
            Tổng số Employee: <strong>{users.filter(u => u.role?.name !== 'staff').length}</strong>
          </p>
          <p className="user-count">
            Tổng số User: <strong>{users.length}</strong>
          </p>
        </div>

        <div className="table-responsive">
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Giới tính</th>
                <th>Role</th>
                <th>Ngày đăng ký</th>
                <th>Xác nhận</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>
                    {u.sex === 'male' ? 'Nam' : u.sex === 'female' ? 'Nữ' : 'Khác'}
                  </td>
                  <td>
                    <span
                      className={`role-badge ${
                        u.role?.name === 'staff' ? 'staff' : 'employee'
                      }`}
                    >
                      {u.role?.name === 'staff' ? 'Staff' : 'Employee'}
                    </span>
                  </td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>
                    {u.confirmed ? (
                      <span className="confirmed">✓ Đã xác nhận</span>
                    ) : (
                      <span className="unconfirmed">✗ Chưa xác nhận</span>
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontWeight: 500,
                        backgroundColor: u.blocked ? '#fee2e2' : '#dcfce7',
                        color: u.blocked ? '#dc2626' : '#15803d',
                      }}
                    >
                      {u.blocked ? '🔒 Đã block' : '✓ Hoạt động'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleBlockUser(u.id, u.blocked || false)}
                      disabled={blockingId === u.id}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        marginTop: 0,
                        height: 'auto',
                        backgroundColor: u.blocked ? '#10b981' : '#ef4444',
                        cursor: blockingId === u.id ? 'not-allowed' : 'pointer',
                        opacity: blockingId === u.id ? 0.6 : 1,
                      }}
                    >
                      {blockingId === u.id
                        ? 'Đang xử lý...'
                        : u.blocked
                        ? 'Unblock'
                        : 'Block'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}