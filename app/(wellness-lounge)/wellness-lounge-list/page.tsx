"use client";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/dataTable";
import { Edit, Eye, MoreHorizontal, Trash, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card,  } from "@/components/ui/card";
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
    submitLoading:false
  });

  const debouncedSearch = useDebounce(state.search, 500);

  useEffect(() => {
    getLoungeList(state.currentPage);
    getCategoryList();
  }, []);

  useEffect(() => {
    getLoungeList(state.currentPage);
  }, [debouncedSearch, state.lounge_type, state.start_date, state.end_date]);

  const getLoungeList = async (page: number) => {
    try {
      let pages = 1;
      let body = bodyData();
      if (objIsEmpty(body)) {
        pages = page;
      } else {
        pages = 1;
      }
      const res: any = await Models.session.list(pages, body);
      setState({
        loungeList: res?.results,
        next: res.next,
        previous: res.previous,
        currentPage: pages,
      });
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const getCategoryList = async () => {
    try {
      const res: any = await Models.category.list();
      const dropdowns = Dropdown(res?.results, "name");
      setState({ categoryList: dropdowns });
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const bodyData = () => {
    let body: any = {};
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

    return body;
  };

  // Example handlers for actions
  const handleEdit = (item: any) => {
    console.log("Editing:", item);
    router.push(`/update-lounge/?id=${item?.id}`);
  };

  const handleView = (item: any) => {
    console.log("Viewing:", item);
  };

  const deleteSession = async () => {
    try {
      setState({ submitLoading: true });
      const res: any = await Models.session.delete(state.deleteId);
      getLoungeList(state.currentPage);
      setState({ isOpen: false, deleteId: null, submitLoading: false });
      Success("Record deleted successfully");
    } catch (error) {
      setState({ submitLoading: false });

      console.log("error: ", error);
    }
  };

  const columns = [
    // {
    //     Header: "Image",
    //     accessor: "img",
    //     Cell: ({ value }) => <img src={value} alt="Thumbnail" className="w-10 h-10 rounded-lg" />,
    // },
    {
      Header: "Title",
      accessor: "title",
    },
    {
      Header: "Lounge Type",
      accessor: "lounge_type",
      Cell: (row: any) => <Label>{row?.row?.lounge_type?.name}</Label>,
    },
    {
      Header: "Start Date",
      accessor: "start_date",
      Cell: (row: any) => (
        <Label>{moment(row?.row?.start_date).format("DD-MM-YYYY")}</Label>
      ),
    },
    {
      Header: "End Date",
      accessor: "end_date",
      Cell: (row: any) => (
        <Label>{moment(row?.row?.end_date).format("DD-MM-YYYY")}</Label>
      ),
    },
    {
      Header: "Start Time",
      accessor: "start_time",
      Cell: (row: any) => <Label>{row?.row?.start_time}</Label>,
    },
    {
      Header: "End Time",
      accessor: "end_time",
      Cell: (row: any) => <Label>{row?.row?.end_time}</Label>,
    },

    {
      Header: "Action",
      accessor: "action",
      Cell: (row: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-md hover:bg-gray-300">
              <MoreHorizontal size={20} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={() => handleEdit(row?.row)}>
              <Edit size={16} className="mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleView(row?.row)}>
              <Eye size={16} className="mr-2" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setState({ isOpen: true, deleteId: row?.row?.id })}
              className="text-red-500"
            >
              <Trash size={16} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
    <div className="container mx-auto">
      <div className="flex flex-1 flex-col gap-4 md:p-4 p-0 pt-0">
        <Card className="w-[100%] p-4">
          <div className="grid auto-rows-min items-center gap-4 grid-cols-2">
            <div>
              <h2 className="md:text-lg text-sm font-bold">
                Lounge Session List
              </h2>
            </div>
            <div
              className="text-end"
              onClick={() => router.push("/create-wellness-lounge")}
            >
              <Button className="bg-black ">Create</Button>
            </div>
          </div>
        </Card>

        <Card className="w-[100%] p-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-4">
            <div>
              <TextInput
                value={state.search}
                onChange={(e) => {
                  setState({ search: e.target.value });
                }}
                placeholder="Search Title"
                required
                className="w-full"
              />
            </div>
            <CustomSelect
              options={state.categoryList}
              value={state.lounge_type?.value || ""}
              onChange={(value: any) => setState({ lounge_type: value })}
              placeholder="Lounge Type"
            />

            {/* <div>
                            <Select>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Price" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="20000">20,000</SelectItem>
                                    <SelectItem value="40000">40,000</SelectItem>
                                    <SelectItem value="50000">50,000</SelectItem>
                                </SelectContent>
                            </Select>
                        </div> */}
            <div>
              <DatePicker
                placeholder="Start date"
                closeIcon={true}
                selectedDate={state.start_date}
                onChange={(date: any) => {
                  setState({
                    start_date: date,
                  });
                }}
              />
            </div>
            <div>
              <DatePicker
                placeholder="End date"
                closeIcon={true}
                selectedDate={state.end_date}
                onChange={(date: any) => {
                  setState({
                    end_date: date,
                  });
                }}
              />
            </div>
          </div>
        </Card>

        {/* <div className="flex gap-2">
          <p className="text-[14px]">Selected Filters:</p>
          <p className="text-[14px] bg-gray-600 text-white px-2 flex items-center gap-1 rounded-sm">
            Online <X className="w-4 h-4 cursor-pointer" />{" "}
          </p>
          <p className="text-[14px] bg-gray-600 text-white px-2 flex items-center gap-1 rounded-sm">
            20,000 <X className="w-4 h-4 cursor-pointer" />{" "}
          </p>
        </div> */}

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
            className={`btn ${!state.next ? "btn-disabled" : "btn-primary"}`}
          >
            Next
          </Button>
        </div>
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

export default WellnessLoungeList;
