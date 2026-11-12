import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { issueTokens, setRefreshCookie, publicUser } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json({ message: "ایمیل و رمز عبور الزامی هستند" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email });
    const isMatch = user ? await bcrypt.compare(password, user.password) : false;

    // پیام خطا را عمداً کلی می‌گذاریم تا معلوم نشود ایمیل وجود دارد یا نه
    if (!isMatch) {
      return NextResponse.json({ message: "ایمیل یا رمز عبور اشتباه است" }, { status: 401 });
    }

    const { accessToken, refreshToken } = await issueTokens(user);

    // Access Token در بدنه پاسخ → فرانت در حافظه نگهش می‌دارد
    // Refresh Token در کوکی httpOnly → مرورگر خودش نگهش می‌دارد
    const response = NextResponse.json({
      message: "ورود با موفقیت انجام شد",
      accessToken,
      user: publicUser(user),
    });
    setRefreshCookie(response, refreshToken);
    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return NextResponse.json({ message: "خطای سرور" }, { status: 500 });
  }
}
