import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import {
  REFRESH_COOKIE_NAME,
  verifyRefreshToken,
  issueTokens,
  setRefreshCookie,
  clearRefreshCookie,
  publicUser,
} from "@/lib/auth";

// پاسخ 401 + پاک کردن کوکی رفرش توکن
function unauthorized(message) {
  const response = NextResponse.json({ message }, { status: 401 });
  clearRefreshCookie(response);
  return response;
}

export async function POST(request) {
  try {
    // ۱. رفرش توکن را از کوکی می‌خوانیم (مرورگر خودش کوکی را فرستاده)
    const token = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
    if (!token) {
      return unauthorized("رفرش توکن وجود ندارد، لطفاً وارد شوید");
    }

    // ۲. امضا و تاریخ انقضای رفرش توکن را بررسی می‌کنیم
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      return unauthorized("رفرش توکن نامعتبر یا منقضی شده است");
    }

    // ۳. رفرش توکن باید با چیزی که در دیتابیس ذخیره کردیم یکی باشد
    await connectDB();
    const user = await User.findById(payload.userId);

    if (!user || user.refreshToken !== token) {
      // توکن معتبر است ولی در دیتابیس نیست → احتمالاً توکن قدیمی/دزدیده‌شده است
      // برای امنیت، رفرش توکن فعلی کاربر را هم باطل می‌کنیم
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
      return unauthorized("رفرش توکن باطل شده است، لطفاً دوباره وارد شوید");
    }

    // ۴. Rotation: هم Access Token جدید و هم Refresh Token جدید می‌سازیم
    const { accessToken, refreshToken } = await issueTokens(user);

    const response = NextResponse.json({
      message: "توکن جدید صادر شد",
      accessToken,
      user: publicUser(user),
    });
    setRefreshCookie(response, refreshToken);
    return response;
  } catch (error) {
    console.error("REFRESH ERROR:", error);
    return NextResponse.json({ message: "خطای سرور" }, { status: 500 });
  }
}
