// app/my-tasks/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Done' | 'On Hold';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  project?: { name: string };
  assignee?: { username: string };
  dueDate: string;
  createdAt: string;
}

export default function MyTasksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    fetchMyTasks();
  }, [authLoading, user, router]);

  const fetchMyTasks = async () => {
    try {
      const jwt = localStorage.getItem('jwt');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/tasks?filters[assignee][id][$eq]=${user?.id}&populate=*`,
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      );

      if (!response.ok) throw new Error('Không thể lấy danh sách task');
      const data = await response.json();
      setTasks(data.data || []);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
    return matchStatus && matchPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Todo':
        return '#6b7280';
      case 'In Progress':
        return '#3b82f6';
      case 'Done':
        return '#10b981';
      case 'On Hold':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low':
        return '#10b981';
      case 'Medium':
        return '#3b82f6';
      case 'High':
        return '#f59e0b';
      case 'Urgent':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (authLoading || loading) {
    return (
      <main className="page">
        <div className="card" style={{ textAlign: 'center' }}>Đang tải task...</div>
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
    <main className="page" style={{ maxWidth: '1000px' }}>
      <div className="card">
        <h1 style={{ marginBottom: '25px' }}>📋 My Tasks</h1>

        {/* Filter */}
        <div style={{ marginBottom: '25px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
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
                }}
              >
                <option value="all">Tất cả</option>
                <option value="Todo">📝 To Do</option>
                <option value="In Progress">⚙️ In Progress</option>
                <option value="Done">✓ Done</option>
                <option value="On Hold">⏸️ On Hold</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                Lọc theo độ ưu tiên
              </label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                <option value="all">Tất cả</option>
                <option value="Low">🟢 Low</option>
                <option value="Medium">🟡 Medium</option>
                <option value="High">🟠 High</option>
                <option value="Urgent">🔴 Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        {filteredTasks.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {filteredTasks.map((task) => (
              <Link key={task.id} href={`/tasks/${task.id}`}>
                <div
                  style={{
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    border: `2px solid ${getStatusColor(task.status)}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = '#ffffff';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f8fafc';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: '#1e293b' }}>
                        {task.title}
                      </h3>
                      <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#64748b' }}>
                        {task.project?.name}
                      </p>
                      <p style={{ margin: '0', fontSize: '13px', color: '#94a3b8' }}>
                        {task.description?.substring(0, 80)}...
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginLeft: '16px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          backgroundColor: getStatusColor(task.status),
                          color: '#ffffff',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {task.status}
                      </span>
                      <span
                        style={{
                          padding: '4px 10px',
                          backgroundColor: getPriorityColor(task.priority),
                          color: '#ffffff',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: '12px', fontSize: '12px', color: '#94a3b8' }}>
                    Due: {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            <p style={{ fontSize: '16px' }}>✨ Không có task nào</p>
            <p style={{ fontSize: '14px' }}>Chờ staff giao task cho bạn</p>
          </div>
        )}
      </div>
    </main>
  );
}
