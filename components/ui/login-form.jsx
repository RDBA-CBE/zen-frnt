"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Success } from "../common-components/toast";

const LoginForm = ({ className, ...props }) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false); // Track mounting state

  const [state, setState] = useSetState({
    username: "",
    password: "",
  });

  useEffect(() => {
    setIsMounted(true); // Ensure component is only rendered on client
  }, []);

  const handleSubmit = async () => {
    try {
      const body = {
        email: state.username,
        password: state.password,
      };
      const res = await Models.auth.login(body);

      localStorage.setItem("token", res.access);
      localStorage.setItem("refreshToken", res.refresh);
      localStorage.setItem("userId", res?.user_id)
      localStorage.setItem("group", res.group[0] )
      Success("Login successfully");

      // ✅ Trigger storage event to notify other tabs
      window.dispatchEvent(new Event("storage"));

      router.back("/");
    } catch (error) {
      console.log("error: ", error);
    }
  };

  // 🚀 Prevent hydration errors by ensuring the component renders only after mount
  if (!isMounted) return null;

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={state.username}
                  onChange={(e) => setState({ username: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={state.password}
                  onChange={(e) => setState({ password: e.target.value })}
                />
              </div>
              <Button type="button" className="w-full" onClick={handleSubmit}>
                Login
              </Button>
              <Button variant="outline" className="w-full">
                Login with Google
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="#" className="underline underline-offset-4">
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
