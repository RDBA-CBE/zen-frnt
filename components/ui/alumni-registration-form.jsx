"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dropdown, useSetState } from "@/utils/function.utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Models from "@/imports/models.import";
import { Failure, InfinitySuccess, Success } from "../common-components/toast";
import CustomSelect from "../common-components/dropdown";
import { mentorList } from "@/utils/constant.utils";
import TextArea from "../common-components/textArea";
import * as Yup from "yup";
import * as Validation from "@/utils/validation.utils";
import { TextInput } from "../common-components/textInput";
import "react-phone-number-input/style.css";

import MultiSelectDropdown from "../common-components/multiSelectDropdown";
import InterestTopicsMultiSelect from "../common-components/interestTopicsMultiSelect";
import Select from "react-select";

import SingleSelectDropdown from "../common-components/singleSelectDropdown";

import PhoneInput, {
  isValidPhoneNumber,
  getCountries,
} from "react-phone-number-input";
import CustomMultiSelect from "../common-components/multi-select";
import { Eye, EyeOff, Loader } from "lucide-react";

const AlumniRegistrationForm = () => {
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
    intrested_topics1: null,
    is_alumni: false,
    year_of_entry: "",
    department: "",
    intrestedTopicsList: [],
    universityList: null,
    alumniUsername: "",
    aluminifirstname: "",
    aluminilastname: "",
    alumniEmail: "",
    alumniPhone: "",
    alumniDepartment: "",
    work: "",
    country: "",
    is_open_to_be_mentor: false,
    alumniUniversity: null,
    alumniIntrested_topics: [],
    alumniIntrested_topics1: "",
    year_of_graduation: "",
    alumniPassword: "",
    btnLoading: false,
  });


  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMounted(true);
      getUniversity();
      getIntrestedTopics();
      getCountry();
    }
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
      const dropdowns = res?.map((item) => ({
        value: item?.id,
        label: item?.name,
        code: item?.code,
      }));
      setState({ countryList: dropdowns });
    } catch (error) {
      console.log("error");
    }
  };

  // 🚀 Prevent hydration errors by ensuring the component renders only after mount
  if (!isMounted) return null;

  const AlumniRegistration = async () => {
    try {
      setState({ btnLoading: true });

      const body = {
        first_name: state?.aluminifirstname,
        last_name: state?.aluminilastname,
        email: state?.alumniEmail.trim(),
        phone_number: state?.alumniPhone,
        department: state?.alumniDepartment,
        work: state?.work,
        country: state?.country?.value,
        address: state?.address,
        year_of_graduation: state?.year_of_graduation?.value
          ? state?.year_of_graduation?.value
          : "",

        intrested_topics:
          state?.alumniIntrested_topics?.length > 0
            ? state?.alumniIntrested_topics?.map((item) => item.value)
            : [],
            lable: state?.alumniIntrested_topics1 || "",

        university: state?.alumniUniversity?.value || "", // Safely access university value
        is_open_to_be_mentor:
          state?.is_open_to_be_mentor?.value == "Yes" ? true : false,
        is_alumni: true,
        password: state.password,
      };

      // First: Run Yup validation
      await Validation.AlumniRegistration.validate(body, { abortEarly: false });

      // Then: Run custom phone validation
      if (!isValidPhoneNumber(body.phone_number)) {
        setState({
          btnLoading: false,
          errors: {
            phone_number: "Please enter a valid phone number",
          },
        });
        return;
      }

      // If all validations pass
      const res = await Models.auth.registration(body);

      setState({ btnLoading: false });

      InfinitySuccess(
        "Thank you for registering as an alumnus. Kindly visit our Programs page and email us your areas of expertise, orientation, and willingness to conduct sessions.",
        () => {
          router?.push("/login");
        }
      );

      resetForm();
    } catch (error) {
      setState({ btnLoading: false, errors: null });

      const validationErrors = {};

      if (error instanceof Yup.ValidationError) {
        error.inner.forEach((err) => {
          validationErrors[err.path] = err.message;
        });

        // ✅ Add custom phone validation too if needed
        if (!isValidPhoneNumber(state.alumniPhone)) {
          validationErrors.phone_number = "Please enter a valid phone number";
        }

        setState({ errors: validationErrors });
      } else {
        if (!isValidPhoneNumber(state.alumniPhone)) {
          validationErrors.phone_number = "Please enter a valid phone number";
        }

        setState({ errors: validationErrors });

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

  const resetForm = () => {
    setState({
      errors: null,
      aluminifirstname: "",
      aluminilastname: "",
      alumniEmail: "",
      alumniPhone: "",
      alumniDepartment: "",
      work: "",
      country: "",
      address: "",
      year_of_graduation: "",
      alumniIntrested_topics1: "",
      alumniIntrested_topics: [],
      alumniUniversity: null,
      is_open_to_be_mentor: false,
      password: "",
      errors: null,
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
            id="alumnifirstname"
            type="text"
            placeholder="Enter Your First Name"
            title="First Name"
            required
            value={state?.aluminifirstname}
            onChange={(e) =>
              setState({
                aluminifirstname: e.target.value,
                errors: { ...state.errors, first_name: "" },
              })
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
              setState({
                aluminilastname: e.target.value,
                errors: { ...state.errors, last_name: "" },
              })
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
            onChange={(e) =>
              setState({
                alumniEmail: e.target.value,
                errors: { ...state.errors, email: "" },
              })
            }
            error={state?.errors?.email}
          />
        </div>

        {/* <div className="space-y-1">
              <MultiSelectDropdown
                options={state?.countryList || []} // Safely pass empty array if universityList is null
                value={state.country?.value || ""}
                onChange={(value) =>
                  setState({ country: value, alumniPhone: "" })
                }
                error={state.errors?.country}
                title="Country"
                placeholder="Select Your Country"
              />
            </div> */}

        <div className="space-y-1">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            {"Country"}
          </label>
          <Select
            options={state.countryList || []}
            value={state.country || ""}
            onChange={(value) => {
              setState({ country: value, alumniPhone: "" });
            }}
            placeholder="Select Your Country"
            className=" text-sm"
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            isClearable
          />
        </div>
        {/* 
        <div className="space-y-1 z-0">
          <SingleSelectDropdown
            options={state?.countryList || []} // Safely pass empty array if universityList is null
            value={state.country || ""}
            onChange={(value) => {
              setState({ country: value, alumniPhone: "" });
            }}
            error={state.errors?.country}
            title="Country"
            placeholder="Select Your Country"
          />
        </div> */}
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
            onChange={(e) => setState({ alumniDepartment: e.target.value })}
          />
        </div>

        {/* <div className="space-y-1"> */}
        {/* <TextInput
                id="year_of_graduation"
                type="numeric"
                placeholder="Enter Year of Graduated"
                title="Year Graduated"
                required
                value={state.year_of_graduation}
                error={state.errors?.year_of_graduation}
                onChange={(e) =>
                  setState({ year_of_graduation: e.target.value })
                }
              /> */}

        {/* <CustomSelect
            options={years || []} // Safely pass empty array if universityList is null
            value={state.year_of_graduation?.value || ""}
            onChange={(value) =>
              setState({
                year_of_graduation: value,
                errors: { ...state.errors, year_of_graduation: "" },
              })
            }
            error={state.errors?.year_of_graduation}
            title="Year Graduated"
            placeholder="Select Year of Graduated"
            required
          /> */}

        <div className="space-y-1">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            {"Year Graduated"} {<span className="text-red-500">*</span>}
          </label>
          <Select
            options={years || []}
            value={state.year_of_graduation || ""}
            onChange={(value) =>
              setState({
                year_of_graduation: value,
                errors: { ...state.errors, year_of_graduation: "" },
              })
            }
            placeholder="Select Year of Graduated"
            className="z-0 text-sm"
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            isClearable
          />
          {state.errors?.year_of_graduation && (
            <p className="mt-2 text-sm text-red-600">
              {state.errors?.year_of_graduation}{" "}
              {/* Display the error message if it exists */}
            </p>
          )}
        </div>

        {/* <Select
            value={state.year_of_graduation}
            isMulti
            options={state.intrestedTopicsList || []}
            placeholder="Select Topics"
            onChange={(value) => setState({ alumniIntrested_topics: value })}
            className="z-50 text-sm"
            menuPortalTarget={document.body} // required when using menuPosition="fixed"
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
        </div> */}

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

        {/* <div className="space-y-1 z-0">
          <CustomSelect
            options={state?.universityList || []} // Safely pass empty array if universityList is null
            value={state.alumniUniversity?.value || ""}
            onChange={(value) => setState({ alumniUniversity: value })}
            error={state.errors?.alumniUniversity}
            placeholder="Select University"
            title="University"
          />
        </div> */}

        <div className="space-y-1">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            {"University"}
          </label>
          <Select
            options={state?.universityList || []}
            value={state.alumniUniversity || ""}
            onChange={(value) => setState({ alumniUniversity: value })}
            placeholder="Select University"
            className=" text-sm"
            menuPortalTarget={document.body}
            // styles={{ menuPortal: (base) => ({ ...base,}) }}
            isClearable
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

        {/* <div className="space-y-1">
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
        </div> */}

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
            className=" text-sm"
            name="ejkfbkjew"
            menuPortalTarget={document.body} // required when using menuPosition="fixed"
            // styles={{ menuPortal: (base) => ({ ...base}) }}
          />
        </div>

        {/* {state.alumniIntrested_topics.includes("others") && ( */}
        {Array.isArray(state.alumniIntrested_topics) &&
          state.alumniIntrested_topics.some(
            (item) => item.value === 13
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
            onChange={(value) => setState({ is_open_to_be_mentor: value })}
            error={state.errors?.is_open_to_be_mentor}
            title="Are you open to being a mentor?"
            placeholder="Select"
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
          <p style={{ fontSize: "12px" }}>min 8 characters required</p>
        </div>
      </div>
      <div className="flex justify-center gap-2">
        <Button
          // onClick={() => router?.back()}
          onClick={() => resetForm()}
          variant="outline"
          className="w-full text-themeGreen hover:text-themeGreen border-themeGreen hover:border-themeGreen"
        >
          Reset
        </Button>
        <Button
          onClick={AlumniRegistration}
          className="w-full bg-themeGreen hover:bg-themeGreen"
        >
          {state.btnLoading ? <Loader /> : "Submit"}
        </Button>
      </div>
    </>
  );
};

export default AlumniRegistrationForm;
