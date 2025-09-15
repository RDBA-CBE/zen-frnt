"use client";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/dataTable";
import {
  Edit,
  Eye,
  MoreHorizontal,
  PlusIcon,
  Trash,
  XIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Models from "@/imports/models.import";
import { Dropdown, UserDropdown, useSetState } from "@/utils/function.utils";
import { Label } from "@radix-ui/react-label";
import moment from "moment";
import CustomSelect from "@/components/common-components/dropdown";
import { TextInput } from "@/components/common-components/textInput";
import useDebounce from "@/components/common-components/useDebounce";
import { DatePicker } from "@/components/common-components/datePicker";
import Modal from "@/components/common-components/modal";
import { Success } from "@/components/common-components/toast";
import PrimaryButton from "@/components/common-components/primaryButton";
import Loading from "@/components/common-components/Loading";
import ProtectedRoute from "@/components/common-components/privateRouter";
import LoadMoreDropdown from "@/components/common-components/loadMoreDropdown";
import { AYURVEDIC_LOUNGE } from "@/utils/constant.utils";

const CancelOrderList = () => {
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
  });

  const debouncedSearch = useDebounce(state.search, 500);

  useEffect(() => {
    getOrdersList(state.currentPage);
    getCategoryList();
    getLoungeList(state.currentPage);
  }, []);

  useEffect(() => {
    getOrdersList(state.currentPage);
  }, [debouncedSearch, state.lounge_status, state.start_date, state.event]);

  const getOrdersList = async (page) => {
    try {
      setState({ loading: true });
      // let pages = 1;
      const body = bodyData();
      // if (objIsEmpty(body)) {
      //     pages = page;
      // } else {
      //     pages = 1;
      // }
      const res = await Models.session.cancelRegistrationList(page, body);
      setState({
        loungeList: res?.results,
        next: res.next,
        previous: res.previous,
        currentPage: page,
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
    let body = {};
    if (state.search) {
      body.search = state.search;
    }
    if (state.start_date) {
      body.start_date = moment(state.start_date).format("YYYY-MM-DD");
    }
    if (state.event) {
      body.event = state.event?.value;
    }
    // if (state.lounge_status) {
    //     body.lounge_status = state.lounge_status?.value;
    // }

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
      // API should support pagination
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
      Cell: (row) => (
        <Label>
          {moment(row?.row?.registration_date).format("DD-MM-YYYY")}
        </Label>
      ),
    },
    {
      Header: "Session Status",
      accessor: "registration_status",
    },
    {
      Header: "Lounge",
      accessor: "event",
      Cell: (row) => <Label>{row?.row?.event?.title}</Label>,
    },

    {
      Header: "Action",
      accessor: "action",
      Cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="cursor-pointer" onClick={() => handleEdit(row?.row)}>
            <Edit size={18} className="mr-2" />
          </div>
          <div className="cursor-pointer" onClick={() => handleView(row?.row)}>
            <Eye size={20} className="mr-2" />
          </div>
          <div
            className="cursor-pointer"
            onClick={() => setState({ isOpen: true, deleteId: row?.row?.id })}
          >
            <Trash size={18} className="mr-2" />
          </div>
        </div>
        // <DropdownMenu>
        //     <DropdownMenuTrigger asChild>
        //         <button className="p-2 rounded-md hover:bg-gray-300">
        //             <MoreHorizontal size={20} />
        //         </button>
        //     </DropdownMenuTrigger>
        //     <DropdownMenuContent align="end" className="w-32">
        //         <DropdownMenuItem onClick={() => handleEdit(row?.row)}>
        //             <Edit size={16} className="mr-2" />
        //             Edit
        //         </DropdownMenuItem>
        //         <DropdownMenuItem onClick={() => handleView(row?.row)}>
        //             <Eye size={16} className="mr-2" />
        //             View
        //         </DropdownMenuItem>
        //         <DropdownMenuItem
        //             onClick={() => setState({ isOpen: true, deleteId: row?.row?.id })}
        //             className="text-red-500"
        //         >
        //             <Trash size={16} className="mr-2" />
        //             Delete
        //         </DropdownMenuItem>
        //     </DropdownMenuContent>
        // </DropdownMenu>
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
    <div className="container mx-auto">
      <div className="flex flex-1 flex-col gap-2 md:p-4 p-0 pt-0">
        <Card className="w-[100%] p-4">
          <div className="block justify-between items-center lg:flex">
            <div className="lg:w-1/6 w-full lg:mb-0 mb-2">
              <h2 className="md:text-[20px] text-sm font-bold">
                Cancelled Users
              </h2>
            </div>
            <div className="block md:flex justify-between items-center gap-3 lg:w-5/6 w-full">
              <div className="md:w-1/4 w-full  md:mb-0 mb-2">
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
              {/* <div className="md:w-1/5 w-full  md:mb-0 mb-2">
                                <CustomSelect
                                    options={orderStatusList}
                                    value={state.lounge_status?.value || ""}
                                    onChange={(value) => setState({ lounge_status: value })}
                                    placeholder="Order Status"
                                />
                            </div> */}
              <div className="md:w-1/4 w-full  md:mb-0 mb-2">
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
              <div className="md:w-1/4 w-full  md:mb-0 mb-2">
                <DatePicker
                  placeholder="Session Date"
                  closeIcon={true}
                  selectedDate={state.start_date}
                  onChange={(date) => {
                    setState({
                      start_date: date,
                    });
                  }}
                />
              </div>
              <div
                className="md:w-1/4 w-full  md:text-end"
                onClick={() => router.push("/create-order")}
              >
                <Button className="bg-themeGreen hover:bg-themeGreen ">
                  <PlusIcon />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="text-start gap-2 mb-0 flex">
          {state?.event && (
            <div className="flex bg-themePurple px-2 py-1 rounded-lg ites-center ">
              <p className=" text-xs text-white">{state.event?.label}</p>
              <XIcon
                className="text-white h-4 w-4 ml-2 cursor-pointer"
                onClick={() => setState({ event: null })}
              />
            </div>
          )}
          {state?.start_date && (
            <div className="flex bg-themePurple px-2 py-1 rounded-lg ites-center ">
              <p className=" text-xs text-white">
                {moment(state.start_date).format("YYYY-MM-DD")}
              </p>
              <XIcon
                className="text-white h-4 w-4 ml-2 cursor-pointer"
                onClick={() => setState({ start_date: null })}
              />
            </div>
          )}
        </div>

        {state.loading ? (
          <Loading />
        ) : state.loungeList?.length > 0 ? (
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
                    ? "bg-themeGreen hover:bg-themeGreen"
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
                    ? "btn-disabled bg-themeGreen hover:bg-themeGreen"
                    : "bg-themeGreen hover:bg-themeGreen"
                }`}
              >
                Next
              </Button>
            </div>
          </>
        ) : (
          <div className="items-center justify-center flex">
            <p className="text-gray-500 dark:text-gray-400">No Record Found</p>
          </div>
        )}
      </div>
      <Modal
        isOpen={state.isOpen}
        setIsOpen={() => setState({ isOpen: false, deleteId: null })}
        title={"Are you sure to delete record"}
        renderComponent={() => (
          <>
            <div className="flex justify-end gap-5">
              <PrimaryButton
                variant={"outline"}
                className="border-themeGreen hover:border-themeGreen text-themeGreen hover:text-themeGreen "
                name="Cancel"
                onClick={() => setState({ isOpen: false, deleteId: null })}
              />

              <PrimaryButton
                name="Submit"
                className="bg-themeGreen hover:bg-themeGreen"
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

export default ProtectedRoute(CancelOrderList);
