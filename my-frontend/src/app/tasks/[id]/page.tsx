// app/tasks/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Done' | 'On Hold';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignee?: { id: number; username: string };
  project?: { id: number; name: string };
  createdBy?: { username: string };
  dueDate: string;
  comments?: Comment[];
}

interface Comment {
  id: number;
  content: string;
  author?: { username: string };
  createdAt: string;
}

export default function TaskDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const taskId = params?.id;

  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (taskId) {
      fetchTask();
    }
  }, [authLoading, user, taskId, router]);

  const fetchTask = async () => {
    try {
      const jwt = localStorage.getItem('jwt');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/tasks/${taskId}?populate=*`,
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      );

      if (!response.ok) throw new Error('Không thể lấy task');
      const data = await response.json();
      setTask(data.data);
      setComments(data.data?.comments || []);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const jwt = localStorage.getItem('jwt');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/tasks/${taskId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              status: newStatus,
            },
          }),
        }
      );

      if (!response.ok) throw new Error('Không thể cập nhật status');
      
      toast.success('Status đã cập nhật!');
      fetchTask();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      toast.error('Vui lòng nhập comment');
      return;
    }

    try {
      const jwt = localStorage.getItem('jwt');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/comments`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              content: newComment,
              task: taskId,
              author: user.id,
            },
          }),
        }
      );

      if (!response.ok) throw new Error('Không thể thêm comment');
      
      toast.success('Comment đã được thêm!');
      setNewComment('');
      fetchTask();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="page">
        <div className="card" style={{ textAlign: 'center' }}>Đang tải task...</div>
      </main>
    );
  }

  if (error || !task) {
    return (
      <main className="page">
        <div className="card">
          <h1>{error || 'Không tìm thấy task'}</h1>
          <Link href="/my-tasks">
            <button>← Quay Lại Task</button>
          </Link>
        </div>
      </main>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Todo':
        return '#6b7280';
      case 'In Progress':
        return '#3b82f6';
      case 'Done':
        return '#10b981';
      case 'On Hold':
        return '#f97316';
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
    <main className="page" style={{ maxWidth: '900px' }}>
      {/* Task Header */}
      <div className="card" style={{ marginBottom: '25px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: '0 0 12px', fontSize: '28px' }}>📋 {task.title}</h1>
            <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '15px' }}>
              {task.description}
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              marginTop: '20px',
            }}>
              <div>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Trạng thái</span>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    marginTop: '6px',
                    backgroundColor: getStatusColor(task.status) + '15',
                    color: getStatusColor(task.status),
                    border: `2px solid ${getStatusColor(task.status)}`,
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  <option value="Todo">📌 Chưa làm</option>
                  <option value="In Progress">⚙️ Đang làm</option>
                  <option value="Done">✓ Hoàn thành</option>
                  <option value="On Hold">⏸️ Tạm dừng</option>
                </select>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Độ ưu tiên</span>
                <div
                  style={{
                    padding: '8px 12px',
                    backgroundColor: getPriorityColor(task.priority) + '15',
                    color: getPriorityColor(task.priority),
                    borderRadius: '6px',
                    fontWeight: '600',
                    marginTop: '6px',
                  }}
                >
                  {task.priority === 'Urgent' && '🔴 Khẩn cấp'}
                  {task.priority === 'High' && '🟠 Cao'}
                  {task.priority === 'Medium' && '🟡 Trung bình'}
                  {task.priority === 'Low' && '🟢 Thấp'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Ngày kết hạn</span>
                <div style={{ fontSize: '15px', fontWeight: '600', marginTop: '6px' }}>
                  📅 {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </div>

            {task.project && (
              <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '6px', borderLeft: '4px solid #3b82f6' }}>
                <span style={{ fontSize: '12px', color: '#0c4a6e', fontWeight: '600' }}>Dự án</span>
                <div style={{ fontSize: '15px', fontWeight: '600', marginTop: '4px', color: '#3b82f6' }}>
                  📁 {task.project.name}
                </div>
              </div>
            )}
          </div>

          <Link href={task.project ? `/projects/${task.project.id}` : '/my-tasks'}>
            <button style={{ padding: '10px 20px' }}>← Quay Lại</button>
          </Link>
        </div>
      </div>

      {/* Comments Section */}
      <div className="card">
        <h2 style={{ margin: '0 0 20px', fontSize: '20px' }}>💬 Bình Luận ({comments.length})</h2>

        {/* Add Comment Form */}
        <form onSubmit={handleAddComment} style={{
          padding: '15px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #e2e8f0',
        }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Viết bình luận của bạn..."
            rows={3}
          />
          <button type="submit" style={{ marginTop: '10px' }}>
            ✓ Gửi Bình Luận
          </button>
        </form>

        {/* Comments List */}
        {comments.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {comments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>
                    👤 {comment.author?.username || 'Anonymous'}
                  </span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    {new Date(comment.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
                <p style={{ margin: '0', color: '#374151', fontSize: '14px' }}>
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            padding: '30px',
            textAlign: 'center',
            color: '#64748b',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px dashed #cbd5e1',
          }}>
            <p style={{ fontSize: '15px', margin: '0' }}>💬 Chưa có bình luận nào. Hãy bình luận đầu tiên!</p>
          </div>
        )}
      </div>
    </main>
  );
}
