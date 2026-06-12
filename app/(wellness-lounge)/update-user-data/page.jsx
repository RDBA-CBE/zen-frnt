"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Models from "@/imports/models.import";
import {
  Dropdown,
  DropdownCode,
  capitalizeFLetter,
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
import { useParams, useRouter, useSearchParams } from "next/navigation";
import * as Yup from "yup";
import * as Validation from "../../../utils/validation.utils";
import {
  Failure,
  InfinitySuccess,
  Success,
} from "@/components/common-components/toast";
import { Trash2, Square, Check } from "lucide-react";
import PrimaryButton from "@/components/common-components/primaryButton";
import { useDispatch, useSelector } from "react-redux";
import { DOMAIN, INDIVIDUAL, mentorList, ROLE, ROLES } from "@/utils/constant.utils";
import ProtectedRoute from "@/components/common-components/privateRouter";
import SingleSelectDropdown from "@/components/common-components/singleSelectDropdown";

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
import { setAuthData } from "@/store/slice/AuthSlice";
import { Input } from "@/components/ui/input";

const CreateUser = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const params = useParams();
  console.log("✌️params --->", params);

  const dispatch = useDispatch();

  const [id, setId] = useState(null);

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
    currentInterestPage: 1,
  });

  useEffect(() => {
    getDetails();
    getGroupList();
    getIntrestedTopics(1);
    getUniversity();
    // getCountry();
  }, [id]);

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      deleteUser();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const deleteUser = async (row) => {
    try {
      const localId = localStorage.getItem("userId");
      await Models.user.delete(localId);
      localStorage.clear();
      window.location.href = "/";
    } catch (error) {
      setState({ deleteLoading: false });

      console.log("error: ", error);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const StoredUsername = localStorage.getItem("username");

      console.log("✌️StoredUsername --->", StoredUsername);
      if (StoredUsername) {
        setState({ firstname: StoredUsername });
      }
      const idFromSearchParams = searchParams.get("id");
      const localId = localStorage.getItem("userId");
      console.log("idFromSearchParams: ", idFromSearchParams);

      if (idFromSearchParams) {
        setId(idFromSearchParams);
      } else {
        setId(localId);
      }
    }
  }, [searchParams]);

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

      if (res?.groups?.length > 0) {
        setState({
          user_type: {
            value: res?.groups[0]?.id,
            label: res?.groups[0]?.name,
          },
        });
      }
      setState({
        // firstname: res.first_name ? res.first_name : "",
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
      console.log("state?.intrested_topics: ", state?.intrested_topics);

      // if (
      //   state.user_type?.label === ROLES.ALUMNI ||
      //   state?.user_type?.label === ROLES.COUNSELOR ||
      //   state?.user_type?.label === ROLES.GROUP
      // ) {
        let body = {
          first_name: capitalizeFLetter(state.firstname),
          last_name: state.lastname,
          email: state.email.trim(),
          department:
            state?.user_type?.label !== "Admin" ? state?.department : undefined,
          address: state.address || "",
          dob: state.dob ? moment(state.dob).format("YYYY-MM-DD") : "",
          user_type: state.user_type?.value,
          thumbnail_image: state.thumbnail_images || "",
          phone_number:
            state?.user_type?.label === ROLES.ALUMNI ||
            state?.user_type?.label === ROLES.COUNSELOR
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
              : state?.user_type?.label === ROLES.COUNSELOR
              ? true
              : undefined,
          country:
            state?.user_type?.label === ROLES.ALUMNI ||
            state?.user_type?.label === ROLES.COUNSELOR
              ? state?.country?.value
              : undefined,
          age: state?.groupAge,
          is_married: state?.is_married?.value || "",
          kids: state?.kids,
          geo_detail: capitalizeFLetter(state?.geo_detail),
          gender: state?.groupGender?.value || "",
          notify: state.notify,
        };

        console.log("body", body);

        // if (state?.user_type?.label === "Alumni") {
        //   await Validation.createUser.validate(body, {
        //     abortEarly: false,
        //   });
        // } else if (state?.user_type?.label === ROLES.GROUP) {
          await Validation.groupUser.validate(body, {
            abortEarly: false,
          });
        // } else {
        //   await Validation.updateUser.validate(body, {
        //     abortEarly: false,
        //   });
        // }

        let groups = [state.user_type?.value];
        let formData = new FormData();
        formData.append("first_name", body.first_name);
        formData.append("last_name", body.last_name);
        formData.append("email", body.email);
        formData.append("notify", body.notify);
        formData.append("is_registering", true);

        if (body.department) formData.append("department", body.department);
        if (body.phone_number)
          formData.append("phone_number", body.phone_number);
        formData.append("date_of_birth", body.dob);

        // groups.forEach((group) => {
          formData.append("groups", INDIVIDUAL?.toString());
        // });

        if (body.thumbnail_image) {
          formData.append("profile_picture", body.thumbnail_image);
        } else {
          formData.append("profile_picture", "");
        }

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

        // if (body.phone_number && state?.user_type?.label === "Alumni") {
        formData.append("phone_number", body.phone_number);
        // }
        if (body.work && state?.user_type?.label === "Alumni") {
          formData.append("work", body.work);
        }

        if (
          body.country &&
          (state?.user_type?.label === "Alumni" ||
            state?.user_type?.label === ROLES.COUNSELOR)
        ) {
          formData.append("country", body.country);
        }

        // if (body.address && state?.user_type?.label === "Alumni") {
        formData.append("address", body.address);
        // }

        if (body.year_of_graduation !== undefined) {
          formData.append("year_of_graduation", body.year_of_graduation);
        }

        if (state?.user_type?.label === ROLES.COUNSELOR) {
          formData.append("is_open_to_be_mentor", true);
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

        if (state?.user_type?.label === ROLES.COUNSELOR) {
          formData.append("is_active", false);
        }

        // if (state?.user_type?.label === ROLES.GROUP) {
          formData.append("is_married", body.is_married);
          formData.append("kids", body.kids);
          formData.append("geo_detail", body.geo_detail);
          formData.append("gender", body.gender);
          formData.append("age", body.age);
        // }

        const res = await Models.user.updateUser(formData, id);
        console.log("updated --->", res);
        setState({submitLoading:false})
        // if (state?.user_type?.label === ROLES.COUNSELOR) {
          InfinitySuccess(
            `The account details for ${state.firstname} ${state.lastname} have been updated. All changes are now saved and reflected across the platform. Waiting for approval`,
            () => {
              window.location.href = "/";
            }
          );
          localStorage.clear();
        // } else if (state?.user_type?.label === ROLES.GROUP) {
          // InfinitySuccess(
          //   `The account details for ${state.firstname} ${state.lastname} have been updated. All changes are now saved and reflected across the platform.`,
          //   () => {
          //     window.location.href = "/";
          //   }
          // );
          // localStorage.clear();
        // } else {
        //   localStorage.setItem(
        //     "username",
        //     `${res?.first_name || ""} ${res?.last_name || ""}`
        //   );

        //   dispatch(
        //     setAuthData({
        //       groups: state.user_type?.label,
        //       userId: res.user_id,
        //       username: `${res?.first_name} ${res?.last_name}`,
        //     })
        //   );
        //   localStorage.setItem("group", state.user_type?.label || "");
        //   setState({ submitLoading: false });
        //   InfinitySuccess(
        //     `The account details for ${state.firstname} ${state.lastname} have been updated. All changes are now saved and reflected across the platform.`,

        //     () => {
        //       window.location.href = "/";
        //     }
        //   );
        // }
      // } else {
      //   let body = {
      //     first_name: state.firstname,
      //     last_name: state.lastname,
      //     // email: state.email.trim(),
      //     email: state?.email.trim() + DOMAIN,

      //     department:
      //       state?.user_type?.label !== "Admin" ? state?.department : undefined,

      //     user_type: state.user_type?.value,
      //     thumbnail_image: state.thumbnail_images || "",

      //     year_of_entry:
      //       state?.user_type?.label === "Student"
      //         ? state.year_of_entry?.value
      //         : undefined,
      //     university:
      //       state?.user_type?.label !== "Admin"
      //         ? state?.university?.value
      //         : undefined,
      //     intrested_topics:
      //       state?.intrested_topics?.length > 0
      //         ? state?.intrested_topics?.map((item) => item?.value)
      //         : [],
      //     notify: state.notify,
      //   };

      //   await Validation.createStudentUser.validate(body, {
      //     abortEarly: false,
      //   });

      //   let groups = [state.user_type?.value];
      //   let formData = new FormData();
      //   formData.append("first_name", body.first_name);
      //   formData.append("last_name", body.last_name);
      //   formData.append("email", body.email);
      //   formData.append("notify", body.notify);
      //   formData.append("is_registering", true);
      //   formData.append("is_verified", true);

      //   if (body.department && state?.user_type?.label != "Counselor") {
      //     formData.append("department", body.department);
      //   }

      //   if (body?.intrested_topics?.length > 0) {
      //     body.intrested_topics.forEach((topicId) => {
      //       formData.append("intrested_topics", topicId);
      //     });
      //     if (body?.intrested_topics?.some((item) => item == 13)) {
      //       formData.append("lable", state?.intrested_topics1);
      //     } else {
      //       formData.append("lable", "");
      //     }
      //   }

      //   groups.forEach((group) => {
      //     formData.append("groups", group?.toString());
      //   });

      //   if (body.thumbnail_image) {
      //     formData.append("profile_picture", body.thumbnail_image);
      //   } else {
      //     formData.append("profile_picture", "");
      //   }
      //   if (body.university) formData.append("university", body.university);

      //   if (body.year_of_entry && state?.user_type?.label === "Student") {
      //     formData.append("year_of_entry", body.year_of_entry);
      //   }
      //   const res = await Models.user.updateUser(formData, id);
      //   console.log("updated 1--->", res);

      //   localStorage.setItem(
      //     "username",
      //     `${res?.first_name || ""} ${res?.last_name || ""}`
      //   );
      //   localStorage.setItem("group", res.groups?.[0] || "");

      //   setState({ submitLoading: false });
      //   // window.location.href = "/";

      //   if (res) {
      //     await verifyEmail();
      //   }

      //   InfinitySuccess(
      //     "Form submitted successfully! A verification email has been sent to your account. Please check your inbox.",
      //     () => {
      //       localStorage.clear();
      //       window.location.href = "/";
      //     }
      //   );

      //   // InfinitySuccess(
      //   //   `Form submitted successfully! A verification email has been sent to your account. Please check your inbox.`
      //   // );
      // }
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

  const verifyEmail = async () => {
    try {
      const body = {
        // email: state?.email.trim(),
        email: state?.email.trim() + DOMAIN,
      };

      await Validation.resendToken.validate(body, {
        abortEarly: false,
      });
      const res = await Models.auth.resendToken(body);
    } catch (error) {
      setState({ btnLoading: false, errors: null });

      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        setState({ errors: validationErrors });
      } else {
        Failure(error.error);
      }
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1951 + 1 }, (_, i) => {
    const year = 1951 + i;
    return { value: year.toString(), label: year.toString() };
  });

  const yearOfEntry = Array.from({ length: currentYear - 2021 + 1 }, (_, i) => {
    const year = 2021 + i;
    return { value: year.toString(), label: year.toString() };
  });

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
    <div className="container mx-auto updateUser">
      <h2 className="font-semibold md:text-[20px] text-sm mb-3">Update User</h2>
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
          {state.user_type?.label === ROLES.STUDENT ? (
            <TextInput
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
          {isValidImageUrl(state.thumbnail_image) || state.thumbnail_images ? (
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
                />
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
                console.log("✌️e.target.files --->", e.target.files);

                const file = e.target.files[0];
                console.log("✌️file --->", file);
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
          {/* <CustomSelect
            options={state.groupList}
            value={state.user_type?.value || ""}
            onChange={(value) =>
              setState({
                user_type: value,
                errors: { ...state.errors, user_type: "" },

              })
            }
            title="User Type"
            error={state.errors?.user_type}
            required
          /> */}
          {/* {
            state?.user_type?.label === ROLES.ALUMNI ||
            state?.user_type?.label === ROLES.COUNSELOR ? (
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
                 
                </div>
                {state?.user_type?.label != ROLES.COUNSELOR && (
                  <TextInput
                    id="work"
                    type="text"
                    placeholder="Enter Your Work"
                    title="Job Sector / Role"
                    value={state.work}
                    onChange={(e) => setState({ work: e.target.value })}
                  />
                )}
              
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
                    required
                    placeholder="Select University"
                    menuPortalTarget={document.body}
                    error={state.errors?.university}
                  />

                </div>
                {state?.user_type?.label != ROLES.COUNSELOR && (
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
                )}

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
                {state.user_type?.label == ROLES.ALUMNI && (
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
                {state.user_type?.label == ROLES.STUDENT && (
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
                    />

                  
                  </div>
                )}

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
                {state.user_type?.label == ROLES.STUDENT && (
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
                    options={yearOfEntry || []}
                    placeholder="Year Of Entry"
                    value={state.year_of_entry || ""}
                    onChange={(value) =>
                      setState({
                        year_of_entry: value,
                        errors: { ...state.errors, year_of_entry: "" },
                      })
                    }
                    required
                    menuPortalTarget={document.body}
                    error={state.errors?.year_of_entry}
                  />
                  
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
                    required
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
          } */}

          {/* {state?.user_type?.label === ROLES.GROUP && ( */}
            <>
              <div className="space-y-1">
                <TextInput
                  id="age"
                  type="number"
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
                  onChange={(value) =>
                    setState({
                      groupGender: value,
                      errors: { ...state.errors, gender: "" },
                    })
                  }
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
                  onChange={(value) =>
                    setState({
                      is_married: value,
                      errors: { ...state.errors, is_married: "" },
                    })
                  }
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
            </>
          {/* )} */}

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
