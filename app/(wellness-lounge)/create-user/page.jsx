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
import { Success } from "@/components/common-components/toast";
import PrimaryButton from "@/components/common-components/primaryButton";

export default function CreateUser() {
  const router = useRouter();

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
  });

  useEffect(() => {
    getGroupList();
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

  const onSubmit = async () => {
    try {
      setState({ submitLoading: true });
      let body = {
        name: state.name,
        email: state.email,
        phone_number: state.phone_number,
        address: state.address ? state.address : "",
        dob: state.dob ? moment(state.dob).format("YYYY-MM-DD") : "",
        user_type: state.user_type?.value,
        thumbnail_image: state.thumbnail_images,
      };

      console.log("body: ", body);
      // let a = {
      //   email: "user@example.com",
      //   username: "string",
      //   phone_number: "string",
      //   address: "string",
      //   date_of_birth: "2025-02-28",
      //   university: 0,
      //   intrested_topics: [0],
      //   year_of_entry: 9223372036854776000,
      //   profile_picture: "string",
      //   groups: ["string"],
      // };

      await Validation.createUser.validate(body, {
        abortEarly: false,
      });
      let groups = [state.user_type?.value];
      let formData = new FormData();
      formData.append("username", body.name);
      formData.append("email", body.email);
      formData.append("phone_number", body.phone_number);
      formData.append("address", body.address);
      formData.append("date_of_birth", body.dob);
      groups.forEach((group) =>
        formData.append("groups", group?.toString())
      );

      if (body.thumbnail_image) {
        formData.append("profile_picture", body.thumbnail_image);
      } else {
        formData.append("profile_picture", "");
      }

      const res = await Models.user.addUser(formData);
      setState({ submitLoading: false });

      router.push("/user-list");
      Success("User added successfully");
      console.log("res: ", res);
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        console.log("validationErrors: ", validationErrors);

        setState({ errors: validationErrors });
        setState({ submitLoading: false });
      } else {
        setState({ submitLoading: false });
      }
    }
  };

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
          <TextInput
            value={state.phone_number}
            onChange={(e) => {
              setState({ phone_number: e.target.value });
            }}
            placeholder="Phone Number"
            title="Phone Number"
            error={state.errors?.phone_number}
            required
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
            error={state.errors?.dob}
            required
          />
        </div>

        <div className="border rounded-xl p-4 gap-4 flex flex-col ">
          <CustomSelect
            options={state.groupList}
            value={state.user_type?.value || ""}
            onChange={(value) => setState({ user_type: value })}
            title="User Type"
            error={state.errors?.user_type}
            required
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
