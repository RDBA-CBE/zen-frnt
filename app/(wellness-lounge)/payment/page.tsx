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
import PrimaryButton from "@/components/common-components/primaryButton";

const WellnessLoungeList = () => {
  const [state, setState] = useSetState({
    name: "",
    description: "",
    isOpen: false,
    paymentName: "",
    categoryList: [],
    editData: {},
    submitLoading:false
  });

  useEffect(() => {
    getPaymentList();
  }, []);

  const getPaymentList = async () => {
    try {
      const res: any = await Models.payment.list();
      console.log("res: ", res);
      setState({ categoryList: res?.results });
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const columns = [
    {
      Header: "Name",
      accessor: "name",
    },
    {
      Header: "Description",
      accessor: "description",
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
              onClick={() => deletePayment(row)}
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
    setState({
      editData: item,
      paymentName: item.name,
      description: item.description,
      isOpen: true,
    });
  };

  const createPayment = async () => {
    try {
      setState({ submitLoading: true });
      const body = {
        name: state.paymentName,
        description: state.description,
      };

      const res = await Models.payment.create(body);
      await getPaymentList();
      clearRecord();
      setState({ submitLoading: false });
    } catch (error) {
      setState({ submitLoading: false });

      console.log("error: ", error);
    }
  };

  const deletePayment = async (row: any) => {
    try {
      const res = await Models.payment.delete(row?.row?.id);
      await getPaymentList();
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const updatePayment = async () => {
    try {
      setState({ submitLoading: true });

      const body = {
        name: state.paymentName,
        description: state.description,
      };

      const res = await Models.payment.update(state.editData?.id, body);
      await getPaymentList();
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
      paymentName: "",
      description: "",
    });
  };

  return (
    <div className="container mx-auto ">
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card className="w-[100%] p-4">
          <div className="grid auto-rows-min items-center gap-4 grid-cols-2">
            <div>
              <h2 className="md:text-lg text-sm font-bold">Payment List</h2>
            </div>
            <div className="text-end">
              <Button
                type="button"
                className="bg-black "
                onClick={() =>
                  setState({
                    isOpen: true,
                    editData: {},
                    paymentName: "",
                    description: "",
                  })
                }
              >
                Create
              </Button>
            </div>
          </div>
        </Card>

        <div className="rounded-lg border">
          <DataTable columns={columns} data={state.categoryList} />
        </div>
      </div>

      <Modal
        isOpen={state.isOpen}
        setIsOpen={clearRecord}
        title={!objIsEmpty(state.editData) ? "Update Payment" : "Add Payment"}
        renderComponent={() => (
          <>
            <TextInput
              value={state.paymentName}
              onChange={(e) => {
                setState({ paymentName: e.target.value });
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
                  objIsEmpty(state.editData) ? createPayment() : updatePayment()
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

export default WellnessLoungeList;
