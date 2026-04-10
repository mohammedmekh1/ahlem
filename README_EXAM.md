# 🎓 EXAM Platform — منصة التعليم الإلكتروني

<div align="center">

![EXAM Platform](https://img.shields.io/badge/EXAM-Platform-6366f1?style=for-the-badge&logo=graduation-cap)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css)

**منصة تعليمية متكاملة مبنية بـ Next.js 15 + Supabase + TypeScript**

</div>

---

## ✨ الميزات الرئيسية

| الميزة | الوصف |
|--------|-------|
| 🔐 **مصادقة متقدمة** | تسجيل دخول بالبريد، MFA، SSO (Google/GitHub) |
| 📚 **إدارة الدورات** | إنشاء واستعراض الدورات مع متابعة التقدم |
| 📝 **نظام الاختبارات** | اختبارات تفاعلية مع توقيت وتصحيح فوري |
| 🧠 **مساعد ذكاء اصطناعي** | شرح المفاهيم وإنشاء الأسئلة تلقائياً |
| 📊 **التحليلات** | تقارير الأداء والتقدم بمخططات تفاعلية |
| 🗂️ **إدارة الملفات** | رفع وتشارك الملفات مع التخزين السحابي |
| 🛡️ **لوحة الإدارة** | إدارة المستخدمين والصلاحيات والمحتوى |
| 🌐 **متعدد اللغات** | دعم العربية والإنجليزية والفرنسية |

---

## 🚀 التثبيت والإعداد

### المتطلبات الأساسية

```bash
Node.js >= 18.0.0
npm >= 9.0.0 (أو yarn)
حساب Supabase (مجاني)
```

### 1. استنساخ المشروع

```bash
git clone https://github.com/mohammedmekh1/ahlem.git
cd ahlem/nextjs
```

### 2. تثبيت الاعتماديات

```bash
npm install
# أو
yarn install
```

### 3. إعداد متغيرات البيئة

```bash
cp .env.example .env.local
```

عدّل `.env.local` بإضافة بيانات Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. إعداد قاعدة البيانات

```bash
# تشغيل الـ migrations في Supabase:
supabase db push
# أو نفّذ ملف: ../supabase/all_migrations_combined.sql
```

### 5. تشغيل المشروع

```bash
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000)

---

## 🏗️ هيكل المشروع

```
nextjs/
├── src/
│   ├── app/
│   │   ├── page.tsx              # الصفحة الرئيسية
│   │   ├── layout.tsx            # التخطيط الجذري
│   │   ├── globals.css           # التصميم العام
│   │   ├── app/                  # صفحات التطبيق (للمسجلين)
│   │   │   ├── page.tsx          # لوحة التحكم
│   │   │   ├── courses/          # الدورات
│   │   │   ├── exams/            # الاختبارات
│   │   │   ├── ai/               # مساعد الذكاء الاصطناعي
│   │   │   ├── analytics/        # التحليلات
│   │   │   ├── storage/          # إدارة الملفات
│   │   │   └── user-settings/    # إعدادات المستخدم
│   │   ├── auth/                 # صفحات المصادقة
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   ├── verify-email/
│   │   │   └── 2fa/
│   │   ├── admin/                # لوحة الإدارة
│   │   ├── api/                  # API Routes
│   │   └── legal/                # صفحات قانونية
│   ├── components/
│   │   ├── AppLayout.tsx         # تخطيط التطبيق (Sidebar)
│   │   ├── AuthAwareButtons.tsx  # أزرار المصادقة
│   │   ├── MFASetup.tsx          # إعداد MFA
│   │   ├── SSOButtons.tsx        # تسجيل دخول SSO
│   │   └── ui/                   # مكونات shadcn/ui
│   └── lib/
│       ├── context/GlobalContext.tsx
│       ├── supabase/             # إعدادات Supabase
│       ├── types.ts              # أنواع TypeScript
│       └── i18n.ts               # الترجمة
└── public/                       # الملفات العامة
```

---

## 🌍 النشر على الإنتاج

### Vercel (الأسهل)

```bash
npm install -g vercel
vercel --prod
```

أضف متغيرات البيئة في لوحة Vercel.

### VPS / سيرفر خاص

```bash
# بناء المشروع
npm run build

# تشغيل في الإنتاج
npm start

# أو استخدم PM2
npm install -g pm2
pm2 start npm --name "exam" -- start
pm2 save && pm2 startup
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🔧 الأوامر المتاحة

```bash
npm run dev      # تشغيل بيئة التطوير
npm run build    # بناء للإنتاج
npm run start    # تشغيل الإنتاج
npm run lint     # فحص الكود
npm run test     # تشغيل الاختبارات
```

---

## 🗃️ قاعدة البيانات (Supabase)

### الجداول الرئيسية

| الجدول | الوصف |
|--------|-------|
| `profiles` | معلومات المستخدمين |
| `admin_profiles` | المديرون |
| `organizations` | المؤسسات |
| `organization_members` | أعضاء المؤسسات |
| `courses` | الدورات التعليمية |
| `exams` | الاختبارات |
| `exam_results` | نتائج الاختبارات |

---

## 📱 التطبيق المحمول

يتوفر تطبيق Expo Mobile في مجلد `supabase-expo-template/`.

```bash
cd supabase-expo-template
npm install
npx expo start
```

---

## 🤝 المساهمة

1. Fork المشروع
2. أنشئ فرعاً: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. افتح Pull Request

---

## 📄 الترخيص

MIT License - راجع ملف [LICENSE](LICENSE)

---

<div align="center">

**صُنع بـ ❤️ لمنصة EXAM التعليمية**

</div>
