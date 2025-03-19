"use client";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/dataTable";

import { Edit, Eye, MoreHorizontal, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";

import { objIsEmpty, useSetState } from "@/utils/function.utils";
import Models from "@/imports/models.import";
import { useEffect } from "react";
import Modal from "@/components/common-components/modal";
import TextArea from "@/components/common-components/textArea";
import { TextInput } from "@/components/common-components/textInput";
import { useRouter } from "next/navigation";
import { Success } from "@/components/common-components/toast";
import { DatePicker } from "@/components/common-components/datePicker";
import CustomSelect from "@/components/common-components/dropdown";
import moment from "moment";
import { Label } from "@radix-ui/react-label";
import PrimaryButton from "@/components/common-components/primaryButton";
import useDebounce from "@/components/common-components/useDebounce";
import Loading from "@/components/common-components/Loading";

const UserList = () => {
  const router = useRouter();

  const [state, setState] = useSetState({
    name: "",
    description: "",
    isOpen: false,
    categoryName: "",
    userList: [],
    editData: {},
    submitLoading: false,
    search: "",
    currentPage: 1,
    loading: false,
  });

  const debouncedSearch = useDebounce(state.search, 500);

  useEffect(() => {
    getUserList(state.currentPage);
  }, []);
  useEffect(() => {
    getUserList(state.currentPage);
  }, [debouncedSearch]);

  const getUserList = async (page) => {
    try {
      setState({ loading: true });

      const body = bodyData();
      // let pages = 1;
      // if (objIsEmpty(body)) {
      //   pages = page;
      // } else {
      //   pages = 1;
      // }
      const res = await Models.user.userList(page, body);
      console.log("res: ", res);
      setState({
        userList: res?.results,
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

  const columns = [
    {
      Header: "Name",
      accessor: "username",
    },
    {
      Header: "Email",
      accessor: "email",
    },
    {
      Header: "Registration Date",
      accessor: "date_joined",
      Cell: (row) => (
        <Label>{moment(row?.row?.date_joined).format("DD-MM-YYYY")}</Label>
      ),
    },

    {
      Header: "Event Registration Count",
      accessor: "event_registrations_count",
      Cell: (row) => <Label>{row?.row?.event_registrations_count}</Label>,
    },

    {
      Header: "Action",
      accessor: "action",
      Cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-md hover:bg-gray-200">
              <MoreHorizontal size={20} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={() => handleEdit(row?.row)}>
              <Edit size={16} className="mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleView(row.row)}>
              <Eye size={16} className="mr-2" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => deleteUser(row)}
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

  const handleEdit = (item) => {
    router.push(`/update-user/?id=${item.id}`);
  };
  const handleView = (item) => {
    router.push(`/view-user/?id=${item.id}`);
  }

  const createCategory = async () => {
    try {
      setState({ submitLoading: true });
      const body = {
        name: state.categoryName,
        description: state.description,
      };

      const res = await Models.category.create(body);
      await getUserList(state.currentPage);
      clearRecord();
      setState({ submitLoading: false });
    } catch (error) {
      setState({ submitLoading: false });

      console.log("error: ", error);
    }
  };

  const deleteUser = async (row) => {
    try {
      await Models.user.delete(row?.row?.id);
      Success("User deleted successfully");
      await getUserList(state.currentPage);
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const updateCategory = async () => {
    try {
      setState({ submitLoading: true });

      const body = {
        name: state.categoryName,
        description: state.description,
      };

      const res = await Models.category.update(state.editData?.id, body);
      await getUserList(state.currentPage);
      clearRecord();
      setState({ submitLoading: false });
    } catch (error) {
      setState({ submitLoading: false });

      console.log("error: ", error);
    }
  };

  const clearRecord = () => {
    setState({
      isOpen: false,
      editData: {},
      categoryName: "",
      description: "",
    });
  };

  const bodyData = () => {
    let body = {};
    if (state.search) {
      body.search = state.search;
    }

    return body;
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
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card className="w-[100%] p-4">
          <div className="grid auto-rows-min items-center gap-4 grid-cols-2">
            <div>
              <h2 className="md:text-lg text-sm font-bold">User List</h2>
            </div>
            <div className="text-end">
              <Button
                type="button" className="bg-themeGreen hover:bg-themeGreen"
                onClick={() => router.push("/create-user")}
              >
                Create
              </Button>
            </div>
          </div>
        </Card>

        <Card className="w-[100%] p-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-2">
            <div>
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
          </div>
        </Card>
        {state.loading ? (
          <Loading />
        ) : state.userList?.length > 0 ? (
          <>
            <div className="rounded-lg border">
              <DataTable columns={columns} data={state.userList} />
            </div>
            <div className="mt-5 flex justify-center gap-3">
              <Button
                disabled={!state.previous}
                onClick={handlePreviousPage}
                className={`btn ${!state.previous ? "btn-disabled bg-themeGreen hover:bg-themeGreen" : "bg-themeGreen hover:bg-themeGreen"
                  }`}
              >
                Prev
              </Button>
              <Button
                disabled={!state.next}
                onClick={handleNextPage}
                className={`btn ${!state.next ? "btn-disabled bg-themeGreen hover:bg-themeGreen" : "bg-themeGreen hover:bg-themeGreen"
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
        {/* <div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  className="bg-black  hover:bg-black text-white hover:text-white"
                />
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  href="#"
                  className="bg-black  hover:bg-black text-white hover:text-white"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div> */}
      </div>

      <Modal
        isOpen={state.isOpen}
        setIsOpen={clearRecord}
        title={!objIsEmpty(state.editData) ? "Update Category" : "Add Category"}
        renderComponent={() => (
          <>
            <TextInput
              value={state.categoryName}
              onChange={(e) => {
                setState({ categoryName: e.target.value });
              }}
              placeholder="Name"
              title="Name"
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

            <div className="flex justify-end gap-5">
              <PrimaryButton
                variant={"outline"}
                name="Cancel"
                onClick={() => clearRecord()}
              />

              <PrimaryButton
                name="Submit"
                onClick={() =>
                  objIsEmpty(state.editData)
                    ? createCategory()
                    : updateCategory()
                }
                loading={state.submitLoading}
              />
            </div>
          </>
        )}
      />
    </div>
  );
};

export default UserList;
