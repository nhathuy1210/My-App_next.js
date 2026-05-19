// app/projects/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Project {
  id: number;
  name: string;
  description: string;
  status: 'Planning' | 'In Progress' | 'Completed';
  startDate: string;
  endDate: string;
  createdBy?: { username: string };
  members?: any[];
  tasks?: any[];
}

export default function ProjectsPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (role !== 'staff') {
      router.push('/my-tasks');
      return;
    }

    fetchProjects();
  }, [authLoading, user, role, router]);

  const fetchProjects = async () => {
    try {
      const jwt = localStorage.getItem('jwt');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/projects?populate=*`,
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      );

      if (!response.ok) throw new Error('Không thể lấy danh sách dự án');
      const data = await response.json();
      setProjects(data.data || []);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planning':
        return '#fbbf24';
      case 'In Progress':
        return '#3b82f6';
      case 'Completed':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'Planning':
        return '#fef3c7';
      case 'In Progress':
        return '#dbeafe';
      case 'Completed':
        return '#dcfce7';
      default:
        return '#f3f4f6';
    }
  };

  if (authLoading || loading) {
    return (
      <main className="page">
        <div className="card" style={{ textAlign: 'center' }}>Đang tải dự án...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page">
        <div className="card" style={{ color: '#dc2626', textAlign: 'center' }}>
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="page" style={{ maxWidth: '1200px' }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h1 style={{ margin: 0 }}>📁 Quản Lý Dự Án</h1>
          <Link href="/projects/create">
            <button style={{ marginTop: 0, padding: '10px 20px' }}>
              ➕ Tạo Dự Án Mới
            </button>
          </Link>
        </div>

        {/* Search & Filter */}
        <div style={{ marginBottom: '25px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                Tìm kiếm dự án
              </label>
              <input
                type="text"
                placeholder="Nhập tên dự án..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                Lọc theo trạng thái
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Planning">📋 Lập kế hoạch</option>
                <option value="In Progress">⚙️ Đang thực hiện</option>
                <option value="Completed">✓ Hoàn thành</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filteredProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <div
                  style={{
                    padding: '20px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  }}
                >
                  <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#1e293b' }}>
                    {project.name}
                  </h3>

                  <p style={{ margin: '8px 0', color: '#64748b', fontSize: '14px', minHeight: '40px' }}>
                    {project.description?.substring(0, 60)}...
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        backgroundColor: getStatusBgColor(project.status),
                        color: getStatusColor(project.status),
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '600',
                      }}
                    >
                      {project.status}
                    </span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {project.tasks?.length || 0} task
                    </span>
                  </div>

                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b' }}>
                    Bắt đầu: {new Date(project.startDate).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            <p style={{ fontSize: '16px' }}>📭 Không tìm thấy dự án</p>
            <Link href="/projects/create">
              <button style={{ marginTop: '16px' }}>Tạo dự án đầu tiên</button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
