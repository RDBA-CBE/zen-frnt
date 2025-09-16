"use client";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/dataTable";
import { Eye, Trash2 } from "lucide-react";

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
import { AYURVEDIC_LOUNGE, orderStatusList } from "@/utils/constant.utils";
import Link from "next/link";
import ProtectedRoute from "@/components/common-components/privateRouter";
import LoadMoreDropdown from "@/components/common-components/loadMoreDropdown";

const WellnessLoungeList = () => {
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
    if (typeof window !== "undefined") {
      getCategoryList();
      getLoungeList(1);

      const userId = localStorage.getItem("userId");
      if (userId) {
        setState({ userId });
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (state.userId) {
        getOrdersList(state.currentPage);
      }
    }
  }, [state.userId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (state.userId) {
        getOrdersList(1); // Reset to first page on filter change
      }
    }
  }, [debouncedSearch, state.lounge_status, state.start_date, state.event]);

  const getOrdersList = async (page) => {
    try {
      setState({ loading: true });

      const body = bodyData();
      const userId = state.userId;
      if (!userId) return;

      const res = await Models.session.singleUserRegistrationList(
        page,
        body,
        userId
      );

      setState({
        loungeList: res?.results || [],
        next: res?.next,
        previous: res?.previous,
        currentPage: page,
        loading: false,
      });
    } catch (error) {
      setState({ loading: false });
      console.error("Error fetching orders:", error);
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
    if (state.lounge_status) {
      body.lounge_status = state.lounge_status?.value;
    }

    return body;
  };

  // Example handlers for actions
  const handleEdit = (item) => {
    console.log("Editing:", item);
    router.push(`/update-order/?id=${item?.id}`);
  };

  const handleView = (item) => {
    console.log("Viewing:", item);
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

  const handleDelete = async () => {
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

  const columns = [
    {
      Header: "Order Id",
      accessor: "registration_id",
    },
    {
      Header: "Order Date",
      accessor: "registration_date",
      Cell: (row) => (
        <Label>
          {moment(row?.row?.registration_date).format("DD-MM-YYYY")}
        </Label>
      ),
    },
    {
      Header: "Order Status",
      accessor: "registration_status",
    },
    {
      Header: "Lounge",
      accessor: "event",
      Cell: (row) => <Label>{row?.row?.event?.title}</Label>,
    },

    {
      Header: "View",
      accessor: "action",
      Cell: (row) => (
        <div className="flex items-center gap-1">
          <Link
            href={
              row?.row?.event?.lounge_type?.id == AYURVEDIC_LOUNGE
                ? `/view-paid-order?id=${row?.row?.id}`
                : `/view-order?id=${row?.row?.id}`
            }
            className="pointer"
            prefetch={true}
          >
            <Eye size={16} className="mr-2" />
          </Link>
          {/* <Link
            href={`/view-order/?id=${row?.row?.id}`}
            passHref
            prefetch={true}
          >
            <Eye size={16} className="mr-2" />
          </Link> */}
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
    <div className="container mx-auto">
      <div className="flex flex-1 flex-col gap-4 md:p-4 p-0 pt-0">
        {state.loading ? (
          <Loading />
        ) : state.loungeList?.length > 0 ? (
          <Card className="w-[100%] p-4">
            <div className="block justify-between items-center lg:flex">
              <div className="lg:w-1/6 w-full lg:mb-0 mb-2">
                <h2 className="md:text-lg text-sm font-bold">Orders</h2>
              </div>
              <div className="block md:flex justify-between items-center gap-3 lg:w-5/6 w-full">
                <div className="md:w-1/4 w-full  md:mb-0 mb-2">
                  <TextInput
                    value={state.search}
                    onChange={(e) => {
                      setState({ search: e.target.value });
                    }}
                    placeholder="Search Order ID"
                    required
                    className="w-full"
                  />
                </div>
                <div className="md:w-1/4 w-full  md:mb-0 mb-2">
                  <CustomSelect
                    options={orderStatusList}
                    value={state.lounge_status?.value || ""}
                    onChange={(value) => setState({ lounge_status: value })}
                    placeholder="Order Status"
                  />
                </div>
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
                    placeholder="Order Date"
                    closeIcon={true}
                    selectedDate={state.start_date}
                    onChange={(date) => {
                      setState({
                        start_date: date,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        ) : null}

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
                  !state.previous ? "btn-disabled" : "btn-primary"
                }`}
              >
                Prev
              </Button>
              <Button
                disabled={!state.next}
                onClick={handleNextPage}
                className={`btn ${
                  !state.next ? "btn-disabled" : "btn-primary"
                }`}
              >
                Next
              </Button>
            </div>
          </>
        ) : (
          <Card className="w-[100%] mt-5 p-4">
            <div className="flex flex-col items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">
                No Record Found
              </p>

              <p className="mt-4">
                Click the below button to get register in the session
              </p>

              <Button
                className={`mt-3 bg-themePurple hover:bg-themePurple
                      }`}
                onClick={() => {
                  router.push("/calendar");
                }}
              >
                Go to programs
              </Button>
            </div>
          </Card>
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
                name="Cancel"
                onClick={() => setState({ isOpen: false, deleteId: null })}
              />

              <PrimaryButton
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

export default ProtectedRoute(WellnessLoungeList);
