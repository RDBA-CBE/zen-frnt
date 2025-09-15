"use client";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/dataTable";
import {
  CircleX,
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  PlusIcon,
  Trash,
  X,
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
import { Dropdown, objIsEmpty, useSetState } from "@/utils/function.utils";
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
  });

  const debouncedSearch = useDebounce(state.search, 500);

  useEffect(() => {
    getLoungeList(state.currentPage);
    getCategoryList();
  }, []);

  useEffect(() => {
    getLoungeList(state.currentPage);
  }, [
    debouncedSearch,
    state.lounge_type,
    state.lounge_status,
    state.start_date,
    state.end_date,
  ]);

  const getLoungeList = async (page) => {
    try {
      setState({ loading: true });
      // let pages = 1;
      let body = bodyData();
      // if (objIsEmpty(body)) {
      //   pages = page;
      // } else {
      //   pages = 1;
      // }
      const res = await Models.session.list(page, body);
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

  const getCategoryList = async () => {
    try {
      setState({ loading: true });

      const res = await Models.category.catDropDownList();
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
    if (state.end_date) {
      body.end_date = moment(state.end_date).format("YYYY-MM-DD");
    }
    if (state.lounge_type) {
      body.lounge_type = state.lounge_type?.value;
    }

    if (state.lounge_status) {
      body.status = state.lounge_status?.value;
    }

    return body;
  };

  // Example handlers for actions
  const handleEdit = (item) => {
    console.log("Editing:", item);
    router.push(`/update-lounge/?id=${item?.id}`);
  };

  const handleView = (item) => {
    console.log("Viewing:", item);
    router.push(`/view-wellness-lounge/?id=${item?.id}`);
  };

  const deleteSession = async () => {
    try {
      setState({ submitLoading: true });
      const res = await Models.session.delete(state.deleteId);
      getLoungeList(state.currentPage);
      setState({ isOpen: false, deleteId: null, submitLoading: false });
      Success("Record deleted successfully");
    } catch (error) {
      setState({ submitLoading: false });

      console.log("error: ", error);
    }
  };

  const changeSessionStatus = async () => {
    try {
      setState({ statusLoading: true });
      const body = {
        is_active: !state.activeData?.is_active,
      };
      const res = await Models.session.update(body, state.activeData?.id);
      getLoungeList(state.currentPage);
      setState({ statusLoading: false, isActiveOpen: false, activeData: null });
      Success("Session status updated successfully");
    } catch (error) {
      setState({ statusLoading: false });
    }
  };

  const columns = [
    {
      Header: "Session Title",
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
          {!row?.row?.is_booked && (
            <>
              <div
                className="cursor-pointer"
                onClick={() =>
                  setState({ isOpen: true, deleteId: row?.row?.id })
                }
              >
                <Trash size={18} className="mr-2" />
              </div>
              <div
                className="cursor-pointer"
                onClick={() =>
                  setState({ isActiveOpen: true, activeData: row?.row })
                }
              >
                <CircleX
                  size={20}
                  className="mr-2"
                  color={row?.row?.is_active ? "#88c742" : "red"}
                />
              </div>
            </>
          )}
        </div>
      ),
    },
  ];

  const handleNextPage = () => {
    if (state.next) {
      const newPage = state.currentPage + 1;
      getLoungeList(newPage);
    }
  };

  const handlePreviousPage = () => {
    if (state.previous) {
      const newPage = state.currentPage - 1;
      getLoungeList(newPage);
    }
  };

  return (
    <div className="container mx-auto ">
      <div className="flex flex-1 flex-col gap-2 p-0 pt-0">
        {/* <Card className="w-[100%] p-4">
          <div className="grid auto-rows-min items-center gap-4 grid-cols-2">
            
            <div
              className="text-end"
              onClick={() => router.push("/create-wellness-lounge")}
            >
              <Button className="bg-themeGreen hover:bg-themeGreen ">Create</Button>
            </div>
          </div>
        </Card> */}

        <Card className="w-[100%] p-4">
          <div className="block justify-between items-center lg:flex">
            <div className="lg:w-1/6 w-full lg:mb-0 mb-2">
              <h2 className="md:text-[20px] text-sm font-bold">
                Lounge Session
              </h2>
            </div>
            <div className="block md:flex justify-between items-center gap-3 lg:w-5/6 w-full">
              <div className="md:w-1/5 w-full  md:mb-0 mb-2">
                <TextInput
                  value={state.search}
                  onChange={(e) => {
                    setState({ search: e.target.value });
                  }}
                  placeholder="Search Title"
                  required
                />
              </div>
              <div className="md:w-1/5 w-full  md:mb-0 mb-2">
                <CustomSelect
                  options={state.categoryList}
                  value={state.lounge_type?.value || ""}
                  onChange={(value) => setState({ lounge_type: value })}
                  placeholder="Lounge Type"
                />
              </div>
              <div className="md:w-1/5 w-full  md:mb-0 mb-2">
                <CustomSelect
                  options={[
                    {
                      label: "Active",
                      value: "true",
                    },
                    {
                      label: "In Active",
                      value: "false",
                    },
                  ]}
                  value={state.lounge_status?.value || ""}
                  onChange={(value) => setState({ lounge_status: value })}
                  placeholder="Status"
                />
              </div>
              <div className="md:w-1/5 w-full  md:mb-0 mb-2">
                <DatePicker
                  placeholder="Start date"
                  closeIcon={true}
                  selectedDate={state.start_date}
                  onChange={(date) => {
                    setState({
                      start_date: date,
                    });
                  }}
                />
              </div>
              <div className="md:w-1/5 w-full  md:mb-0 mb-2">
                <DatePicker
                  placeholder="End date"
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
                onClick={() => router.push("/create-wellness-lounge")}
              >
                <Button className="bg-themeGreen hover:bg-themeGreen ">
                  <PlusIcon />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="text-start gap-2 mb-0 flex">
          {state.lounge_type && (
            <div className="flex bg-themePurple px-2 py-1 rounded-lg ites-center ">
              <p className=" text-xs text-white">{state.lounge_type?.label}</p>
              <XIcon
                className="text-white h-4 w-4 ml-2 cursor-pointer"
                onClick={() => setState({ lounge_type: null })}
              />
            </div>
          )}

          {state?.start_date && (
            <div className="flex bg-themePurple px-2 py-1 rounded-lg ites-center ">
              <p className=" text-xs text-white">
                Start : {moment(state.start_date).format("YYYY-MM-DD")}
              </p>
              <XIcon
                className="text-white h-4 w-4 ml-2 cursor-pointer"
                onClick={() => setState({ start_date: null })}
              />
            </div>
          )}

          {state?.end_date && (
            <div className="flex bg-themePurple px-2 py-1 rounded-lg ites-center ">
              <p className=" text-xs text-white">
                End : {moment(state.end_date).format("YYYY-MM-DD")}
              </p>
              <XIcon
                className="text-white h-4 w-4 ml-2 cursor-pointer"
                onClick={() => setState({ end_date: null })}
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
                    ? "btn-disabled bg-themeGreen"
                    : "bg-themeGreen"
                }`}
              >
                Prev
              </Button>
              <Button
                disabled={!state.next}
                onClick={handleNextPage}
                className={`btn ${
                  !state.next ? "btn-disabled bg-themeGreen" : "bg-themeGreen"
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
        title={
          "Are you sure to delete the record. The selected wellness lounge will been removed from Zen Wellness. All associated content and access will be revoked, and the changes will be reflected across the platform."
        }
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

      <Modal
        isOpen={state.isActiveOpen}
        setIsOpen={() => setState({ isActiveOpen: false, activeData: null })}
        title={`Are you sure to ${
          state.activeData?.is_active ? "In active" : "Active"
        } record`}
        renderComponent={() => (
          <>
            <div className="flex justify-end gap-5">
              <PrimaryButton
                variant={"outline"}
                className="border-themeGreen hover:border-themeGreen text-themeGreen hover:text-themeGreen "
                name="Cancel"
                onClick={() =>
                  setState({ isActiveOpen: false, activeData: null })
                }
              />

              <PrimaryButton
                name="Submit"
                className="bg-themeGreen hover:bg-themeGreen"
                onClick={() => changeSessionStatus()}
                loading={state.statusLoading}
              />
            </div>
          </>
        )}
      />
    </div>
  );
};

export default ProtectedRoute(WellnessLoungeList);
