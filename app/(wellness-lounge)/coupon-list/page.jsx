"use client";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/dataTable";

import {
  CircleX,
  Edit,
  MoreHorizontal,
  PlusIcon,
  Trash,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";

import { capitalizeFLetter, useSetState } from "@/utils/function.utils";
import Models from "@/imports/models.import";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Label } from "@radix-ui/react-label";
import moment from "moment";
import Modal from "@/components/common-components/modal";
import { Success } from "@/components/common-components/toast";
import PrimaryButton from "@/components/common-components/primaryButton";
import ProtectedRoute from "@/components/common-components/privateRouter";

const WellnessLoungeList = () => {
  const router = useRouter();

  const [state, setState] = useSetState({
    name: "",
    description: "",
    isOpen: false,
    categoryName: "",
    categoryList: [],
    editData: {},
    deleteId: null,
    submitLoading: false,
  });

  useEffect(() => {
    getCouponList();
  }, []);

  const getCouponList = async () => {
    try {
      const res = await Models.coupon.list();
      setState({ categoryList: res?.results });
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const changeCouponStatus = async () => {
    try {
      setState({ statusLoading: true });
      const body = {
        is_active: !state.activeData?.is_active,
      };
      const res = await Models.coupon.update(body, state.activeData?.id);
      await getCouponList();
      setState({ statusLoading: false, isActiveOpen: false, activeData: null });
      Success("Coupon status updated successfully");
    } catch (error) {
      setState({ statusLoading: false });
    }
  };

  const columns = [
    {
      Header: "Code",
      accessor: "code",
    },
    {
      Header: "Type",
      accessor: "discount_type",
      Cell: (row) => (
        <Label>{capitalizeFLetter(row?.row?.discount_type)}</Label>
      ),
    },
    {
      Header: "Value",
      accessor: "discount_value",
    },
    {
      Header: "Valid From",
      accessor: "valid From",
      Cell: (row) => (
        <Label>{moment(row?.row?.valid_from).format("DD-MM-YYYY")}</Label>
      ),
    },
    {
      Header: "Valid To",
      accessor: "valid_to",
      Cell: (row) => (
        <Label>{moment(row?.row?.valid_to).format("DD-MM-YYYY")}</Label>
      ),
    },

    {
      Header: "Action",
      accessor: "action",
      Cell: (row) => (
        <div className="flex items-center gap-2">
          <div
            className="cursor-pointer"
            onClick={() => router.push(`/update-coupon?id=${row?.row?.id} `)}
          >
            <Edit size={18} className="mr-2" />
          </div>
          {/* <div className="cursor-pointer" onClick={() => handleView(row?.row)}>
          <Eye size={20} className="mr-2" />
        </div> */}
          <div
            className="cursor-pointer"
            onClick={() => setState({ isOpen: true, deleteId: row?.row?.id })}
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
        </div>
        // <DropdownMenu>
        //   <DropdownMenuTrigger asChild>
        //     <button className="p-2 rounded-md hover:bg-gray-200">
        //       <MoreHorizontal size={20} />
        //     </button>
        //   </DropdownMenuTrigger>
        //   <DropdownMenuContent align="end" className="w-32">
        //     <DropdownMenuItem
        //       onClick={() => router.push(`/update-coupon?id=${row?.row?.id} `)}
        //     >
        //       <Edit size={16} className="mr-2" />
        //       Edit
        //     </DropdownMenuItem>
        //     <DropdownMenuItem
        //       onClick={() => setState({ isOpen: true, deleteId: row?.row?.id })}
        //       className="text-red-500"
        //     >
        //       <Trash size={16} className="mr-2" />
        //       Delete
        //     </DropdownMenuItem>
        //   </DropdownMenuContent>
        // </DropdownMenu>
      ),
    },
  ];

  const deleteCoupon = async () => {
    try {
      setState({ submitLoading: true });
      const res = await Models.coupon.delete(state.deleteId);
      await getCouponList();
      setState({ isOpen: false, deleteId: null, submitLoading: false });
      Success("Coupon deleted successfully");
    } catch (error) {
      setState({ submitLoading: false });

      console.log("error: ", error);
    }
  };

  return (
    <div className="container mx-auto ">
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card className="w-[100%] p-4">
          <div className="grid auto-rows-min items-center gap-4 grid-cols-2">
            <div>
              <h2 className="md:text-[20px] text-sm font-bold">Coupon List</h2>
            </div>
            <div className="text-end">
              <Button
                type="button"
                className="bg-themeGreen hover:bg-themeGreen"
                onClick={() => router.push("/create-coupon")}
              >
                <PlusIcon />
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
        setIsOpen={() => setState({ isOpen: false, deleteId: null })}
        title={"Are you sure to delete record"}
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
                name="Submit"
                className="bg-themeGreen hover:bg-themeGreen"
                onClick={() => deleteCoupon()}
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
                onClick={() => changeCouponStatus()}
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
