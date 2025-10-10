"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Models from "@/imports/models.import";
import {
  Dropdown,
  DropdownCode,
  convertUrlToFile,
  extractUsername,
  getFileNameFromUrl,
  isMenOrAlumni,
  isOnlyAlumniRole,
  isOnlyStudent,
  isOnlyStudents,
  isRole,
  isValidImageUrl,
  onlyCon,
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
import { DOMAIN, MENTOR, mentorList, ROLES } from "@/utils/constant.utils";
import ProtectedRoute from "@/components/common-components/privateRouter";
import PhoneInput, {
  isValidPhoneNumber,
  getCountries,
} from "react-phone-number-input";
import "react-phone-number-input/style.css";
import MultiSelectDropdown from "@/components/common-components/CustomSelectDropdown";
import Select from "react-select";
import { getCountryCallingCode } from "libphonenumber-js";
import Checkboxs from "@/components/ui/singleCheckbox";
import LoadMoreDropdown from "@/components/common-components/LoadMoreDropdown";
import { Input } from "@/components/ui/input";

const CreateUser = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [id, setId] = useState(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const idFromSearchParams = searchParams.get("id");
      if (idFromSearchParams) {
        setId(idFromSearchParams);
      }
    }
  }, [searchParams]);

  const groups = useSelector((state) => state.auth.groups);

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
    available_to: null,
    available_from: null,
    currentInterestPage: 1,
  });

  useEffect(() => {
    getDetails();
    getGroupList();
    getIntrestedTopics(1);
    getUniversity();
    // getCountry();
  }, [id]);

  const getGroupList = async () => {
    try {
      const res = await Models.Common.groups();
      const Dropdowns = Dropdown(res?.results, "name");
      setState({ groupList: Dropdowns });
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const getDetails = async () => {
    try {
      const res = await Models.user.getUserId(id);
      console.log("getDetails --->", res);

      const group = localStorage.getItem("group");
      setState({ group });
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

      const topic = Dropdown(res?.groups, "name");
      setState({ user_types: topic });
      if (isOnlyStudent(res?.groups)) {
        setState({
          email: res.email ? extractUsername(res.email) : "",
        });
      } else {
        setState({
          email: res.email ? res.email : "",
        });
      }

      setState({
        firstname: res.first_name ? res.first_name : "",
        lastname: res.last_name ? res.last_name : "",
        // email: res.email ? res.email : "",
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
          value: res?.groups?.[0]?.id,
          label: res?.groups?.[0]?.name,
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

  const getIntrestedTopics = async (page = 1) => {
    try {
      const res = await Models.auth.getIntrestedTopics(page);
      const Dropdownss = Dropdown(res?.results, "topic");
      const filter = Dropdownss?.filter((item) => item?.label !== "");

      setState({ intrestedTopicsList: filter, hasMoreInterest: res?.next });
      console.log("res", res);
    } catch (error) {
      console.log(error);
    }
  };

  const interestedListLoadMore = async () => {
    console.log("hello");

    try {
      if (state.hasMoreInterest) {
        console.log("hasMoreInterest");
        const res = await Models.auth.getIntrestedTopics(
          state.currentInterestPage + 1
        );
        const Dropdownss = Dropdown(res?.results, "topic");
        const filter = Dropdownss?.filter((item) => item?.label !== "");

        setState({
          intrestedTopicsList: [...state.intrestedTopicsList, ...filter],
          hasMoreInterest: res?.next,
          currentInterestPage: state.currentInterestPage + 1,
        });
      } else {
        setState({ intrestedTopicsList: state.intrestedTopicsList });
      }
    } catch (error) {
      console.log("error: ", error);
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

      if (isRole(state.user_types)) {
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
          phone_number: isRole(state.user_types)
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

          work: isRole(state.user_types) ? state?.work : undefined,
          year_of_graduation: state?.year_of_graduation?.value,
          is_open_to_be_mentor: onlyCon(state.user_types)
            ? true
            : isRole(state.user_types)
            ? state?.is_open_to_be_mentor?.value == "Yes"
              ? true
              : false
            : undefined,
          country: isRole(state.user_types) ? state?.country?.value : undefined,
          notify: state.notify,
          available_from: state.available_from,
          available_to: state.available_to,
        };

        console.log("body", body);
        await Validation.createUser.validate(body, {
          abortEarly: false,
        });

        // let groups = [state.user_types?.map((item) => item?.value)];
        let formData = new FormData();
        formData.append("first_name", body.first_name);
        formData.append("last_name", body.last_name);
        formData.append("email", body.email);
        formData.append("notify", body.notify);
        // if (state.available_from) {
        //   formData.append(
        //     "available_from",
        //     state.available_from
        //       ? moment(state.available_from).format("YYYY-MM-DD")
        //       : null
        //   );
        // }
        // if (state.available_to) {
        //   formData.append(
        //     "available_to",
        //     state.available_to
        //       ? moment(state.available_to).format("YYYY-MM-DD")
        //       : null
        //   );
        // }

        if (body.department) formData.append("department", body.department);
        if (body.phone_number)
          formData.append("phone_number", body.phone_number);
        formData.append("date_of_birth", body.dob);

        // groups.map((group) => {
        //   formData.append("groups", group);
        // });

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

        if (body.phone_number && isRole(state.user_types)) {
          formData.append("phone_number", body.phone_number);
        }
        if (body.work && isRole(state.user_types)) {
          formData.append("work", body.work);
        }

        if (body.country && isRole(state.user_types)) {
          formData.append("country", body.country);
        }

        if (body.address && isRole(state.user_types)) {
          formData.append("address", body.address);
        }

        if (body.year_of_graduation !== undefined && isRole(state.user_types)) {
          formData.append("year_of_graduation", body.year_of_graduation);
        }
        // if(body.is_open_to_be_mentor){
        formData.append("is_open_to_be_mentor", body.is_open_to_be_mentor);

        // }

        // if (
        //   (body.is_open_to_be_mentor !== undefined &&
        //     state?.user_type?.label === "Alumni") ||
        //   state?.user_type?.label === "Mentor"
        // ) {
        //   formData.append("is_open_to_be_mentor", body.is_open_to_be_mentor);
        // }
        if (body.year_of_entry && state?.user_type?.label === "Student") {
          formData.append("year_of_entry", body.year_of_entry);
        }
        await Models.user.updateUser(formData, id);
        setState({ submitLoading: false });
        router?.back();
        Success(
          `The account details for ${state.firstname} ${state.lastname} have been updated. All changes are now saved and reflected across the platform.`
        );
      } else {
        console.log("✌️else --->");
        let body = {
          first_name: state.firstname,
          last_name: state.lastname,
          // email: state.email.trim() + ,
          email: state?.email.trim() + DOMAIN,
          department:
            state?.user_type?.label !== "Admin" ||
            state?.user_type?.label === "Mentor"
              ? state?.department
              : undefined,

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
        console.log("✌️body --->", body);

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
        await Models.user.updateUser(formData, id);
        setState({ submitLoading: false });
        router?.back();
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

  const years = Array.from({ length: 2025 - 1951 + 1 }, (_, i) => {
    const year = 1951 + i;
    return { value: year.toString(), label: year.toString() };
  });

  return (
    <div className="container mx-auto updateUser pt-3 pb-3">
      <h2 className="font-semibold md:text-[20px] text-sm mb-3 pt-5">
        Update User
      </h2>
      <div className="grid auto-rows-min gap-4 md:grid-cols-2 py-4">
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

          {isOnlyStudents(state.user_types) ? (
            // <TextInput
            //   value={state.email}
            //   onChange={(e) => {
            //     setState({
            //       email: e.target.value,
            //       errors: { ...state.errors, email: "" },
            //     });
            //   }}
            //   placeholder="Email"
            //   title="Emailsss"
            //   error={state.errors?.email}
            //   required
            // />

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
              title="Email"
            />
          ) : (
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
          )}

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
                <img
                  src={state.thumbnail_image}
                  height={200}
                  width={200}
                  className="object-cover rounded-md"
                  alt="Session image"
                />
                <div
                  className="flex bg-slate-300 rounded-md p-3 items-center justify-center cursor-pointer hover:bg-slate-400 transition-colors"
                  onClick={() =>
                    setState({
                      thumbnail_image: "",
                      thumbnail_images: null,
                    })
                  }
                >
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Profile Image (size: 300x300)
              </label>
              <TextInput
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Create object URL for preview
                    const imageUrl = URL.createObjectURL(file);
                    console.log("✌️imageUrl --->", imageUrl);

                    // Set both the file for API and URL for preview
                    setState({
                      thumbnail_images: file, // File object for API upload
                      thumbnail_image: imageUrl, // Object URL for preview
                    });
                  }
                }}
                className="mt-2 w-full border border-gray-300 rounded-md p-2"
              />
            </div>
          )}
        </div>

        <div className="border rounded-xl p-4 gap-4 flex flex-col ">
          {/* <CustomSelect
            options={state.groupList}
            value={state.user_types}
            onChange={(value) =>
              setState({
                user_types: value,
                errors: { ...state.errors, user_types: "" },

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
            // isMulti
            error={state.errors?.user_type}
            required
            disabled
          /> */}

          <MultiSelectDropdown
            label="User Type"
            options={state.groupList}
            placeholder="Select User Type"
            value={state.user_types || ""}
            onChange={(value) =>
              setState({
                user_types: value,
                errors: { ...state.errors, user_types: "" },
              })
            }
            isMulti
            required
            isDisabled
            menuPortalTarget={document.body}
          />
          {
            state?.user_type?.label === "Alumni" ||
            state?.user_type?.label === "Mentor" ||
            state?.user_type?.label === ROLES.COUNSELOR ? (
              // Add the component or content you want to render for "Alumni" here
              <>
                <div className="space-y-1">
                  <MultiSelectDropdown
                    label="Year Graduated"
                    options={years || []}
                    placeholder="Select Year of Graduated"
                    value={state.year_of_graduation || ""}
                    onChange={(value) =>
                      setState({
                        year_of_graduation: value,
                        errors: { ...state.errors, year_of_graduation: "" },
                      })
                    }
                    required
                    menuPortalTarget={document.body}
                    error={state.errors?.year_of_graduation}
                  />
                  {/* <label className="block text-sm font-bold text-gray-700 mb-2">
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
                    </p>
                  )} */}
                </div>

                <TextInput
                  id="work"
                  type="text"
                  placeholder="Enter Your Work"
                  title="Job Sector / Role"
                  value={state.work}
                  onChange={(e) => setState({ work: e.target.value })}
                />

                <LoadMoreDropdown
                  value={state.country}
                  onChange={(value) => {
                    const shouldClear = shouldClearPhoneNumber(
                      value,
                      state.alumniPhone
                    );

                    setState({
                      country: value,
                      phone_number: shouldClear ? "" : state.phone_number,
                      errors: { ...state.errors, country: "" },
                    });
                  }}
                  title="Country"
                  error={state.errors?.country}
                  required
                  placeholder="Select Your Country"
                  height={34}
                  placeholderSize={"14px"}
                  loadOptions={loadCountryOptions}
                  position="top"
                />

                {/* <div className="space-y-1">
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
                </div> */}

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
                  <MultiSelectDropdown
                    label="University"
                    options={state?.universityList || []}
                    value={state.university || ""}
                    onChange={(value) =>
                      setState({
                        university: value,
                        errors: { ...state.errors, university: "" },
                      })
                    }
                    placeholder="Select University"
                    menuPortalTarget={document.body}
                    error={state.errors?.university}
                  />
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
                {isOnlyAlumniRole(state?.user_types) && (
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
                )}
                {!isRole(state?.user_types) && (
                  <>
                    <div className="space-y-1">
                      <MultiSelectDropdown
                        label="Interests in Topics"
                        value={state.intrested_topics}
                        isMulti
                        options={state.intrestedTopicsList || []}
                        placeholder="Select Topics"
                        onChange={(value) =>
                          setState({ intrested_topics: value })
                        }
                        name="topics"
                        menuPortalTarget={document.body}
                        loadMore={interestedListLoadMore}
                      />
                    </div>

                    {Array.isArray(state.intrested_topics) &&
                      state.intrested_topics.some(
                        (item) => item.value == 13
                      ) && (
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
                  </>
                )}

                {/* {rolesExceptAluAndStudent(state.user_types) && (
                  <>
                    <DatePicker
                      placeholder="Available From"
                      title="Available From"
                      error={state.errors?.available_from}
                      closeIcon={true}
                      selectedDate={state.available_from}
                      onChange={(date) => {
                        setState({
                          available_from: date,
                          errors: { ...state.errors, available_from: "" },
                        });
                      }}
                    />

                    <DatePicker
                      placeholder="Available To"
                      title="Available To"
                      fromDate={state.available_from}
                      error={state.errors?.available_to}
                      closeIcon={true}
                      selectedDate={state.available_to}
                      onChange={(date) => {
                        setState({
                          available_to: date,
                          errors: { ...state.errors, available_to: "" },
                        });
                      }}
                    />
                  </>
                )} */}

                {!isRole(state?.user_types) && (
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
                )}
              </>
            ) : state?.user_type?.label === "Student" ? (
              <>
                <div className="space-y-1">
                  <MultiSelectDropdown
                    label="Year of Entry"
                    options={years || []}
                    placeholder="Year Of Entry"
                    value={state.year_of_entry || ""}
                    onChange={(value) =>
                      setState({
                        year_of_entry: value,
                        errors: { ...state.errors, year_of_entry: "" },
                      })
                    }
                    menuPortalTarget={document.body}
                    error={state.errors?.year_of_entry}
                  />

                  {/* <label className="block text-sm font-bold text-gray-700 mb-2">
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
                    </p>
                  )} */}
                </div>
                <div className="space-y-1">
                  <MultiSelectDropdown
                    label="University"
                    options={state?.universityList || []}
                    value={state.university || ""}
                    onChange={(value) =>
                      setState({
                        university: value,
                        errors: { ...state.errors, university: "" },
                      })
                    }
                    placeholder="Select University"
                    menuPortalTarget={document.body}
                    error={state.errors?.university}
                  />
                  {/* <label className="block text-sm font-bold text-gray-700 mb-2">
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
                    </p>
                  )} */}
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
                  <MultiSelectDropdown
                    label="Interests in Topics"
                    value={state.intrested_topics}
                    isMulti
                    options={state.intrestedTopicsList || []}
                    placeholder="Select Topics"
                    onChange={(value) => setState({ intrested_topics: value })}
                    name="topics"
                    menuPortalTarget={document.body}
                  />
                  {/* <label className="block text-sm font-bold text-gray-700 mb-2">
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
                    position="top"
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                  /> */}
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
            <PrimaryButton
              variant={"outline"}
              name="Cancel"
              className="border-themeGreen hover:border-themeGreen text-themeGreen hover:text-themeGreen "
              onClick={() => router.push("/user-list")}
            />

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
