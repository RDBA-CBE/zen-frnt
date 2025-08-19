"use client";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/dataTable";

import {
  Edit,
  Eye,
  MoreHorizontal,
  PlusIcon,
  Trash,
  CircleX,
} from "lucide-react";
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
import ProtectedRoute from "@/components/common-components/privateRouter";

const CategoriesList = () => {
  const [state, setState] = useSetState({
    description: "",
    isOpen: false,
    name: "",
    categoryList: [],
    editData: {},
    deleteId: null,
    isOpenDelete: false,
    deleteLoading: false,
    submitLoading: false,
  });

  useEffect(() => {
    getCategoryList();
  }, []);

  const getCategoryList = async () => {
    try {
      const res = await Models.category.list();
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
    // {
    //   Header: "Description",
    //   accessor: "description" || N/A,
    // },
    {
      Header: "Description",
      accessor: "description",
      Cell: ({ value }) => {
        return value && value.trim() !== "" ? value : "N/A";
      },
    },

    {
      Header: "Action",
      accessor: "action",
      Cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="cursor-pointer" onClick={() => handleEdit(row?.row)}>
            <Edit size={18} className="mr-2" />
          </div>

          <div
            className="cursor-pointer"
            onClick={() =>
              setState({ isOpenDelete: true, deleteId: row?.row?.id })
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
          {/* <DropdownMenu>
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
            <DropdownMenuItem onClick={() => handleView(row.original)}>
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
        </DropdownMenu> */}
        </div>
      ),
    },
  ];

  const handleEdit = (item) => {
    setState({
      editData: item,
      name: item.name,
      description: item.description,
      isOpen: true,
    });
  };

  const createCategory = async () => {
    try {
      setState({ submitLoading: true });
      const body = {
        name: state.name,
        description: state.description,
      };
      await Validation.createCategory.validate(body, {
        abortEarly: false,
      });
      await Models.category.create(body);
      await getCategoryList();
      clearRecord();
      setState({ submitLoading: false });

      Success("Category created successfully");
      setState({ submitLoading: false });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });

        setState({ errors: validationErrors });
        setState({ submitLoading: false });
      } else {
        setState({ submitLoading: false });
      }
    }
  };

  const deleteCategory = async () => {
    try {
      setState({ deleteLoading: true });
      await Models.category.delete(state.deleteId);
      await getCategoryList();
      setState({ isOpenDelete: false, deleteId: null, deleteLoading: false });
      Success("Category deleted successfully");
    } catch (error) {
      setState({ deleteLoading: false });
      console.log("error: ", error);
    }
  };

  const updateCategory = async () => {
    try {
      setState({ submitLoading: true });

      const body = {
        name: state.name,
        description: state.description,
      };
      await Validation.createCategory.validate(body, {
        abortEarly: false,
      });
      await Models.category.update(state.editData?.id, body);
      await getCategoryList();
      clearRecord();
      setState({ submitLoading: false });

      Success("Category updated successfully");
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });

        setState({ errors: validationErrors });
        setState({ submitLoading: false });
      } else {
        setState({ submitLoading: false });
      }
    }
  };

  const changeCategoryStatus = async () => {
    try {
      setState({ statusLoading: true });
      const body = {
        is_active: !state.activeData?.is_active,
      };

      await Models.category.update(state.activeData?.id, body);
      await getCategoryList();
      setState({ statusLoading: false, isActiveOpen: false, activeData: null });
      Success("Category status updated successfully");
    } catch (error) {
      setState({ statusLoading: false });
    }
  };

  const clearRecord = () => {
    setState({
      isOpen: false,
      editData: {},
      name: "",
      description: "",
      errors: {},
    });
  };

  return (
    <div className="container mx-auto ">
      <div className="flex justify-center  w-full">
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Card className="w-[100%] p-4">
            <div className="grid auto-rows-min items-center gap-4 grid-cols-2">
              <div>
                <h2 className="md:text-[20px] text-sm font-bold">
                  Category List
                </h2>
              </div>
              <div className="text-end">
                <Button
                  type="button"
                  className="bg-themeGreen hover:bg-themeGreen "
                  onClick={() =>
                    setState({
                      isOpen: true,
                      editData: {},
                      name: "",
                      description: "",
                    })
                  }
                >
                  <PlusIcon />
                </Button>
              </div>
            </div>
          </Card>

          <p style={{ fontSize: "14px", color: "red" }}>
            <strong style={{ color: "black" }}>Note:</strong> Please don't
            delete any category
          </p>

          {/* <Card className="w-[100%] p-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div>
              <Input placeholder="Search Title" />
            </div>
            <div>
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
            </div>
            <div>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Lounge Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card> */}

          {/* <div className="flex gap-2">
          <p className="text-[14px]">Selected Filters:</p>
          <p className="text-[14px] bg-gray-600 text-white px-2 flex items-center gap-1 rounded-sm">
            Online <X className="w-4 h-4 cursor-pointer" />{" "}
          </p>
          <p className="text-[14px] bg-gray-600 text-white px-2 flex items-center gap-1 rounded-sm">
            20,000 <X className="w-4 h-4 cursor-pointer" />{" "}
          </p>
        </div> */}

          <div className="rounded-lg border">
            <DataTable columns={columns} data={state.categoryList} />
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
      </div>

      <Modal
        isOpen={state.isOpen}
        setIsOpen={clearRecord}
        title={!objIsEmpty(state.editData) ? "Update Category" : "Add Category"}
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
                className="text-themeGreen hover:text-themeGreen border-themeGreen hover:border-themeGreen"
                name="Cancel"
                onClick={() => clearRecord()}
              />

              <PrimaryButton
                name="Submit"
                className="bg-themeGreen hover:bg-themeGreen"
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

      <Modal
        isOpen={state.isOpenDelete}
        setIsOpen={() => setState({ isOpenDelete: false, deleteId: null })}
        title={"Are you sure to delete record"}
        renderComponent={() => (
          <>
            <div className="flex justify-end gap-5">
              <PrimaryButton
                variant={"outline"}
                className="border-themeGreen hover:border-themeGreen text-themeGreen hover:text-themeGreen "
                name="Cancel"
                onClick={() =>
                  setState({ isOpenDelete: false, deleteId: null })
                }
              />

              <PrimaryButton
                name="Submit"
                className="bg-themeGreen hover:bg-themeGreen"
                onClick={() => deleteCategory()}
                loading={state.deleteLoading}
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
                onClick={() => changeCategoryStatus()}
                loading={state.statusLoading}
              />
            </div>
          </>
        )}
      />
    </div>
  );
};

export default ProtectedRoute(CategoriesList);
