"use client";
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
import { useRouter } from "next/navigation";
import { Success } from "../common-components/toast";

const LoginForm = ({ className, ...props }) => {

  const router = useRouter();
  
  const { showToast } = useToast();

  const [state, setState] = useSetState({
    username: "",
    password: "",
  });


  const handleSubmit = async () => {
    try {
      const body = {
        email: state.username,
        password: state.password,
      };
      console.log("body: ", body);
      const res = await Models.auth.login(body);
      console.log("res: ", res);
      localStorage.setItem("token", res.access);
      localStorage.setItem("refreshToken", res.refresh);
Success("Login successfully")
      router.push("/");
    } catch (error) {
      console.log("error: ", error);
    }
  };
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
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
              <Button
                type="button"
                className="w-full"
                onClick={() => handleSubmit()}
              >
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
