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
import * as Yup from "yup";
import * as Validation from "../../../utils/validation.utils";
import { objIsEmpty, useSetState } from "@/utils/function.utils";
import Models from "@/imports/models.import";
import { useEffect } from "react";
import Modal from "@/components/common-components/modal";
import TextArea from "@/components/common-components/textArea";
import { TextInput } from "@/components/common-components/textInput";
import { Success } from "@/components/common-components/toast";
import PrimaryButton from "@/components/common-components/primaryButton";

const PaymentGatewayList = () => {
  const [state, setState] = useSetState({
    description: "",
    isOpen: false,
    name: "",
    getewayList: [],
    editData: {},
    deleteId: null,
    isOpenDelete: false,
    deleteLoading: false,
    submitLoading: false,
    errors: {},
    isOpenView: false,
  });

  useEffect(() => {
    paymentGatewayList();
  }, []);

  const paymentGatewayList = async () => {
    try {
      const res: any = await Models.payment_gateway.list();
      console.log("res: ", res);
      setState({ getewayList: res?.results });
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
      Header: "Public Key",
      accessor: "public_key",
    },
    {
      Header: "Secret Key",
      accessor: "secret_key",
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
            <DropdownMenuItem onClick={() => handleView(row?.row)}>
              <Eye size={16} className="mr-2" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                setState({ isOpenDelete: true, deleteId: row?.row?.id })
              }
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
      name: item.name,
      description: item.description,
      public_key: item?.public_key,
      secret_key: item.secret_key,
      isOpen: true,
    });
  };

  const handleView = (item: any) => {
    setState({
      name: item.name,
      description: item.description,
      public_key: item?.public_key,
      secret_key: item.secret_key,
      isOpenView: true,
    });
  };

  const createGatway = async () => {
    try {
      setState({ submitLoading: true });
      const body = {
        name: state.name,
        description: state.description,
        public_key: state?.public_key,
        secret_key: state.secret_key,
      };
      await Validation.createPaymetGayway.validate(body, {
        abortEarly: false,
      });
      await Models.payment_gateway.create(body);
      await paymentGatewayList();
      clearRecord();
      setState({ submitLoading: false });

      Success("Payment gateway created successfully");
      setState({ submitLoading: false });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors: any = {};
        error.inner.forEach((err: any) => {
          validationErrors[err.path] = err?.message;
        });
        console.log("validationErrors: ", validationErrors);

        setState({ errors: validationErrors });
        setState({ submitLoading: false });
      } else {
        setState({ submitLoading: false });
      }
    }
  };

  const deleteGatway = async () => {
    try {
      setState({ deleteLoading: true });
      await Models.payment_gateway.delete(state.deleteId);
      await paymentGatewayList();
      setState({ isOpenDelete: false, deleteId: null, deleteLoading: false });
      Success("Payment gateway deleted successfully");
    } catch (error) {
      setState({ deleteLoading: false });

      console.log("error: ", error);
    }
  };

  const updateGatway = async () => {
    try {
      setState({ submitLoading: true });

      const body = {
        name: state.name,
        description: state.description,
        public_key: state?.public_key,
        secret_key: state.secret_key,
      };
      await Validation.createPaymetGayway.validate(body, {
        abortEarly: false,
      });
      await Models.payment_gateway.update(body, state.editData?.id);
      await paymentGatewayList();
      clearRecord();
      setState({ submitLoading: false });
      Success("Payment gateway updated successfully");
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors: any = {};
        error.inner.forEach((err: any) => {
          validationErrors[err.path] = err?.message;
        });
        console.log("validationErrors: ", validationErrors);

        setState({ errors: validationErrors });
        setState({ submitLoading: false });
      } else {
        setState({ submitLoading: false });
      }
    }
  };

  const clearRecord = () => {
    setState({
      isOpen: false,
      editData: {},
      description: "",
      name: "",
      public_key: "",
      secret_key: "",
      errors: {},
    });
  };

  return (
    <div className="container mx-auto ">
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card className="w-[100%] p-4">
          <div className="grid auto-rows-min items-center gap-4 grid-cols-2">
            <div>
              <h2 className="md:text-lg text-sm font-bold">
                Payment Gateway List
              </h2>
            </div>
            <div className="text-end">
              <Button
                type="button"
                className="bg-black "
                onClick={() =>
                  setState({
                    isOpen: true,
                    editData: {},
                    name: "",
                    description: "",
                    secret_key: "",
                    public_key: "",
                    errors: {},
                  })
                }
              >
                Create
              </Button>
            </div>
          </div>
        </Card>

        <div className="rounded-lg border">
          <DataTable columns={columns} data={state.getewayList} />
        </div>
      </div>

      <Modal
        isOpen={state.isOpen}
        setIsOpen={clearRecord}
        title={
          !objIsEmpty(state.editData)
            ? "Update Payment Gateway"
            : "Add Payment Gateway"
        }
        renderComponent={() => (
          <>
            <TextInput
              value={state.name}
              onChange={(e) => {
                setState({ name: e.target.value });
              }}
              placeholder="Name"
              title="Name"
              required
              error={state.errors?.name}
            />
            <TextInput
              value={state.public_key}
              onChange={(e) => {
                setState({ public_key: e.target.value });
              }}
              placeholder="Public Key"
              title="Public Key"
              required
              error={state.errors?.public_key}
            />
            <TextInput
              value={state.secret_key}
              onChange={(e) => {
                setState({ secret_key: e.target.value });
              }}
              placeholder="Secret Key"
              title="Secret Key"
              required
              error={state.errors?.secret_key}
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
                  objIsEmpty(state.editData) ? createGatway() : updateGatway()
                }
                loading={state.submitLoading}
              />
            </div>
          </>
        )}
      />

      <Modal
        isOpen={state.isOpenView}
        setIsOpen={() =>
          setState({
            isOpenView: false,
          })
        }
        title={" Payment Gateway Details"}
        renderComponent={() => (
          <>
            <TextInput
              value={state.name}
              onChange={(e) => {
                setState({ name: e.target.value });
              }}
              placeholder="Name"
              title="Name"
              error={state.errors?.name}
              disabled
            />
            <TextInput
              value={state.public_key}
              onChange={(e) => {
                setState({ public_key: e.target.value });
              }}
              placeholder="Public Key"
              title="Public Key"
              error={state.errors?.public_key}
              disabled
            />
            <TextInput
              value={state.secret_key}
              onChange={(e) => {
                setState({ secret_key: e.target.value });
              }}
              placeholder="Secret Key"
              title="Secret Key"
              error={state.errors?.secret_key}
              disabled
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
              disabled
            />

            <div className="flex justify-end gap-5">
              <PrimaryButton
                variant={"outline"}
                name="Close"
                onClick={() =>
                  setState({
                    isOpenView: false,
                  })
                }
              />
            </div>
          </>
        )}
      />

      <Modal
        isOpen={state.isOpenDelete}
        setIsOpen={() => setState({ isOpenDelete: false, deleteId: null })}
        title={"Are you sure to delete record"}
        renderComponent={() => (
          <>
            <div className="flex justify-end gap-5">
              <PrimaryButton
                variant={"outline"}
                name="Cancel"
                onClick={() =>
                  setState({ isOpenDelete: false, deleteId: null })
                }
              />

              <PrimaryButton
                name="Submit"
                onClick={() => deleteGatway()}
                loading={state.deleteLoading}
              />
            </div>
          </>
        )}
      />
    </div>
  );
};

export default PaymentGatewayList;
