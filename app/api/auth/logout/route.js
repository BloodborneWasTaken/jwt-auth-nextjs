import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { REFRESH_COOKIE_NAME, clearRefreshCookie } from "@/lib/auth";

export async function POST(request) {
  try {
    const token = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

    // رفرش توکن را از دیتابیس پاک می‌کنیم تا دیگر قابل استفاده نباشد
    if (token) {
      await connectDB();
      await User.updateOne({ refreshToken: token }, { refreshToken: null });
    }

    const response = NextResponse.json({ message: "خروج انجام شد" });
    clearRefreshCookie(response);
    return response;
  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    return NextResponse.json({ message: "خطای سرور" }, { status: 500 });
  }
}
