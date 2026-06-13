"use client";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/dataTable";

import {
  Edit,
  Eye,
  Loader,
  PlusIcon,
  Trash,
  CalendarX2,
  CalendarCheck2,
  FormInput,
  Sheet,
  XIcon,
} from "lucide-react";

import {
  Dropdown,
  extractZoomMeetingId,
  formatDuration,
  objIsEmpty,
  useSetState,
} from "@/utils/function.utils";
import Models from "@/imports/models.import";
import { useEffect } from "react";
import Modal from "@/components/common-components/modal";
import TextArea from "@/components/common-components/textArea";
import { TextInput } from "@/components/common-components/textInput";
import { useRouter, useSearchParams } from "next/navigation";
import { Success } from "@/components/common-components/toast";
import CustomSelect from "@/components/common-components/dropdown";
import moment from "moment";
import { Label } from "@radix-ui/react-label";
import PrimaryButton from "@/components/common-components/primaryButton";
import useDebounce from "@/components/common-components/useDebounce";
import Loading from "@/components/common-components/Loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProtectedRoute from "@/components/common-components/privateRouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AYURVEDIC_LOUNGE } from "@/utils/constant.utils";
import { DatePickers } from "@/components/common-components/datePickers";

const RegistrationList = () => {
  const router = useRouter();

  const searchParams = useSearchParams();

  const [state, setState] = useSetState({
    name: "",
    description: "",
    isOpen: false,
    categoryName: "",
    participatedList: [],
    eventDateCount: [],
    registrationList: [],
    submitLoading: false,
    search: "",
    currentPage: 1,
    loading: false,
    roleList: [],
    deleteLoading: false,
    isAyurvedic: false,
    activeTab: "registered",
  });

  const debouncedSearch = useDebounce(state.search, 500);

  useEffect(() => {
    eventDetail();
    registrationList(state.currentPage);
  }, [searchParams, state.start_date, state.session_date, state.selected_date]);
  console.log("✌️state.session_date --->", state.session_date);

  const registrationList = async (page) => {
    try {
      setState({ loading: true });
      const idFromSearchParams = searchParams.get("id");
      if (idFromSearchParams) {
        let body = {
          event: idFromSearchParams,
          include_deleted: "Yes",
        };
        if (state.start_date) {
          body.start_date = moment(state.start_date).format("YYYY-MM-DD");
        }

        if (state.session_date) {
          body.session_date = moment(state.session_date).format("YYYY-MM-DD");
        }

        if (state.selected_date) {
          body.session_date = moment(state.selected_date).format("YYYY-MM-DD");
        }

        const res = await Models.session.registrationList(page, body);
        console.log("registrationList", res);
        // const updateObj=res?.results?.map((item)=>({
        //   user:
        // }))
        setState({ registrationList: [] });

        if (res?.results?.length > 0) {
          const data = res?.results?.map((item) => {
            const isAyurvedic =
              item?.event?.lounge_type?.id === AYURVEDIC_LOUNGE;

            return {
              name: `${item?.user?.first_name || ""} ${
                item?.user?.last_name || ""
              }`,
              registration_id: item?.registration_id,
              registration_status: item?.registration_status,
              // registration_date:item?.google_event_id?(item?.start_datetime): item?.registration_date,
              session_date: item?.google_event_id
                ? moment(item?.start_datetime).format("DD-MM-YYYY")
                : moment(item?.event?.start_date).format("DD-MM-YYYY"),
              registration_date: item?.registration_date,

              slotDateOrStartTime: isAyurvedic
                ? item?.slot?.event_slot?.date
                : item?.google_event_id
                ? moment(item?.start_datetime).format("HH:mm")
                : item?.event?.start_time,

              slotTimeOrEndTime: isAyurvedic
                ? item?.slot?.start_time
                : item?.google_event_id
                ? moment(item?.end_datetime).format("HH:mm")
                : item?.event?.end_time,

              amount: item?.amount,
              email: item?.user?.email,
              google_event_id: item?.google_event_id,
              deleted: item?.deleted,
              isAyurvedic, // keep flag for column headers
            };
          });

          console.log("✌️data --->", data);

          setState({
            registrationList: data,
            next: res.next,
            eventDateCount: res?.event_date_count || [],

            previous: res.previous,
            currentPage: page,
            loading: false,
          });
        }
      } else {
        setState({ loading: false });
      }
    } catch (error) {
      setState({ loading: false });
    }
  };

  const eventDetail = async () => {
    try {
      setState({ loading: true });
      const id = searchParams.get("id");
      const res = await Models.session.details(id);
      console.log("✌️res --->", res);

      const isAyurvedic = res?.lounge_type?.id == AYURVEDIC_LOUNGE;
      setState({ eventDetail: res, isAyurvedic });

      const link = extractZoomMeetingId(res?.session_link);

      await participatedList(link);

      // const res = await Models.attendance.list(meeting_id);
      // console.log("attendanceList: ", res);
      // setState({
      //   participatedList: res?.results,
      //   loading: false,
      //   count: res.next,
      //   prev: res.previous,
      // });
    } catch (error) {
      setState({ loading: false });
      console.log("error: ", error);
    }
  };

  const participatedList = async (meeting_id) => {
    try {
      setState({ loading: true });

      const res = await Models.attendance.list(meeting_id);
      const data = res?.results?.map((item) => ({
        name: item?.name,
        user_id: item?.user_id,
        status: item?.status,
        join_time: item?.join_time,
        leave_time: item?.leave_time,
        duration: item?.duration ? formatDuration(item?.duration) : "_",
        email: item?.user_email,
        google_event_id: item?.google_event_id,
        deleted: item?.deleted,
      }));

      setState({
        participatedList: data,
        loading: false,
        count: res.next,
        prev: res.previous,
      });
    } catch (error) {
      setState({ loading: false });
      console.log("error: ", error);
    }
  };

  const registerColumn = [
    {
      Header: "Registration ID",
      accessor: "registration_id",
      Cell: (row) => (
        <div className="flex items-center gap-1.5">
          <Label>{row?.row?.registration_id}</Label>
          {row?.row?.google_event_id && (
            <div className="relative group">
              {row?.row?.deleted ? (
                <CalendarX2 size={14} className="text-red-400 cursor-pointer" />
              ) : (
                <Sheet size={14} className="text-green-500 cursor-pointer" />
              )}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                {row?.row?.deleted
                  ? "Session deleted from Google Calendar"
                  : "Google Form Session"}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      Header: "Registration Date",
      accessor: "registration_date",
      Cell: (row) => (
        <Label>
          {row?.row?.registration_date
            ? moment(row?.row?.registration_date).format("DD-MM-YYYY")
            : "-"}
        </Label>
      ),
    },
    {
      Header: "Session Date",
      accessor: "session_date",
      Cell: (row) => <Label>{row?.row?.session_date || "-"}</Label>,
    },
    {
      Header: "Name",
      accessor: "name",
      Cell: (row) => <Label>{row?.row?.name}</Label>,
    },
    {
      Header: "Email",
      accessor: "email",
      Cell: (row) => <Label>{row?.row?.email || "-"}</Label>,
    },
    {
      Header: "Start Time",
      accessor: "slotDateOrStartTime",
      Cell: (row) => (
        <Label>
          {row?.row?.slotDateOrStartTime ? row?.row?.slotDateOrStartTime : "_"}
        </Label>
      ),
    },
    {
      Header: "End Time",
      accessor: "slotTimeOrEndTime",
      Cell: (row) => (
        <Label>
          {row?.row?.slotTimeOrEndTime ? row?.row?.slotTimeOrEndTime : "_"}
        </Label>
      ),
    },
  ];

  const registerAyurvedicColumn = [
    {
      Header: "Registration ID",
      accessor: "registration_id",
      Cell: (row) => (
        <div className="flex items-center gap-1.5">
          <Label>{row?.row?.registration_id}</Label>
          {row?.row?.google_event_id && (
            <div className="relative group">
              {row?.row?.deleted ? (
                <CalendarX2 size={14} className="text-red-400 cursor-pointer" />
              ) : row?.row?.google_event_id ? (
                <Sheet size={14} className="text-green-500 cursor-pointer" />
              ) : null}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                {row?.row?.deleted
                  ? "Event deleted from Google Calendar"
                  : "Google Form Event"}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      Header: "Registration Date",
      accessor: "registration_date",
      Cell: (row) => (
        <Label>
          {row?.row?.registration_date
            ? moment(row?.row?.registration_date).format("DD-MM-YYYY")
            : "-"}
        </Label>
      ),
    },
    {
      Header: "Name",
      accessor: "name",
      Cell: (row) => <Label>{row?.row?.name}</Label>,
    },
    {
      Header: "Email",
      accessor: "email",
      Cell: (row) => <Label>{row?.row?.email || "-"}</Label>,
    },
    {
      Header: "Session Date",
      accessor: "slot",
      Cell: (row) => (
        <Label>
          {row?.row?.slotDateOrStartTime
            ? moment(row?.row?.slotDateOrStartTime).format("DD-MM-YYYY")
            : "_"}
        </Label>
      ),
    },
    {
      Header: "Slot Time",
      accessor: "slot_time",
      Cell: (row) => (
        <Label>
          {row?.row?.slotTimeOrEndTime ? row?.row?.slotTimeOrEndTime : "-"}
        </Label>
      ),
    },
  ];

  const participatedColum = [
    {
      Header: "Name",
      accessor: "name",
      Cell: (row) => <Label>{`${row?.row?.name}  `}</Label>,
    },
    {
      Header: "Email",
      accessor: "email",
      Cell: (row) => <Label>{row?.row?.email || "-"}</Label>,
    },

    {
      Header: "Session Date",
      accessor: "date",
      Cell: (row) => (
        <Label>
          {row?.row?.join_time
            ? moment(row?.row?.join_time).format("DD-MM-YYYY")
            : "-"}
        </Label>
      ),
    },
    {
      Header: "Join Time",
      accessor: "join_time",
      Cell: (row) => (
        <Label>
          {row?.row?.join_time
            ? moment(row?.row?.join_time).format("HH:mm")
            : "-"}
        </Label>
      ),
    },

    {
      Header: "Leave Time",
      accessor: "leave_time",
      Cell: (row) => (
        <Label>
          {row?.row?.leave_time
            ? moment(row?.row?.leave_time).format("HH:mm")
            : "-"}
        </Label>
      ),
    },
    {
      Header: "Duration",
      accessor: "duration",
      Cell: (row) => <Label>{row?.row?.duration || "-"}</Label>,
    },
  ];

  const handleEdit = (item) => {
    router.push(`/update-user/?id=${item.id}`);
  };

  const handleView = (item) => {
    router.push(`/view-user/?id=${item.id}`);
  };

  const handleNextPage = () => {
    if (state.next) {
      const newPage = state.currentPage + 1;
      if (state.activeTab === "participated") {
        participatedList(newPage);
      } else {
        registrationList(newPage);
      }
    }
  };

  const handlePreviousPage = () => {
    if (state.previous) {
      const newPage = state.currentPage - 1;
      if (state.activeTab === "participated") {
        participatedList(newPage);
      } else {
        registrationList(newPage);
      }
    }
  };

  const handleClick = (date) => {
    console.log("date", date);
    setState({ selected_date: date });
  };

  return (
    <div className="container mx-auto pt-4">
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 pt-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">
              Session :{" "}
              <span className="text-themePurple">
                {state?.eventDetail?.title}
              </span>
            </h4>
            <p className="text-gray-600">
              Lounge Type: {state?.eventDetail?.lounge_type?.name}
            </p>
          </div>
          <div>
            <div className="text-right">
              <p className="text-gray-600">
                 Start Date:{" "}
                {moment(state?.eventDetail?.start_date).format("DD-MMM-YYYY")}
              </p>

              <p className="text-gray-600">
                 End Date:{" "}
                {moment(state?.eventDetail?.end_date).format("DD-MMM-YYYY")}
              </p>

              {/* <p className="text-gray-600">
                Registration End Date:{" "}
                {moment(state?.ordeeventDetailrData?.end_date).format(
                  "DD-MMM-YYYY"
                )}
              </p> */}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2  pt-0">
        {/* <Card className="w-[100%] p-4">
          <div className="block justify-between items-center lg:flex">
            <div className="lg:w-1/6 w-full lg:mb-0 mb-2">
              <h2 className="md:text-[20px] text-sm font-semibold">Users</h2>
            </div>
            <div className="block md:flex justify-between items-center gap-3 lg:w-5/6 w-full">
              <div className="md:w-3/4 w-full  md:mb-0 mb-2">
                <TextInput
                  value={state.search}
                  onChange={(e) => {
                    setState({ search: e.target.value });
                  }}
                  placeholder="Search Name"
                  required
                  className="w-full"
                />
              </div>
              <CustomSelect
                options={state?.roleList || []} // Safely pass empty array if universityList is null
                value={state.role?.value || ""}
                onChange={(value) => setState({ role: value })}
                placeholder="Filter by role"
              />

              <div
                className="md:w-1/4 w-full  md:text-end"
                onClick={() => router.push("/create-user")}
              >
                <Button className="bg-themeGreen hover:bg-themeGreen mt-2 md:mt-0">
                  <PlusIcon />
                </Button>
              </div>
            </div>
          </div>
        </Card> */}

        <div className="flex justify-between items-center w-[100%]">
          <Tabs
            defaultValue="registered"
            className="lg:flex lg:gap-20 gap-4 w-[100%]"
            onValueChange={(val) =>
              setState({ start_date: null, activeTab: val })
            }
          >
            <TabsList className="flex lg:flex-col flex-row lg:w-[20%] w-[100%] h-[100%] overflow-scroll sm:overflow-hidden sm:justify-center justify-start pl-5 lg:space-y-2 space-y-0  lg:space-x-0 space-x-2 lg:p-5 p-2">
              <TabsTrigger
                value="registered"
                className="w-[100%] p-2  md:text-md text-sm lg:justify-start"
              >
                Registered List
              </TabsTrigger>
              <TabsTrigger
                value="participated"
                className="w-[100%] p-2 md:text-md text-sm lg:justify-start"
              >
                Participated List
              </TabsTrigger>
            </TabsList>
            <div className="lg:flex-1 lg:w-[75%] w-[100%]">
              <TabsContent value="registered">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Registered List</CardTitle>
                    <div className="flex gap-2">
                      <div className="md:mb-0 mb-2">
                        <DatePickers
                          placeholder="Registration Date"
                          closeIcon={true}
                          selectedDate={state.start_date}
                          onChange={(date) => {
                            setState({
                              start_date: date,
                            });
                          }}
                        />
                      </div>
                      <div className="md:mb-0 mb-2">
                        <DatePickers
                          placeholder="Session Date"
                          closeIcon={true}
                          selectedDate={state.session_date}
                          onChange={(date) => {
                            setState({
                              session_date: date,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {/* {state.loading ? (
                      <div className="flex items-center w-full justify-center">
                        <Loader />
                      </div>
                    ) : ( */}
                    <div>
                      {state.activeTab === "registered" &&
                        state.eventDetail?.start_date &&
                        state.eventDetail?.end_date &&
                        (() => {
                          const dates = [];
                          const start = moment(state.eventDetail.start_date);
                          const end = moment(state.eventDetail.end_date);
                          for (
                            let d = start.clone();
                            d.isSameOrBefore(end, "day");
                            d.add(1, "day")
                          ) {
                            dates.push(d.format("YYYY-MM-DD"));
                          }

                          return dates.length > 1 ? (
                            <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-thin">
                              {dates.map((date) => {
                                const countObj = state.eventDateCount?.find(
                                  (c) => c.date === date
                                );
                                const count = countObj?.count ?? 0;
                                return (
                                  <div
                                    onClick={() => handleClick(date)}
                                    key={date}
                                    className={`cursor-pointer flex gap-3 items-center shrink-0 border rounded-xl px-4 py-1 min-w-[70px] ${
                                      state?.selected_date === date
                                        ? "bg-[#7f4099] border-[#7f4099]"
                                        : "bg-purple-50 border-purple-200"
                                    }`}
                                  >
                                    <span
                                      className={`text-xs font-semibold ${
                                        state?.selected_date === date
                                          ? "text-white"
                                          : "text-purple-700"
                                      }`}
                                    >
                                      {moment(date).format("DD MMM")}
                                    </span>

                                    <span
                                      className={`text-md font-bold rounded-full px-3 ${
                                        state?.selected_date === date
                                          ? "bg-white text-[#7f4099]"
                                          : "bg-white text-[#7f4099]"
                                      }`}
                                    >
                                      {count}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : null;
                        })()}
                      <div className="text-start gap-2 mb-2 flex">
                        {state?.session_date && (
                          <div className="flex bg-themePurple px-2 py-1 rounded-lg ites-center ">
                            <p className=" text-xs text-white">
                              Session Date :{" "}
                              {moment(state.session_date).format("YYYY-MM-DD")}
                            </p>
                            <XIcon
                              className="text-white h-4 w-4 ml-2 cursor-pointer"
                              onClick={() => setState({ session_date: null })}
                            />
                          </div>
                        )}

                        {state?.selected_date && (
                          <div className="flex bg-themePurple px-2 py-1 rounded-lg ites-center ">
                            <p className=" text-xs text-white">
                              Session Date :{" "}
                              {moment(state.selected_date).format("YYYY-MM-DD")}
                            </p>
                            <XIcon
                              className="text-white h-4 w-4 ml-2 cursor-pointer"
                              onClick={() => setState({ selected_date: null })}
                            />
                          </div>
                        )}

                        {state?.start_date && (
                          <div className="flex bg-themePurple px-2 py-1 rounded-lg ites-center ">
                            <p className=" text-xs text-white">
                              Reg Date :{" "}
                              {moment(state.start_date).format("YYYY-MM-DD")}
                            </p>
                            <XIcon
                              className="text-white h-4 w-4 ml-2 cursor-pointer"
                              onClick={() => setState({ start_date: null })}
                            />
                          </div>
                        )}
                      </div>

                      <div className="rounded-lg border">
                        <DataTable
                          columns={
                            state.isAyurvedic
                              ? registerAyurvedicColumn
                              : registerColumn
                          }
                          loading={state.loading}
                          data={state?.registrationList ?? []}
                          getRowClassName={(row) =>
                            row?.deleted ? "opacity-120 text-gray-400" : ""
                          }
                        />
                      </div>
                    </div>
                    {/* )} */}
                  </CardContent>
                  <div className="mt-5 mb-5 flex justify-center gap-3">
                    <Button
                      disabled={!state.previous}
                      onClick={handlePreviousPage}
                      className={`btn ${
                        !state.previous
                          ? "btn-disabled bg-themeGreen"
                          : "bg-themeGreen hover:bg-themeGreen"
                      }`}
                    >
                      Prev
                    </Button>
                    <Button
                      disabled={!state.next}
                      onClick={handleNextPage}
                      className={`btn ${
                        !state.next
                          ? "btn-disabled bg-themeGreen"
                          : "bg-themeGreen hover:bg-themeGreen"
                      }`}
                    >
                      Next
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="participated">
                <Card>
                  {/* <CardHeader>
                    <CardTitle>Participated List</CardTitle>
                  </CardHeader> */}
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Participated List</CardTitle>
                    {/* <div className="md:mb-0 mb-2">
                      <DatePickers
                        placeholder="Registration Date"
                        closeIcon={true}
                        selectedDate={state.start_date}
                        onChange={(date) => {
                          setState({
                            start_date: date,
                          });
                        }}
                      />
                    </div> */}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {state.loading ? (
                      <div className="flex items-center w-full justify-center">
                        <Loader />
                      </div>
                    ) : (state?.participatedList ?? []).length > 0 ? (
                      <div>
                        <div className="rounded-lg border">
                          <DataTable
                            columns={participatedColum}
                            data={state?.participatedList ?? []}
                          />
                        </div>
                      </div>
                    ) : (
                      "List Not Found"
                    )}
                  </CardContent>
                  <div className="mt-5 mb-5 flex justify-center gap-3">
                    <Button
                      disabled={!state.previous}
                      onClick={handlePreviousPage}
                      className={`btn ${
                        !state.previous
                          ? "btn-disabled bg-themeGreen"
                          : "bg-themeGreen hover:bg-themeGreen"
                      }`}
                    >
                      Prev
                    </Button>
                    <Button
                      disabled={!state.next}
                      onClick={handleNextPage}
                      className={`btn ${
                        !state.next
                          ? "btn-disabled bg-themeGreen"
                          : "bg-themeGreen hover:bg-themeGreen"
                      }`}
                    >
                      Next
                    </Button>
                  </div>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* <div className="items-center justify-center flex">
          <p className="text-gray-500 dark:text-gray-400">No Record Found</p>
        </div> */}
      </div>
    </div>
  );
};

export default ProtectedRoute(RegistrationList);
