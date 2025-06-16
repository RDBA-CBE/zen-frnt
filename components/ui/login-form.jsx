"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux"; // Import useDispatch
import { setAuthData } from "@/store/slice/AuthSlice"; // Import the action
import { cn } from "@/lib/utils";
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
import useToast from "@/components/ui/toast";
import { Failure, Success } from "../common-components/toast";
import * as Yup from "yup";
import Loading from "../common-components/Loading";
import { Loader } from "lucide-react";
import Link from "next/link";
import { login } from "@/utils/validation.utils";
import { Eye, EyeOff } from "lucide-react";

const LoginForm = (props) => {
  const { isRefresh } = props;
  const router = useRouter();
  const dispatch = useDispatch(); // Initialize dispatch
  const [isMounted, setIsMounted] = useState(false); // Track mounting state

  const [state, setState] = useSetState({
    username: "",
    password: "",
    eventid: null,
    loading: false,
    showPassword: false,
  });
  useEffect(() => {
    setIsMounted(true); // Ensure component is only rendered on client
  }, []);

  useEffect(() => {
    const eventId = localStorage.getItem("eventId");
    if (eventId) {
      setState({ eventid: eventId });
    }
  }, [state?.eventid]);

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

      // Store tokens and group in localStorage
      localStorage.setItem("zentoken", res.access);
      localStorage.setItem("refreshToken", res.refresh);
      localStorage.setItem("userId", res?.user_id);
      localStorage.setItem("group", res.group[0]);
      localStorage.setItem("username", res?.username);

      // Dispatch action to store tokens and group in Redux
      dispatch(
        setAuthData({
          tokens: res.access,
          groups: res.group[0],
          userId: res.user_id,
          username: res?.username,
        })
      );

      // Success("Welcome back to Zen Wellness Redirecting you to your wellness dashboard to continue your journey toward your well-being.");
      Success("Login Successful")
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

        console.log("validationErrors: ", validationErrors);

        // Set validation errors in state
        setState({ errors: validationErrors, loading: false });
      } else {
        setState({ loading: false }); // Stop loading after unexpected error
        if (error?.detail) {
          Failure(error.detail);
        } else {
          Failure("An error occurred. Please try again.");
        }
      }
    }
  };

  // 🚀 Prevent hydration errors by ensuring the component renders only after mount
  if (!isMounted) return null;

  return (
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
              >
                {state?.loading ? <Loader /> : "Login"}
              </Button>
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
  );
};

export default LoginForm;
