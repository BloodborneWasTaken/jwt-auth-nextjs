# احراز هویت JWT با Next.js و MongoDB

فقط ورود و ثبت‌نام با **Access Token** و **Refresh Token**.

## اجرا

پیش‌نیاز: Node.js نسخه 20.9 یا بالاتر و MongoDB (لوکال یا Atlas)

```bash
cd ~/Desktop/jwt-auth-nextjs
npm install
npm run dev
```

بعد برو به `http://localhost:3000`

> اگر از MongoDB Atlas استفاده می‌کنی، مقدار `MONGODB_URI` را در فایل `.env.local` عوض کن.

## ساختار پروژه

```
lib/db.js                    اتصال به MongoDB
lib/auth.js                  ساخت و بررسی توکن‌ها + تنظیمات کوکی
models/User.js               مدل کاربر (پسورد هش‌شده + رفرش توکن)
app/api/auth/signup          ثبت‌نام
app/api/auth/login           ورود
app/api/auth/refresh         گرفتن اکسس توکن جدید با رفرش توکن
app/api/auth/logout          خروج و باطل کردن رفرش توکن
app/api/user/me              API محافظت‌شده (فقط با اکسس توکن)
app/page.js                  صفحه اصلی (فرانت‌اند — خالی)
```

## جریان کار

1. کاربر لاگین یا ثبت‌نام می‌کند ← سرور دو توکن می‌سازد:
   - **Access Token** (عمر ۳۰ ثانیه) ← در بدنه پاسخ ← فرانت در state نگهش می‌دارد
   - **Refresh Token** (عمر ۷ روز) ← در کوکی `httpOnly` ← در دیتابیس هم ذخیره می‌شود
2. فرانت برای API محافظت‌شده هدر `Authorization: Bearer <accessToken>` می‌فرستد.
3. وقتی اکسس توکن منقضی شود، سرور 401 می‌دهد ← فرانت `/api/auth/refresh` را صدا می‌زند ← مرورگر کوکی را خودش می‌فرستد ← توکن‌های جدید می‌گیرد و درخواست را تکرار می‌کند.
4. با هر رفرش، رفرش توکن هم عوض می‌شود (**Rotation**) و رفرش توکن قبلی دیگر کار نمی‌کند.
5. با خروج، رفرش توکن از دیتابیس و کوکی پاک می‌شود.
