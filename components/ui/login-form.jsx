"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setAuthData } from "@/store/slice/AuthSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSetState } from "@/utils/function.utils";
import Models from "@/imports/models.import";
import { Failure, Success } from "../common-components/toast";
import * as Yup from "yup";
import { Loader, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { login } from "@/utils/validation.utils";
import { CLIENT_ID } from "@/utils/constant.utils";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const LoginForm = (props) => {
  const { isRefresh } = props;
  const router = useRouter();
  const dispatch = useDispatch();

  const [state, setState] = useSetState({
    username: "",
    password: "",
    eventid: null,
    loading: false,
    showPassword: false,
    googleLoading: false,
  });

  useEffect(() => {
    const eventId = localStorage.getItem("eventId");
    if (eventId) {
      setState({ eventid: eventId });
    }
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    setState({ googleLoading: true });

    try {
      const body = {
        access_token: credentialResponse.credential,
      };
      const res = await Models.auth.googleAuth(body);
      console.log("Google auth response: ", res);

      if (res.access) {
        localStorage.setItem("zentoken", res.access);
        localStorage.setItem("refreshToken", res.refresh);
        localStorage.setItem("userId", res?.user_id || "");
        localStorage.setItem("username", res?.username || res?.email || "");

        if (res.groups?.length > 0) {
          localStorage.setItem("group", res.groups[0]);
          setAuthData({
            tokens: res.access,
            groups: res.groups[0],
            userId: res.user_id,
            username: res?.username || "",
          });
          setState({ googleLoading: false });

          router.push("/");
          setTimeout(() => {
            window.location.reload();
          }, 100);
        } else {
          await updateUserGroup(res);
        }

        Success("Google login successful!");
      } else {
        Failure("Google login failed: No access token received");
      }
    } catch (error) {
      console.error("Google login error:", error);
      if (error.response?.status === 400) {
        Failure("Invalid Google account. Please try a different account.");
      } else {
        Failure(
          error.response?.data?.message ||
            "Google login failed. Please try again."
        );
      }
    } finally {
      setState({ googleLoading: false });
    }
  };

  const updateUserGroup = async (res) => {
    try {
      let formData = new FormData();
      formData.append("groups", "1");
      await Models.user.updateUser(formData, res?.user_id);
      localStorage.setItem("group", "1");
      dispatch(
        setAuthData({
          tokens: res.access,
          groups: "Student",
          userId: res.user_id,
          username: res?.username || "",
        })
      );
      router.replace(`/update-user-data?id=${res?.user_id}`);
      setState({ googleLoading: false });
    } catch (error) {
      console.error("Error updating user group:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    try {
      setState({ loading: true });

      const validatebody = {
        email: state.username,
        password: state.password,
      };

      const body = {
        email: state.username.trim(),
        password: state.password,
      };

      await login.validate(validatebody, {
        abortEarly: false,
      });

      const res = await Models.auth.login(body);

      localStorage.setItem("zentoken", res.access);
      localStorage.setItem("refreshToken", res.refresh);
      localStorage.setItem("userId", res?.user_id);
      localStorage.setItem("group", res.group[0]);
      localStorage.setItem("username", res?.username);

      dispatch(
        setAuthData({
          tokens: res.access,
          groups: res.group[0],
          userId: res.user_id,
          username: res?.username,
        })
      );

      Success("Login Successful");
      setState({ loading: false, username: "", password: "" });

      setTimeout(() => {
        if (res?.group[0] === "Student") {
          if (state?.eventid) {
            router.push(`/view-wellness-lounge?id=${state?.eventid}`);
          } else {
            router.push("/");
            if (isRefresh) {
              window.location.reload();
            }
          }
        } else {
          router.push("/");
          if (isRefresh) {
            window.location.reload();
          }
        }
      }, 500);
    } catch (error) {
      console.log("error: ", error);
      setState({ loading: false });

      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        setState({ errors: validationErrors, loading: false });
      } else {
        setState({ loading: false });
        if (error?.detail) {
          Failure(error.detail);
        } else {
          Failure("An error occurred. Please try again.");
        }
      }
    }
  };

  const handleGoogleError = () => {
    Failure("Google login failed");
  };

  return (
    <>
      {state.googleLoading ? (
        <div className="flex md:min-h-[70vh] min-h-[60vh] w-full items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <GoogleOAuthProvider clientId={CLIENT_ID}>
          <div className="flex items-center justify-center">
            <Card className="md:w-[400px] w-[100%]">
              <CardHeader>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>
                  Enter your email below to login to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form autoComplete="off">
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        name="user_login_email"
                        placeholder="Enter Your mail ID"
                        required
                        value={state.username}
                        onChange={(e) =>
                          setState({
                            username: e.target.value,
                            errors: { ...state.errors, email: "" },
                          })
                        }
                        error={state.errors?.email}
                        autoComplete="off"
                      />
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <a
                          href="/forgot-password-email"
                          className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                        >
                          Forgot your password?
                        </a>
                      </div>

                      <div className="relative">
                        <Input
                          id="password"
                          type={state.showPassword ? "text" : "password"}
                          placeholder="Enter Your Password"
                          required
                          name="user_login_password"
                          value={state.password}
                          onChange={(e) =>
                            setState({
                              password: e.target.value,
                              errors: { ...state.errors, password: "" },
                            })
                          }
                          error={state.errors?.password}
                          className="pr-10"
                          autoComplete="off"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setState({ showPassword: !state.showPassword });
                          }}
                          className={` ${
                            state.errors?.password
                              ? "absolute top-2 right-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
                              : "absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
                          }`}
                        >
                          {state?.showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="button"
                      className="w-full bg-themeGreen hover:bg-themeGreen"
                      onClick={handleSubmit}
                      disabled={state.loading}
                    >
                      {state.loading ? (
                        <Loader className="animate-spin" />
                      ) : (
                        "Login"
                      )}
                    </Button>

                    <div className="relative p-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap={false}
                        shape="rectangular"
                        theme="outline"
                        size="large"
                        text="signin_with"
                        logo_alignment="left"
                        width="300"
                      />
                    </div>

                    <p className="text-center text-[14px]">
                      Don't have an account?{" "}
                      <Link
                        href="/registration"
                        className="underline"
                        prefetch={true}
                      >
                        Sign up
                      </Link>{" "}
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </GoogleOAuthProvider>
      )}
    </>
  );
};

export default LoginForm;
