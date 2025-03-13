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
import { orderStatusList } from "@/utils/constant.utils";

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
        getOrdersList(state.currentPage);
        getCategoryList();
        getLoungeList(state.currentPage)
    }, []);

    useEffect(() => {
        getOrdersList(1);
    }, [debouncedSearch, state.lounge_status, state.start_date, state.event]);

    const getOrdersList = async (page: number) => {
        try {
            setState({ loading: true });
            // let pages = 1;
            let body = bodyData();
            // if (objIsEmpty(body)) {
            //     pages = page;
            // } else {
            //     pages = 1;
            // }
            const res: any = await Models.session.registrationList(page, body);

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

    const getLoungeList = async (page: number) => {
        try {
            setState({ loading: true });
            let pages = 1;
            let body = {};

            const res: any = await Models.session.list(pages, body);
            const Dropdowns = Dropdown(res?.results, "title");
            setState({
                loungeSearch: Dropdowns,
            })
        } catch (error) {
            setState({ loading: false });

            console.log("error: ", error);
        }
    };

    const getCategoryList = async () => {
        try {
            setState({ loading: true });

            const res: any = await Models.category.list();
            const dropdowns = Dropdown(res?.results, "name");
            setState({ categoryList: dropdowns, loading: false });
        } catch (error) {
            setState({ loading: false });

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
        if (state.event) {
            body.event = state.event?.value;
        }
        if (state.lounge_status) {
            body.lounge_status = state.lounge_status?.value;
        }

        return body;
    };

    // Example handlers for actions
    const handleEdit = (item: any) => {
        console.log("Editing:", item);
        router.push(`/update-order/?id=${item?.id}`);
    };

    const handleView = (item: any) => {
        console.log("Viewing:", item);
        router.push(`/view-order/?id=${item?.id}`);
    };

    const deleteSession = async () => {
        try {
            setState({ submitLoading: true });
            const res: any = await Models.session.deleteRegistration(state.deleteId);
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
            Cell: (row: any) => (
                <Label>{moment(row?.row?.registration_date).format("DD-MM-YYYY")}</Label>
            ),
        },
        {
            Header: "Order Status",
            accessor: "registration_status",

        },
        {
            Header: "Lounge",
            accessor: "event",
            Cell: (row: any) => <Label>{row?.row?.event?.title}</Label>
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
                <Card className="w-[100%] p-4">
                    <div className="grid auto-rows-min items-center gap-4 grid-cols-2">
                        <div>
                            <h2 className="md:text-lg text-sm font-bold">
                                Orders List
                            </h2>
                        </div>
                        <div
                            className="text-end"
                            onClick={() => router.push("/create-order")}
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
                                placeholder="Search Order ID"
                                required
                                className="w-full"
                            />
                        </div>
                        <CustomSelect
                            options={orderStatusList}
                            value={state.lounge_status?.value || ""}
                            onChange={(value: any) => setState({ lounge_status: value })}
                            placeholder="Order Status"
                        />
                        <CustomSelect
                            options={state?.loungeSearch}
                            value={state.event?.value || ""}
                            onChange={(value: any) => setState({ event: value })}
                            placeholder="Lounge"
                        />
                        <div>
                            <DatePicker
                                placeholder="Order Date"
                                closeIcon={true}
                                selectedDate={state.start_date}
                                onChange={(date: any) => {
                                    setState({
                                        start_date: date,
                                    });
                                }}
                            />
                        </div>

                    </div>
                </Card>

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
                                className={`btn ${!state.previous ? "btn-disabled" : "btn-primary"
                                    }`}
                            >
                                Prev
                            </Button>
                            <Button
                                disabled={!state.next}
                                onClick={handleNextPage}
                                className={`btn ${!state.next ? "btn-disabled" : "btn-primary"
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
