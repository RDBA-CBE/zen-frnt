"use client";
import React, { useEffect } from "react";
import {
  CheckCircle,
  ArrowRight,
  Mail,
  X,
  InfoIcon,
  Loader,
  Loader2Icon,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSetState } from "@/utils/function.utils";
import * as Validation from "@/utils/validation.utils";
import { Failure, Success } from "@/components/common-components/toast";
import Models from "@/imports/models.import";
import { useSearchParams } from "next/navigation";
import * as Yup from "yup";
import { DOMAIN } from "@/utils/constant.utils";

const UserVerificationPage = () => {
  const [state, setState] = useSetState({
    email: "",
    loading: true,
    isTokenVerified: false,
  });

  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  useEffect(() => {
    verifyToken();
    localStorage.clear()
  }, []);

  const verifyToken = async () => {
    try {
      setState({ loading: true });
      const body = {
        uid: uid,
        token: token,
      };

      const res = await Models.auth.verifyToken(body);

      setState({ loading: false, isTokenVerified: true });
    } catch (error) {
      setState({ loading: false });
    }
  };

  const resendToken = async () => {
    localStorage.clear();
    try {
      setState({ btnLoading: true });
      const body = {
        // email: state?.email.trim() + DOMAIN,
        email: state?.email.trim(),

      };

      await Validation.resendToken.validate(body, {
        abortEarly: false,
      });
      const res = await Models.auth.resendToken(body);

      setState({ btnLoading: false });
      Success(res.message)

      // Success("Verification mail sent to your registered e-mail id");
    } catch (error) {
      setState({ btnLoading: false, errors: null });

      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        setState({ errors: validationErrors });
        setState({ btnLoading: false });
      } else {
        setState({ btnLoading: false });
        Failure(error.error);
      }
    }
  };

  console.log("state.errors", state.errors);

  return state.loading ? (
    <div className="md:h-[600px] flex items-center justify-center">
      <Loader2 className="animate-spin w-12 h-12" />
    </div>
  ) : (
    <div className=" from-green-50 via-white to-emerald-100 flex items-center justify-center p-4 md:h-[600px]">
      <div className="max-w-md w-full ">
        {state.isTokenVerified ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Verification Successful!
            </h1>
            <p className="text-gray-600 mb-2">
              Your email has been successfully verified.
            </p>
            <p className="text-gray-600 mb-8">
              You can now access your account and explore all features.
            </p>

            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center gap-3"
            >
              <span>Continue to Login</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <InfoIcon className="w-12 h-12 text-blue-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Token Expired
            </h1>
            <div className="space-y-1 mb-8 text-left">
              {" "}
              <Input
                id="email"
                type="email"
                placeholder="Email"
                required
                value={state.email}
                onChange={(e) =>
                  setState({
                    email: e.target.value,
                    errors: { ...state.errors, email: "" },
                  })
                }
                error={state.errors?.email}
                title="Enter Email"
              />
            </div>

            <button
              onClick={resendToken}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center gap-3"
            >
              {" "}
              {state.btnLoading ? (
                <Loader />
              ) : (
                <span>Resend Verification Token</span>
              )}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserVerificationPage;
