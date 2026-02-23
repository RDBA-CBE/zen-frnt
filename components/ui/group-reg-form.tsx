"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useSetState } from "@/utils/function.utils";
import { TextInput } from "../common-components/textInput";
// import TextArea from "../common-components/textArea";
import CustomSelect from "../common-components/dropdown";
import { Eye, EyeOff, Loader } from "lucide-react";
import * as Yup from "yup";
import * as Validation from "@/utils/validation.utils";
import { Failure, InfinitySuccess } from "../common-components/toast";
import Models from "@/imports/models.import";
import { useRouter } from "next/navigation";

const GroupRegForm = () => {
  const router = useRouter();

  const [state, setState] = useSetState({
    groupFirstName: "",
    groupLastName:"",
    groupAge: "",
    is_married: null,
    kids: "",
    geo_detail: "",
    groupGender: null,
    btnLoading: false,
    errors: null,
    groupEmail: "",
    password: "",
  });

  const GroupRegistration = async () => {
    // Placeholder for submission logic
    try {
      setState({ btnLoading: true });
      const body = {
        first_name: state?.groupFirstName,
        last_name: state?.groupLastName,

        email: state?.groupEmail.trim(),
        password: state.password,
        age: state?.groupAge,
        is_married: state?.is_married?.value,
        kids: state?.kids,
        geo_detail: state?.geo_detail,
        gender: state?.groupGender?.value,
        group_name : "Group"
      };

      await Validation.groupRegistration.validate(body, { abortEarly: false });

      await Models.auth.registration(body);

      console.log("body", body);
      

      setState({ btnLoading: false });

      InfinitySuccess(
        "Thank you for registering as a Group member. Please check your inbox to verify your email and then log in to your account. Visit the Programs page to explore Lounges and register for sessions that match your interests.",
        () => {
          router?.push("/login");
        },
      );

      resetForm();
      
    } catch (error) {
      setState({ btnLoading: false, errors: null });

      const validationErrors = {};

      if (error instanceof Yup.ValidationError) {
        error.inner.forEach((err) => {
          validationErrors[err.path] = err.message;
        });

        setState({ errors: validationErrors });
      } else {
        if (error?.email) {
          Failure(error.email[0]);
          setState({ errors: null });
        } else if (error?.password) {
          Failure(error.password[0]);
          setState({ errors: null });
        } else if (Object.keys(validationErrors).length === 0) {
          Failure("An error occurred. Please try again.");
          setState({ errors: null });
        }
      }
    }
  };

  const resetForm = () => {
    setState({
      groupName: "",
      groupEmail: "",
      password: "",
      groupAge: "",
      is_married: null,
      kids: "",
      geo_detail: "",
      groupGender: null,
      errors: null,
    });
  };

  const marriedOptions = [
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
  ];

  const genderOptions = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5 pb-5">
        <div className="space-y-1 ">
          <TextInput
            id="first_name"
            type="text"
            placeholder="Enter First Name"
            title="First Name"
            required
            value={state.groupFirstName}
            onChange={(e) =>
              setState({
                groupFirstName: e.target.value,
                errors: { ...state.errors, first_name: "" },
              })
            }
            error={state.errors?.first_name}
          />
        </div>

        <div className="space-y-1 ">
          <TextInput
            id="last_name"
            type="text"
            placeholder="Enter First Name"
            title="First Name"
            required
            value={state.groupLastName}
            onChange={(e) =>
              setState({
                groupLastName: e.target.value,
                errors: { ...state.errors, last_name: "" },
              })
            }
            error={state.errors?.last_name}
          />
        </div>

        <div className="space-y-1">
          <TextInput
            id="groupEmail"
            type="email"
            placeholder="user@gmail.com"
            required
            title="E-Mail"
            value={state.groupEmail}
            onChange={(e) =>
              setState({
                groupEmail: e.target.value,
                errors: { ...state.errors, email: "" },
              })
            }
            error={state?.errors?.email}
          />
        </div>

        <div className="space-y-1">
          <div className="relative">
            <TextInput
              id="password"
              type={state.showPassword ? "text" : "password"}
              placeholder="Enter Your password"
              required
              title="Password"
              value={state.password}
              onChange={(e) =>
                setState({
                  password: e.target.value,
                  errors: { ...state.errors, password: "" },
                })
              }
              error={state.errors?.password}
            />
            <button
              type="button"
              onClick={() => {
                setState({ showPassword: !state.showPassword });
              }}
              className="absolute  right-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
              style={{ top: `${state.errors?.password ? "40%" : "55%"}` }}
            >
              {state?.showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p style={{ fontSize: "12px" }}>Min 8 characters required</p>
        </div>

        <div className="space-y-1">
          <TextInput
            id="age"
            type="text"
            placeholder="Enter Age"
            title="Age"
            required
            value={state.groupAge}
            onChange={(e) =>
              setState({
                groupAge: e.target.value,
                errors: { ...state.errors, age: "" },
              })
            }
            error={state.errors?.age}
          />
        </div>

        <div className="space-y-1">
          <CustomSelect
            options={genderOptions}
            value={state.groupGender?.value || ""}
            onChange={(value) => setState({ groupGender: value })}
            error={state.errors?.gender}
            title="Gender"
            placeholder="Select Gender"
            required
          />
        </div>

        <div className="space-y-1">
          <CustomSelect
            options={marriedOptions}
            value={state.is_married?.value || ""}
            onChange={(value) => setState({ is_married: value })}
            error={state.errors?.is_married}
            title="Married"
            placeholder="Select Status"
            required
          />
        </div>

        <div className="space-y-1">
          <TextInput
            id="kids"
            type="text"
            placeholder="Number of Kids"
            title="Kids"
            value={state.kids}
            onChange={(e) =>
              setState({
                kids: e.target.value,
                errors: { ...state.errors, kids: "" },
              })
            }
            error={state.errors?.kids}
          />
        </div>

        <div className="space-y-1 ">
          <TextInput
            id="geo_detail"
            type="text"
            placeholder="Enter Geographical Details"
            title="Geographical Details"
            value={state.geo_detail}
            onChange={(e) => setState({ geo_detail: e.target.value })}
            error={state.errors?.geo_detail}
          />
        </div>
      </div>

      <div className="flex justify-center gap-2">
        <Button
          onClick={() =>
            setState({
              name: "",
              age: "",
              is_married: null,
              kids: "",
              geo_detail: "",
              gender: null,
              errors: null,
            })
          }
          variant="outline"
          className="w-full text-themeGreen hover:text-themeGreen border-themeGreen hover:border-themeGreen"
        >
          Reset
        </Button>
        <Button
          onClick={GroupRegistration}
          className="w-full bg-themeGreen hover:bg-themeGreen"
        >
          
          {state.btnLoading ? <Loader /> : "Submit"}
        </Button>
      </div>
    </>
  );
};

export default GroupRegForm;


