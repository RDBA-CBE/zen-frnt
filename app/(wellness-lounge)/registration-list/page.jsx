"use client";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/dataTable";

import { Edit, Eye, Loader, PlusIcon, Trash } from "lucide-react";

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

const RegistrationList = () => {
  const router = useRouter();

  const searchParams = useSearchParams();

  const [state, setState] = useSetState({
    name: "",
    description: "",
    isOpen: false,
    categoryName: "",
    participatedList: [],
    registrationList: [],
    submitLoading: false,
    search: "",
    currentPage: 1,
    loading: false,
    roleList: [],
    deleteLoading: false,
    isAyurvedic: false,
  });

  const debouncedSearch = useDebounce(state.search, 500);

  useEffect(() => {
    eventDetail();
    registrationList(state.currentPage);
  }, [searchParams]);

  const registrationList = async (page) => {
    try {
      setState({ loading: true });
      const idFromSearchParams = searchParams.get("id");
      if (idFromSearchParams) {
        let body = {
          event: idFromSearchParams,
        };

        const res = await Models.session.registrationList(page, body);
        console.log("registrationList --->", res);
        // const updateObj=res?.results?.map((item)=>({
        //   user:
        // }))

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
              registration_date: item?.registration_date,

              slotDateOrStartTime: isAyurvedic
                ? item?.slot?.event_slot?.date
                : item?.event?.start_time,

              slotTimeOrEndTime: isAyurvedic
                ? item?.slot?.start_time
                : item?.event?.end_time,

              amount: item?.amount,
              email: item?.user?.email,
              isAyurvedic, // keep flag for column headers
            };
          });

          console.log("✌️data --->", data);

          setState({
            registrationList: data,
            next: res.next,
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
      Cell: (row) => <Label>{`${row?.row?.registration_id}  `}</Label>,
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
      Cell: (row) => <Label>{`${row?.row?.name}  `}</Label>,
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
      Cell: (row) => <Label>{`${row?.row?.registration_id}  `}</Label>,
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
      Cell: (row) => <Label>{`${row?.row?.name}  `}</Label>,
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
      getUserList(newPage);
    }
  };

  const handlePreviousPage = () => {
    if (state.previous) {
      const newPage = state.currentPage - 1;
      getUserList(newPage);
    }
  };

  return (
    <div className="container mx-auto ">
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
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
                Registration Start Date:{" "}
                {moment(state?.eventDetail?.start_date).format("DD-MMM-YYYY")}
              </p>

              <p className="text-gray-600">
                Registration End Date:{" "}
                {moment(state?.ordeeventDetailrData?.end_date).format(
                  "DD-MMM-YYYY"
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2  pt-0">
        {/* <Card className="w-[100%] p-4">
          <div className="block justify-between items-center lg:flex">
            <div className="lg:w-1/6 w-full lg:mb-0 mb-2">
              <h2 className="md:text-[20px] text-sm font-bold">Users</h2>
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
                  <CardHeader>
                    <CardTitle> Registered List</CardTitle>
                    {/* <CardDescription>
                      Change your password here. After saving, you'll be logged out.
                    </CardDescription> */}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {state.loading ? (
                      <div className="flex items-center w-full justify-center">
                        <Loader />
                      </div>
                    ) : (state?.registrationList ?? []).length > 0 ? (
                      <div>
                        <div className="rounded-lg border">
                          <DataTable
                            columns={
                              state.isAyurvedic
                                ? registerAyurvedicColumn
                                : registerColumn
                            }
                            data={state?.registrationList ?? []}
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

              <TabsContent value="participated">
                <Card>
                  <CardHeader>
                    <CardTitle>Participated List</CardTitle>
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
