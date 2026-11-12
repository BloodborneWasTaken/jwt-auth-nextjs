import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyAccessToken } from "@/lib/auth";

// یک API محافظت‌شده: فقط با Access Token معتبر جواب می‌دهد
// هدر درخواست باید این شکلی باشد →  Authorization: Bearer <accessToken>
export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ message: "اکسس توکن ارسال نشده است" }, { status: 401 });
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (error) {
      const message =
        error.name === "TokenExpiredError" ? "اکسس توکن منقضی شده است" : "اکسس توکن نامعتبر است";
      return NextResponse.json({ message }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(payload.userId).select("name email createdAt");
    if (!user) {
      return NextResponse.json({ message: "کاربر پیدا نشد" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("ME ERROR:", error);
    return NextResponse.json({ message: "خطای سرور" }, { status: 500 });
  }
}
