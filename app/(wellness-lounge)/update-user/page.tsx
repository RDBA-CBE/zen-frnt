"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";
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

export default function CreateUser() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const id = searchParams.get("id");
  const groups = useSelector((state: any) => state.auth.groups);
  console.log("groups", groups)

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
    getDetails();
    getGroupList();
  }, [id]);

  const getGroupList = async () => {
    try {
      const res: any = await Models.Common.groups();
      const Dropdowns = Dropdown(res?.results, "name");
      setState({ groupList: Dropdowns });
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const getDetails = async () => {
    try {
      const res: any = await Models.user.getUserId(id);
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
        email: res.email ? res.email : "",
        name: res.username ? res.username : "",
        address: res.address ? res.address : "",
        phone_number: res?.phone_number ? res?.phone_number : "",
        dob: res.date_of_birth ? new Date(res.date_of_birth) : "",
        user_type: {
          value: res?.groups?.[0],
          label: res?.groups?.[0],
        },
      });
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const onSubmit = async () => {
    try {
      setState({ submitLoading: true });
      let body: any = {
        name: state.name,
        email: state.email,
        phone_number: state.phone_number,
        address: state.address ? state.address : "",
        dob: state.dob ? moment(state.dob).format("YYYY-MM-DD") : "",
        user_type: state.user_type?.value,
        thumbnail_image: state.thumbnail_images,
      };

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
      groups.forEach((group: any) =>
        formData.append("groups", group?.toString())
      );

      if (body.thumbnail_image) {
        formData.append("profile_picture", body.thumbnail_image);
      } else {
        formData.append("profile_picture", "");
      }
      await Models.user.updateUser(formData, id);
      setState({ submitLoading: false });

      // router.push("/user-list");
      router?.back()
      Success("User updated successfully");
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors: any = {};
        error.inner.forEach((err: any) => {
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
      <div className="font-bold text-lg mb-3">Update User</div>
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
            onChange={(e: any) => {
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
            onChange={(date: any) => {
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
          {
            groups == "Student" ? (
              <TextInput
                // options={state.groupList}
                value={state.user_type?.label || ""}
                // onChange={(value: any) => setState({ user_type: value })}
                title="User Type"
                // error={state.errors?.user_type}
                required
                disabled
              />
            ) : (
              <CustomSelect
                options={state.groupList}
                value={state.user_type?.value || ""}
                onChange={(value: any) => setState({ user_type: value })}
                title="User Type"
                error={state.errors?.user_type}
                required
              />
            )
          }


          {/* <TextInput
            title="Profile Image"
            placeholder="Profile Image"
            value={state.thumbnail_image}
            onChange={(e: any) => {
              console.log("e.target: ", e.target.files[0]);

              setState({
                thumbnail_images: e.target.files[0],
                thumbnail_image: e.target.value,
              });
            }}
            className="mt-2 w-full"
            type="file"
          /> */}

          {isValidImageUrl(state.thumbnail_image) ? (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Session Image
              </label>
              <div className="flex items-center gap-10">
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
              title="Profile Image"
              placeholder="Profile Image"
              type="file"
              className="mt-2 w-full"
              onChange={(e: any) => {
                const file = e.target.files[0];
                if (!file) return;
                const imageUrl = URL.createObjectURL(file); // Generate preview URL
                setState({
                  thumbnail_images: file, // Store actual file
                  thumbnail_image: imageUrl, // Use preview URL instead of fakepath
                });
              }}
            />
          )}

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
