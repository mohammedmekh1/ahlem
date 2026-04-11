# 🎓 EXAM Platform — منصة التعليم الإلكتروني المتكاملة

<div align="center">

![EXAM](https://img.shields.io/badge/EXAM-Platform-6366f1?style=for-the-badge)
![Next.js 15](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E?style=for-the-badge&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

**منصة تعليمية متكاملة — 4 أدوار، اختبارات حقيقية، AI، 6 لغات، Stripe**

</div>

---

## 🚀 التثبيت السريع (5 دقائق)

```bash
# 1. استنساخ المشروع
git clone https://github.com/mohammedmekh1/ahlem.git
cd ahlem/nextjs

# 2. تثبيت الاعتماديات
npm install

# 3. إعداد المتغيرات
cp .env.example .env.local
# عدّل .env.local بإضافة بيانات Supabase

# 4. تشغيل المشروع
npm run dev
```

افتح: http://localhost:3000

---

## 🗃️ إعداد قاعدة البيانات

افتح **Supabase → SQL Editor** وشغّل الملفات بالترتيب:

```
supabase/migrations/phase1_roles_exams.sql
supabase/migrations/phase2_3_payments_invites.sql
```

---

## 👥 الأدوار الأربعة

| الدور | الوصول | الصلاحيات |
|-------|--------|-----------|
| 🛡️ **Owner** | `/admin` + `/app` | كل الصلاحيات |
| 🔧 **Admin** | `/admin` + `/app` | إدارة المستخدمين والمحتوى |
| 📚 **Teacher** | `/app/teacher/*` | إنشاء الاختبارات + دعوة الطلاب |
| 🎓 **Student** | `/app` | تأدية الاختبارات + متابعة التقدم |

### تعيين الأدوار

```sql
-- بعد تسجيل الحسابات، شغّل في Supabase SQL Editor:
UPDATE public.profiles SET role='owner', is_admin=true WHERE email='admin@exam.dz';
UPDATE public.profiles SET role='teacher'                WHERE email='teacher@exam.dz';
-- الطالب: role='student' تلقائياً عند التسجيل
```

---

## 📊 حسابات الاختبار

سجّل هذه الحسابات من `/auth/register`:

| الدور | الإيميل | كلمة المرور |
|-------|---------|-------------|
| 🛡️ مشرف | `admin@exam.dz` | `Admin123!` |
| 📚 معلم | `teacher@exam.dz` | `Teacher123!` |
| 🎓 طالب | `student@exam.dz` | `Student123!` |

ثم اذهب إلى `/admin/seed` لإنشاء بيانات تجريبية بضغطة زر.

---

## 🔄 رحلة الاختبار الكاملة

```
المعلم → ينشئ اختبار (يدوي أو AI) → ينسخ الرابط
الطالب → يفتح الرابط → يدخل اسمه + إيميله → يؤدي الاختبار
النتيجة → تظهر فوراً → تُحفظ في DB → تظهر في لوحة المعلم
```

**رابط الاختبار:** `https://your-domain.com/exam/XXXX`  
**لا يحتاج الطالب حساباً!**

---

## ✨ الميزات

### المرحلة 1 — الأساس ✅
- [x] نظام 4 أدوار مع RLS في Supabase
- [x] لوحة المعلم: إنشاء اختبار بـ 3 خطوات
- [x] توليد أسئلة بـ Anthropic Claude AI
- [x] بوابة الطالب العامة (بدون تسجيل)
- [x] مؤقت الاختبار + تصحيح فوري
- [x] أرشيف النتائج + تصدير CSV
- [x] دعوة الطلاب عبر رابط أو إيميل

### المرحلة 2 — الاختبارات ✅
- [x] بيانات حقيقية من Supabase
- [x] إحصاءات المعلم الحقيقية
- [x] API دعوة الإيميل (Resend)
- [x] أرشفة تلقائية مع التصحيح التفصيلي
- [x] لوحة نتائج متكاملة

### المرحلة 3 — المتقدم ✅
- [x] Stripe Checkout + Webhook
- [x] صفحة الأسعار الكاملة
- [x] لوحة الإدارة الحقيقية (بيانات DB)
- [x] صفحة البيانات التجريبية `/admin/seed`
- [x] 6 لغات (عربي، إنجليزي، فرنسي، إسباني، تركي، ألماني)
- [x] مساعد AI حقيقي للطلاب والمعلمين
- [x] security headers + standalone Docker

---

## 🌍 اللغات المدعومة

العربية 🇩🇿 | English 🇺🇸 | Français 🇫🇷 | Español 🇪🇸 | Türkçe 🇹🇷 | Deutsch 🇩🇪

---

## ⚙️ المتغيرات المطلوبة

```env
# مطلوب
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# للذكاء الاصطناعي (يُحقن تلقائياً في Claude.ai)
# ANTHROPIC_API_KEY=...

# للدفع (اختياري)
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PRO_PRICE_ID=...
STRIPE_ENTERPRISE_PRICE_ID=...

# للإيميل (اختياري)
RESEND_API_KEY=...
FROM_EMAIL=noreply@exam.dz
```

---

## 🐳 النشر بـ Docker

```bash
cd nextjs
docker build -t exam-platform .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=... \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  exam-platform
```

أو بـ docker-compose:
```bash
cd ..  # جذر المشروع
docker-compose up -d
```

---

## 🚀 النشر على Vercel

```bash
npx vercel --prod
```

أضف المتغيرات في لوحة Vercel Dashboard.

---

## 📁 هيكل المشروع

```
nextjs/src/
├── app/
│   ├── page.tsx                    # الصفحة الرئيسية
│   ├── pricing/                    # صفحة الأسعار
│   ├── exam/[code]/               # بوابة الطالب (عامة)
│   ├── app/
│   │   ├── page.tsx               # لوحة التحكم (role-aware)
│   │   ├── teacher/
│   │   │   ├── exams/             # قائمة اختبارات المعلم
│   │   │   ├── exams/new/        # إنشاء اختبار
│   │   │   ├── exams/[id]/invite/ # دعوة الطلاب
│   │   │   └── results/          # النتائج والأرشيف
│   │   ├── ai/                    # مساعد AI (طالب/معلم)
│   │   ├── analytics/             # التحليلات
│   │   ├── courses/               # الدورات
│   │   ├── exams/                 # اختبارات الطالب
│   │   └── storage/              # إدارة الملفات
│   ├── admin/
│   │   ├── page.tsx              # لوحة الإدارة الحقيقية
│   │   ├── subscriptions/        # إدارة الاشتراكات
│   │   └── seed/                 # بيانات تجريبية
│   └── api/
│       ├── ai/chat/              # Anthropic chat API
│       ├── ai/generate-questions/ # توليد أسئلة AI
│       ├── invite/send/          # إرسال دعوات إيميل
│       └── stripe/               # Stripe checkout + webhook
├── components/
│   ├── AppLayout.tsx             # تنقل role-aware
│   └── LanguageSwitcher.tsx      # 6 لغات
└── lib/
    ├── context/GlobalContext.tsx # User + role helpers
    └── supabase/                 # Supabase clients
```

---

© 2025 EXAM Platform. جميع الحقوق محفوظة.
