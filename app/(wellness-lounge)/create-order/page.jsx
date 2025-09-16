"use client";

import { useEffect } from "react";
import Models from "@/imports/models.import";
import { Dropdown, UserDropdown, useSetState } from "@/utils/function.utils";

import CustomSelect from "@/components/common-components/dropdown";

import LoadMoreDropdown from "@/components/common-components/loadMoreDropdown";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import * as Validation from "../../../utils/validation.utils";
import { Failure, Success } from "@/components/common-components/toast";
import PrimaryButton from "@/components/common-components/primaryButton";

import { AYURVEDIC_LOUNGE, orderStatusList } from "@/utils/constant.utils";
import ProtectedRoute from "@/components/common-components/privateRouter";
import BookingSlots from "@/components/common-components/bookingSlots";
import moment from "moment";

const CreateOrder = () => {
  const router = useRouter();

  const [state, setState] = useSetState({
    lounge_type: {},
    categoryList: [],
    userList: [],
    user: null,
    loungeList: [],
    event: [],
    registration_status: {},
    errors: {},
    submitLoading: false,
    currentPage: 1,
    hasMore: true,
    dropLoading: false,
    selectedUser: [],
    lounge_type: null,
    eventSlot: [],
    eventId: null,
  });

  useEffect(() => {
    getCategoryList();
    getUsersList();
  }, []);

  const getCategoryList = async () => {
    try {
      const res = await Models.category.list();
      const Dropdowns = Dropdown(res?.results, "name");
      setState({ categoryList: Dropdowns });
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const getUsersList = async () => {
    let page = 1;
    let allResults = [];
    let nextPage = true;

    while (nextPage) {
      const res = await Models.user.dropdownUserserList(page);
      allResults = [...allResults, ...(res?.results || [])];

      page += 1;
      nextPage = !!res?.next;
    }
    setState({ userData: allResults });
  };

  const loadUserOptions = async (search, loadedOptions, { page }) => {
    try {
      const body = {
        search,
      };
      const res = await Models.user.dropdownUserserList(page, body); // API should support pagination
      const Dropdowns = UserDropdown(
        res?.results,
        (item) => `${item.first_name} ${item.last_name}`
      );
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

  const loadLoungeOptions = async (search, loadedOptions, { page }) => {
    try {
      const res = await Models.session.dropdownLoungelistWithPage(page);
      const Dropdowns = UserDropdown(res?.results, (item) => `${item.title} `);
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

  const onSubmit = async () => {
    try {
      setState({ submitLoading: true });
      let body = {
        user: state?.user?.value,
        event: [state?.eventId],
        // slot: state.slots?.fullSlot?.id,
        is_admin_registration: true,
      };

      let valid = {
        user: state?.user?.value,
        event: state?.eventId,
        slot: state.slots?.fullSlot?.id,
        lounge_type: state.lounge_type,
      };
      console.log("✌️valid --->", valid);

      if (state.lounge_type == AYURVEDIC_LOUNGE) {
        body.slot = state.slots?.fullSlot?.id;
        body.registration_status = "Completed";
      } else {
        body.registration_status = state?.registration_status?.value;
      }

      if (state.lounge_type == AYURVEDIC_LOUNGE) {
        valid.registration_status = "Completed";
      } else {
        valid.registration_status = state?.registration_status?.value;
      }
      console.log("✌️body --->", body);

      await Validation.createSessionOrder.validate(valid, {
        abortEarly: false,
      });
      const res = await Models.session.createRegistration(body);
      setState({ submitLoading: false });
      if (state.lounge_type == AYURVEDIC_LOUNGE) {
        router.push("/booking_list");
      } else {
        router.push("/order-list");
      }
      Success("Session created successfully");
      setState({
        submitLoading: false,
      });
    } catch (error) {
      console.log("error", error);

      if (error[0]) {
        Failure(error[0]);
        setState({
          submitLoading: false,
        });
      }

      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        console.log("✌️validationErrors --->", validationErrors);

        setState({
          errors: validationErrors,
          submitLoading: false,
        });
      } else {
        setState({ submitLoading: false });
      }
    }
  };

  const SelectedUser = state?.userData?.filter(
    (item) => item?.id == state?.user?.value
  );

  const handleLoungeChange = async (value) => {
    try {
      if (value) {
        const res = await Models.session.details(value?.value);
        console.log("✌️res --->", res);
        getEventSlot(res?.id);
        setState({
          lounge_type: res?.lounge_type?.id,
          start_date: res?.start_date,
          end_date: res?.end_date,
          eventId: res?.id,
          event: value,
          errors: { ...state.errors, event: "", lounge_type: "" },
        });
      } else {
        setState({ lounge_type: null, event: null });
      }
    } catch (error) {}
  };

  // const handleLoungeChange = async (value) => {
  //   try {
  //     if (value) {
  //       const res = await Models.session.details(value?.value);
  //       console.log('✌️res --->', res);

  //       const currentDateTime = moment();

  //       // Check if the lounge has already ended
  //       const loungeEndDate = moment(res.end_date);
  //       const loungeEndTime = moment(res.end_time, 'HH:mm:ss');

  //       // Combine date and time for the lounge end
  //       const loungeEndDateTime = loungeEndDate
  //         .set({
  //           hour: loungeEndTime.hour(),
  //           minute: loungeEndTime.minute(),
  //           second: loungeEndTime.second()
  //         });

  //       // Check if lounge has already ended
  //       if (loungeEndDateTime.isBefore(currentDateTime)) {
  //         setState({
  //           event: null,
  //           errors: {
  //             ...state.errors,
  //             event: "Cannot book this lounge. It has already ended."
  //           },
  //         });
  //         return;
  //       }

  //       // Check if the lounge start date/time is at least one day from now
  //       const loungeStartDate = moment(res.start_date);
  //       const loungeStartTime = moment(res.start_time, 'HH:mm:ss');

  //       // Combine date and time for the lounge start
  //       const loungeStartDateTime = loungeStartDate
  //         .set({
  //           hour: loungeStartTime.hour(),
  //           minute: loungeStartTime.minute(),
  //           second: loungeStartTime.second()
  //         });

  //       // Calculate 24 hours from now
  //       const twentyFourHoursFromNow = moment().add(24, 'hours');

  //       // Check if lounge starts at least 24 hours from now OR is already ongoing
  //       if (loungeStartDateTime.isAfter(twentyFourHoursFromNow) ||
  //           (loungeStartDateTime.isBefore(currentDateTime) && loungeEndDateTime.isAfter(currentDateTime))) {
  //         getEventSlot(res?.id);
  //         setState({
  //           lounge_type: res?.lounge_type?.id,
  //           start_date: res?.start_date,
  //           end_date: res?.end_date,
  //           eventId: res?.id,
  //           event: value,
  //           errors: { ...state.errors, event: "", lounge_type: "" },
  //         });
  //       } else {
  //         // Show error if lounge starts in less than 24 hours and hasn't started yet
  //         setState({
  //           event: null,
  //           errors: {
  //             ...state.errors,
  //             event: "Cannot book this lounge. It starts in less than 24 hours."
  //           },
  //         });
  //       }
  //     } else {
  //       setState({
  //         lounge_type: null,
  //         event: null,
  //         errors: { ...state.errors, event: "" }
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error handling lounge change:", error);
  //     setState({
  //       event: null,
  //       errors: {
  //         ...state.errors,
  //         event: "Error loading lounge details."
  //       },
  //     });
  //   }
  // };

  const getEventSlot = async (id) => {
    try {
      const res = await Models.slot.list(id);
      setState({ eventSlot: res?.results });
    } catch (error) {
      setState({ loading: false });

      console.log("error: ", error);
    }
  };

  return (
    <div className="container mx-auto flex items-center">
      <div className="w-full">
        <h2 className="font-bold md:text-[20px] text-sm mb-3">Add User</h2>
        <div className="grid auto-rows-min gap-4 md:grid-cols-2">
          <div className="border rounded-xl p-4 gap-4 flex flex-col ">
            <LoadMoreDropdown
              value={state.user}
              onChange={(value) => {
                setState({
                  user: value,
                  errors: { ...state.errors, user: "" },
                });
              }}
              title="Select User"
              error={state.errors?.user}
              required
              placeholder="Select User"
              loadOptions={loadUserOptions}
            />

            {/* <CustomSelect
              options={state.userList}
              value={state.user?.value || ""}
              onChange={(value) =>
                setState((prev) => ({
                  ...prev,
                  user: value,
                  errors: { ...prev.errors, user: "" },
                }))
              }
              title="Select User"
              error={state.errors?.user}
              required
              placeholder="Select User"
              onLoadMore={() => loadOptions(state.currentPage)}
              hasMore={state.hasMore} // now preserved!
              loading={state.dropLoading}
            /> */}
            <div>
              {SelectedUser?.length > 0 && (
                <>
                  <h3 className="text-lg font-medium">User Details:</h3>

                  <div className="pl-3 pt-3">
                    <ul className="text-sm">
                      <li className="pb-3">
                        <span className="font-bold text-gray-700">
                          Profile Picture:
                        </span>
                        <img
                          style={{ borderRadius: "10px" }}
                          src={
                            !SelectedUser[0]?.profile_picture
                              ? "/assets/images/dummy-profile.jpg"
                              : SelectedUser[0]?.profile_picture
                          }
                          //  src={SelectedUser[0]?.profile_picture}
                          alt="Profile"
                          className="w-[100px] h-[100px] rounded mt-2"
                        />
                      </li>
                      <li className="pb-3">
                        <span className="font-bold text-gray-700">Name:</span>{" "}
                        {SelectedUser[0]?.first_name}{" "}
                        {SelectedUser[0]?.last_name}
                      </li>
                      <li className="pb-3">
                        <span className="font-bold text-gray-700">Email:</span>{" "}
                        {SelectedUser[0]?.email || "N/A"}
                      </li>
                      <li className="pb-3">
                        <span className="font-bold text-gray-700">
                          Contact Number:
                        </span>{" "}
                        {SelectedUser[0]?.phone_number || "N/A"}
                      </li>
                      <li className="pb-3">
                        <span className="font-bold text-gray-700">
                          Date of Birth:
                        </span>{" "}
                        {SelectedUser[0]?.date_of_birth || "N/A"}
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="border rounded-xl p-4 gap-4 flex flex-col ">
            <LoadMoreDropdown
              value={state.event}
              onChange={(value) => {
                handleLoungeChange(value);
              }}
              title="Select Lounge"
              error={state.errors?.event || state.errors?.lounge_type}
              required
              placeholder="Select Lounge"
              loadOptions={loadLoungeOptions}
            />
            {state.lounge_type == AYURVEDIC_LOUNGE && (
              <>
                <BookingSlots
                  error={state.errors?.slot}
                  startDate={state.start_date || new Date()}
                  endDate={state.end_date || new Date()}
                  slotInterval={state.interval?.value || 30}
                  getSlots={(data) => {
                    if (data) {
                      setState({ errors: { ...state.errors, slot: "" } });
                    }
                    setState({ slots: data });
                  }}
                  eventSlot={state.eventSlot}
                  eventId={state.eventId}
                />
              </>
            )}
            {state.lounge_type != 15 && (
              <CustomSelect
                options={orderStatusList}
                value={state.registration_status?.value || ""}
                onChange={(value) =>
                  setState({
                    registration_status: value,
                    errors: { ...state.errors, registration_status: "" },
                  })
                }
                title="Select Session Status"
                error={state.errors?.registration_status}
                required
                placeholder="Select Session Status"
              />
            )}
            <div className="flex justify-end gap-5 mt-10">
              <PrimaryButton
                variant={"outline"}
                className="border-themeGreen hover:border-themeGreen text-themeGreen hover:text-themeGreen "
                name="Cancel"
                onClick={() => router.back()}
              />

              <PrimaryButton
                className="bg-themeGreen hover:bg-themeGreen"
                name="Submit"
                onClick={() => onSubmit()}
                loading={state.submitLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtectedRoute(CreateOrder);
