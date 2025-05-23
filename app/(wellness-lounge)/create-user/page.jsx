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

const CreateUser = () => {
  const router = useRouter();

  const [state, setState] = useSetState({
    firstname: "",
    lastname:"",
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

  const onSubmit = async () => {
    try {
      // Set loading state to true
      setState({ submitLoading: true });

      // Construct the body object with necessary fields, conditionally included
      let body = {
        first_name: state.firstname,
         last_name: state.lastname,
        email: state.email,
        department:
          state?.user_type?.label !== "Admin" ? state?.department : undefined,
        address: state.address || "", // Set an empty string if address is falsy
        dob: state.dob ? moment(state.dob).format("YYYY-MM-DD") : "", // Format dob to YYYY-MM-DD if it exists
        user_type: state.user_type?.value,
        thumbnail_image: state.thumbnail_images || "", // Default empty string if image doesn't exist
        phone_number:
          state?.user_type?.label === "Alumni" ? state.phone_number : undefined,
        year_of_entry:
          state?.user_type?.label === "Student"
            ? state?.year_of_entry?.value
            : undefined,
        university:
          state?.user_type?.label !== "Alumni"
            ? state?.university?.value
            : undefined,
        intrested_topics: state?.intrested_topics?.some(
          (item) => item.value === "others"
        )
          ? state?.intrested_topics1
          : state?.intrested_topics?.map((item) => item.label),

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
      };

      console.log("body: ", body); // For debugging purposes

      // Validate the body object using Yup
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
      // Prepare the formData to submit
      let groups = [state.user_type?.value];
      let formData = new FormData();
      formData.append("first_name", body.first_name);
       formData.append("last_name", body.last_name);
      formData.append("email", body.email);

      // Append other fields conditionally
      if (body.department) formData.append("department", body.department);
      if (body.phone_number) formData.append("phone_number", body.phone_number);
      formData.append("date_of_birth", body.dob);

      groups.forEach((group) => {
        formData.append("groups", group?.toString());
      });

      // Handle thumbnail image
      if (body.thumbnail_image) {
        formData.append("profile_picture", body.thumbnail_image);
      } else {
        formData.append("profile_picture", ""); // Empty string if no image
      }

      const topics = state?.intrested_topics?.some(
        (item) => item.value === "others"
      )
        ? state?.intrested_topics1
        : state?.intrested_topics?.map((item) => item.label);

      // Convert the array or string to JSON if it's complex data
      if (state?.intrested_topics?.length > 0) {
        formData.append("intrested_topics", JSON.stringify(topics));
      }
      // Conditionally append fields based on user type
      // if (state?.user_type?.label !== "Admin") {
      //   if (body.university) formData.append("university", body.university);
      //   if (body.intrested_topics)
      //     formData.append("intrested_topics", body.intrested_topics);
      // }

      // Append alumni-specific fields
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
      Success("User added successfully");

      console.log("res: ", res); // Log the response for debugging
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
              setState({ firstname: e.target.value });
            }}
            placeholder="First Name"
            title="First Name"
            error={state.errors?.first_name}
            required
          />

          <TextInput
            value={state.lastname}
            onChange={(e) => {
              setState({ lastname: e.target.value });
            }}
            placeholder="Last Name"
            title="Last Name"
            error={state.errors?.last_name}
            required
          />

          <TextInput
            value={state.email}
            onChange={(e) => {
              setState({ email: e.target.value });
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
                <CustomSelect
                  options={years || []} // Safely pass empty array if universityList is null
                  value={state.year_of_graduation?.value || ""}
                  onChange={(value) => setState({ year_of_graduation: value })}
                  error={state.errors?.year_of_graduation}
                  title="Year Graduated"
                  placeholder="Select Year of Graduated"
                />

                <TextInput
                  id="work"
                  type="text"
                  placeholder="Enter Your Work"
                  title="Work"
                  value={state.work}
                  onChange={(e) => setState({ work: e.target.value })}
                />

                <SingleSelectDropdown
                  options={state?.countryList || []} // Safely pass empty array if universityList is null
                  value={state.country || ""}
                  onChange={(value) => {
                    setState({ country: value, phone_number: "" });
                  }}
                  error={state.errors?.country}
                  title="Country"
                  placeholder="Select Your Country"
                />

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
                    />
                    {state.errors?.phone_number && (
                      <p className="mt-2 text-sm text-red-600">
                        {state.errors?.phone_number}
                      </p>
                    )}
                  </div>
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
                  options={mentorList || []} // Safely pass empty array if intrestedTopicsList is null
                  value={state.is_open_to_be_mentor?.value || ""}
                  onChange={(value) =>
                    setState({ is_open_to_be_mentor: value })
                  }
                  error={state.errors?.is_open_to_be_mentor}
                  title="Are you open to being a mentor?"
                  placeholder="Select Topics"
                />
              </>
            ) : state?.user_type?.label === "Student" ? (
              <>
                <CustomSelect
                  options={years || []} // Safely pass empty array if universityList is null
                  value={state.year_of_entry?.value || ""}
                  onChange={(value) => setState({ year_of_entry: value })}
                  error={state.errors?.year_of_graduation}
                  title="Year of Entry"
                  placeholder="Select Year of Entry"
                />
              </>
            ) : null // If neither "Alumni" nor "student", nothing will be rendered
          }

          {state?.user_type?.label !== "Admin" && (
            <>
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
              </div>
              {Array.isArray(state.intrested_topics) &&
                state.intrested_topics.some(
                  (item) => item.value === "others"
                ) && (
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
            </>
          )}

          <div className="flex justify-end gap-5 mt-10">
            <PrimaryButton
              variant={"outline"}
              className="border-themeGreen hover:border-themeGreen text-themeGreen hover:text-themeGreen "
              name="Cancel"
              onClick={() => router.back()}
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
