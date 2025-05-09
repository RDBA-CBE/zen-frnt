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
import { Failure, Success } from "../common-components/toast";
import CustomSelect from "../common-components/dropdown";
import * as Yup from "yup";
import * as Validation from "@/utils/validation.utils";
import { TextInput } from "../common-components/textInput";
import MultiSelectDropdown from "../common-components/multiSelectDropdown";
import { Loader } from "lucide-react";

const StudentRegistrationForm = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false); // Track mounting state

  const [state, setState] = useSetState({
    username: "",
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
        username: state?.username,
        email: state?.email,
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

      Success(
        "Thank you. You are being registered as a student. Please visit our Programs page, explore the lounges, and register for the sessions that align with your interests."
      );

      router?.push("/login");
      setState({
        btnLoading: false,
        username: "",
        email: "",
        department: "",
        year_of_entry: "",
        password: "",
        university: null,
      });
    } catch (error) {
      console.log("error", error);
      setState({ btnLoading: false });

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

  // const AlumniRegistration = async () => {

  //     try {
  //         const body = {
  //             username: state?.alumniUsername,
  //             email: state?.alumniEmail,
  //             phone_number: state?.alumniPhone,
  //             department: state?.alumniDepartment,
  //             work: state?.work,
  //             country: state?.country?.value,
  //             address: state?.address,
  //             year_of_graduation: state?.year_of_graduation,
  //             password: state?.alumniPassword,
  //             intrested_topics: state?.alumniIntrested_topics?.label == "Others" ? state?.alumniIntrested_topics1 : state?.alumniIntrested_topics?.label, // Ensure this is an array or null
  //             alumniUniversity: state?.alumniUniversity?.value || "", // Safely access university value
  //             is_open_to_be_mentor: state?.is_open_to_be_mentor?.value == "Yes" ? true : false,
  //             is_alumni: true
  //         };

  //         await Validation.AlumniRegistration.validate(body, {
  //             abortEarly: false,
  //         });

  //         const res = await Models.auth.registration(body);
  //         Success("Registration successfully");

  //     } catch (error) {
  //         console.log("error", error)
  //         if (error instanceof Yup.ValidationError) {
  //             const validationErrors: any = {};
  //             error.inner.forEach((err: any) => {
  //                 validationErrors[err.path] = err?.message;
  //             });
  //             console.log("validationErrors: ", validationErrors);

  //             setState({
  //                 errors: validationErrors,
  //                 submitLoading: false
  //             });
  //         } else {
  //             // If it's neither a custom error nor a validation error, just stop loading
  //             setState({ submitLoading: false });
  //         }
  //     }

  // };

  const years = Array.from({ length: 2025 - 1951 + 1 }, (_, i) => {
    const year = 1951 + i;
    return { value: year.toString(), label: year.toString() };
  });

  return (
    <div className="flex items-center justify-center w-full">
      <Card className="lg:w-[800px] md:600px sm:w-[100%] w-[100%]">
        <CardHeader>
          <CardTitle>Student Registration</CardTitle>
          <CardDescription>
            Update your account information here. Be sure to save your changes
            once you&lsquo;re finished.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <TextInput
                id="username"
                type="text"
                placeholder="Enter Your Name"
                required
                value={state.username}
                onChange={(e) => setState({ username: e.target.value })}
                error={state.errors?.username}
                title="User Name"
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

            {/* <div className="space-y-1">
                            <CustomSelect
                                options={state.intrestedTopicsList || []} // Safely pass empty array if intrestedTopicsList is null
                                value={state.intrested_topics?.value || ""}
                                onChange={(value) => setState({ intrested_topics: value })}
                                error={state.errors?.intrested_topics}
                                title="Intrested Topics"
                                placeholder="Select Intrested Topics"
                            />
                        </div> */}
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
              {/* <Label htmlFor="year_of_entry">Year of Entry</Label> */}
              {/* <DatePicker
                                        placeholder="Select Year"
                                        selectedDate={state.year_of_entry}
                                        onChange={(date: any) => {
                                            setState({
                                                year_of_entry: date,
                                            });
                                        }}
                                        error={state.errors?.year_of_entry}
                                        required
                                    /> */}
              {/* <TextInput
                id="year_of_entry"
                type="text"
                placeholder="Enter Year of Entry"
                value={state.year_of_entry}
                onChange={(e) => setState({ year_of_entry: e.target.value })}
                title="Year of Entry"
                required
                error={state.errors?.year_of_entry}
              /> */}
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
              <TextInput
                id="password"
                type="password"
                placeholder="Enter Your password"
                required
                title="Password"
                value={state.password}
                onChange={(e) => setState({ password: e.target.value })}
                error={state.errors?.password}
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
              onClick={StudentRegistration}
              className="w-full bg-themeGreen hover:bg-themeGreen"
            >
              {state.btnLoading ? <Loader /> : "Submit"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentRegistrationForm;
