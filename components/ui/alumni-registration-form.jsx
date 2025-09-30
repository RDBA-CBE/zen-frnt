"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dropdown, DropdownCode, useSetState } from "@/utils/function.utils";
import Models from "@/imports/models.import";
import { Failure, InfinitySuccess, Success } from "../common-components/toast";
import CustomSelect from "../common-components/dropdown";
import { CLIENT_ID, mentorList } from "@/utils/constant.utils";
import TextArea from "../common-components/textArea";
import * as Yup from "yup";
import * as Validation from "@/utils/validation.utils";
import { TextInput } from "../common-components/textInput";
import "react-phone-number-input/style.css";
import Select from "react-select";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { Eye, EyeOff, Loader } from "lucide-react";
import { getCountryCallingCode } from "libphonenumber-js";
import Checkboxs from "./singleCheckbox";
import { useDispatch } from "react-redux";
import LoadMoreDropdown from "../common-components/LoadMoreDropdown";

const AlumniRegistrationForm = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false); // Track mounting state
  const dispatch = useDispatch();

  const [googleAuthInitialized, setGoogleAuthInitialized] = useState(false);

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
    notify: false,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMounted(true);
      getUniversity();
      getIntrestedTopics();
      // getCountry();
    }
  }, []);

  const updateUserGroup = async (res) => {
    try {
      let formData = new FormData();

      formData.append("groups", [3]);

      await Models.user.updateUser(formData, res?.user_id);

      router.push(`/update-user-data?id=${res?.user_id}`);

      console.log("res", res);
    } catch (error) {
      console.log("error", error);
    }
  };

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
      const body = {
        pagination: false,
      };
      const res = await Models.auth.getCountries(body);
      const dropdowns = res?.map((item) => ({
        value: item?.id,
        label: item?.name,
        code: item?.code,
      }));
      console.log("✌️dropdowns --->", dropdowns);

      setState({ countryList: dropdowns });
    } catch (error) {
      console.log("error");
    }
  };

  function shouldClearPhoneNumber(selectedCountry, currentPhone) {
    if (!selectedCountry?.code || !currentPhone?.startsWith("+")) return false;
    try {
      const selectedCallingCode = getCountryCallingCode(selectedCountry.code); // e.g., '91'
      const expectedPrefix = `+${selectedCallingCode}`;

      return !currentPhone.startsWith(expectedPrefix);
    } catch (err) {
      console.error("Phone check failed:", err);
      return false;
    }
  }

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
        notify: state.notify,
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
      notify: false,
    });
  };

  const years = Array.from({ length: 2025 - 1951 + 1 }, (_, i) => {
    const year = 1951 + i;
    return { value: year.toString(), label: year.toString() };
  });

  const loadCountryOptions = async (search, loadedOptions, { page = 1 }) => {
    try {
      const body = {
        pagination: true,
        search,
        page,
      };
      const res = await Models.auth.getCountries(body);
      const Dropdowns = DropdownCode(res?.results, "name");
      return {
        options: Dropdowns,
        hasMore: !!res?.next,
        additional: {
          page: page + 1,
        },
      };
    } catch (error) {
      return {
        options: [],
        hasMore: false,
        additional: {
          page: page,
        },
      };
    }
  };

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

        <div className="space-y-1">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            {"Country"} <span className="text-red-500">*</span>
          </label>
          {/* <Select
            options={state.countryList || []}
            value={state.country || ""}
            onChange={(value) => {
               const clearPhone = shouldClearPhoneNumber(value, state.alumniPhone);

               console.log("clearPhone",clearPhone);
               
              setState({ country: value,
                  alumniPhone: clearPhone ? "" : state.alumniPhone,
                 });
            }}
            placeholder="Select Your Country"
            className=" text-sm"
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            isClearable
          /> */}
          <div className="phone-input-wrapper ">
            {/* <CustomSelect
              options={state.countryList}
              // value={state.registration_status?.value || ""}
              value={state.country?.value || ""}
              onChange={(value) => {
                const shouldClear = shouldClearPhoneNumber(
                  value,
                  state.alumniPhone
                );

                setState({
                  country: value,
                  alumniPhone: shouldClear ? "" : state.alumniPhone,
                  errors: { ...state.errors, country: "" },
                });
              }}
              title="Country"
              error={state.errors?.country}
              required
              placeholder="Select Country"
            /> */}

            <LoadMoreDropdown
              value={state.country}
              onChange={(value) => {
                const shouldClear = shouldClearPhoneNumber(
                  value,
                  state.alumniPhone
                );

                setState({
                  country: value,
                  alumniPhone: shouldClear ? "" : state.alumniPhone,
                  errors: { ...state.errors, country: "" },
                });
              }}
              error={state.errors?.country}
              required
              placeholder="Select Your Country"
              height={34}
              placeholderSize={"14px"}
              loadOptions={loadCountryOptions}
            />
            {/* <Select
              options={state.countryList || []}
              value={state.country || ""}
              onChange={(value) => {
                const shouldClear = shouldClearPhoneNumber(
                  value,
                  state.alumniPhone
                );

                setState({
                  country: value,
                  alumniPhone: shouldClear ? "" : state.alumniPhone,
                  errors: { ...state.errors, country: "" },
                });
              }}
              placeholder="Select Your Country"
              className="text-sm"
              menuPortalTarget={document.body}
              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              isClearable
              // filterOption={(data,option)=>filterOption(data,option)}
            /> */}
            {state.errors?.country && (
              <p className="mt-2 text-sm text-red-600">
                {state.errors?.country}
              </p>
            )}
          </div>
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
              // countryCallingCodeEditable={false} // 🔒 disables editing country code
              // countrySelectComponent={() => null}
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
          <label className="block text-sm font-bold text-gray-700 mb-2">
            {"University"} {<span className="text-red-500">*</span>}
          </label>
          <Select
            options={state?.universityList || []}
            value={state.alumniUniversity || ""}
            onChange={(value) =>
              setState({
                alumniUniversity: value,
                errors: { ...state.errors, university: "" },
              })
            }
            placeholder="Select University"
            className=" text-sm"
            menuPortalTarget={document.body}
            // styles={{ menuPortal: (base) => ({ ...base,}) }}
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
            id="alumniDepartment"
            type="text"
            placeholder="Enter Your Department Name"
            title="Department"
            value={state.alumniDepartment}
            onChange={(e) =>
              setState({
                alumniDepartment: e.target.value,
                errors: { ...state.errors, department: "" },
              })
            }
            required
            error={state?.errors?.department}
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
            title="Job Sector / Role"
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
            {"Interests in Topics"}
          </label>
          <Select
            value={state.alumniIntrested_topics}
            isMulti
            options={state.intrestedTopicsList || []}
            placeholder="Select Topics"
            onChange={(value) => setState({ alumniIntrested_topics: value })}
            className=" text-sm"
            name="topics"
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            menuPortalTarget={document.body}
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

        {/* {state.alumniIntrested_topics.includes("others") && ( */}
        {Array.isArray(state.alumniIntrested_topics) &&
          state.alumniIntrested_topics.some((item) => item.value === 13) && (
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
      <div className="pt-2 pb-2">
        <Checkboxs
          label={"Notify me on these topics"}
          checked={state.notify}
          onChange={(val) => setState({ notify: val })}
        />
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

      {/* <div className="relative  p-4">
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
        <div id="googleButtonContainer" className="flex justify-center"></div>

      </div> */}
    </>
  );
};

export default AlumniRegistrationForm;
