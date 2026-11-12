"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

export default function HomePage() {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("login");
  const [profile, setProfile] = useState(null);
  const [apiError, setApiError] = useState("");

  const isLogin = mode == "login";

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm({ mode: "onBlur" });

  const onSubmit = async (data) => {
    const url = isLogin ? "/api/auth/login" : "/api/auth/signup";
    const body = isLogin
      ? { email: data.email, password: data.password }
      : data;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      console.log(result);

      if (!response.ok) {
        setError("root.serverError", { message: result.message });
      }

      setAccessToken(result.accessToken);
      setUser(result.user);
      reset();
    } catch (error) {
      setError("root.serverError", { message: "ارتباط با سرور برقرار نشد" });
    }
  };

  const getProfile = async () => {
    setApiError("");
    setProfile(null);

    try {
      const response = await fetch("api/user/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = await response.json();

      if (!response.ok) {
        setApiError(`${response.status}:${result.message}`);
      }

      setProfile(result.user);
    } catch (error) {
      setApiError("خطا در ارتباط با سرور");
    }
  };

  const switchMode = () => {
    setMode(isLogin ? "signup" : "login");
    reset();
  };

  if (user) {
    return (
      <main className="card card-dashboard">
        <h1 className="title">سلام {user.name}</h1>
        <p className="label">Accass token:</p>
        <p className="token-box">{accessToken}</p>

        <div className="actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={getProfile}
          >
            دریافت اطلاعات از سرور
          </button>
        </div>

        {apiError && <p className="alert alert-error">{apiError}</p>}
        {profile && <p className="profile-box">{JSON.stringify(profile)}</p>}
      </main>
    );
  }

  return (
    <main className="card">
      <h1 className="title">{isLogin ? "ورود" : "ثبت نام"}</h1>
      <form className="form" action="" onSubmit={handleSubmit(onSubmit)}>
        {!isLogin && (
          <>
            <input
              className="input"
              type="text"
              placeholder="نام"
              {...register("name", { required: "نام الزامی است" })}
            />
            <br />
            {errors.name && (
              <p className="field-error">{errors.name.message}</p>
            )}
            <br />
          </>
        )}
        <input
          className="input"
          type="email"
          placeholder="ایمیل"
          {...register("email", { required: "ایمیل الزامی است" })}
        />
        <br />
        {errors.email && <p className="field-error">{errors.email.message}</p>}
        <br />
        <input
          className="input"
          type="password"
          placeholder="رمز عبور"
          {...register("password", { required: "رمز عبور الزامی است" })}
        />
        <br />
        {errors.password && (
          <p className="field-error">{errors.password.message}</p>
        )}
        <br />
        <input
          className="btn btn-primary"
          type="submit"
          value={isLogin ? "ورود" : "ثبت نام"}
        />
      </form>

      <p className="switch-text">
        {isLogin ? "حساب کاربری ندارید؟" : "قبلا ثبت نام کرده اید؟"}
      </p>

      <button type="button" className="btn btn-ghost" onClick={switchMode}>
        {isLogin ? "ثبت نام کن" : "وارد شو"}
      </button>
    </main>
  );
}
