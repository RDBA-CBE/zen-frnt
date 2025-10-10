"use client";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/dataTable";
import {
  Calendar,
  Edit,
  Eye,
  Loader,
  MoreHorizontal,
  PlusIcon,
  Table,
  Trash,
  X,
  XIcon,
} from "lucide-react";
import ExcelJS from "exceljs";
import * as FileSaver from "file-saver";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Models from "@/imports/models.import";
import {
  Dropdown,
  objIsEmpty,
  UserDropdown,
  useSetState,
} from "@/utils/function.utils";
import { Label } from "@radix-ui/react-label";
import moment from "moment";
import CustomSelect from "@/components/common-components/dropdown";
import { TextInput } from "@/components/common-components/textInput";
import useDebounce from "@/components/common-components/useDebounce";
import { DatePicker } from "@/components/common-components/datePickers";
import Modal from "@/components/common-components/modal";
import { Success } from "@/components/common-components/toast";
import PrimaryButton from "@/components/common-components/primaryButton";
import Loading from "@/components/common-components/Loading";
import { AYURVEDIC_LOUNGE, orderStatusList } from "@/utils/constant.utils";
import ProtectedRoute from "@/components/common-components/privateRouter";
import LoadMoreDropdown from "@/components/common-components/LoadMoreDropdown";
import AdminCalendar from "@/components/ui/adminCalender";
import dayjs from "dayjs";

const BookingList = () => {
  const router = useRouter();

  const [state, setState] = useSetState({
    loungeList: [],
    categoryList: [],
    search: "",
    currentPage: 1,
    previous: null,
    next: null,
    deleteId: null,
    submitLoading: false,
    loading: false,
    loungeSearch: [],
    viewMode: "table",
    end_date: null,
    btnloading: false,
  });

  const debouncedSearch = useDebounce(state.search, 500);

  useEffect(() => {
    getOrdersList(state.currentPage);
    getCategoryList();
    getLoungeList(state.currentPage);
    getOrderList();
  }, []);

  useEffect(() => {
    getOrdersList(1);
    getOrderList();
  }, [
    debouncedSearch,
    state.lounge_status,
    state.start_date,
    state.event,
    state.end_date,
  ]);

  const sessionId = (row) => {
    console.log(row);

    setState({
      isOpen: true,
      deleteId: row?.row?.id,
      sessionID: row?.row?.registration_id,
    });
  };

  const getOrdersList = async (page) => {
    try {
      setState({ loading: true });
      let body = bodyData();

      const res = await Models.session.registrationList(page, body);

      setState({
        loungeList: res?.results,
        next: res.next,
        previous: res.previous,
        currentPage: page,
        loading: false,
      });
    } catch (error) {
      setState({ loading: false });
    }
  };

  const getOrderList = async () => {
    try {
      setState({ loading: true });
      let body = bodyData();
      console.log("body: ", body);

      const res = await Models.session.registrationWithoutPageList(body);
      console.log("res: ", res);

      setState({
        orderList: res,
        loading: false,
      });
    } catch (error) {
      setState({ loading: false });

      console.log("error: ", error);
    }
  };

  const getLoungeList = async (page) => {
    try {
      setState({ loading: true });
      let pages = 1;
      let body = {};

      const res = await Models.session.activeList(pages, body);
      const Dropdowns = Dropdown(res?.results, "title");
      setState({
        loungeSearch: Dropdowns,
      });
    } catch (error) {
      setState({ loading: false });

      console.log("error: ", error);
    }
  };

  const getCategoryList = async () => {
    try {
      setState({ loading: true });

      const res = await Models.category.list();
      const dropdowns = Dropdown(res?.results, "name");
      setState({ categoryList: dropdowns, loading: false });
    } catch (error) {
      setState({ loading: false });

      console.log("error: ", error);
    }
  };

  const bodyData = () => {
    let body = {
      category: AYURVEDIC_LOUNGE,
    };
    if (state.search) {
      body.search = state.search;
    }
    if (state.start_date) {
      body.start_date = moment(state.start_date).format("YYYY-MM-DD");
    }
    if (state.event) {
      body.event = state.event?.value;
    }
    if (state.lounge_status) {
      body.lounge_status = state.lounge_status?.value;
    }

    return body;
  };

  // Example handlers for actions
  const handleEdit = (item) => {
    router.push(`/update-order/?id=${item?.id}`);
  };

  const handleView = (item) => {
    if (item?.event?.lounge_type?.id == AYURVEDIC_LOUNGE) {
      router.push(`/view-paid-order/?id=${item?.id}`);
    } else {
      router.push(`/view-order/?id=${item?.id}`);
    }
  };

  const exportToExcel = async () => {
    setState({ btnloading: true });

    try {
      const body = bodyData();
      const allData = await Models.session.registrationWithoutPageList(body);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Booking Report");

      const columnsData = [
        { title: "Registration ID", dataIndex: "registration_id" },
        { title: "Event Name", dataIndex: "event.title" },
        { title: "Session Link", dataIndex: "event.session_link" },
        { title: "Lounge", dataIndex: "event.lounge_type.name" },
        { title: "Moderator", dataIndex: "event.moderator" },
        { title: "Start Date", dataIndex: "event.start_date" },
        { title: "End Date", dataIndex: "event.end_date" },
        { title: "Slot (Date & Time)", dataIndex: "slot" },
        { title: "Price", dataIndex: "amount" },
        { title: "Registration Status", dataIndex: "registration_status" },
        { title: "Payment Status", dataIndex: "payments" },
        { title: "Payments", dataIndex: "payments" },
        { title: "Discount Amount", dataIndex: "discount_amount" },
      ];

      // Add header row
      worksheet.addRow(columnsData.map((col) => col.title));

      const getNestedValue = (obj, path) =>
        path
          .split(".")
          .reduce(
            (acc, key) => (acc && acc[key] !== undefined ? acc[key] : null),
            obj
          );

      // Add data rows
      allData.forEach((row) => {
        const rowData = columnsData.map((col) => {
          if (col.dataIndex === "slot") {
            const date = row.slot?.event_slot?.date || "";
            const startTime = row.slot?.start_time || "";
            const endTime = row.slot?.end_time || "";
            return `${date} ${startTime}${endTime ? " - " + endTime : ""}`;
          }

          if (col.dataIndex === "payments") {
            return (
              row.payments?.map((p) => p.amount || p.status).join(", ") || ""
            );
          }

          if (col.dataIndex === "event.moderator") {
            return row.event?.moderator
              ? `${row.event.moderator.first_name} ${row.event.moderator.last_name}`
              : "";
          }

          if (
            col.dataIndex === "amount" ||
            col.dataIndex === "discount_amount"
          ) {
            return parseFloat(getNestedValue(row, col.dataIndex)) || 0;
          }

          if (col.dataIndex.includes(".")) {
            return getNestedValue(row, col.dataIndex) || "";
          }

          return row[col.dataIndex] ?? "";
        });

        worksheet.addRow(rowData);
      });

      const blob = await workbook.xlsx.writeBuffer();
      FileSaver.saveAs(
        new Blob([blob], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        "Booking-list.xlsx"
      );
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    } finally {
      setState({ btnloading: false, id: null });
    }
  };

  const deleteSession = async () => {
    try {
      setState({ submitLoading: true });
      const res = await Models.session.deleteRegistration(state.deleteId);
      getOrdersList(state.currentPage);
      setState({ isOpen: false, deleteId: null, submitLoading: false });
      Success("Record deleted successfully");
    } catch (error) {
      setState({ submitLoading: false });

      console.log("error: ", error);
    }
  };

  const loadSessionOptions = async (search, loadedOptions, { page }) => {
    try {
      const res = await Models.session.activeList(page, {});
      const Dropdowns = UserDropdown(res?.results, (item) => item?.title);
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

 const columns = [
   {
        Header: "Session Id",
        accessor: "registration_id",
      },
      {
        Header: "Session Date",
        accessor: "registration_date",
        Cell: ({ row }) => (
        <Label>
          {moment(row?.row?.registration_date).format("DD-MM-YYYY")}
        </Label>
          
        ),
      },
      {
        Header: "Slot Date",
        accessor: "slot.event_slot.date",
        Cell: ({ row }) => (
       
           <Label>
          {moment(row?.row?.slot?.event_slot?.date).format("DD-MM-YYYY")}
        </Label>
        ),
      },
      {
        Header: "Slot Time",
        accessor: "slot.start_time",
      Cell: (row) => <Label>{row?.row?.slot?.start_time}</Label>,


      },
      {
        Header: "Session Status",
        accessor: "registration_status",
      },
      {
        Header: "Lounge",
        accessor: "event.title",
      Cell: (row) => <Label>{row?.row?.event?.title}</Label>,

      },
      {
        Header: "Action",
        accessor: "action",
        Cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div
              className="cursor-pointer"
              onClick={() => handleView(row)}
            >
              <Eye size={20} className="mr-2" />
            </div>
            <div
              className="cursor-pointer"
              onClick={() => sessionId(row.row)}
            >
              <Trash size={18} className="mr-2" />
            </div>
          </div>
        ),
      },
  ];

  const handleNextPage = () => {
    if (state.next) {
      const newPage = state.currentPage + 1;
      getOrdersList(newPage);
    }
  };

  const handlePreviousPage = () => {
    if (state.previous) {
      const newPage = state.currentPage - 1;
      getOrdersList(newPage);
    }
  };

  return (
    <div className="container mx-auto pt-4">
      <div className="flex flex-1 flex-col gap-2 p-0 pt-5">
        <Card className="w-[100%] p-4">
          <div className="block justify-between items-center lg:flex">
            <div className="lg:w-1/6 w-full lg:mb-0 mb-2">
              <h2 className="md:text-[20px] text-sm font-semibold">Booking List</h2>
            </div>
            <div className="block md:flex justify-between items-center gap-3 lg:w-5/6 w-full">
              <div className="md:w-2/6 w-full  md:mb-0 mb-2">
                <TextInput
                  value={state.search}
                  onChange={(e) => {
                    setState({ search: e.target.value });
                  }}
                  placeholder="Search Session ID"
                  required
                  className="w-full"
                />
              </div>
              <div className="md:w-2/6 w-full  md:mb-0 mb-2">
                <CustomSelect
                  options={orderStatusList}
                  value={state.lounge_status?.value || ""}
                  onChange={(value) => setState({ lounge_status: value })}
                  placeholder="Session Status"
                />
              </div>
              <div className="md:w-2/6 w-full  md:mb-0 mb-2">
                <LoadMoreDropdown
                  value={state.event}
                  onChange={(value) => {
                    setState({
                      event: value,
                    });
                  }}
                  // title="Select User"
                  error={state.errors?.user}
                  required
                  placeholder="Lounge"
                  height={34}
                  placeholderSize={"14px"}
                  loadOptions={loadSessionOptions}
                />
              </div>
              <div className="md:w-2/6 w-full  md:mb-0 mb-2">
                <DatePicker
                  placeholder="Start Date"
                  closeIcon={true}
                  selectedDate={state.start_date}
                  onChange={(date) => {
                    setState({
                      start_date: date,
                    });
                  }}
                />
              </div>

              <div className="md:w-2/6 w-full  md:mb-0 mb-2">
                <DatePicker
                  placeholder="End Date"
                  closeIcon={true}
                  selectedDate={state.end_date}
                  onChange={(date) => {
                    setState({
                      end_date: date,
                    });
                  }}
                />
              </div>
              <div
                className="md:w-1/5 w-full  md:text-end"
                onClick={() => router.push("/create-order")}
              >
                <Button className="bg-themeGreen hover:bg-themePurple ">
                  <PlusIcon />
                </Button>
              </div>
            </div>
          </div>
        </Card>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {state.lounge_status && (
              <div className="flex items-center bg-themePurple px-2 py-1 rounded-lg">
                <p className="text-xs text-white">
                  {state.lounge_status?.label}
                </p>
                <XIcon
                  className="text-white h-4 w-4 ml-2 cursor-pointer"
                  onClick={() => setState({ lounge_status: null })}
                />
              </div>
            )}

            {state?.event && (
              <div className="flex items-center bg-themePurple px-2 py-1 rounded-lg">
                <p className="text-xs text-white">{state.event?.label}</p>
                <XIcon
                  className="text-white h-4 w-4 ml-2 cursor-pointer"
                  onClick={() => setState({ event: null })}
                />
              </div>
            )}

            {state?.start_date && (
              <div className="flex items-center bg-themePurple px-2 py-1 rounded-lg">
                <p className="text-xs text-white">
                  {moment(state.start_date).format("YYYY-MM-DD")}
                </p>
                <XIcon
                  className="text-white h-4 w-4 ml-2 cursor-pointer"
                  onClick={() => setState({ start_date: null })}
                />
              </div>
            )}

            {state?.end_date && (
              <div className="flex items-center bg-themePurple px-2 py-1 rounded-lg">
                <p className="text-xs text-white">
                  {moment(state.end_date).format("YYYY-MM-DD")}
                </p>
                <XIcon
                  className="text-white h-4 w-4 ml-2 cursor-pointer"
                  onClick={() => setState({ end_date: null })}
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* <div className="flex items-center gap-3 bg-white border rounded-md px-3 py-2 shadow-sm">
              <button
                onClick={() => setState({ viewMode: "table" })}
                className={`p-2 rounded-md ${
                  state.viewMode === "table"
                    ? "bg-themeGreen text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <Table size={18} />
              </button>

              <div className="w-px h-6 bg-gray-300" />

              <button
                onClick={() => setState({ viewMode: "calendar" })}
                className={`p-2 rounded-md ${
                  state.viewMode === "calendar"
                    ? "bg-themeGreen text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <Calendar size={18} />
              </button>
            </div> */}
            <div
              className="md:w-1/5 w-full  md:text-end"
              onClick={() => exportToExcel()}
            >
              <Button className="bg-themePurple hover:bg-themeGreen ">
                {state.btnloading ? <Loader /> : "Export"}
              </Button>
            </div>
          </div>
        </div>

        {state.loading ? (
          <Loading />
        ) : state.loungeList?.length > 0 ? (
          state.viewMode == "table" ? (
            <>
              <div className=" mt-2 overflow-x-auto">
                <Card className="w-[100%] p-4">
                  <DataTable columns={columns} data={state.loungeList} />
                </Card>
              </div>

              <div className="mt-5 flex justify-center gap-3">
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
            </>
          ) : (
            <AdminCalendar registrations={state.orderList} />
          )
        ) : (
          <div className="items-center justify-center flex">
            <p className="text-gray-500 dark:text-gray-400">No Record Found</p>
          </div>
        )}
      </div>
      <Modal
        isOpen={state.isOpen}
        setIsOpen={() => setState({ isOpen: false, deleteId: null })}
        title={`Are You sure to delete this session. The session with session id ${state.sessionID}, will been deleted. This session is no longer visible to participants, and all associated access will been revoked.`}
        renderComponent={() => (
          <>
            <div className="flex justify-end gap-5">
              <PrimaryButton
                variant={"outline"}
                name="Cancel"
                className="border-themeGreen hover:border-themeGreen text-themeGreen hover:text-themeGreen "
                onClick={() => setState({ isOpen: false, deleteId: null })}
              />

              <PrimaryButton
                className="bg-themeGreen hover:bg-themeGreen"
                name="Submit"
                onClick={() => deleteSession()}
                loading={state.submitLoading}
              />
            </div>
          </>
        )}
      />
    </div>
  );
};

export default ProtectedRoute(BookingList);
