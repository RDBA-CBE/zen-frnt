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
import { Success } from "@/components/common-components/toast";
import { Trash2 } from "lucide-react";
import PrimaryButton from "@/components/common-components/primaryButton";
import { useSelector } from "react-redux";
import { mentorList } from "@/utils/constant.utils";

export default function CreateUser() {
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
  console.log("groups", groups);

  const [state, setState] = useSetState({
    name: "",
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
    getDetails();
    getGroupList();
    getIntrestedTopics();
    getUniversity();
    getCountry();
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

      console.log("resss", res);
      setState({
        email: res.email ? res.email : "",
        name: res.username ? res.username : "",
        address: res.address ? res.address : "",
        phone_number: res?.phone_number ? res?.phone_number : "",
        year_of_entry: res?.year_of_entry,
        department: res?.department ? res?.department : "",
        university: {
          value: res?.university?.id ? res?.university?.id : null,
          label: res?.university?.name ? res?.university?.name : null
        },
        intrested_topics: {
          value: res?.intrested_topics ? res?.intrested_topics?.label : null,
          label: res?.intrested_topics ? res?.intrested_topics?.label : null,
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
      const Dropdowns = Dropdown(res?.results, "name");
      setState({ universityList: Dropdowns });
      console.log("res", res);
    } catch (error) {
      console.log("error", error);
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

  const getIntrestedTopics = async () => {
    try {
      const res = await Models.auth.getIntrestedTopics();
      const Dropdowns = Dropdown(res?.results, "topic");

      const updatedDropdowns = [
        ...Dropdowns,
        { label: "Others", value: "others" }
      ];

      setState({ intrestedTopicsList: updatedDropdowns });
      console.log("res", res);
    } catch (error) {
      console.log(error);
    }
  };

  const onSubmit = async () => {
    try {
      setState({ submitLoading: true });

      let body = {
        name: state.name,
        email: state.email,
        department: state?.user_type?.label !== "Admin" ? state?.department : undefined,
        address: state.address || "",
        dob: state.dob ? moment(state.dob).format("YYYY-MM-DD") : "",
        user_type: state.user_type?.value,
        thumbnail_image: state.thumbnail_images || "",
        phone_number: state?.user_type?.label === "Alumni" ? state.phone_number : undefined,
        year_of_entry: state?.user_type?.label === "Student" ? state.year_of_entry : undefined,
        university: state?.user_type?.label !== "Admin" ? state?.university?.value : undefined,
        intrested_topics: state?.user_type?.label !== "Admin" ? state?.intrested_topics?.label == "Others" ? state?.intrested_topics1 : state?.intrested_topics?.label : undefined,
        work: state?.user_type?.label === "Alumni" ? state?.work : undefined,
        year_of_graduation: state?.user_type?.label === "Alumni" ? state?.year_of_graduation : undefined,
        is_open_to_be_mentor: state?.user_type?.label === "Alumni" ? state?.is_open_to_be_mentor?.value == "Yes" ? true : false : undefined,
        country: state?.user_type?.label === "Alumni" ? state?.country?.value : undefined,
      };

      console.log("state?.user_type?.label ", state?.user_type?.label);

      await Validation.createUser.validate(body, {
        abortEarly: false,
      });

      let groups = [state.user_type?.value];
      let formData = new FormData();
      formData.append("username", body.name);
      formData.append("email", body.email);

      if (body.department) formData.append("department", body.department);
      if (body.phone_number) formData.append("phone_number", body.phone_number);
      formData.append("date_of_birth", body.dob);

      groups.forEach((group) => {
        formData.append("groups", group?.toString());
      });

      if (body.thumbnail_image) {
        formData.append("profile_picture", body.thumbnail_image);
      } else {
        formData.append("profile_picture", "");
      }

      if (state?.user_type?.label !== "Admin") {
        if (body.university) formData.append("university", body.university);
        if (body.intrested_topics) formData.append("intrested_topics", body.intrested_topics);
      }

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

      if (body.year_of_graduation !== undefined && state?.user_type?.label === "Alumni") {
        formData.append("year_of_graduation", body.year_of_graduation);
      }

      if (body.is_open_to_be_mentor !== undefined && state?.user_type?.label === "Alumni") {
        formData.append("is_open_to_be_mentor", body.is_open_to_be_mentor);
      }
      if (body.year_of_entry && state?.user_type?.label === "Student") {
        formData.append("year_of_entry", body.year_of_entry);
      }
      await Models.user.updateUser(formData, id);
      setState({ submitLoading: false });
      router?.back();
      Success("User updated successfully");
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        setState({ errors: validationErrors });
        setState({ submitLoading: false });
      } else {
        setState({ submitLoading: false });
      }
    }
  };


  // const onSubmit = async () => {
  //   try {
  //     setState({ submitLoading: true });

  //     let body = {
  //       name: state.name,
  //       email: state.email,
  //       department: state?.user_type?.label !== "Admin" ? state?.department : undefined,
  //       address: state.address || "", // Set an empty string if address is falsy
  //       dob: state.dob ? moment(state.dob).format("YYYY-MM-DD") : "", // Format dob to YYYY-MM-DD if it exists
  //       user_type: state.user_type?.value,
  //       thumbnail_image: state.thumbnail_images || "", // Default empty string if image doesn't exist
  //       phone_number: state?.user_type?.label === "Alumni" ? state.phone_number : undefined,
  //       year_of_entry: state?.user_type?.label === "Student" ? state.year_of_entry : undefined,
  //       university: state?.user_type?.label !== "Admin" ? state?.university?.value : undefined,
  //       intrested_topics: state?.user_type?.label !== "Admin" ? state?.intrested_topics?.label == "Others" ? state?.intrested_topics1 : state?.intrested_topics?.label : undefined,
  //       work: state?.user_type?.label === "Alumni" ? state?.work : undefined,
  //       year_of_graduation: state?.user_type?.label === "Alumni" ? state?.year_of_graduation : undefined,
  //       is_open_to_be_mentor: state?.user_type?.label === "Alumni" ? state?.is_open_to_be_mentor?.value == "Yes" ? true : false : undefined,
  //       country: state?.user_type?.label === "Alumni" ? state?.country?.value : undefined,
  //     };

  //     console.log("state?.user_type?.label ", state?.user_type?.label);

  //     await Validation.createUser.validate(body, {
  //       abortEarly: false,
  //     });

  //     let groups = [state.user_type?.value];
  //     let formData = new FormData();
  //     formData.append("username", body.name);
  //     formData.append("email", body.email);

  //     if (body.department) formData.append("department", body.department);
  //     if (body.phone_number) formData.append("phone_number", body.phone_number);
  //     formData.append("date_of_birth", body.dob);

  //     groups.forEach((group) => {
  //       formData.append("groups", group?.toString());
  //     });

  //     if (body.thumbnail_image) {
  //       formData.append("profile_picture", body.thumbnail_image);
  //     } else {
  //       formData.append("profile_picture", "");
  //     }

  //     if (state?.user_type?.label !== "Admin") {
  //       if (body.university) formData.append("university", body.university);
  //       if (body.intrested_topics) formData.append("intrested_topics", body.intrested_topics);
  //     }

  //     if (body.phone_number && state?.user_type?.label === "Alumni") {
  //       formData.append("phone_number", body.phone_number);
  //     }

  //     if (body.year_of_entry && state?.user_type?.label === "Student") {
  //       formData.append("year_of_entry", body.year_of_entry);
  //     }

  //     if (body.work && state?.user_type?.label === "Alumni") {
  //       formData.append("work", body.work);
  //     }

  //     if (body.country && state?.user_type?.label === "Alumni") {
  //       formData.append("country", body.country);
  //     }

  //     if (body.address && state?.user_type?.label === "Alumni") {
  //       formData.append("address", body.address);
  //     }

  //     if (body.year_of_graduation !== undefined && state?.user_type?.label === "Alumni") {
  //       formData.append("year_of_graduation", body.year_of_graduation);
  //     }

  //     if (body.is_open_to_be_mentor !== undefined & state?.user_type?.label === "Alumni") {
  //       formData.append("is_open_to_be_mentor", body.is_open_to_be_mentor);
  //     }

  //     await Models.user.updateUser(formData, id);
  //     setState({ submitLoading: false });
  //     router?.back();
  //     Success("User updated successfully");
  //   } catch (error) {
  //     if (error instanceof Yup.ValidationError) {
  //       const validationErrors = {};
  //       error.inner.forEach((err) => {
  //         validationErrors[err.path] = err?.message;
  //       });
  //       setState({ errors: validationErrors });
  //       setState({ submitLoading: false });
  //     } else {
  //       setState({ submitLoading: false });
  //     }
  //   }
  // };

  console.log("state.intrested_topics?.label", state.intrested_topics?.label)

  return (
    <div className="container mx-auto">
      <div className="font-bold text-lg mb-3">Create User</div>
      <div className="grid auto-rows-min gap-4 md:grid-cols-2">
        <div className="border rounded-xl p-4 gap-4 flex flex-col ">
          <TextInput
            value={state.name}
            onChange={(e) => {
              setState({ name: e.target.value });
            }}
            placeholder="Name"
            title="Name"
            error={state.errors?.name}
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


          <DatePicker
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
          />

          <TextInput
            title="Profile Image"
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
            onChange={(value) => setState({ user_type: value, phone_number: "", year_of_graduation: "", work: "", country: null, address: "", is_open_to_be_mentor: null, year_of_entry: "" })}
            title="User Type"
            error={state.errors?.user_type}
            required
          />
          {
            state?.user_type?.label === "Alumni" ? (
              // Add the component or content you want to render for "Alumni" here
              <>
                <TextInput
                  value={state.phone_number}
                  onChange={(e) => {
                    setState({ phone_number: e.target.value });
                  }}
                  placeholder="Phone Number"
                  title="Phone Number"
                // error={state.errors?.phone_number}
                // required
                />




                <TextInput
                  id="year_of_graduation"
                  type="text"
                  placeholder="Enter Year of Graduated"
                  title="Year Graduated"
                  value={state.year_of_graduation}
                  onChange={(e) => setState({ year_of_graduation: e.target.value })}
                />

                <TextInput
                  id="work"
                  type="text"
                  placeholder="Enter Your Work"
                  title="Work"
                  value={state.work}
                  onChange={(e) => setState({ work: e.target.value })}
                />

                <CustomSelect
                  options={state?.countryList || []} // Safely pass empty array if universityList is null
                  value={state.country?.value || ""}
                  onChange={(value) => setState({ country: value })}
                  error={state.errors?.country}
                  title="country"
                  placeholder="Select Your Country"
                />

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
                  onChange={(value) => setState({ is_open_to_be_mentor: value })}
                  error={state.errors?.is_open_to_be_mentor}
                  title="Are you open to being a mentor?"
                  placeholder="Select Topics"
                />
              </>
            ) : state?.user_type?.label === "Student" ? (
              // Add the component or content you want to render for "student" here
              <>
                <TextInput
                  id="year_of_entry"
                  type="text"
                  placeholder="Enter Year of Entry"

                  value={state.year_of_entry}
                  onChange={(e) => setState({ year_of_entry: e.target.value })}
                  title="Year of Entry"
                />
              </>
            ) : null // If neither "Alumni" nor "student", nothing will be rendered
          }

          {
            state?.user_type?.label !== "Admin" && (
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
                  <CustomSelect
                    options={state.intrestedTopicsList || []}
                    value={state.intrested_topics?.label || ""}
                    onChange={(value) => setState({ intrested_topics: value })}
                    error={state.errors?.intrested_topics}
                    title="Intrested Topics"
                    placeholder="Select Intrested Topics"
                  />
                </div>
                {
                  state.intrested_topics?.value == "others" &&
                  <div className="space-y-1">
                    <TextInput
                      id="intrested_topics1"
                      type="text"
                      placeholder="Enter Your Intrested Topics"
                      title="Interests in Topics"
                      value={state.intrested_topics1}
                      onChange={(e) => setState({ intrested_topics1: e.target.value })}
                    />
                  </div>
                }</>
            )
          }



          <div className="flex justify-end gap-5 mt-10">
            <PrimaryButton
              variant={"outline"}
              name="Cancel"
              onClick={() => router.back()}
            />

            <PrimaryButton
              name="Submit"
              onClick={() => onSubmit()}
              loading={state.submitLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
