import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { issueTokens, setRefreshCookie, publicUser } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");

    if (!name || !email || !password) {
      return NextResponse.json({ message: "همه فیلدها الزامی هستند" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ message: "رمز عبور باید حداقل ۶ کاراکتر باشد" }, { status: 400 });
    }

    await connectDB();

    const exists = await User.findOne({ email });
    if (exists) {
      return NextResponse.json({ message: "این ایمیل قبلاً ثبت شده است" }, { status: 409 });
    }

    // هیچ‌وقت پسورد را خام ذخیره نمی‌کنیم
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    // بعد از ثبت‌نام، کاربر مستقیم لاگین می‌شود
    const { accessToken, refreshToken } = await issueTokens(user);

    const response = NextResponse.json(
      { message: "ثبت‌نام با موفقیت انجام شد", accessToken, user: publicUser(user) },
      { status: 201 }
    );
    setRefreshCookie(response, refreshToken);
    return response;
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ message: "این ایمیل قبلاً ثبت شده است" }, { status: 409 });
    }
    console.error("SIGNUP ERROR:", error);
    return NextResponse.json({ message: "خطای سرور" }, { status: 500 });
  }
}
