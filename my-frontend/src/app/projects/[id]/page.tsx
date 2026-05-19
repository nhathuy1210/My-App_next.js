// app/projects/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
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
  tasks?: Task[];
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Done' | 'On Hold';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignee?: { username: string };
  dueDate: string;
}

export default function ProjectDetailPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (role !== 'staff') {
      router.push('/projects');
      return;
    }
    if (projectId) {
      fetchProject();
    }
  }, [authLoading, user, role, projectId, router]);

  const fetchProject = async () => {
    try {
      const jwt = localStorage.getItem('jwt');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/projects/${projectId}?populate=*`,
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      );

      if (!response.ok) throw new Error('Không thể lấy dự án');
      const data = await response.json();
      setProject(data.data);
      setTasks(data.data?.tasks || []);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleTaskChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTaskFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskFormData.title || !taskFormData.dueDate) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const jwt = localStorage.getItem('jwt');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/tasks`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              title: taskFormData.title,
              description: taskFormData.description,
              priority: taskFormData.priority,
              status: 'Todo',
              dueDate: taskFormData.dueDate,
              project: projectId,
              createdBy: user.id,
            },
          }),
        }
      );

      if (!response.ok) throw new Error('Không thể tạo task');
      
      toast.success('Task đã được tạo thành công!');
      setTaskFormData({ title: '', description: '', priority: 'Medium', dueDate: '' });
      setShowTaskForm(false);
      fetchProject();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="page">
        <div className="card" style={{ textAlign: 'center' }}>Đang tải dự án...</div>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="page">
        <div className="card">
          <h1>{error || 'Không tìm thấy dự án'}</h1>
          <Link href="/projects">
            <button>← Quay Lại Dự Án</button>
          </Link>
        </div>
      </main>
    );
  }

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return '#dc2626';
      case 'High':
        return '#f97316';
      case 'Medium':
        return '#eab308';
      case 'Low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  return (
    <main className="page" style={{ maxWidth: '1200px' }}>
      {/* Project Header */}
      <div className="card" style={{ marginBottom: '25px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: '0 0 8px', fontSize: '28px' }}>📁 {project.name}</h1>
            <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '15px' }}>
              {project.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
              <div>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Trạng thái</span>
                <div
                  style={{
                    padding: '8px 16px',
                    backgroundColor: getStatusColor(project.status) + '20',
                    color: getStatusColor(project.status),
                    borderRadius: '6px',
                    fontWeight: '600',
                    marginTop: '6px',
                  }}
                >
                  {project.status === 'Planning' && '📋 Lập kế hoạch'}
                  {project.status === 'In Progress' && '⚙️ Đang thực hiện'}
                  {project.status === 'Completed' && '✓ Hoàn thành'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Ngày bắt đầu</span>
                <div style={{ fontSize: '15px', fontWeight: '600', marginTop: '6px' }}>
                  📅 {new Date(project.startDate).toLocaleDateString('vi-VN')}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Ngày kết thúc</span>
                <div style={{ fontSize: '15px', fontWeight: '600', marginTop: '6px' }}>
                  📅 {new Date(project.endDate).toLocaleDateString('vi-VN')}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Số Task</span>
                <div style={{ fontSize: '15px', fontWeight: '600', marginTop: '6px' }}>
                  📋 {tasks.length} tasks
                </div>
              </div>
            </div>
          </div>

          <Link href="/projects">
            <button style={{ padding: '10px 20px' }}>← Quay Lại</button>
          </Link>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>📋 Danh Sách Task ({tasks.length})</h2>
          <button
            onClick={() => setShowTaskForm(!showTaskForm)}
            style={{
              padding: '10px 20px',
              backgroundColor: showTaskForm ? '#dc2626' : '#3b82f6',
            }}
          >
            {showTaskForm ? '✕ Đóng' : '➕ Thêm Task'}
          </button>
        </div>

        {/* Add Task Form */}
        {showTaskForm && (
          <div style={{
            padding: '20px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #e2e8f0',
          }}>
            <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                name="title"
                placeholder="Tiêu đề task..."
                value={taskFormData.title}
                onChange={handleTaskChange}
                required
              />

              <textarea
                name="description"
                placeholder="Mô tả task (tùy chọn)..."
                value={taskFormData.description}
                onChange={handleTaskChange}
                rows={3}
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600' }}>Độ ưu tiên</label>
                  <select
                    name="priority"
                    value={taskFormData.priority}
                    onChange={handleTaskChange}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      marginTop: '4px',
                    }}
                  >
                    <option value="Low">🟢 Thấp</option>
                    <option value="Medium">🟡 Trung bình</option>
                    <option value="High">🟠 Cao</option>
                    <option value="Urgent">🔴 Khẩn cấp</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600' }}>Ngày kết hạn</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={taskFormData.dueDate}
                    onChange={handleTaskChange}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 1 }}>✓ Thêm Task</button>
                <button
                  type="button"
                  onClick={() => setShowTaskForm(false)}
                  style={{ flex: 1, backgroundColor: '#94a3b8' }}
                >
                  Đóng
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tasks List */}
        {tasks.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tasks.map((task) => (
              <Link key={task.id} href={`/tasks/${task.id}`}>
                <div
                  style={{
                    padding: '15px',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f3f4f6';
                    (e.currentTarget as HTMLDivElement).style.borderColor = '#d1d5db';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f9fafb';
                    (e.currentTarget as HTMLDivElement).style.borderColor = '#e5e7eb';
                  }}
                >
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '600' }}>
                      {task.title}
                    </h4>
                    <p style={{ margin: '0', color: '#6b7280', fontSize: '13px' }}>
                      {task.description?.substring(0, 50)}...
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{
                      padding: '4px 10px',
                      backgroundColor: getPriorityColor(task.priority) + '20',
                      color: getPriorityColor(task.priority),
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}>
                      {task.priority === 'Urgent' && '🔴 Khẩn cấp'}
                      {task.priority === 'High' && '🟠 Cao'}
                      {task.priority === 'Medium' && '🟡 TB'}
                      {task.priority === 'Low' && '🟢 Thấp'}
                    </span>
                    <span style={{
                      padding: '4px 10px',
                      backgroundColor: '#dbeafe',
                      color: '#3b82f6',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}>
                      {task.status}
                    </span>
                    <span style={{ fontSize: '12px', color: '#6b7280', minWidth: '100px' }}>
                      📅 {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#64748b',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px dashed #cbd5e1',
          }}>
            <p style={{ fontSize: '15px', margin: '0' }}>📋 Chưa có task nào. Hãy thêm task mới!</p>
          </div>
        )}
      </div>
    </main>
  );
}
