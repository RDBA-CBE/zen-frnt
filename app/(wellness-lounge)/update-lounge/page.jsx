"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Models from "@/imports/models.import";
import {
  Dropdown,
  buildFormData,
  convertUrlToFile,
  getFileNameFromUrl,
  getTimeZone,
  getUnmatchedSlots,
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
import * as Validation from "../../../utils/validation.utils";
import { CheckboxDemo } from "@/components/common-components/checkbox";
import { Loader, Trash2, X } from "lucide-react";
import { Failure, Success } from "@/components/common-components/toast";
import PrimaryButton from "@/components/common-components/primaryButton";
import * as Yup from "yup";
import ProtectedRoute from "@/components/common-components/privateRouter";
import SlideCalender from "@/components/common-components/slideCalender";
import Select from "react-select";
import dynamic from "next/dynamic";
import { AYURVEDIC_LOUNGE, getTimeIntervals } from "@/utils/constant.utils";
import LoadMoreDropdown from "@/components/common-components/loadMoreDropdown";
import TimezoneSelector from "@/components/common-components/TimezoneSelect";

// import DateTimeField from "@/components/common-components/DateTimeField"

// Dynamically import DateTimeField to avoid hydration issues (if needed)
const DateTimeField = dynamic(
  () => import("@/components/common-components/DateTimeField"),
  { ssr: false }
);

const UpdateWellnessLounge = () => {
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
    loading: false,
    interval: { label: "30 Minutes", value: 30 },
    slots: [],
    isAnyBooked: false,
    intrested_topics: [],
    passcode: "",
  });

  useEffect(() => {
    getCategoryList();
    getIntrestedTopics();
  }, []);

  useEffect(() => {
    getDetails();
    getEventSlot();
  }, [id]);

  const getDetails = async () => {
    try {
      setState({ loading: true });
      const res = await Models.session.details(id);
      if (res?.thumbnail) {
        const fileName = getFileNameFromUrl(res?.thumbnail);
        const thumbnail = await convertUrlToFile(res?.thumbnail, fileName);

        setState({
          thumbnail_images: thumbnail,
          thumbnail_image: res?.thumbnail,
        });
      }

      if (res?.timezone) {
        setState({
          timezone: getTimeZone(res?.timezone),
          timezones: res?.timezone,
        });
      }
      if (res?.intrested_topics?.length > 0) {
        const topic = Dropdown(res?.intrested_topics, "topic");
        setState({ intrested_topics: topic });
      }
      if (res?.moderator) {
        setState({
          moderator: {
            value: res?.moderator?.id,
            label: `${res?.moderator?.first_name} ${res?.moderator?.last_name}`,
          },
        });
      }

      setState({
        title: res.title,
        interval: res.interval,
        description: res.description,
        start_date: new Date(res.start_date),
        end_date: new Date(res.end_date),
        price: Number(res?.price),
        session_link: res.session_link,
        // start_time:moment(res.start_time).format("h:mm aa")
        start_time: moment(res.start_time, "h:mm aa").toDate(),
        end_time: moment(res.end_time, "h:mm aa").toDate(),
        combinedStartDateTime: moment(
          `${res.start_date} ${res.start_time}`,
          "YYYY-MM-DD h:mm A"
        ).toDate(),
        combinedEndDateTime: moment(
          `${res.end_date} ${res.end_time}`,
          "YYYY-MM-DD h:mm A"
        ).toDate(),
        lounge_type: {
          value: res?.lounge_type?.id,
          label: res?.lounge_type?.name,
        },
        seat_count: Number(res?.seat_count),
        isFeatured: res?.is_featured,
        loading: false,
        passcode: res?.passcode,
        // lable: res?.lable,
      });
    } catch (error) {
      setState({ loading: false });

      console.log("error: ", error);
    }
  };

  const getEventSlot = async () => {
    try {
      setState({ loading: true });

      const res = await Models.slot.list(id);
      if (res?.results?.length > 0) {
        const isAnyBooked = res?.results.some((day) =>
          day.slots.some((slot) => slot.booked === true)
        );
        setState({ isAnyBooked });
      }

      setState({ eventSlot: res?.results });
    } catch (error) {
      setState({ loading: false });

      console.log("error: ", error);
    }
  };

  const getCategoryList = async () => {
    try {
      setState({ loading: true });

      const res = await Models.category.activeList();
      const Dropdowns = Dropdown(res?.results, "name");
      setState({ categoryList: Dropdowns, loading: false });
    } catch (error) {
      setState({ loading: false });

      console.log("error: ", error);
    }
  };

  const getIntrestedTopics = async () => {
    try {
      const res = await Models.auth.getIntrestedTopics();
      const filters = res?.results?.filter((item) => item?.id != 13);

      const Dropdownss = Dropdown(filters, "topic");
      const filter = Dropdownss?.filter((item) => item?.label !== "");

      setState({ intrestedTopicsList: filter });
    } catch (error) {
      console.log(error);
    }
  };

  const onSubmit = async () => {
    try {
      setState({ submitLoading: true });

      let validForFree = {
        title: state.title,
        lounge_type: state.lounge_type ? state.lounge_type?.value : null,
        start_date: state.start_date
          ? moment(state.start_date).format("YYYY-MM-DD")
          : null,
        end_date: state.end_date
          ? moment(state.end_date).format("YYYY-MM-DD")
          : null,
        end_time: state.end_time
          ? moment(state.end_time).format("HH:mm:ss")
          : null,
        start_time: state.start_time
          ? moment(state.start_time).format("HH:mm:ss")
          : null,
        timezone: state?.timezone,
        moderator: state.moderator?.value,
        intrested_topics:
          state?.intrested_topics?.length > 0
            ? state?.intrested_topics?.map((item) => item.value)
            : [],
        session_link: state.session_link,
        thumbnail_image: state.thumbnail_images,
      };

      let validForPaid = {
        title: state.title,
        start_date: state.start_date
          ? moment(state.start_date).format("YYYY-MM-DD")
          : null,

        end_date: state.end_date
          ? moment(state.end_date).format("YYYY-MM-DD")
          : null,

        session_link: state.session_link,
        lounge_type: state.lounge_type ? state.lounge_type?.value : null,
        thumbnail_image: state.thumbnail_images,
        slot: state.slots,
        interval: state.interval,
        moderator: state.moderator?.value,
        intrested_topics:
          state?.intrested_topics?.length > 0
            ? state?.intrested_topics?.map((item) => item.value)
            : [],
        timezone: state?.timezone,
      };

      if (state.lounge_type?.value == AYURVEDIC_LOUNGE) {
        await Validation.createPaidSession.validate(validForPaid, {
          abortEarly: false,
        });
      } else {
        await Validation.createFreeSession.validate(validForFree, {
          abortEarly: false,
        });
      }

      if (state.lounge_type?.value == AYURVEDIC_LOUNGE) {
        await updatePaidSession();
      } else {
        await updateFreeSession();
      }
      // let body = {
      //   description: state.description ? state.description : "",
      //   title: state.title,
      //   start_date: state.start_date
      //     ? moment(state.start_date).format("YYYY-MM-DD")
      //     : null,
      //   end_date: state.end_date
      //     ? moment(state.end_date).format("YYYY-MM-DD")
      //     : null,
      //   end_time: state.end_time
      //     ? moment(state.end_time).format("HH:mm")
      //     : null,
      //   start_time: state.start_time
      //     ? moment(state.start_time).format("HH:mm")
      //     : null,
      //   price: state.price ? state.price : 0,
      //   session_link: state.session_link,
      //   seat_count: state.seat_count,
      //   lounge_type: state.lounge_type ? state.lounge_type?.value : null,
      //   thumbnail_image: state.thumbnail_images,
      //   is_featured: state.isFeatured,
      //   slot: state.lounge_type?.value == AYURVEDIC_LOUNGE ? state.slots : [],
      //   interval:
      //     state.lounge_type?.value == AYURVEDIC_LOUNGE && state.interval
      //       ? state.interval
      //       : 30,
      //   moderator: state.moderator?.value,
      //   intrested_topics:
      //     state?.intrested_topics?.length > 0
      //       ? state?.intrested_topics?.map((item) => item.value)
      //       : [],
      //   lable: state?.lable || "",
      // };
      // console.log("body: ", body);

      // let formData = new FormData();
      // formData.append("description", body.description);
      // formData.append("title", body.title);
      // formData.append("start_date", body.start_date);
      // formData.append("end_date", body.end_date);
      // formData.append("event_type", body.lounge_type);
      // formData.append("price", body.price);
      // formData.append("start_time", body.start_time);
      // formData.append("end_time", body.end_time);
      // formData.append("session_link", body.session_link);
      // formData.append("seat_count", body.seat_count);
      // formData.append("lounge_type", body.lounge_type);
      // formData.append("is_featured", body.is_featured);
      // formData.append("moderator", body.moderator);
      // {
      //   body.intrested_topics?.map((item) =>
      //     formData.append("intrested_topics", item)
      //   );
      // }
      // formData.append("lable", body.lable);

      // if (body.thumbnail_image) {
      //   formData.append("thumbnail", body.thumbnail_image);
      // } else {
      //   formData.append("thumbnail", "");
      // }
      // await Validation.createSession.validate(body, {
      //   abortEarly: false,
      // });
      // const res = await Models.session.update(formData, id);
      // await createSlot();

      // setState({ submitLoading: false });

      // router.push("/wellness-lounge-list");
      // Success(
      //   `The session ${state.title} under the ${state.lounge_type?.label} category has been updated. All changes are now live and reflected across participant dashboards.`
      // );
    } catch (error) {
      // console.log("error", error?.end_date[0])
      console.log("error", error);

      // Check if error for start_date exists and has at least one error message
      if (
        error?.start_date &&
        Array.isArray(error.start_date) &&
        error.start_date.length > 0
      ) {
        Failure(error?.start_date[0]);
      }

      // Check if error for end_date exists and has at least one error message
      else if (
        error?.end_date &&
        Array.isArray(error.end_date) &&
        error.end_date.length > 0
      ) {
        Failure(error?.end_date[0]);
      } else if (
        error?.start_time &&
        Array.isArray(error.start_time) &&
        error.start_time.length > 0
      ) {
        Failure(error?.start_time[0]); // Show failure message for start_time
      } else if (
        error?.end_time &&
        Array.isArray(error.end_time) &&
        error.end_time.length > 0
      ) {
        Failure(error?.end_time[0]);
      }

      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        console.log("validationErrors: ", validationErrors);
        setState({ submitLoading: false, errors: validationErrors });
      } else {
        const errros = state.errors;
        // if(state?.topic?.length == 0){
        //   errros.topic == "Interested topic is required"
        // }

        // setState({ errors:[errros] });
        setState({ submitLoading: false });
      }
    }
  };

  const updateFreeSession = async (res) => {
    try {
      let body = {
        title: state.title,
        description: state.description ? state.description : "",
        lounge_type: state.lounge_type ? state.lounge_type?.value : null,

        start_date: state.start_date
          ? moment(state.start_date).format("YYYY-MM-DD")
          : null,
        end_date: state.end_date
          ? moment(state.end_date).format("YYYY-MM-DD")
          : null,
        end_time: state.end_time
          ? moment(state.end_time).format("HH:mm:ss")
          : null,
        start_time: state.start_time
          ? moment(state.start_time).format("HH:mm:ss")
          : null,
        timezone: state?.timezones,
        moderator: state.moderator?.value,
        intrested_topics:
          state?.intrested_topics?.length > 0
            ? state?.intrested_topics?.map((item) => item.value)
            : [],
        session_link: state.session_link,
        passcode: state?.passcode,
        thumbnail: state.thumbnail_images,
        event_credits: state.price ? state.price : 0,
        price: state.price ? state.price : 0,
      };

      const formData = buildFormData(body);

      const res = await Models.session.update(formData, id);

      setState({ submitLoading: false });

      router.back();
      Success(
        `The session ${state.title} under the ${state.lounge_type?.label} category has been updated. All changes are now live and reflected across participant dashboards.`
      );
    } catch (error) {
      setState({ submitLoading: false });
      console.log("error: ", error);
    }
  };

  const updatePaidSession = async (res) => {
    try {
      let body = {
        title: state.title,
        description: state.description ? state.description : "",
        lounge_type: state.lounge_type ? state.lounge_type?.value : null,
        start_date: state.start_date
          ? moment(state.start_date).format("YYYY-MM-DD")
          : null,
        end_date: state.end_date
          ? moment(state.end_date).format("YYYY-MM-DD")
          : null,
        interval: state.interval,

        timezone: state?.timezones,
        moderator: state.moderator?.value,
        intrested_topics:
          state?.intrested_topics?.length > 0
            ? state?.intrested_topics?.map((item) => item.value)
            : [],
        session_link: state.session_link,
        passcode: state?.passcode,
        price: state.price ? state.price : 0,
        seat_count: state.seat_count || 0,
        thumbnail: state.thumbnail_images,
      };

      if (state.slots?.length > 0) {
        const slotsWithTime = state.slots.filter(
          (slot) => slot.slot?.length > 0
        );

        if (slotsWithTime.length > 0) {
          const firstSlot = slotsWithTime[0];

          let highestTime = "";

          slotsWithTime.forEach((slot) => {
            slot.slot.forEach((time) => {
              if (!highestTime || time > highestTime) {
                highestTime = time;
              }
            });
          });

          const start_time = firstSlot.slot[0];
          const end_time = highestTime;

          body.start_time = moment(start_time, "HH:mm").format("HH:mm");
          body.end_time = moment(end_time, "HH:mm").format("HH:mm");
        }
      }

      const formData = buildFormData(body);

      const res = await Models.session.update(formData, id);
      await createSlot();
      setState({ submitLoading: false });

      router.back();

      Success(
        `The session ${state.title} under the ${state.lounge_type?.label} category has been updated. All changes are now live and reflected across participant dashboards.`
      );
    } catch (error) {
      setState({ submitLoading: false });
      console.log("error: ", error);
    }
  };

  const createSlot = async () => {
    try {
      const final = getUnmatchedSlots(state.slots, state.eventSlot);

      if (final?.length > 0) {
        const filter = final?.map(async (item) => {
          const res = await Models.slot.delete(item?.id);
        });
      }

      if (state.eventSlot?.length > 0) {
        const result = state.slots.map((day) => {
          const match = state.eventSlot.find((f) => f.date === day.date);
          const available = match
            ? match.slots.map((s) => s.start_time.slice(0, 5))
            : [];
          const unmatched = day.slot.filter((t) => !available.includes(t));
          return {
            date: day.date,
            slot: unmatched,
          };
        });

        // const filter = result?.filter((item) => item.slot.length > 0 && item);
        const promises = result?.map((slot) => {
          const body = {
            event: id,
            date: slot.date,
            start_time: moment(state.start_time).format("HH:mm"),
            end_time: moment(state.end_time).format("HH:mm"),
            slots: slot.slot,
          };
          return Models.slot.create(body);
        });
        await Promise.all(promises); // ✅ wait until all complete
      } else {
        // create new slots in parallel and wait for all
        const promises = state.slots.map((slot) => {
          const body = {
            event: id,
            date: slot.date,
            start_time: moment(state.start_time).format("HH:mm"),
            end_time: moment(state.end_time).format("HH:mm"),
            slots: slot.slot,
          };
          return Models.slot.create(body);
        });

        await Promise.all(promises); // ✅ wait until all complete
      }
      // setState({ loading: false });
    } catch (error) {
      // setState({ loading: false });
      console.log("error: ", error);
    }
  };

  const loadMendorList = async (search, loadedOptions, { page }) => {
    try {
      const body = {
        group_name: "Mentor",
      };
      const res = await Models.user.userList(page, body);
      const dropdownsa = res?.results?.map((item) => ({
        value: item?.id,
        label: `${item?.first_name} ${item.last_name}`,
      }));

      return {
        options: dropdownsa,
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
  console.log("✌️state.timezone --->", state.timezone);

  return state.loading ? (
    <div className="container mx-auto flex justify-center items-center ">
      <Loader />
    </div>
  ) : (
    <div className="container mx-auto">
      <h2 className="font-bold md:text-[20px] text-sm mb-3">
        Update Lounge Session
      </h2>
      <div className="grid auto-rows-min gap-4 md:grid-cols-2">
        <div className="border rounded-xl p-4 gap-4 flex flex-col ">
          <TextInput
            value={state.title}
            onChange={(e) => {
              setState({
                title: e.target.value,
                errors: { ...state.errors, title: "" },
              });
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
          <CustomSelect
            options={state.categoryList}
            value={state.lounge_type?.value || ""}
            onChange={(value) =>
              setState({
                lounge_type: value,
                errors: { ...state.errors, lounge_type: "" },
              })
            }
            title="Lounge Type"
            error={state.errors?.lounge_type}
            required
            disabled={state.isAnyBooked}
          />

          {state.lounge_type?.value == AYURVEDIC_LOUNGE && (
            <>
              <div className="w-full grid auto-rows-min gap-4 md:grid-cols-2">
                <DatePicker
                  placeholder="Start Date"
                  title="Start Date"
                  required
                  error={state.errors?.start_date}
                  closeIcon={true}
                  selectedDate={state.start_date}
                  onChange={(date) => {
                    setState({
                      start_date: date,
                    });
                  }}
                  disabled={state.isAnyBooked}
                />

                <DatePicker
                  placeholder="End Date"
                  title="End Date"
                  required
                  error={state.errors?.end_date}
                  closeIcon={true}
                  selectedDate={state.end_date}
                  onChange={(date) => {
                    setState({
                      end_date: date,
                      errors: { ...state.errors, end_date: "" },
                    });
                  }}
                  fromDate={state.start_date}
                />
                <TimezoneSelector
                  title="Timezone"
                  required
                  error={state.errors?.timezone}
                  value={state.timezone}
                  onChange={(tz) => {
                    setState({
                      timezone: tz?.value,
                      timezones: tz?.label,
                      errors: { ...state.errors, timezone: "" },
                    });
                  }}
                />
              </div>

              <SlideCalender
                startDate={state.start_date}
                endDate={state.end_date}
                slotInterval={state.interval || 30}
                getSlots={(data) => {
                  setState({ slots: data });
                }}
                error={state.errors?.slot}
                eventSlot={state.eventSlot}
              />
            </>
          )}
          {state.lounge_type?.value != AYURVEDIC_LOUNGE && (
            <>
              <div className="grid auto-rows-min gap-4 grid-cols-2">
                <DateTimeField
                  disabled={state.isAnyBooked}
                  label={`Start Date & Time (Choose both date & time)`}
                  placeholder="Start Date & Time"
                  value={state.combinedStartDateTime}
                  onChange={(date) => {
                    setState({
                      ...state,
                      combinedStartDateTime: date,
                      start_date: date,
                      start_time: date,
                      // end_date: null,
                      errors: {
                        ...state.errors,
                        start_date: "",
                        start_time: "",
                      },
                    });
                  }}
                  error={state.errors?.start_date || state.errors?.start_time}
                  required
                  fromDate={new Date()}
                />

                <DateTimeField
                  label="End Date & Time (Choose both date & time)"
                  placeholder="End Date & Time"
                  value={state.combinedEndDateTime}
                  onChange={(date) => {
                    setState({
                      ...state,
                      combinedEndDateTime: date,
                      end_date: date,
                      end_time: date,
                      errors: { ...state.errors, end_date: "", end_time: "" },
                    });
                  }}
                  error={state.errors?.end_date || state.errors?.end_time}
                  required
                  fromDate={
                    !state.isAnyBooked ? state.end_date : state.start_date
                  }
                />
              </div>
              <TimezoneSelector
                title="Timezone"
                required
                error={state.errors?.timezone}
                value={state.timezone}
                onChange={(tz) => {
                  setState({
                    timezone: tz?.value,
                    timezones: tz?.label,
                    errors: { ...state.errors, timezone: "" },
                  });
                }}
              />
            </>
          )}
          {state.lounge_type?.value == AYURVEDIC_LOUNGE && (
            <>
              {/* <CustomSelect
                options={getTimeIntervals}
                value={state.interval?.value || ""}
                onChange={(value) =>
                  setState({
                    interval: value,
                    errors: { ...state.errors, interval: "" },
                  })
                }
                title="Interval (In minutes)"
                error={state.errors?.interval}
                required
              /> */}
            </>
          )}
        </div>

        <div className="border rounded-xl p-4 gap-4 flex flex-col ">
          <LoadMoreDropdown
            value={state.moderator}
            onChange={(value) => {
              setState({
                moderator: value,
                errors: { ...state.errors, moderator: "" },
              });
            }}
            height={"35px"}
            title="Select Mentor"
            error={state.errors?.moderator}
            required
            placeholder="Select Mentor"
            loadOptions={loadMendorList}
            disabled={state.isAnyBooked}
          />
          <div className="space-y-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {"Topics"} <span className="text-red-500">*</span>
            </label>
            <Select
              value={state.intrested_topics}
              isMulti
              options={state.intrestedTopicsList || []}
              placeholder="Select Topics"
              onChange={(value) =>
                setState({
                  intrested_topics: value,
                  errors: { ...state.errors, intrested_topics: "" },
                })
              }
              className=" text-sm"
              name="topics"
              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              menuPortalTarget={document.body}
            />
            {state.errors?.intrested_topics && (
              <p className=" text-sm text-red-600">
                {state.errors?.intrested_topics}
              </p>
            )}
          </div>

          {/* {state.intrested_topics?.length > 0 &&
            state.intrested_topics?.some((topic) => topic?.value === 13) && (
              <div className="space-y-1">
                <TextInput
                  id="intrested_topics1"
                  type="text"
                  placeholder="Enter New Topics"
                  title="New Topics"
                  value={state.lable}
                  required
                  error={state.errors?.lable}
                  onChange={(e) =>
                    setState({
                      lable: e.target.value,
                      errors: { ...state.errors, lable: "" },
                    })
                  }
                />
              </div>
            )} */}
          <TextInput
            value={state.session_link}
            onChange={(e) => {
              setState({
                session_link: e.target.value,
                errors: { ...state.errors, session_link: "" },
              });
            }}
            placeholder="Session Link"
            title="Session Link"
            error={state.errors?.session_link}
            required
            // disabled={state.isAnyBooked}
          />
          <TextInput
            value={state.passcode}
            onChange={(e) => {
              setState({ passcode: e.target.value });
            }}
            placeholder={"PassCode"}
            title={"PassCode"}
            type="text"
            error={state.errors?.price}
          />
          <TextInput
            value={state.price}
            onChange={(e) => {
              setState({ price: e.target.value });
            }}
            placeholder={
              state.lounge_type?.value == AYURVEDIC_LOUNGE ? "Price" : "Credits"
            }
            title={
              state.lounge_type?.value == AYURVEDIC_LOUNGE ? "Price" : "Credits"
            }
            type="number"
            error={state.errors?.price}
            disabled={state.isAnyBooked}
          />
          {state.lounge_type?.value == AYURVEDIC_LOUNGE && (
            <TextInput
              value={state.seat_count}
              onChange={(e) => {
                setState({ seat_count: e.target.value });
              }}
              placeholder="Seat Count"
              title="Seat Count"
              type="number"
              error={state.errors?.seat_count}
              disabled={state.isAnyBooked}
            />
          )}
          {/* <CheckboxDemo
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
              title="Session Image ( Best Result: Image Size - 610*407)"
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
                  errors: { ...state.errors, thumbnail_image: "" },
                });
              }}
              required
              error={state.errors?.thumbnail_image}
            />
          )}

          <div className="flex justify-end gap-5 mt-10">
            <PrimaryButton
              variant={"outline"}
              name="Cancel"
              className="border-themeGreen hover:border-themeGreen text-themeGreen hover:text-themeGreen"
              onClick={() => router.push("/wellness-lounge-list")}
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

export default ProtectedRoute(UpdateWellnessLounge);
