"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Models from "@/imports/models.import";
import {
  Dropdown,
  convertUrlToFile,
  getFileNameFromUrl,
  isValidImageUrl,
  useSetState,
} from "@/utils/function.utils";
import { TextInput } from "@/components/common-components/textInput";
import TextArea from "@/components/common-components/textArea";
import { DatePicker } from "@/components/common-components/datePicker";
import CustomSelect from "@/components/common-components/dropdown";
import TimePicker from "@/components/common-components/timePicker";
import moment from "moment";
import { useRouter, useSearchParams } from "next/navigation";
import * as Yup from "yup";
import * as Validation from "../../../utils/validation.utils";
import { Failure, Success } from "@/components/common-components/toast";
import { Trash2, Square, Check } from "lucide-react";
import PrimaryButton from "@/components/common-components/primaryButton";
import { useSelector } from "react-redux";
import { mentorList } from "@/utils/constant.utils";
import ProtectedRoute from "@/components/common-components/privateRouter";
import SingleSelectDropdown from "@/components/common-components/singleSelectDropdown";

import PhoneInput, {
  isValidPhoneNumber,
  getCountries,
} from "react-phone-number-input";
import "react-phone-number-input/style.css";
import MultiSelectDropdown from "@/components/common-components/multiSelectDropdown";
import Select from "react-select";
import { getCountryCallingCode } from "libphonenumber-js";
import Checkboxs from "@/components/ui/singleCheckbox";

const CreateUser = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [id, setId] = useState(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const idFromSearchParams = searchParams.get("id");
      console.log("idFromSearchParams: ", idFromSearchParams);
      if (idFromSearchParams) {
        setId(idFromSearchParams);
      }
    }
  }, [searchParams]);

  const [state, setState] = useSetState({
    firstname: "",
    lastname: "",
    email: "",
    phone_number: "",
    address: "",
    dob: "",
    user_type: {},
    thumbnail_image: "",
    groupList: [],
    submitLoading: false,
    department: "",
    intrested_topics: null,
    intrested_topics1: "",
    intrestedTopicsList: null,
    universityList: null,
    mentorList: [],
    is_open_to_be_mentor: false,
    university: null,
    year_of_entry: "",
    year_of_graduation: "",
    work: "",
    country: null,
    countryList: [],
    notify: false,
  });

  useEffect(() => {
    getDetails();
    getGroupList();
    getIntrestedTopics();
    getUniversity();
    getCountry();
  }, [id]);

  useEffect(() => {
    const preventBackNavigation = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener("popstate", preventBackNavigation);

    return () => {
      window.removeEventListener("popstate", preventBackNavigation);
    };
  }, []);

  const getGroupList = async () => {
    try {
      const res = await Models.Common.groups();
      const Dropdowns = Dropdown(res?.results, "name");
      const filter = Dropdowns.filter((item) => item?.value != 5);
      setState({ groupList: filter });
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const getDetails = async () => {
    try {
      const res = await Models.user.getUserId(id);

      if (res?.profile_picture) {
        const fileName = getFileNameFromUrl(res?.profile_picture);
        const thumbnail = await convertUrlToFile(
          res?.profile_picture,
          fileName
        );
        setState({
          thumbnail_images: thumbnail,
          thumbnail_image: res?.profile_picture,
        });
      }

      setState({
        firstname: res.first_name ? res.first_name : "",
        lastname: res.last_name ? res.last_name : "",
        email: res.email ? res.email : "",
        intrested_topics1: res?.lable,
        notify: res?.notify || false,
        address: res.address ? res.address : "",
        phone_number: res?.phone_number ? res?.phone_number : "",
        year_of_entry: res?.year_of_entry
          ? {
              value: res?.year_of_entry.toString(),
              label: res?.year_of_entry.toString(),
            }
          : null,
        // year_of_graduation: res?.year_of_graduation
        //   ? res?.year_of_graduation
        //   : "",

        year_of_graduation: res?.year_of_graduation
          ? {
              value: res?.year_of_graduation,
              label: res?.year_of_graduation,
            }
          : null,
        work: res?.work ? res?.work : "",
        department: res?.department ? res?.department : "",
        university: res?.university
          ? {
              value: res?.university?.id,
              label: res?.university?.name,
            }
          : null,
        intrested_topics:
          res?.intrested_topics?.length > 0
            ? res?.intrested_topics?.map((item) => ({
                value: item?.id,
                label: item?.topic,
              }))
            : [],

        country: res?.country
          ? {
              value: res?.country?.id,
              label: res?.country?.name,
              code: res?.country?.code,
            }
          : null,
        is_open_to_be_mentor: {
          value: res?.is_open_to_be_mentor == true ? "Yes" : "No",
          label: res?.is_open_to_be_mentor == true ? "Yes" : "No",
        },
        dob: res.date_of_birth ? new Date(res.date_of_birth) : "",
        user_type: {
          value: res?.group?.id,
          label: res?.group?.name,
        },
      });
    } catch (error) {
      console.log("error: ", error);
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

  // const getCountry = async () => {
  //   try {
  //     const res = await Models.auth.getCountries();
  //     const Dropdowns = Dropdown(res?.results, "name");
  //     setState({ countryList: Dropdowns });
  //     console.log("res", res);
  //   } catch (error) {
  //     console.log("error");
  //   }
  // };

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

  const getIntrestedTopics = async () => {
    try {
      const res = await Models.auth.getIntrestedTopics();
      const Dropdowns = Dropdown(res?.results, "topic");

      setState({ intrestedTopicsList: Dropdowns });
      console.log("res", res);
    } catch (error) {
      console.log(error);
    }
  };

  function shouldClearPhoneNumber(selectedCountry, currentPhone) {
    if (!selectedCountry?.code || !currentPhone?.startsWith("+")) return false;

    try {
      const selectedCallingCode = getCountryCallingCode(selectedCountry.code); // e.g., '91'
      const expectedPrefix = `+${selectedCallingCode}`;

      // ✅ If phone starts with +91 and selected country is also 91 → DON'T clear
      // ❌ If phone starts with +91 and selected country is something else → CLEAR
      return !currentPhone.startsWith(expectedPrefix);
    } catch (err) {
      console.error("Phone check failed:", err);
      return false;
    }
  }

  const onSubmit = async () => {
    try {
      setState({ submitLoading: true });
      console.log("state?.intrested_topics: ", state?.intrested_topics);

      if (state.user_type?.label === "Alumni") {
        let body = {
          first_name: state.firstname,
          last_name: state.lastname,
          email: state.email.trim(),
          department:
            state?.user_type?.label !== "Admin" ? state?.department : undefined,
          address: state.address || "",
          dob: state.dob ? moment(state.dob).format("YYYY-MM-DD") : "",
          user_type: state.user_type?.value,
          thumbnail_image: state.thumbnail_images || "",
          phone_number:
            state?.user_type?.label === "Alumni"
              ? state.phone_number
              : undefined,
          year_of_entry:
            state?.user_type?.label === "Student"
              ? state.year_of_entry?.value
              : undefined,
          university:
            state?.user_type?.label !== "Admin"
              ? state?.university?.value
              : undefined,
          // intrested_topics:
          //   state?.user_type?.label !== "Admin"
          //     ? state?.intrested_topics?.label == "Others"
          //       ? state?.intrested_topics1
          //       : state?.intrested_topics?.label
          //     : undefined,
          intrested_topics:
            state?.intrested_topics?.length > 0
              ? state?.intrested_topics?.map((item) => item.value)
              : [],

          work: state?.user_type?.label === "Alumni" ? state?.work : undefined,
          year_of_graduation: state?.year_of_graduation?.value,
          is_open_to_be_mentor:
            state?.user_type?.label === "Alumni"
              ? state?.is_open_to_be_mentor?.value == "Yes"
                ? true
                : false
              : undefined,
          country:
            state?.user_type?.label === "Alumni"
              ? state?.country?.value
              : undefined,
          notify: state.notify,
        };

        console.log("body", body);
        await Validation.createUser.validate(body, {
          abortEarly: false,
        });

        let groups = [state.user_type?.value];
        let formData = new FormData();
        formData.append("first_name", body.first_name);
        formData.append("last_name", body.last_name);
        formData.append("email", body.email);
        formData.append("notify", body.notify);

        if (body.department) formData.append("department", body.department);
        if (body.phone_number)
          formData.append("phone_number", body.phone_number);
        formData.append("date_of_birth", body.dob);

        groups.forEach((group) => {
          formData.append("groups", group?.toString());
        });

        if (body.thumbnail_image) {
          formData.append("profile_picture", body.thumbnail_image);
        } else {
          formData.append("profile_picture", "");
        }

        // if (state?.user_type?.label !== "Admin") {
        if (body.university) {
          formData.append("university", body.university);
        } else {
          formData.append("university", "");
        }

        if (body?.intrested_topics?.length > 0) {
          body.intrested_topics.forEach((topicId) => {
            formData.append("intrested_topics", topicId);
          });
          if (body?.intrested_topics?.some((item) => item == 13)) {
            formData.append("lable", state?.intrested_topics1);
          } else {
            formData.append("lable", "");
          }
        }
        // }

        if (body.phone_number && state?.user_type?.label === "Alumni") {
          formData.append("phone_number", body.phone_number);
        }
        if (body.work && state?.user_type?.label === "Alumni") {
          formData.append("work", body.work);
        }

        if (body.country && state?.user_type?.label === "Alumni") {
          formData.append("country", body.country);
        }

        if (body.address && state?.user_type?.label === "Alumni") {
          formData.append("address", body.address);
        }

        if (
          body.year_of_graduation !== undefined &&
          state?.user_type?.label === "Alumni"
        ) {
          formData.append("year_of_graduation", body.year_of_graduation);
        }

        if (
          body.is_open_to_be_mentor !== undefined &&
          state?.user_type?.label === "Alumni"
        ) {
          formData.append("is_open_to_be_mentor", body.is_open_to_be_mentor);
        }
        if (body.year_of_entry && state?.user_type?.label === "Student") {
          formData.append("year_of_entry", body.year_of_entry);
        }
        const res = await Models.user.updateUser(formData, id);
        console.log("updated --->", res);
         localStorage.setItem(
          "username",
          `${res?.first_name || ""} ${res?.last_name || ""}`
        );
        localStorage.setItem("group", res.groups?.[0] || "");
        setState({ submitLoading: false });
        router.push("/");
        // setTimeout(() => {
        //   window.location.reload();
        // }, 100);

        Success(
          `The account details for ${state.firstname} ${state.lastname} have been updated. All changes are now saved and reflected across the platform.`
        );
      } else {
        let body = {
          first_name: state.firstname,
          last_name: state.lastname,
          email: state.email.trim(),
          department:
            state?.user_type?.label !== "Admin" ? state?.department : undefined,

          user_type: state.user_type?.value,
          thumbnail_image: state.thumbnail_images || "",

          year_of_entry:
            state?.user_type?.label === "Student"
              ? state.year_of_entry?.value
              : undefined,
          university:
            state?.user_type?.label !== "Admin"
              ? state?.university?.value
              : undefined,
          intrested_topics:
            state?.intrested_topics?.length > 0
              ? state?.intrested_topics?.map((item) => item?.value)
              : [],
          notify: state.notify,
        };

        await Validation.createStudentUser.validate(body, {
          abortEarly: false,
        });

        let groups = [state.user_type?.value];
        let formData = new FormData();
        formData.append("first_name", body.first_name);
        formData.append("last_name", body.last_name);
        formData.append("email", body.email);
        formData.append("notify", body.notify);

        if (body.department) formData.append("department", body.department);

        if (body?.intrested_topics?.length > 0) {
          body.intrested_topics.forEach((topicId) => {
            formData.append("intrested_topics", topicId);
          });
          if (body?.intrested_topics?.some((item) => item == 13)) {
            formData.append("lable", state?.intrested_topics1);
          } else {
            formData.append("lable", "");
          }
        }

        groups.forEach((group) => {
          formData.append("groups", group?.toString());
        });

        if (body.thumbnail_image) {
          formData.append("profile_picture", body.thumbnail_image);
        } else {
          formData.append("profile_picture", "");
        }
        if (body.university) formData.append("university", body.university);

        if (body.year_of_entry && state?.user_type?.label === "Student") {
          formData.append("year_of_entry", body.year_of_entry);
        }
        const res = await Models.user.updateUser(formData, id);
        console.log("updated 1--->", res);

        localStorage.setItem(
          "username",
          `${res?.first_name || ""} ${res?.last_name || ""}`
        );
        localStorage.setItem("group", res.groups?.[0] || "");

        setState({ submitLoading: false });
        router.push("/");
        // setTimeout(() => {
        //   window.location.reload();
        // }, 100);

        Success(
          `The account details for ${state.firstname} ${state.lastname} have been updated. All changes are now saved and reflected across the platform.`
        );
      }
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        console.log("state?.intrested_topics: ", state?.intrested_topics);

        console.log("validationErrors: ", validationErrors);

        // Set validation errors in state
        setState({ errors: validationErrors });
        setState({ submitLoading: false }); // Stop loading after error
      } else {
        setState({ submitLoading: false }); // Stop loading after unexpected error
        if (error?.email) {
          Failure(error.email[0]);
        } else {
          Failure("An error occurred. Please try again.");
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
        phone_number: value,
      });
    } else {
      setState({
        errors: { ...state.errors, phone_number: "" },
        phone_number: value,
      });
    }
  };

  const years = Array.from({ length: 2025 - 1951 + 1 }, (_, i) => {
    const year = 1951 + i;
    return { value: year.toString(), label: year.toString() };
  });

  console.log("✌️notify --->", state.notify);

  return (
    <div className="container mx-auto updateUser">
      <h2 className="font-bold md:text-[20px] text-sm mb-3">Update User</h2>
      <div className="grid auto-rows-min gap-4 md:grid-cols-2">
        <div className="border rounded-xl p-4 gap-4 flex flex-col ">
          <TextInput
            value={state.firstname}
            onChange={(e) => {
              setState({
                firstname: e.target.value,
                errors: { ...state.errors, first_name: "" },
              });
            }}
            placeholder="First Name"
            title="First Name"
            error={state.errors?.first_name}
            required
          />

          <TextInput
            value={state.lastname}
            onChange={(e) => {
              setState({
                lastname: e.target.value,
                errors: { ...state.errors, last_name: "" },
              });
            }}
            placeholder="Last Name"
            title="Last Name"
            error={state.errors?.last_name}
            required
          />

          <TextInput
            value={state.email}
            onChange={(e) => {
              setState({
                email: e.target.value,
                errors: { ...state.errors, email: "" },
              });
            }}
            placeholder="Email"
            title="Email"
            error={state.errors?.email}
            required
          />

          {/* <DatePicker
            placeholder="Date Of Birth"
            title="Date Of Birth"
            selectedDate={state.dob}
            onChange={(date) => {
              console.log("date: ", date);
              setState({
                dob: date,
              });
            }}
            // error={state.errors?.dob}
            // required
          /> */}
          {isValidImageUrl(state.thumbnail_image) ? (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Session Image
              </label>
              <div className="flex items-center md:gap-10 gap-2">
                <img src={state.thumbnail_image} height={200} width={200} />
                <div
                  className=" flex bg-slate-300 rounded-md p-3 items-center justify-center"
                  onClick={() =>
                    setState({ thumbnail_image: "", thumbnail_images: "" })
                  }
                >
                  <Trash2 className="  h-6 w-6 cursor-pointer text-red-600" />
                </div>
              </div>
            </div>
          ) : (
            <TextInput
              title="Profile Image (size: 300x300)"
              placeholder="Profile Image"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const imageUrl = URL.createObjectURL(file); // Generate preview URL
                setState({
                  thumbnail_images: file, // Store actual file
                  thumbnail_image: imageUrl, // Use preview URL instead of fakepath
                });
              }}
              className="mt-2 w-full"
              type="file"
            />
          )}
        </div>

        <div className="border rounded-xl p-4 gap-4 flex flex-col ">
          <CustomSelect
            options={state.groupList}
            value={state.user_type?.value || ""}
            onChange={(value) =>
              setState({
                user_type: value,
                errors: { ...state.errors, user_type: "" },

                // phone_number: "",
                // year_of_graduation: "",
                // work: "",
                // country: null,
                // address: "",
                // is_open_to_be_mentor: null,
                // year_of_entry: "",
              })
            }
            title="User Type"
            error={state.errors?.user_type}
            required
          />
          {
            state?.user_type?.label === "Alumni" ? (
              // Add the component or content you want to render for "Alumni" here
              <>
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
                    className=" text-sm"
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                    isClearable
                  />
                  {state.errors?.year_of_graduation && (
                    <p className="mt-2 text-sm text-red-600">
                      {state.errors?.year_of_graduation}{" "}
                      {/* Display the error message if it exists */}
                    </p>
                  )}
                </div>

                <TextInput
                  id="work"
                  type="text"
                  placeholder="Enter Your Work"
                  title="Job Sector / Role"
                  value={state.work}
                  onChange={(e) => setState({ work: e.target.value })}
                />

                <div className="space-y-1">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {"Country"} <span className="text-red-500">*</span>
                  </label>
                  <div className="phone-input-wrapper pt-1">
                    <Select
                      options={state.countryList || []}
                      value={state.country || ""}
                      onChange={(value) => {
                        const shouldClear = shouldClearPhoneNumber(
                          value,
                          state.phone_number
                        );
                        setState({
                          country: value,
                          phone_number: shouldClear ? "" : state.phone_number,
                        });
                        // setState({ country: value, phone_number: "" });
                      }}
                      placeholder="Select Your Country"
                      className=" text-sm"
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      }}
                      isClearable
                    />
                    {state.errors?.country && (
                      <p className="mt-2 text-sm text-red-600">
                        {state.errors?.country}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-bold text-gray-700">
                    Phone Number {""} <span className="text-red-500">*</span>
                  </label>
                  <div className="phone-input-wrapper pt-1">
                    <PhoneInput
                      placeholder="Enter phone number"
                      country={state.country?.code}
                      defaultCountry={state.country?.code}
                      value={state.phone_number}
                      onChange={handlePhoneChange}
                      international
                      className="custom-phone-input"
                      //          countryCallingCodeEditable={false} // 🔒 disables editing country code
                      // countrySelectComponent={() => null}
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
                    value={state.university || ""}
                    onChange={(value) =>
                      setState({
                        university: value,
                        errors: { ...state.errors, university: "" },
                      })
                    }
                    placeholder="Select University"
                    className="z-50 text-sm"
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                    isClearable
                    required
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
                    title="Department"
                    value={state.department}
                    onChange={(e) =>
                      setState({
                        department: e.target.value,
                        errors: { ...state.errors, department: "" },
                      })
                    }
                    error={state.errors?.department}
                    required
                  />
                </div>

                <TextArea
                  name="Address"
                  value={state.address}
                  onChange={(e) => {
                    setState({ address: e.target.value });
                  }}
                  className="mt-2 w-full"
                  placeholder="Address"
                  title="Address"
                />
                <CustomSelect
                  options={mentorList || []}
                  value={state.is_open_to_be_mentor?.value || ""}
                  onChange={(value) =>
                    setState({ is_open_to_be_mentor: value })
                  }
                  error={state.errors?.is_open_to_be_mentor}
                  title="Are you open to being a mentor?"
                  placeholder="Select"
                />

                <div className="space-y-1">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {"Interests in Topics"}
                  </label>
                  <Select
                    value={state.intrested_topics}
                    isMulti
                    options={state.intrestedTopicsList || []}
                    placeholder="Select Topics"
                    onChange={(value) => setState({ intrested_topics: value })}
                    className="z-50 text-sm"
                    menuPortalTarget={document.body} // required when using menuPosition="fixed"
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                  />
                </div>

                {Array.isArray(state.intrested_topics) &&
                  state.intrested_topics.some((item) => item.value == 13) && (
                    <div className="space-y-1">
                      <TextInput
                        id="intrested_topics1"
                        type="text"
                        placeholder="Enter Your Intrested Topics"
                        title="New Topics"
                        value={state.intrested_topics1}
                        onChange={(e) =>
                          setState({ intrested_topics1: e.target.value })
                        }
                      />
                    </div>
                  )}

                <div className="pt-2 pb-2">
                  <Checkboxs
                    label={"Notify me on these topics"}
                    checked={state.notify}
                    onChange={(val) => {
                      console.log("✌️val --->", val);
                      setState({ notify: val });
                    }}
                  />
                </div>
              </>
            ) : state?.user_type?.label === "Student" ? (
              <>
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {"Year of Entry"} {<span className="text-red-500">*</span>}
                  </label>
                  <Select
                    options={years || []}
                    value={state.year_of_entry || ""}
                    onChange={(value) =>
                      setState({
                        year_of_entry: value,
                        errors: { ...state.errors, year_of_entry: "" },
                      })
                    }
                    placeholder="Year Of Entry"
                    className="z-50 text-sm"
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
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
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {"University"} {<span className="text-red-500">*</span>}
                  </label>
                  <Select
                    options={state?.universityList || []}
                    value={state.university || ""}
                    onChange={(value) =>
                      setState({
                        university: value,
                        errors: { ...state.errors, university: "" },
                      })
                    }
                    placeholder="Select University"
                    className="z-50 text-sm"
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                    isClearable
                    required
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
                    title="Department"
                    value={state.department}
                    onChange={(e) =>
                      setState({
                        department: e.target.value,
                        errors: { ...state.errors, department: "" },
                      })
                    }
                    error={state.errors?.department}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {"Interests in Topics"}
                  </label>
                  <Select
                    value={state.intrested_topics}
                    isMulti
                    options={state.intrestedTopicsList || []}
                    placeholder="Select Topics"
                    onChange={(value) => setState({ intrested_topics: value })}
                    className="z-50 text-sm"
                    menuPortalTarget={document.body} // required when using menuPosition="fixed"
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                  />
                </div>

                {Array.isArray(state.intrested_topics) &&
                  state.intrested_topics.some((item) => item.value == 13) && (
                    <div className="space-y-1">
                      <TextInput
                        id="intrested_topics1"
                        type="text"
                        placeholder="Enter Your Intrested Topics"
                        title="Interests in Topics"
                        value={state.intrested_topics1}
                        onChange={(e) =>
                          setState({ intrested_topics1: e.target.value })
                        }
                      />
                    </div>
                  )}
                <div className="pt-2 pb-2">
                  <Checkboxs
                    label={"Notify me on these topics"}
                    checked={state.notify}
                    onChange={(val) => setState({ notify: val })}
                  />
                </div>
              </>
            ) : null // If neither "Alumni" nor "student", nothing will be rendered
          }

          <div className="flex justify-end gap-5 mt-10">
            {/* <PrimaryButton
              variant={"outline"}
              name="Cancel"
              className="border-themeGreen hover:border-themeGreen text-themeGreen hover:text-themeGreen "
              onClick={() => router.push("/user-list")}
            /> */}

            <PrimaryButton
              name="Submit"
              className="bg-themeGreen hover:bg-themeGreen"
              onClick={() => onSubmit()}
              loading={state.submitLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtectedRoute(CreateUser);
