"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import Models from "@/imports/models.import";
import { Dropdown, useSetState } from "@/utils/function.utils";
import { TextInput } from "@/components/common-components/textInput";
import TextArea from "@/components/common-components/textArea";
import { DatePicker } from "@/components/common-components/datePicker";
import CustomSelect from "@/components/common-components/dropdown";
import TimePicker from "@/components/common-components/timePicker";
import moment from "moment";
import { useRouter } from "next/navigation";

import * as Yup from "yup";
import * as Validation from "../../../utils/validation.utils";
import { Failure, Success } from "@/components/common-components/toast";
import PrimaryButton from "@/components/common-components/primaryButton";
import { mentorList } from "@/utils/constant.utils";
import ProtectedRoute from "@/components/common-components/privateRouter";
import MultiSelectDropdown from "@/components/common-components/multiSelectDropdown";
import SingleSelectDropdown from "@/components/common-components/singleSelectDropdown";
import PhoneInput, {
  isValidPhoneNumber,
  getCountries,
} from "react-phone-number-input";
import "react-phone-number-input/style.css";
import Select from "react-select";
import { getCountryCallingCode } from "libphonenumber-js";
import Checkboxs from "@/components/ui/singleCheckbox";

const CreateUser = () => {
  const router = useRouter();

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
    if (typeof window !== "undefined") {
      getGroupList();
      getIntrestedTopics();
      getUniversity();
      getCountry();
    }
  }, []);

  const getGroupList = async () => {
    try {
      const res = await Models.Common.groups();
      console.log("res: ", res);
      const Dropdowns = Dropdown(res?.results, "name");
      console.log("Dropdowns: ", Dropdowns);
      setState({ groupList: Dropdowns });
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

  const getIntrestedTopics = async () => {
    try {
      const res = await Models.auth.getIntrestedTopics();
      const Dropdowns = Dropdown(res?.results, "topic");
      console.log("✌️Dropdowns --->", Dropdowns);

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
      // Set loading state to true
      setState({ submitLoading: true });
      if (state.user_type?.label === "Alumni") {
        // Construct the body object with necessary fields, conditionally included
        let body = {
          first_name: state.firstname,
          last_name: state.lastname,
          email: state.email.trim(),
          department:
            state?.user_type?.label !== "Admin" ? state?.department : undefined,
          address: state.address || "", // Set an empty string if address is falsy
          dob: state.dob ? moment(state.dob).format("YYYY-MM-DD") : "", // Format dob to YYYY-MM-DD if it exists
          user_type: state.user_type?.value,
          thumbnail_image: state.thumbnail_images || "", // Default empty string if image doesn't exist
          phone_number:
            state?.user_type?.label === "Alumni"
              ? state.phone_number
              : undefined,
          year_of_entry:
            state?.user_type?.label === "Student"
              ? state?.year_of_entry?.value
              : undefined,
          university:
            state?.user_type?.label !== "Alumni"
              ? state?.university?.value
              : undefined,
          intrested_topics:
            state?.intrested_topics?.length > 0
              ? state?.intrested_topics?.map((item) => item.value)
              : [],
          lable: state.intrested_topics1,

          work: state?.user_type?.label === "Alumni" ? state?.work : undefined,
          year_of_graduation:
            state?.user_type?.label === "Alumni"
              ? state?.year_of_graduation?.value
              : undefined,
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

        await Validation.createUser.validate(body, {
          abortEarly: false,
        });

        if (state?.user_type?.label === "Alumni") {
          if (!isValidPhoneNumber(body.phone_number)) {
            setState({
              submitLoading: false,
              errors: {
                phone_number: "Please enter a valid phone number",
              },
            });
            return;
          }
        }
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
          formData.append("profile_picture", ""); // Empty string if no image
        }

        if (body?.intrested_topics?.length > 0) {
          body.intrested_topics.forEach((topicId) => {
            formData.append("intrested_topics", topicId);
          });
        }
        formData.append("lable", state.intrested_topics1);

        if (state?.university?.value) {
          formData.append("university", state?.university?.value);
        }

        if (body.phone_number && state?.user_type?.label === "Alumni") {
          formData.append("phone_number", body.phone_number);
        }

        if (body.year_of_entry && state?.user_type?.label === "Student") {
          formData.append("year_of_entry", body.year_of_entry);
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

        if (body.year_of_graduation && state?.user_type?.label === "Alumni") {
          formData.append("year_of_graduation", body.year_of_graduation);
        }

        if (body.is_open_to_be_mentor && state?.user_type?.label === "Alumni") {
          formData.append("is_open_to_be_mentor", body.is_open_to_be_mentor);
        }
        console.log("formData", formData);
        // Submit the formData
        const res = await Models.user.addUser(formData);

        // Reset submitLoading to false after submission
        setState({ submitLoading: false });

        // Redirect to user list page
        router.push("/user-list");
        Success(`The user ${state.firstname} ${state.lastname} has been successfully added to Zen Wellness.
Login credentials have been generated, and the user can now access the platform and explore available wellness programs.
`);

        console.log("res: ", res); // Log the response for debugging
      } else {
        // Construct the body object with necessary fields, conditionally included
        let body = {
          first_name: state.firstname,
          last_name: state.lastname,
          email: state.email.trim(),
          department:
            state?.user_type?.label !== "Admin" ? state?.department : undefined,
          // address: state.address || "", // Set an empty string if address is falsy
          // dob: state.dob ? moment(state.dob).format("YYYY-MM-DD") : "", // Format dob to YYYY-MM-DD if it exists
          user_type: state.user_type?.value,
          thumbnail_image: state.thumbnail_images || "", // Default empty string if image doesn't exist
          // phone_number:
          //   state?.user_type?.label === "Alumni" ? state.phone_number : undefined,
          year_of_entry:
            state?.user_type?.label === "Student"
              ? state?.year_of_entry?.value
              : undefined,
          university: state?.university?.value,
          intrested_topics: state?.intrested_topics?.map((item) => item.value),
          lable: state?.intrested_topics1,
          notify: state.notify,
        };

        console.log("body: ", body); // For debugging purposes

        // Validate the body object using Yup
        await Validation.createStudentUser.validate(body, {
          abortEarly: false,
        });

        if (state?.user_type?.label === "Alumni") {
          if (!isValidPhoneNumber(body.phone_number)) {
            setState({
              submitLoading: false,
              errors: {
                phone_number: "Please enter a valid phone number",
              },
            });
            return;
          }
        }
        // Prepare the formData to submit
        let groups = [state.user_type?.value];
        let formData = new FormData();
        formData.append("first_name", body.first_name);
        formData.append("last_name", body.last_name);
        formData.append("email", body.email);
        formData.append("notify", body.notify);

        if (body.department) formData.append("department", body.department);
        if (body.university) formData.append("university", body.university);

        groups.forEach((group) => {
          formData.append("groups", group?.toString());
        });

        // Handle thumbnail image
        if (body.thumbnail_image) {
          formData.append("profile_picture", body.thumbnail_image);
        } else {
          formData.append("profile_picture", ""); // Empty string if no image
        }

        if (body?.intrested_topics?.length > 0) {
          body.intrested_topics.forEach((topicId) => {
            formData.append("intrested_topics", topicId);
          });
        }

        formData.append("lable", state?.intrested_topics1);

        if (body.year_of_entry && state?.user_type?.label === "Student") {
          formData.append("year_of_entry", body.year_of_entry);
        }
        console.log("formData", formData);
        const res = await Models.user.addUser(formData);

        // Reset submitLoading to false after submission
        setState({ submitLoading: false });

        // Redirect to user list page
        router.push("/user-list");
        Success(`The user ${state.firstname} ${state.lastname} has been successfully added to Zen Wellness.
Login credentials have been generated, and the user can now access the platform and explore available wellness programs.
`);

        console.log("res: ", res); // Log the response for debugging
      }
    } catch (error) {
      console.log("error", error?.email);

      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });

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
        phone_number: value,
      });
    } else {
      setState({
        errors: { ...state.errors, phone_number: "" },
        phone_number: value,
      });
    }
  };

  return (
    <div className="container mx-auto">
      <h2 className="font-bold md:text-[20px] text-sm mb-3">Create User</h2>
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

          <TextInput
            title="Profile Image (size: 300x300)"
            placeholder="Profile Image"
            value={state.thumbnail_image}
            onChange={(e) => {
              console.log("e.target: ", e.target.files[0]);

              setState({
                thumbnail_images: e.target.files[0],
                thumbnail_image: e.target.value,
              });
            }}
            className="mt-2 w-full"
            type="file"
          />
        </div>

        <div className="border rounded-xl p-4 gap-4 flex flex-col ">
          <CustomSelect
            options={state.groupList}
            value={state.user_type?.value || ""}
            onChange={(value) =>
              setState({
                user_type: value,
                phone_number: "",
                year_of_graduation: "",
                work: "",
                country: null,
                address: "",
                is_open_to_be_mentor: null,
                year_of_entry: "",
                errors: { ...state.errors, user_type: "" },
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

                {/* <SingleSelectDropdown
                  options={state?.countryList || []} // Safely pass empty array if universityList is null
                  value={state.country || ""}
                  onChange={(value) => {
                    setState({ country: value, phone_number: "" });
                  }}
                  error={state.errors?.country}
                  title="Country"
                  placeholder="Select Your Country"
                /> */}

                <div className="space-y-1">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {"Country"} {""}
                    <span className="text-red-500">*</span>
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
                      }}
                      placeholder="Select Your Country"
                      className="text-sm"
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
                    Phone Number <span className="text-red-500">*</span>
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

                {/* <CustomSelect
                  options={years || []} // Safely pass empty array if universityList is null
                  value={state.year_of_entry?.value || ""}
                  onChange={(value) =>
                    setState({
                      year_of_entry: value,
                      errors: { ...state.errors, year_of_entry: "" },
                    })
                  }
                  error={state.errors?.year_of_entry}
                  title="Year of Entry"
                  placeholder="Select Year of Entry"
                  required
                /> */}
              </>
            ) : null // If neither "Alumni" nor "student", nothing will be rendered
          }

          {state?.user_type?.label !== "Admin" && (
            <>
              <div className="space-y-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {"University"} <span className="text-red-500">*</span>
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
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  isClearable
                  required
                />
                {state.errors?.university && (
                  <p className="mt-2 text-sm text-red-600">
                    {state.errors?.university}
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
                  onChange={(e) =>
                    setState({
                      department: e.target.value,
                      errors: { ...state.errors, department: "" },
                    })
                  }
                  required
                />
              </div>
              {/* <div className="space-y-1">
                <MultiSelectDropdown
                  options={state.intrestedTopicsList || []} // Safely pass empty array if intrestedTopicsList is null
                  value={state.intrested_topics || ""}
                  onChange={(value) => {
                    console.log("✌️value --->", value);
                    if (value.length > 0) {
                      if (value?.some((item) => item.value === "others")) {
                        setState({
                          intrested_topics: [
                            { value: "others", label: "Others" },
                          ],
                        });
                      } else {
                        setState({ intrested_topics: value });
                      }
                    } else {
                      setState({ intrested_topics: value });
                    }
                  }}
                  error={state.errors?.intrested_topics}
                  placeholder="Select Topics"
                  title="Interests in Topics"
                />
              </div> */}

              {state?.user_type?.label === "Alumni" && (
                <>
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
                    options={mentorList || []} // Safely pass empty array if intrestedTopicsList is null
                    value={state.is_open_to_be_mentor?.value || ""}
                    onChange={(value) =>
                      setState({ is_open_to_be_mentor: value })
                    }
                    error={state.errors?.is_open_to_be_mentor}
                    title="Are you open to being a mentor?"
                    placeholder="Select"
                  />
                </>
              )}

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
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                />
              </div>
              {Array.isArray(state.intrested_topics) &&
                state.intrested_topics.some((item) => item.value === 13) && (
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
          )}

          <div className="flex justify-end gap-5 mt-10">
            <PrimaryButton
              variant={"outline"}
              className="border-themeGreen hover:border-themeGreen text-themeGreen hover:text-themeGreen "
              name="Cancel"
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
