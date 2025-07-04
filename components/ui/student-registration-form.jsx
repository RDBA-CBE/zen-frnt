"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dropdown, MultiDropdown, useSetState } from "@/utils/function.utils";
import Models from "@/imports/models.import";
import {
  Failure,
  InfinitySuccess,
  Success,
  ToastAndNavigate,
  useToastAndNavigate,
} from "../common-components/toast";
import CustomSelect from "../common-components/dropdown";
import * as Yup from "yup";
import * as Validation from "@/utils/validation.utils";
import { TextInput } from "../common-components/textInput";
import MultiSelectDropdown from "../common-components/multiSelectDropdown";
import { ChevronUp, Eye, EyeOff, Loader } from "lucide-react";
import { CheckboxDemo } from "../common-components/checkbox";
import SingleSelectDropdown from "../common-components/singleSelectDropdown";
import "react-phone-number-input/style.css";
import PhoneInput, {
  isValidPhoneNumber,
  getCountries,
} from "react-phone-number-input";
import TextArea from "../common-components/textArea";
import { mentorList } from "@/utils/constant.utils";
import Select from "react-select";

const StudentRegistrationForm = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false); // Track mounting state


  const [state, setState] = useSetState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    phone_number: "",
    address: "",
    date_of_birth: "",
    university: null,
    intrested_topics: null,
    intrested_topics1: "",
    is_alumni: false,
    year_of_entry: "",
    department: "",
    intrestedTopicsList: null,
    universityList: null,
    alumniUsername: "",
    alumniEmail: "",
    alumniPhone: "",
    alumniDepartment: "",
    work: "",
    country: "",
    is_open_to_be_mentor: false,
    alumniUniversity: null,
    alumniIntrested_topics: null,
    alumniIntrested_topics1: "",
    year_of_graduation: "",
    alumniPassword: "",
    btnLoading: false,
    showPassword: false,
    role: "student",
  });

  useEffect(() => {
    setIsMounted(true); // Ensure component is only rendered on client
    getUniversity();
    getIntrestedTopics();
    getCountry();
  }, []);

  const getUniversity = async () => {
    try {
      const res = await Models.auth.getUniversity();
      const Dropdowns = Dropdown(res, "name");
      setState({ universityList: Dropdowns });
    } catch (error) {
      console.log("error", error);
    }
  };

  const getIntrestedTopics = async () => {
    try {
      const res = await Models.auth.getIntrestedTopics();
      const Dropdownss = Dropdown(res?.results, "topic");
      const filter = Dropdownss?.filter((item) => item?.label !== "");
     
      setState({ intrestedTopicsList: filter });
      console.log("res", res);
    } catch (error) {
      console.log(error);
    }
  };

  const getCountry = async () => {
    try {
      const res = await Models.auth.getCountries();
      const Dropdowns = Dropdown(res?.results, "name");
      setState({ countryList: Dropdowns });
    } catch (error) {
      console.log("error");
    }
  };

  if (!isMounted) return null;

  const StudentRegistration = async () => {
    try {
      setState({ btnLoading: true });

      const body = {
        first_name: state?.firstname,
        last_name: state?.lastname,
        email: state?.email.trim(),
        department: state?.department,
        year_of_entry: state?.year_of_entry?.value
          ? state?.year_of_entry?.value
          : "",
        password: state?.password,
        intrested_topics:
          state?.alumniIntrested_topics?.length > 0
            ? state?.alumniIntrested_topics?.map((item) => item.value)
            : [],
        lable: state?.intrested_topics1 || "",
        university: state?.university?.value || "",
        is_alumni: false,
      };
      console.log('✌️body --->', body);

      await Validation.studentRegistration.validate(body, {
        abortEarly: false,
      });
      const res = await Models.auth.registration(body);

      InfinitySuccess(
        "Thank you. You are being registered as a student. Please visit our Programs page, explore the lounges, and register for the sessions that align with your interests.",
        () => {
          router?.push("/login");
        }
      );
      resetForm();
    } catch (error) {
      console.log("error", error);
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
        if (error?.email) {
          Failure(error.email[0]);
        } else if (error?.password) {
          Failure(error.password[0]);
        } else {
          Failure("An error occurred. Please try again.");
        }
      }
    }
  };

  const resetForm = () => {
    setState({
      btnLoading: false,
      firstname: "",
      lastname: "",
      email: "",
      department: "",
      year_of_entry: "",
      password: "",
      university: null,
      errors: null,
      alumniIntrested_topics: [],
    });
  };

  const years = Array.from({ length: 2025 - 1951 + 1 }, (_, i) => {
    const year = 1951 + i;
    return { value: year.toString(), label: year.toString() };
  });


  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5">
        <div className="space-y-1">
          <TextInput
            id="firstname"
            type="text"
            placeholder="Enter Your First Name"
            required
            value={state.firstname}
            onChange={(e) =>
              setState({
                firstname: e.target.value,
                errors: { ...state.errors, first_name: "" },
              })
            }
            error={state.errors?.first_name}
            title="First Name"
          />
        </div>

        <div className="space-y-1">
          <TextInput
            id="lastname"
            type="text"
            placeholder="Enter Your Last Name"
            required
            value={state.lastname}
            onChange={(e) =>
              setState({
                lastname: e.target.value,
                errors: { ...state.errors, last_name: "" },
              })
            }
            error={state.errors?.last_name}
            title="Last Name"
          />
        </div>

        <div className="space-y-1">
          <TextInput
            id="email"
            type="email"
            placeholder="user@gmail.com"
            required
            value={state.email}
            onChange={(e) =>
              setState({
                email: e.target.value,
                errors: { ...state.errors, email: "" },
              })
            }
            error={state.errors?.email}
            title="E-Mail"
          />
        </div>

       

        {/* <div className="space-y-1">
          <CustomSelect
            options={state?.universityList || []} // Safely pass empty array if universityList is null
            value={state.university?.value || ""}
            onChange={(value) => setState({ university: value })}
            error={state.errors?.university}
            title="University"
            placeholder="Select University"
          />
        </div> */}

        <div className="space-y-1">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            {"University"} {<span className="text-red-500">*</span>}
          </label>
          <Select
            options={state?.universityList || []}
            value={state.university || ""}
            onChange={(value) => setState({ university: value ,
               errors: { ...state.errors, university: "" },
            })}
            placeholder="Select University"
            className="z-50 text-sm"
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            isClearable
          />
          {state.errors?.university && (
            <p className="mt-2 text-sm text-red-600">
              {state.errors?.university}{" "}
              {/* Display the error message if it exists */}
            </p>
          )}
        </div>

         <div className="space-y-1">
          <TextInput
            id="department"
            type="text"
            placeholder="Enter Your Department Name"
            error={state.errors?.department}
            title="Department"
            value={state.department}
            onChange={(e) => setState({ department: e.target.value,
               errors: { ...state.errors, department: "" },
             })}
            required
            
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            {"Interests in Topics"}
          </label>
          <Select
            value={state.alumniIntrested_topics}
            isMulti
            options={state.intrestedTopicsList || []}
            placeholder="Select Topics"
            onChange={(value) => setState({ alumniIntrested_topics: value })}
            className="z-50 text-sm"
            menuPortalTarget={document.body} // required when using menuPosition="fixed"
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
          
        </div>
        {Array.isArray(state.alumniIntrested_topics) &&
          state.alumniIntrested_topics.some(
            (item) => item.value === 13
          ) && (
            <div className="space-y-1">
              <TextInput
                id="intrested_topics1"
                type="text"
                placeholder="Enter New Topics"
                title="New Topics"
                value={state.intrested_topics1}
                onChange={(e) =>
                  setState({ intrested_topics1: e.target.value })
                }
              />
            </div>
          )}

        <div className="space-y-1">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            {"Year of Entry"} {<span className="text-red-500">*</span>}
          </label>
          <Select
            options={years || []}
            value={state.year_of_entry || ""}
            onChange={(value) => setState({ year_of_entry: value , errors:{...state.errors, year_of_entry:""}})}

            placeholder="Year Of Entry"
            className="z-50 text-sm"
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            isClearable
          />
          {state.errors?.year_of_entry && (
            <p className="mt-2 text-sm text-red-600">
              {state.errors?.year_of_entry}{" "}
              {/* Display the error message if it exists */}
            </p>
          )}
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
              onChange={(e) => setState({ password: e.target.value , errors:{...state.errors, password:""}})}
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
          <p style={{ fontSize: "12px" }}>min 8 characters required</p>
        </div>
      </div>

      <div className="flex justify-center gap-2">
        <Button
          onClick={() => resetForm()}
          variant="outline"
          className="w-full text-themeGreen hover:text-themeGreen border-themeGreen hover:border-themeGreen"
        >
          Reset
        </Button>
        <Button
          onClick={StudentRegistration}
          className="w-full bg-themeGreen hover:bg-themeGreen"
        >
          {state.btnLoading ? <Loader /> : "Submit"}
        </Button>
      </div>
    </>
  );
};

export default StudentRegistrationForm;
