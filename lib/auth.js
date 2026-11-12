import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

// نام کوکی‌ای که رفرش توکن داخلش ذخیره می‌شود
export const REFRESH_COOKIE_NAME = "refreshToken";

// ---------- ساخت توکن‌ها ----------

// Access Token: عمر کوتاه — با آن APIهای محافظت‌شده را صدا می‌زنیم
export function createAccessToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "30s" }
  );
}

// Refresh Token: عمر طولانی — فقط برای گرفتن Access Token جدید
export function createRefreshToken(user) {
  return jwt.sign(
    { userId: user._id.toString() },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES || "7d",
      jwtid: randomUUID(), // شناسه یکتا تا هر رفرش توکن با قبلی فرق داشته باشد
    }
  );
}

// ---------- بررسی توکن‌ها (اگر نامعتبر یا منقضی باشد خطا می‌دهد) ----------

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
}

// ساخت هر دو توکن + ذخیره رفرش توکن در دیتابیس
export async function issueTokens(user) {
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
}

// ---------- کوکی رفرش توکن ----------

const cookieOptions = {
  httpOnly: true, // جاوااسکریپت مرورگر نمی‌تواند این کوکی را بخواند (محافظت در برابر XSS)
  secure: process.env.NODE_ENV === "production", // در پروداکشن فقط روی HTTPS
  sameSite: "strict",
  path: "/api/auth", // کوکی فقط به مسیرهای /api/auth فرستاده می‌شود
  maxAge: 7 * 24 * 60 * 60, // ۷ روز (به ثانیه) — هم‌اندازه REFRESH_TOKEN_EXPIRES
};

export function setRefreshCookie(response, refreshToken) {
  response.cookies.set(REFRESH_COOKIE_NAME, refreshToken, cookieOptions);
}

export function clearRefreshCookie(response) {
  response.cookies.set(REFRESH_COOKIE_NAME, "", { ...cookieOptions, maxAge: 0 });
}

// اطلاعاتی از کاربر که می‌توانیم به فرانت بفرستیم (بدون پسورد و توکن)
export function publicUser(user) {
  return { id: user._id.toString(), name: user.name, email: user.email };
}
