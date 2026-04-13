"use client";
import React, { useState } from 'react';
import { Settings, Shield, Globe, Bell, Database, Save, CheckCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'EXAM', allowRegistration: true, requireEmailVerification: true,
    maintenanceMode: false, emailNotifications: true, maxExamsPerTeacher: 50,
    maxStudentsPerExam: 500, defaultExamDuration: 30,
  });

  const save = () => { setSaved(true); setTimeout(()=>setSaved(false), 3000); };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div><h1 className="text-2xl font-bold text-gray-900">إعدادات المنصة</h1><p className="text-gray-500 text-sm mt-1">تحكم في إعدادات منصة EXAM</p></div>

      {saved && <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm"><CheckCircle className="h-4 w-4"/>تم حفظ الإعدادات</div>}

      {[
        {title:'إعدادات عامة', icon:Settings, items:[
          {label:'اسم المنصة', type:'text', key:'siteName'},
          {label:'الحد الأقصى للاختبارات لكل معلم', type:'number', key:'maxExamsPerTeacher'},
          {label:'الحد الأقصى للطلاب لكل اختبار', type:'number', key:'maxStudentsPerExam'},
          {label:'مدة الاختبار الافتراضية (دقيقة)', type:'number', key:'defaultExamDuration'},
        ]},
        {title:'إعدادات الأمان', icon:Shield, items:[]},
        {title:'الإشعارات', icon:Bell, items:[]},
      ].map((sec,si)=>(
        <div key={si} className="exam-card p-5">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><sec.icon className="h-4 w-4 text-indigo-500"/>{sec.title}</h2>
          <div className="space-y-4">
            {sec.items.map((item,i)=>(
              <div key={i}><label className="block text-sm font-medium text-gray-700 mb-1">{item.label}</label>
                <input type={item.type} className="exam-input" value={(settings as Record<string,unknown>)[item.key] as string}
                  onChange={e=>setSettings(s=>({...s,[item.key]:item.type==='number'?Number(e.target.value):e.target.value}))}/></div>
            ))}
            {[
              {label:'السماح بالتسجيل الجديد', key:'allowRegistration'},
              {label:'تأكيد الإيميل عند التسجيل', key:'requireEmailVerification'},
              {label:'وضع الصيانة', key:'maintenanceMode'},
              {label:'إرسال إشعارات بالإيميل', key:'emailNotifications'},
            ].filter((_,i) => (si===1&&i<2)||(si===2&&i>=2)).map((t,i)=>(
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-700">{t.label}</span>
                <button type="button" onClick={()=>setSettings(s=>({...s,[t.key]:!s[t.key as keyof typeof s]}))}
                  className={`relative w-10 h-5 rounded-full transition-colors ${(settings as Record<string,unknown>)[t.key]?'bg-indigo-500':'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${(settings as Record<string,unknown>)[t.key]?'right-0.5':'left-0.5'}`}/>
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button onClick={save} className="exam-btn-primary"><Save className="h-4 w-4"/>حفظ الإعدادات</button>
    </div>
  );
}
