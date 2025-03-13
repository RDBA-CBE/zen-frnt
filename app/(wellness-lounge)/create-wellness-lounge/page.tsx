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

export default function CreateWellnessLounge() {
  const router = useRouter();

  const [state, setState] = useSetState({
    seat_count: 0,
    session_link: "",
    price: 0,
    lounge_type: {},
    end_time: "",
    start_time: "",
    valid_to: "",
    valid_from: "",
    Description: "",
    title: "",
    categoryName: "",
    categoryList: [],
    thumbnail_image: "",
    errors: {},
    submitLoading: false,
  });

  useEffect(() => {
    getCategoryList();
  }, []);

  const getCategoryList = async () => {
    try {
      const res: any = await Models.category.list();
      const Dropdowns = Dropdown(res?.results, "name");
      setState({ categoryList: Dropdowns });
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const onSubmit = async () => {
    try {
      setState({ submitLoading: true });
      let body: any = {
        description: state.description ? state.description : "",
        title: state.title,
        start_date: state.start_date
          ? moment(state.start_date).format("YYYY-MM-DD")
          : null,
        end_date: state.end_date
          ? moment(state.end_date).format("YYYY-MM-DD")
          : null,
        end_time: state.end_time
          ? moment(state.end_time).format("hh:mm:ss")
          : null,
        start_time: state.start_time
          ? moment(state.start_time).format("hh:mm:ss")
          : null,
        price: state.price ? state.price : 0,
        session_link: state.session_link,
        seat_count: state.seat_count,
        lounge_type: state.lounge_type ? state.lounge_type?.value : null,
        thumbnail_image: state.thumbnail_images,
      };
      console.log("body: ", body);

      let formData = new FormData();
      formData.append("description", body.description);
      formData.append("title", body.title);
      formData.append("start_date", body.start_date);
      formData.append("end_date", body.end_date);
      formData.append("event_type", body.lounge_type);
      formData.append("price", body.price);
      formData.append("start_time", body.start_time);
      formData.append("end_time", body.end_time);
      formData.append("session_link", body.session_link);
      formData.append("seat_count", body.seat_count);
      formData.append("lounge_type", body.lounge_type);

      if (body.thumbnail_image) {
        formData.append("thumbnail", body.thumbnail_image);
      }
      await Validation.createSession.validate(body, {
        abortEarly: false,
      });
      const res = await Models.session.create(formData);
      setState({ submitLoading: false });

      router.push("/wellness-lounge-list");
      Success("Lounge created successfully");
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
    <div className="container mx-auto ">
      <div className="flex justify-center   ">
        <div className="w-full">
          <div className="font-bold text-lg mb-3">Create Lounge Session</div>
          <div className="grid auto-rows-min gap-4 md:grid-cols-2">
            <div className="border rounded-xl p-4 gap-4 flex flex-col ">
              <TextInput
                value={state.title}
                onChange={(e) => {
                  setState({ title: e.target.value });
                }}
                placeholder="Title"
                title="Title"
                error={state.errors?.title}
                required
              />
              <TextArea
                name="Description"
                value={state.description}
                onChange={(e: any) => {
                  setState({ description: e.target.value });
                }}
                className="mt-2 w-full"
                placeholder="Description"
                title="Description"
              />
              <div className="grid auto-rows-min gap-4 grid-cols-2">
                <DatePicker
                  placeholder="Start date"
                  title="Start date"
                  selectedDate={state.start_date}
                  onChange={(date: any) => {
                    console.log("date: ", date);
                    setState({
                      start_date: date,
                    });
                  }}
                  error={state.errors?.start_date}
                  required
                />
                <DatePicker
                  placeholder="End date"
                  title="End date"
                  selectedDate={state.end_date}
                  onChange={(date: any) => {
                    console.log("date: ", date);
                    setState({
                      end_date: date,
                    });
                  }}
                  error={state.errors?.end_date}
                  required
                />
              </div>
              <div className="grid auto-rows-min gap-4 grid-cols-2">
                <TimePicker
                  value={state.start_time}
                  onChange={(e: any) => setState({ start_time: e })}
                  title="Start Time"
                  placeholder="Start Time"
                  error={state.errors?.start_time}
                  required
                />
                <TimePicker
                  value={state.end_time}
                  onChange={(e: any) => setState({ end_time: e })}
                  title="End Time"
                  placeholder="End Time"
                  error={state.errors?.end_time}
                  required
                />
              </div>
            </div>

            <div className="border rounded-xl p-4 gap-4 flex flex-col ">
              <CustomSelect
                options={state.categoryList}
                value={state.lounge_type?.value || ""}
                onChange={(value: any) => setState({ lounge_type: value })}
                title="Lounge Type"
                error={state.errors?.lounge_type}
                required
              />
              <TextInput
                value={state.session_link}
                onChange={(e) => {
                  setState({ session_link: e.target.value });
                }}
                placeholder="Session Link"
                title="Session Link"
                error={state.errors?.session_link}
                required
              />
              <TextInput
                value={state.price}
                onChange={(e) => {
                  setState({ price: e.target.value });
                }}
                placeholder="Price"
                title="Price"
                type="number"
                error={state.errors?.price}
              />

              <TextInput
                value={state.seat_count}
                onChange={(e) => {
                  setState({ seat_count: e.target.value });
                }}
                placeholder="Seat Count"
                title="Seat Count"
                type="number"
                error={state.errors?.seat_count}
              />
              <TextInput
                title="Session Image"
                placeholder="Session Image"
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
              />

              <div className="flex justify-end gap-5 mt-10">
                {/* <Button variant="outline" className="sm:w-auto lg:w-[100px]">
              Cancel
            </Button>
            <Button
              className="sm:w-auto lg:w-[100px]"
              onClick={() => onSubmit()}
            >
              Submit
            </Button> */}

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

      </div>

    </div>
  );
}
