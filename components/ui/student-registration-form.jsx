"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dropdown, useSetState } from "@/utils/function.utils";
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
import { Eye, EyeOff, Loader } from "lucide-react";
import { CheckboxDemo } from "../common-components/checkbox";
import SingleSelectDropdown from "../common-components/singleSelectDropdown";
import "react-phone-number-input/style.css";
import PhoneInput, {
  isValidPhoneNumber,
  getCountries,
} from "react-phone-number-input";
import TextArea from "../common-components/textArea";
import { mentorList } from "@/utils/constant.utils";

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
      console.log("res", res);
    } catch (error) {
      console.log("error", error);
    }
  };

  const getIntrestedTopics = async () => {
    try {
      const res = await Models.auth.getIntrestedTopics();
      const Dropdowns = Dropdown(res?.results, "topic");

      const updatedDropdowns = [
        ...Dropdowns,
        { label: "Others", value: "others" },
      ];

      setState({ intrestedTopicsList: updatedDropdowns });
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
      console.log("res", res);
    } catch (error) {
      console.log("error");
    }
  };

  // 🚀 Prevent hydration errors by ensuring the component renders only after mount
  if (!isMounted) return null;

  const StudentRegistration = async () => {
    try {
      setState({ btnLoading: true });
      console.log(
        "✌️state?.alumniIntrested_topics --->",
        state?.alumniIntrested_topics
      );
      console.log(
        "✌️state?.alumniIntrested_topics1 --->",
        state?.alumniIntrested_topics1
      );

      const body = {
        first_name: state?.firstname,
        last_name: state?.lastname,
        email: state?.email.trim(),
        department: state?.department,
        year_of_entry: state?.year_of_entry?.value
          ? state?.year_of_entry?.value
          : "",
        password: state?.password,
        intrested_topics: state?.alumniIntrested_topics?.some(
          (item) => item.value === "others"
        )
          ? state?.intrested_topics1
          : state?.alumniIntrested_topics?.map((item) => item.label),
        university: state?.university?.value || "",
        is_alumni: false,
      };

      await Validation.studentRegistration.validate(body, {
        abortEarly: false,
      });
      const res = await Models.auth.registration(body);

      InfinitySuccess(
        "Thank you for registering as an alumnus. Kindly visit our Programs page and email us your areas of expertise, orientation, and willingness to conduct sessions.",
        () => {
          router?.push("/login");
          // console.log("jghjfgjhmv");
        }
      );

      // router?.push("/login");

      // useToastAndNavigate
      // useToastAndNavigate(
      //   "Thank you. You are being registered as a student. Please visit our Programs page, explore the lounges, and register for the sessions that align with your interests.",
      //   toastStyles.success,
      //   "/login"
      // );

      setState({
        btnLoading: false,
        firstname: "",
        lastname: "",
        email: "",
        department: "",
        year_of_entry: "",
        password: "",
        university: null,
      });
    } catch (error) {
      console.log("error", error);
      setState({ btnLoading: false, errors: null });

      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });

        console.log("validationErrors: ", validationErrors);

        // Set validation errors in state
        setState({ errors: validationErrors });
        setState({ btnLoading: false }); // Stop loading after error
      } else {
        setState({ btnLoading: false }); // Stop loading after unexpected error
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

  const years = Array.from({ length: 2025 - 1951 + 1 }, (_, i) => {
    const year = 1951 + i;
    return { value: year.toString(), label: year.toString() };
  });

  const handlePhoneChange = (value) => {
    const valid = value && isValidPhoneNumber(value);
    if (valid == false) {
      setState({
        errors: {
          ...state.errors,
          phone_number: "Please enter a valid phone number",
        },
        alumniPhone: value,
      });
    } else {
      setState({
        errors: { ...state.errors, phone_number: "" },
        alumniPhone: value,
      });
    }
  };

  const role = [
    {
      name: "Student Registration",
      value: "student",
    },
    {
      name: "Alumni Registration",
      value: "alumni",
    },
  ];

  return (
    <div className="flex items-center justify-center w-full">
      <Card className="lg:w-[800px] md:600px sm:w-[100%] w-[100%]">
        <CardHeader>
          <CardTitle>Registration</CardTitle>

          <CardDescription>
            Update your account information here. Be sure to save your changes
            once you&lsquo;re finished.
          </CardDescription>
          <div className="flex gap-5 pt-5">
            {role?.map((item) => (
              <CheckboxDemo
                key={item.value}
                label={item.name}
                value={item.value}
                selectedValues={
                  state.role === item.value
                    ? [{ value: item.value, label: item.name }]
                    : []
                }
                onChange={(newSelectedValues) => {
                  const selected = newSelectedValues?.[0]?.value || "";
                  console.log("✌️ Selected Value --->", selected);
                  setState({ role: selected });
                }}
                isMulti={false} // Single selection
              />
            ))}
          </div>
        </CardHeader>
        {state.role == "student" ? (
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <TextInput
                  id="firstname"
                  type="text"
                  placeholder="Enter Your First Name"
                  required
                  value={state.firstname}
                  onChange={(e) => setState({ firstname: e.target.value })}
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
                  onChange={(e) => setState({ lastname: e.target.value })}
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
                  onChange={(e) => setState({ email: e.target.value })}
                  error={state.errors?.email}
                  title="E-Mail"
                />
              </div>

              <div className="space-y-1">
                <TextInput
                  id="department"
                  type="text"
                  placeholder="Enter Your Department Name"
                  error={state.errors?.department}
                  title="Department"
                  value={state.department}
                  onChange={(e) => setState({ department: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <CustomSelect
                  options={state?.universityList || []} // Safely pass empty array if universityList is null
                  value={state.university?.value || ""}
                  onChange={(value) => setState({ university: value })}
                  error={state.errors?.university}
                  title="University"
                  placeholder="Select University"
                />
              </div>

              <div className="space-y-1">
                <MultiSelectDropdown
                  options={state.intrestedTopicsList || []} // Safely pass empty array if intrestedTopicsList is null
                  value={state.alumniIntrested_topics || ""}
                  onChange={(value) => {
                    console.log("✌️value --->", value);
                    if (value.length > 0) {
                      if (value?.some((item) => item.value === "others")) {
                        setState({
                          alumniIntrested_topics: [
                            { value: "others", label: "Others" },
                          ],
                        });
                      } else {
                        setState({ alumniIntrested_topics: value });
                      }
                    } else {
                      setState({ alumniIntrested_topics: value });
                    }
                  }}
                  error={state.errors?.alumniIntrested_topics}
                  placeholder="Select Topics"
                  title="Interests in Topics"
                />
              </div>
              {Array.isArray(state.alumniIntrested_topics) &&
                state.alumniIntrested_topics.some(
                  (item) => item.value === "others"
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
                <CustomSelect
                  options={years || []} // Safely pass empty array if universityList is null
                  value={state.year_of_entry?.value || ""}
                  onChange={(value) => setState({ year_of_entry: value })}
                  error={state.errors?.year_of_entry}
                  title="Year of Entry"
                  placeholder="Select Year of Entry"
                  required
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
                    onChange={(e) => setState({ password: e.target.value })}
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
                    {state?.showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                <p style={{ fontSize: "12px" }}>min 8 characters required</p>
              </div>
            </div>

            <div className="flex justify-center gap-2">
              <Button
                onClick={() => router?.back()}
                variant="outline"
                className="w-full text-themeGreen hover:text-themeGreen border-themeGreen hover:border-themeGreen"
              >
                Cancel
              </Button>
              <Button
                onClick={StudentRegistration}
                className="w-full bg-themeGreen hover:bg-themeGreen"
              >
                {state.btnLoading ? <Loader /> : "Submit"}
              </Button>
            </div>
          </CardContent>
        ) : (
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <TextInput
                  id="alumnifirstname"
                  type="text"
                  placeholder="Enter Your First Name"
                  title="First Name"
                  required
                  value={state?.aluminifirstname}
                  onChange={(e) =>
                    setState({ aluminifirstname: e.target.value })
                  }
                  error={state?.errors?.first_name}
                />
              </div>

              <div className="space-y-1">
                <TextInput
                  id="alumnilastname"
                  type="text"
                  placeholder="Enter Your Last Name"
                  title="Last Name"
                  required
                  value={state.aluminilastname}
                  onChange={(e) =>
                    setState({ aluminilastname: e.target.value })
                  }
                  error={state?.errors?.last_name}
                />
              </div>

              <div className="space-y-1">
                <TextInput
                  id="alumniEmail"
                  type="email"
                  placeholder="user@gmail.com"
                  required
                  title="E-Mail"
                  value={state.alumniEmail}
                  onChange={(e) => setState({ alumniEmail: e.target.value })}
                  error={state?.errors?.email}
                />
              </div>

              <div className="space-y-1 z-0">
                <SingleSelectDropdown
                  options={state?.countryList || []}
                  value={state.country || ""}
                  onChange={(value) => {
                    setState({ country: value, alumniPhone: "" });
                  }}
                  error={state.errors?.country}
                  title="Country"
                  placeholder="Select Your Country"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-bold text-gray-700">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="phone-input-wrapper pt-1">
                  <PhoneInput
                    placeholder="Enter phone number"
                    country={state.country?.code}
                    defaultCountry={state.country?.code}
                    value={state.alumniPhone}
                    onChange={handlePhoneChange}
                    international
                    className="custom-phone-input"
                  />
                  {state.errors?.phone_number && (
                    <p className="mt-2 text-sm text-red-600">
                      {state.errors?.phone_number}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <TextInput
                  id="alumniDepartment"
                  type="text"
                  placeholder="Enter Your Department Name"
                  title="Department"
                  value={state.alumniDepartment}
                  onChange={(e) =>
                    setState({ alumniDepartment: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <CustomSelect
                  options={years || []}
                  value={state.year_of_graduation?.value || ""}
                  onChange={(value) => setState({ year_of_graduation: value })}
                  error={state.errors?.year_of_graduation}
                  title="Year Graduated"
                  placeholder="Select Year of Graduated"
                  required
                />
              </div>

              <div className="space-y-1">
                <TextInput
                  id="work"
                  type="text"
                  placeholder="Enter Your Work"
                  title="Work"
                  value={state.work}
                  onChange={(e) => setState({ work: e.target.value })}
                />
              </div>

              <div className="space-y-1 z-0">
                <CustomSelect
                  options={state?.universityList || []}
                  value={state.alumniUniversity?.value || ""}
                  onChange={(value) => setState({ alumniUniversity: value })}
                  error={state.errors?.alumniUniversity}
                  placeholder="Select University"
                  title="University"
                />
              </div>

              <div className="space-y-1">
                <TextArea
                  placeholder="Enter Your address"
                  title="Address"
                  value={state.address}
                  onChange={(e) => setState({ address: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <MultiSelectDropdown
                  options={state.intrestedTopicsList || []}
                  value={state.alumniIntrested_topics || ""}
                  onChange={(value) => {
                    console.log("✌️value --->", value);
                    if (value.length > 0) {
                      if (value?.some((item) => item.value === "others")) {
                        setState({
                          alumniIntrested_topics: [
                            { value: "others", label: "Others" },
                          ],
                        });
                      } else {
                        setState({ alumniIntrested_topics: value });
                      }
                    } else {
                      setState({ alumniIntrested_topics: value });
                    }
                  }}
                  error={state.errors?.alumniIntrested_topics}
                  placeholder="Select Topics"
                  title="Interests in Topics"
                />
              </div>
              {Array.isArray(state.alumniIntrested_topics) &&
                state.alumniIntrested_topics.some(
                  (item) => item.value === "others"
                ) && (
                  <div className="space-y-1">
                    <TextInput
                      id="alumniIntrested_topics1"
                      type="text"
                      placeholder="Enter New Topics"
                      title="New Topics"
                      value={state.alumniIntrested_topics1}
                      onChange={(e) =>
                        setState({ alumniIntrested_topics1: e.target.value })
                      }
                    />
                  </div>
                )}

              <div className="space-y-1 ">
                <CustomSelect
                  options={mentorList || []} // Safely pass empty array if intrestedTopicsList is null
                  value={state.is_open_to_be_mentor?.value || ""}
                  onChange={(value) =>
                    setState({ is_open_to_be_mentor: value })
                  }
                  error={state.errors?.is_open_to_be_mentor}
                  title="Are you open to being a mentor?"
                  placeholder="Select"
                />
              </div>
            </div>
            <div className="flex justify-center gap-2">
              <Button
                onClick={() => router?.back()}
                variant="outline"
                className="w-full text-themeGreen hover:text-themeGreen border-themeGreen hover:border-themeGreen"
              >
                Cancel
              </Button>
              <Button
                // onClick={AlumniRegistration}
                className="w-full bg-themeGreen hover:bg-themeGreen"
              >
                {state.btnLoading ? <Loader /> : "Submit"}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default StudentRegistrationForm;
