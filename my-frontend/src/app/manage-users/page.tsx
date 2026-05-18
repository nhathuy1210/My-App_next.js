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
}

export default function ManageUsersPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (role !== 'staff') {
      router.push('/dashboard');
      return;
    }

    const jwt = localStorage.getItem('jwt');
    fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users?populate=role`, {
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then((res) => {
        if (!res.ok) throw toast.error('Không thể lấy danh sách user');
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
        <div className="card" style={{ color: '#b91c1c', textAlign: 'center' }}>
        {error}
        </div>
      </main>
    );
  }

  return (
    <main className="page manage-users-page">
      <div className="card">
        <h3>Quản lý người dùng</h3>
        <div className="user-stats">
          <p className="user-count">
            Tổng số Staff: <strong>{users.filter(u => u.role?.name === 'staff').length}</strong>
          </p>
          <p className="user-count">
            Tổng số Employee: <strong>{users.filter(u => u.role?.name !== 'staff').length}</strong>
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
                <th>Xác nhận</th>
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
                    <span className={`role-badge ${u.role?.name === 'staff' ? 'staff' : 'employee'}`}>
                      {u.role?.name === 'staff' ? 'Staff' : 'Employee'}
                    </span>
                   </td>
                  <td>
                    {u.confirmed ? (
                      <span className="confirmed">Đã xác nhận</span>
                    ) : (
                      <span className="unconfirmed">Chưa xác nhận</span>
                    )}
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