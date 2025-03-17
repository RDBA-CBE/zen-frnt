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
import { CheckboxDemo } from "@/components/common-components/checkbox";
import { Trash2, X } from "lucide-react";
import { Success } from "@/components/common-components/toast";
import PrimaryButton from "@/components/common-components/primaryButton";

export default function UpdateWellnessLounge() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const [id, setId] = useState(null);

  useEffect(() => {
    // Ensure that searchParams are read only on the client side
    if (typeof window !== "undefined") {

      const idFromSearchParams = searchParams.get("id");

      if (idFromSearchParams) {
        setId(idFromSearchParams);
      }
    }

  }, [searchParams]);

  const [state, setState] = useSetState({
    seat_count: 0,
    session_link: "",
    price: 0,
    lounge_type: {},
    end_time: "",
    start_time: "",
    valid_to: "",
    valid_from: "",
    description: "",
    title: "",
    categoryName: "",
    categoryList: [],
    thumbnail_image: "",
    errors: {},
    isFeatured: false,
    submitLoading: false,
  });

  useEffect(() => {
    getCategoryList();
  }, []);

  useEffect(() => {
    if (id) {
      getDetails();
    }
  }, [id]);

  const getDetails = async () => {
    try {
      const res = await Models.session.details(id);

      if (res?.thumbnail) {
        const fileName = getFileNameFromUrl(res?.thumbnail);
        const thumbnail = await convertUrlToFile(res?.thumbnail, fileName);

        setState({
          thumbnail_images: thumbnail,
          thumbnail_image: res?.thumbnail,
        });
      }
      setState({
        title: res.title,

        description: res.description,
        start_date: new Date(res.start_date),
        end_date: new Date(res.end_date),
        price: Number(res?.price),
        session_link: res.session_link,
        // start_time:moment(res.start_time).format("h:mm aa")
        start_time: moment(res.start_time, "h:mm aa").toDate(),
        end_time: moment(res.end_time, "h:mm aa").toDate(),
        lounge_type: {
          value: res?.lounge_type?.id,
          label: res?.lounge_type?.name,
        },
        seat_count: Number(res?.seat_count),
        isFeatured: res?.is_featured,
      });
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const getCategoryList = async () => {
    try {
      const res = await Models.category.list();
      console.log("res: ", res);
      const Dropdowns = Dropdown(res?.results, "name");
      setState({ categoryList: Dropdowns });
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const onSubmit = async () => {
    try {
      setState({ submitLoading: true });
      let body = {
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
        is_featured: state.isFeatured,
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
      formData.append("is_featured", body.is_featured);

      if (body.thumbnail_image) {
        formData.append("thumbnail", body.thumbnail_image);
      } else {
        formData.append("thumbnail", "");
      }
      await Validation.createSession.validate(body, {
        abortEarly: false,
      });
      const res = await Models.session.update(formData, id);
      setState({ submitLoading: false });

      router.push("/wellness-lounge-list");
      Success("Lounge updated successfully");
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
  console.log("isFeatured: ", state.isFeatured);

  return (
    <div className="container mx-auto">
      <div className="font-bold text-lg mb-3">Update Lounge Session</div>
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
            onChange={(e) => {
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
              onChange={(date) => {
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
              onChange={(date) => {
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
              onChange={(e) => setState({ start_time: e })}
              title="Start Time"
              placeholder="Start Time"
              error={state.errors?.start_time}
              required
            />
            <TimePicker
              value={state.end_time}
              onChange={(e) => setState({ end_time: e })}
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
            onChange={(value) => setState({ lounge_type: value })}
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
          <CheckboxDemo
            label="Featured Lounge"
            value="isFeatured"
            selectedValues={
              state.isFeatured
                ? [{ value: "isFeatured", label: "Featured" }]
                : []
            }
            onChange={(newSelectedValues) => {
              const isChecked = newSelectedValues.some(
                (item) => item.value === "isFeatured"
              );
              setState({ isFeatured: isChecked });
            }}
            isMulti={false} // Single selection
          />
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
              title="Session Image"
              placeholder="Session Image"
              type="file"
              className="mt-2 w-full"
              onChange={(e) => {
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
