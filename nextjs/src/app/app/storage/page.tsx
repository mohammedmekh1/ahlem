"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, Download, Share2, Trash2, Loader2, FileIcon, AlertCircle, CheckCircle, Copy, HardDrive, Cloud, FolderOpen } from 'lucide-react';
import { createSPASaaSClientAuthenticated as createSPASaaSClient } from '@/lib/supabase/client';
import { FileObject } from '@supabase/storage-js';

export default function StoragePage() {
  const { user } = useGlobal();
  const [files,           setFiles]           = useState<FileObject[]>([]);
  const [uploading,       setUploading]       = useState(false);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState('');
  const [success,         setSuccess]         = useState('');
  const [shareUrl,        setShareUrl]        = useState('');
  const [selectedFile,    setSelectedFile]    = useState<string | null>(null);
  const [showDelete,      setShowDelete]      = useState(false);
  const [fileToDelete,    setFileToDelete]    = useState<string | null>(null);
  const [copied,          setCopied]          = useState(false);
  const [isDragging,      setIsDragging]      = useState(false);

  useEffect(() => { if (user?.id) loadFiles(); }, [user]);

  const loadFiles = async () => {
    try {
      setLoading(true); setError('');
      const supabase = await createSPASaaSClient();
      const { data, error: e } = await supabase.getFiles(user!.id);
      if (e) throw e;
      setFiles(data || []);
    } catch { setError('فشل تحميل الملفات'); }
    finally  { setLoading(false); }
  };

  const handleUpload = async (file: File) => {
    try {
      setUploading(true); setError('');
      const supabase = await createSPASaaSClient();
      const { error: e } = await supabase.uploadFile(user!.id, file.name, file);
      if (e) throw e;
      await loadFiles();
      setSuccess('تم رفع الملف بنجاح ✓');
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('فشل رفع الملف'); }
    finally  { setUploading(false); }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = Array.from(e.dataTransfer.files)[0];
    if (file) handleUpload(file);
  }, []);

  const handleDownload = async (filename: string) => {
    try {
      const supabase = await createSPASaaSClient();
      const { data, error: e } = await supabase.shareFile(user!.id, filename, 60, true);
      if (e) throw e;
      window.open(data.signedUrl, '_blank');
    } catch { setError('فشل تحميل الملف'); }
  };

  const handleShare = async (filename: string) => {
    try {
      const supabase = await createSPASaaSClient();
      const { data, error: e } = await supabase.shareFile(user!.id, filename, 24 * 60 * 60);
      if (e) throw e;
      setShareUrl(data.signedUrl); setSelectedFile(filename);
    } catch { setError('فشل إنشاء رابط المشاركة'); }
  };

  const handleDelete = async () => {
    if (!fileToDelete) return;
    try {
      const supabase = await createSPASaaSClient();
      const { error: e } = await supabase.deleteFile(user!.id, fileToDelete);
      if (e) throw e;
      await loadFiles();
      setSuccess('تم حذف الملف بنجاح');
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('فشل حذف الملف'); }
    finally  { setShowDelete(false); setFileToDelete(null); }
  };

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (['jpg','jpeg','png','gif','webp'].includes(ext)) return '🖼️';
    if (['pdf'].includes(ext)) return '📄';
    if (['doc','docx'].includes(ext)) return '📝';
    if (['xls','xlsx'].includes(ext)) return '📊';
    if (['zip','rar','7z'].includes(ext)) return '🗜️';
    if (['mp4','avi','mov'].includes(ext)) return '🎬';
    if (['mp3','wav'].includes(ext)) return '🎵';
    return '📁';
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الملفات</h1>
          <p className="text-gray-500 text-sm mt-1">ارفع وشارك وأدِر ملفاتك بأمان</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Cloud className="h-4 w-4 text-indigo-400" />
          <span>{files.length} ملف</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'إجمالي الملفات', value: files.length, icon: FolderOpen, color: 'text-indigo-500', bg: 'bg-indigo-50' },
          { label: 'مساحة مستخدمة', value: '—', icon: HardDrive, color: 'text-purple-500', bg: 'bg-purple-50' },
          { label: 'مشاركات نشطة', value: '—', icon: Share2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        ].map((s, i) => (
          <div key={i} className="stat-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {error   && <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
      {success && <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm"><CheckCircle className="h-4 w-4 shrink-0" />{success}</div>}

      {/* Upload Zone */}
      <label
        className={`flex flex-col items-center justify-center w-full h-40 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
          isDragging ? 'border-indigo-500 bg-indigo-50 scale-[1.01]' : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30'
        } ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
        onDragEnter={e => { e.preventDefault(); setIsDragging(true); }}
        onDragOver={e => e.preventDefault()}
        onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            <p className="text-sm text-indigo-600 font-medium">جاري رفع الملف...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center px-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Upload className="h-6 w-6 text-indigo-500" />
            </div>
            <div>
              <p className="font-medium text-gray-700 text-sm">اسحب الملف وأفلته هنا</p>
              <p className="text-xs text-gray-400 mt-1">أو انقر للاختيار من جهازك</p>
            </div>
          </div>
        )}
        <input type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ''; }} disabled={uploading} />
      </label>

      {/* File List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">لا توجد ملفات</p>
          <p className="text-sm mt-1">ارفع أول ملف باستخدام المنطقة أعلاه</p>
        </div>
      ) : (
        <div className="exam-card overflow-hidden">
          <div className="divide-y divide-gray-50">
            {files.map((file, i) => (
              <div key={file.name} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <span className="text-2xl shrink-0">{getFileIcon(file.name)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name.split('/').pop()}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatSize((file.metadata as Record<string, number>)?.size)} · {new Date(file.created_at || '').toLocaleDateString('ar-DZ')}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleDownload(file.name)} title="تحميل"
                    className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors">
                    <Download className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleShare(file.name)} title="مشاركة"
                    className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors">
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => { setFileToDelete(file.name); setShowDelete(true); }} title="حذف"
                    className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share Dialog */}
      <Dialog open={Boolean(shareUrl)} onOpenChange={() => { setShareUrl(''); setSelectedFile(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>مشاركة الملف</DialogTitle>
            <DialogDescription>انسخ الرابط أدناه. ينتهي صلاحيته بعد 24 ساعة.</DialogDescription>
          </DialogHeader>
          <p className="text-sm font-medium text-gray-600 mb-2">{selectedFile?.split('/').pop()}</p>
          <div className="flex items-center gap-2">
            <input type="text" value={shareUrl} readOnly className="exam-input text-xs flex-1" />
            <button onClick={() => copyUrl(shareUrl)}
              className={`p-2.5 rounded-xl border transition-all ${copied ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}>
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الملف</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف هذا الملف؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
