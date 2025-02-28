"use client";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/dataTable";

import { Edit, MoreHorizontal, Trash } from "lucide-react";
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

const UserList = () => {
  const router = useRouter();

  const [state, setState] = useSetState({
    name: "",
    description: "",
    isOpen: false,
    categoryName: "",
    userList: [],
    editData: {},
    submitLoading:false
  });

  useEffect(() => {
    getUserList();
  }, []);

  const getUserList = async () => {
    try {
      const res: any = await Models.user.userList(1);
      console.log("res: ", res);
      setState({ userList: res?.results });
    } catch (error) {
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
      Cell: (row: any) => (
        <Label>{moment(row?.row?.date_joined).format("DD-MM-YYYY")}</Label>
      ),
    },

    {
      Header: "Event Registration Count",
      accessor: "event_registrations_count",
      Cell: (row: any) => <Label>{row?.row?.event_registrations_count}</Label>,
    },

    {
      Header: "Action",
      accessor: "action",
      Cell: (row: any) => (
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
            {/* <DropdownMenuItem onClick={() => handleView(row.original)}>
              <Eye size={16} className="mr-2" />
              View
            </DropdownMenuItem> */}
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

  const handleEdit = (item: any) => {
    router.push(`/update-user/?id=${item.id}`);
  };

  const createCategory = async () => {
    try {
      setState({ submitLoading: true });
      const body = {
        name: state.categoryName,
        description: state.description,
      };

      const res = await Models.category.create(body);
      await getUserList();
      clearRecord();
      setState({ submitLoading: false });
    } catch (error) {
      setState({ submitLoading: false });

      console.log("error: ", error);
    }
  };

  const deleteUser = async (row: any) => {
    console.log("row: ", row);
    try {
      await Models.user.delete(row?.row?.id);
      Success("User deleted successfully");
      await getUserList();
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
      await getUserList();
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
                type="button"
                className="bg-black "
                onClick={() => router.push("/create-user")}
              >
                Create
              </Button>
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
                placeholder="Search Name"
                required
                className="w-full"
              />
            </div>
            {/* <CustomSelect
              options={state.categoryList}
              value={state.lounge_type?.value || ""}
              onChange={(value: any) => setState({ lounge_type: value })}
              placeholder="Lounge Type"
            /> */}

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

        <div className="rounded-lg border">
          <DataTable columns={columns} data={state.userList} />
        </div>

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
              onChange={(e: any) => {
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
