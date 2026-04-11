"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { createSPASaaSClientAuthenticated as createSPASaaSClient } from '@/lib/supabase/client';
import { CheckCircle, Loader2, Plus, Trash2, AlertCircle, Flag } from 'lucide-react';
import Confetti from '@/components/Confetti';
import { Database } from '@/lib/types';

type Task = Database['public']['Tables']['todo_list']['Row'];
type NewTask = Database['public']['Tables']['todo_list']['Insert'];

export default function TaskManagementPage() {
  const { user } = useGlobal();
  const [tasks,          setTasks]          = useState<Task[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [error,          setError]          = useState('');
  const [filter,         setFilter]         = useState<boolean | null>(null);
  const [showConfetti,   setShowConfetti]   = useState(false);
  const [showAddForm,    setShowAddForm]    = useState(false);
  const [newTitle,       setNewTitle]       = useState('');
  const [newDesc,        setNewDesc]        = useState('');
  const [isUrgent,       setIsUrgent]       = useState(false);

  const loadTasks = useCallback(async () => {
    if (!user?.id) return;
    try {
      const supabase = await createSPASaaSClient();
      const { data, error: e } = await supabase.getMyTodoList(1, 100, 'created_at', filter);
      if (e) throw e;
      setTasks(data || []);
    } catch { setError('فشل تحميل المهام'); }
    finally   { setLoading(false); }
  }, [user?.id, filter]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !user?.id) return;
    setSaving(true);
    try {
      const supabase = await createSPASaaSClient();
      const task: NewTask = { title: newTitle.trim(), description: newDesc.trim() || null, urgent: isUrgent, owner: user.id, done: false };
      const { error: e } = await supabase.createTask(task);
      if (e) throw e;
      setNewTitle(''); setNewDesc(''); setIsUrgent(false); setShowAddForm(false);
      await loadTasks();
    } catch { setError('فشل إضافة المهمة'); }
    finally   { setSaving(false); }
  };

  const handleDone = async (id: number) => {
    try {
      const supabase = await createSPASaaSClient();
      const { error: e } = await supabase.updateAsDone(id);
      if (e) throw e;
      setShowConfetti(true); setTimeout(() => setShowConfetti(false), 2500);
      await loadTasks();
    } catch { setError('فشل تحديث المهمة'); }
  };

  const handleDelete = async (id: number) => {
    try {
      const supabase = await createSPASaaSClient();
      const { error: e } = await supabase.removeTask(id);
      if (e) throw e;
      await loadTasks();
    } catch { setError('فشل حذف المهمة'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <Confetti active={showConfetti} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">قائمة المهام</h1>
          <p className="text-gray-500 text-sm mt-1">نظّم مهامك اليومية وتابع تقدمك</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="exam-btn-primary">
          <Plus className="h-4 w-4" /> مهمة جديدة
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="exam-card p-5 animate-fade-in">
          <h3 className="font-semibold text-gray-800 mb-4">إضافة مهمة جديدة</h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <input className="exam-input" placeholder="عنوان المهمة *" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
            <textarea className="exam-input resize-none" rows={2} placeholder="وصف اختياري..." value={newDesc} onChange={e => setNewDesc(e.target.value)} />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                <input type="checkbox" checked={isUrgent} onChange={e => setIsUrgent(e.target.checked)} className="rounded" />
                <Flag className="h-4 w-4 text-red-400" /> طارئة
              </label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowAddForm(false)} className="exam-btn-secondary text-xs py-1.5 px-3">إلغاء</button>
                <button type="submit" disabled={saving || !newTitle.trim()} className="exam-btn-primary text-xs py-1.5 px-3 disabled:opacity-50">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حفظ'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[[null,'الكل'],[false,'النشطة'],[true,'المكتملة']].map(([val, label]) => (
          <button key={String(label)} onClick={() => setFilter(val as boolean | null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === val ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {String(label)}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'الكل',       count: tasks.length,                           color: 'text-gray-600' },
          { label: 'نشطة',      count: tasks.filter(t => !t.done).length,      color: 'text-indigo-600' },
          { label: 'مكتملة',    count: tasks.filter(t => t.done).length,       color: 'text-emerald-600' },
        ].map((s, i) => (
          <div key={i} className="exam-card p-3 text-center">
            <div className={`text-xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">لا توجد مهام</p>
          <p className="text-sm mt-1">أضف مهمة جديدة للبدء</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task, i) => (
            <div key={task.id}
              className={`exam-card p-4 flex items-start gap-3 animate-fade-in ${task.done ? 'opacity-60' : ''}`}
              style={{ animationDelay: `${i * 0.04}s` }}>
              <button onClick={() => !task.done && handleDone(task.id)}
                className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${task.done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 hover:border-indigo-400'}`}>
                {task.done && <CheckCircle className="h-3 w-3 text-white" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${task.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{task.title}</p>
                {task.description && <p className="text-xs text-gray-400 mt-0.5">{task.description}</p>}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-gray-300">{new Date(task.created_at).toLocaleDateString('ar-DZ')}</span>
                  {task.urgent && !task.done && <span className="exam-badge exam-badge-danger text-xs py-0 px-1.5"><Flag className="h-2.5 w-2.5" />طارئة</span>}
                  {task.done && <span className="exam-badge exam-badge-success text-xs py-0 px-1.5">مكتمل</span>}
                </div>
              </div>
              <button onClick={() => handleDelete(task.id)}
                className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
