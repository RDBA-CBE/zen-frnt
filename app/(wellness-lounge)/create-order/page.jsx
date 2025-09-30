"use client";

import { useEffect } from "react";
import Models from "@/imports/models.import";
import {
  Dropdown,
  formatNumber,
  UserDropdown,
  useSetState,
} from "@/utils/function.utils";

import CustomSelect from "@/components/common-components/dropdown";

import LoadMoreDropdown from "@/components/common-components/LoadMoreDropdown";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import * as Validation from "../../../utils/validation.utils";
import { Failure, Success } from "@/components/common-components/toast";
import PrimaryButton from "@/components/common-components/primaryButton";

import { AYURVEDIC_LOUNGE, orderStatusList } from "@/utils/constant.utils";
import ProtectedRoute from "@/components/common-components/privateRouter";
import BookingSlots from "@/components/common-components/bookingSlots";
import moment from "moment";
import { TextInput } from "@/components/common-components/textInput";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/dataTable";
import { Label } from "@radix-ui/react-label";

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
    price: 0,
    sessionDetail: [],
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
      if (!state.session?.value) {
        return {
          options: [],
          hasMore: false,
          additional: {
            page: page,
          },
        };
      }
      const body = {
        lounge_type: state.session?.value,
      };

      const res = await Models.session.eventFilter(page, body);
      console.log("✌️res --->", res);
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

  const loadSessionOptions = async (search, loadedOptions, { page }) => {
    try {
      const res = await Models.category.listWithPage(page);
      const Dropdowns = Dropdown(res?.results, "name");
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
        session:state.session?.value

      };

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

  const handleSessionChange = async (value) => {
    try {
      setState({ session: value });
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
          price: formatNumber(res?.price),
          sessionDetail: [res],
        });
      } else {
        setState({ lounge_type: null, event: null });
      }
    } catch (error) {}
  };

  const handleLoungeChange = async (value) => {
    try {
      setState({ event: value });
      if (value) {
        const res = await Models.session.details(value?.value);
        getEventSlot(res?.id);
        setState({
          lounge_type: res?.lounge_type?.id,
          start_date: res?.start_date,
          end_date: res?.end_date,
          eventId: res?.id,
          errors: { ...state.errors, event: "", lounge_type: "" },
          price: formatNumber(res?.price),
          sessionDetail: [res],
        });
      } else {
        setState({ lounge_type: null, event: null });
      }
    } catch (error) {}
  };

  const columns = [
    {
      Header: "Title",
      accessor: "title",
    },
    {
      Header: "Lounge Type",
      accessor: "lounge_type",
      Cell: (row) => <Label>{row?.row?.lounge_type?.name}</Label>,
    },
    {
      Header: "Start Date",
      accessor: "start_date",
      Cell: (row) => (
        <Label>{moment(row?.row?.start_date).format("DD-MM-YYYY")}</Label>
      ),
    },
    {
      Header: "End Date",
      accessor: "end_date",
      Cell: (row) => (
        <Label>{moment(row?.row?.end_date).format("DD-MM-YYYY")}</Label>
      ),
    },
    {
      Header: "Start Time",
      accessor: "start_time",
      Cell: (row) => <Label>{row?.row?.start_time}</Label>,
    },
    {
      Header: "End Time",
      accessor: "end_time",
      Cell: (row) => <Label>{row?.row?.end_time}</Label>,
    },
    // {
    //     Header: "Action",
    //     accessor: "action",
    //     Cell: (row: any) => (
    //         <XIcon onClick={setState({lounge: null})}/>
    //     )
    // }
  ];

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
              value={state.session}
              onChange={(value) => {
                if (value) {
                  setState({
                    session: value,
                    event: null,
                    lounge_type: null,
                    sessionDetail: [],
                    slots: [],
                    errors: { ...state.errors, session: "" },
                    price:0


                  });
                } else {
                  setState({
                    event: null,
                    lounge_type: null,
                    sessionDetail: [],
                    slots: [],
                    session: null,
                    price:0
                  });
                }
              }}
              title="Select Session"
              error={state.errors?.session}
              required
              placeholder="Select Session"
              loadOptions={loadSessionOptions}
            />
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
              reRender={state.session}
            />
            {state.lounge_type ? (
              state.lounge_type == AYURVEDIC_LOUNGE ? (
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
              ) : (
                <Card className="w-[100%] mt-2 mb-4 p-2">
                  <DataTable columns={columns} data={state.sessionDetail} />
                </Card>
              )
            ) : null}
            <TextInput
              value={state.price}
              onChange={(e) => {
                setState({ price: e.target.value });
              }}
              placeholder={
                state.lounge_type == AYURVEDIC_LOUNGE ? "Price" : "Credits"
              }
              title={
                state.lounge_type == AYURVEDIC_LOUNGE ? "Price" : "Credits"
              }
              type="number"
              disabled
            />
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
