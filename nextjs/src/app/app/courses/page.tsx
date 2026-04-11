"use client";
import React, { useState } from 'react';
import { BookOpen, Clock, Users, Star, Search, Filter, Play, Lock, ChevronRight } from 'lucide-react';

const courses = [
  { id: 1, title: 'الرياضيات المتقدمة',   category: 'رياضيات', level: 'متقدم',    lessons: 24, hours: 12, students: 1240, rating: 4.8, progress: 65, enrolled: true,  color: 'from-blue-500 to-cyan-500',     icon: '📐' },
  { id: 2, title: 'الفيزياء النظرية',      category: 'علوم',    level: 'متوسط',   lessons: 18, hours: 9,  students: 890,  rating: 4.6, progress: 30, enrolled: true,  color: 'from-purple-500 to-indigo-500', icon: '⚛️' },
  { id: 3, title: 'الكيمياء العضوية',     category: 'علوم',    level: 'متوسط',   lessons: 20, hours: 10, students: 672,  rating: 4.7, progress: 0,  enrolled: false, color: 'from-emerald-500 to-teal-500',  icon: '🧪' },
  { id: 4, title: 'تاريخ الحضارات',       category: 'إنسانيات', level: 'مبتدئ',  lessons: 15, hours: 7,  students: 2100, rating: 4.9, progress: 0,  enrolled: false, color: 'from-orange-500 to-amber-500',  icon: '🏛️' },
  { id: 5, title: 'البرمجة بلغة Python',  category: 'تقنية',   level: 'مبتدئ',  lessons: 32, hours: 16, students: 3400, rating: 4.9, progress: 80, enrolled: true,  color: 'from-rose-500 to-pink-500',     icon: '💻' },
  { id: 6, title: 'الإحصاء والبيانات',    category: 'رياضيات', level: 'متوسط',   lessons: 22, hours: 11, students: 1560, rating: 4.7, progress: 0,  enrolled: false, color: 'from-indigo-500 to-violet-500', icon: '📊' },
];

const categories = ['الكل', 'رياضيات', 'علوم', 'تقنية', 'إنسانيات'];
const levels     = ['الكل', 'مبتدئ', 'متوسط', 'متقدم'];

export default function CoursesPage() {
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('الكل');
  const [level,    setLevel]    = useState('الكل');
  const [tab,      setTab]      = useState<'all' | 'enrolled'>('all');

  const filtered = courses.filter(c => {
    const matchSearch   = c.title.includes(search) || c.category.includes(search);
    const matchCategory = category === 'الكل' || c.category === category;
    const matchLevel    = level    === 'الكل' || c.level    === level;
    const matchTab      = tab === 'all' || c.enrolled;
    return matchSearch && matchCategory && matchLevel && matchTab;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الدورات التعليمية</h1>
          <p className="text-gray-500 text-sm mt-1">اكتشف وتعلّم من أفضل الدورات</p>
        </div>
        <span className="exam-badge exam-badge-primary">{courses.length} دورة</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100">
        {[['all','جميع الدورات'],['enrolled','دوراتي']] .map(([key, label]) => (
          <button key={key} onClick={() => setTab(key as 'all'|'enrolled')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${tab === key ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >{label}</button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input className="exam-input pr-9" placeholder="ابحث عن دورة..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <select className="exam-input w-auto" value={category} onChange={e => setCategory(e.target.value)}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="exam-input w-auto" value={level} onChange={e => setLevel(e.target.value)}>
            {levels.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((c, i) => (
          <div key={c.id} className="course-card animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
            {/* Thumbnail */}
            <div className={`h-36 bg-gradient-to-br ${c.color} flex items-center justify-center relative`}>
              <span className="text-5xl">{c.icon}</span>
              {c.enrolled && c.progress > 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/30 px-3 py-1.5">
                  <div className="flex justify-between text-xs text-white mb-1">
                    <span>التقدم</span><span>{c.progress}%</span>
                  </div>
                  <div className="exam-progress h-1.5">
                    <div className="exam-progress-bar" style={{ width: `${c.progress}%`, background: 'white' }} />
                  </div>
                </div>
              )}
              {!c.enrolled && (
                <div className="absolute top-2 right-2">
                  <span className="bg-white/90 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">{c.level}</span>
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-sm leading-snug flex-1">{c.title}</h3>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{c.lessons} درس</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{c.hours} ساعة</span>
                <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />{c.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                <Users className="h-3.5 w-3.5" />
                <span>{c.students.toLocaleString()} طالب مسجّل</span>
              </div>

              {c.enrolled ? (
                <button className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
                  <Play className="h-4 w-4 fill-white" />
                  {c.progress > 0 ? 'متابعة التعلم' : 'ابدأ الدورة'}
                </button>
              ) : (
                <button className="w-full flex items-center justify-center gap-2 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-sm font-medium py-2.5 rounded-xl transition-colors">
                  <ChevronRight className="h-4 w-4" />
                  الالتحاق بالدورة
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">لا توجد دورات مطابقة</p>
          <p className="text-sm mt-1">جرب تغيير كلمة البحث أو الفلاتر</p>
        </div>
      )}
    </div>
  );
}
