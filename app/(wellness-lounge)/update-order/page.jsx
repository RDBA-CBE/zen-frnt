"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Models from "@/imports/models.import";
import { Dropdown, useSetState } from "@/utils/function.utils";
import { TextInput } from "@/components/common-components/textInput";
import TextArea from "@/components/common-components/textArea";
import { DatePicker } from "@/components/common-components/datePicker";
import CustomSelect from "@/components/common-components/dropdown";
import TimePicker from "@/components/common-components/timePicker";
import moment from "moment";
import { useRouter, useSearchParams } from "next/navigation";

import * as Yup from "yup";
import * as Validation from "../../../utils/validation.utils";
import { Failure, Success } from "@/components/common-components/toast";
import PrimaryButton from "@/components/common-components/primaryButton";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/dataTable";
import { Label } from "@radix-ui/react-label";
import { XIcon } from "lucide-react";
import { orderStatusList } from "@/utils/constant.utils"
import CustomSelectMulti from "@/components/common-components/multi-select";
import CustomMultiSelect from "@/components/common-components/multi-select";

export default function UpdateOrder() {
    const router = useRouter();

    const searchParams = useSearchParams();

    const [id, setId] = useState(null);
    useEffect(() => {
        // Ensure that searchParams are read only on the client side
        if (typeof window !== "undefined") {
    
        const idFromSearchParams = searchParams.get("id");
    
        if (idFromSearchParams) {
          setId(idFromSearchParams);
        }
      }
    
      }, [searchParams]);

    const [state, setState] = useSetState({
        seat_count: 0,
        session_link: "",
        price: 0,
        lounge_type: {},
        end_time: "",
        start_time: "",
        valid_to: "",
        valid_from: "",
        Description: "",
        title: "",
        categoryName: "",
        categoryList: [],
        userList: [],
        user: {},
        loungeList: [],
        event: {},
        registration_status: {},
        thumbnail_image: "",
        errors: {},
        submitLoading: false,
    });

    useEffect(() => {
        if (id) {
            getDetails()
            getCategoryList();
            getUsersList();
            getLoungeList();
        }

    }, [id]);

    const getDetails = async () => {
        try {
            const res = await Models.session.detailsRegistration(id);
            console.log("res: ", res);

            setState({
                user: {
                    value: res?.user?.id,
                    label: res?.user?.username,
                },
                registration_status: {
                    value: res?.registration_status,
                    label: res?.registration_status,
                },
                event: {
                    value: res?.event?.id,
                    label: res?.event?.title,
                }

            });
        } catch (error) {
            console.log("error: ", error);
        }
    };

    const getCategoryList = async () => {
        try {
            const res = await Models.category.list();
            const Dropdowns = Dropdown(res?.results, "name");
            setState({ categoryList: Dropdowns });
        } catch (error) {
            console.log("error: ", error);
        }
    };

    const getUsersList = async () => {
        try {
            const res = await Models.user.dropdownUserserList();

            const Dropdowns = Dropdown(res?.results, "username");
            setState({ userList: Dropdowns, userData: res?.results });
        } catch (error) {
            console.log("error: ", error);
        }
    };

    const getLoungeList = async () => {
        try {
            const res = await Models.session.dropdownLoungelist();
            const Dropdowns = Dropdown(res?.results, "title");
            setState({ loungeList: Dropdowns, loungeData: res?.results });
        } catch (error) {
            console.log("error: ", error);
        }
    };


    const onSubmit = async () => {
        try {
            setState({ submitLoading: true });
            let body = {
                user: state?.user?.value,
                registration_status: state?.registration_status?.value,
                event: state?.event?.value,
            };
            console.log("body: ", body);

            // let formData = new FormData();
            // formData.append("description", body.description);
            // formData.append("title", body.title);
            // formData.append("start_date", body.start_date);
            // formData.append("end_date", body.end_date);
            // formData.append("event_type", body.lounge_type);
            // formData.append("price", body.price);
            // formData.append("start_time", body.start_time);
            // formData.append("end_time", body.end_time);
            // formData.append("session_link", body.session_link);
            // formData.append("seat_count", body.seat_count);
            // formData.append("lounge_type", body.lounge_type);

            // if (body.thumbnail_image) {
            //     formData.append("thumbnail", body.thumbnail_image);
            // }
            await Validation.updateSessionOrder.validate(body, {
                abortEarly: false,
            });
            const res = await Models.session.updateRegistration(body, id);
            setState({ submitLoading: false });

            router.push("/order-list");
            Success("Order created successfully");
        } catch (error) {
            console.log("error", error);

            // If error[0] exists (custom error message like "Registration for event Testing and user Ramesh already exists.")
            if (error[0]) {
                // You can set the custom error message here
                Failure(error[0])
                setState({
                    submitLoading: false
                });
            }

            // Handle Yup validation errors
            if (error instanceof Yup.ValidationError) {
                const validationErrors = {};
                error.inner.forEach((err) => {
                    validationErrors[err.path] = err?.message;
                });
                console.log("validationErrors: ", validationErrors);

                setState({
                    errors: validationErrors,
                    submitLoading: false
                });
            } else {
                // If it's neither a custom error nor a validation error, just stop loading
                setState({ submitLoading: false });
            }
        }

    };

    console.log("state?.error", state?.errors)

    const SelectedUser = state?.userData?.filter((item) => item?.id == state?.user?.value)

    const filteredLoungeData = state?.loungeData?.filter((lounge) =>
        lounge?.id == state?.event?.value
    );


    const columns = [
        {
            Header: "Title",
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
        // {
        //     Header: "Action",
        //     accessor: "action",
        //     Cell: (row: any) => (
        //         <XIcon onClick={setState({lounge: null})}/>
        //     )
        // }

    ];

    return (
        <div className="container mx-auto">
            <div className="font-bold text-lg mb-3">Create Order</div>
            <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                <div className="border rounded-xl p-4 gap-4 flex flex-col ">

                    <CustomSelect
                        options={state.userList}
                        value={state.user?.value || ""}
                        onChange={(value) => setState({ user: value })}
                        title="Select User"
                        error={state.errors?.user}
                        required
                        placeholder="Select User"
                    />
                    <div>

                        {

                            SelectedUser?.length > 0 && (
                                <>
                                    <h3 className="text-lg font-medium">User Details:</h3>

                                    <div className="pl-3 pt-3">
                                        <ul className="text-sm">
                                            <li className="pb-3"><span className="font-bold text-gray-700">Profile Picture:</span> <img src={SelectedUser[0]?.profile_picture} alt="Profile" className="w-[100px] h-[100px] rounded pt-2" /></li>
                                            <li className="pb-3"><span className="font-bold text-gray-700">Name:</span> {SelectedUser[0]?.username}</li>
                                            <li className="pb-3"><span className="font-bold text-gray-700">Email:</span> {SelectedUser[0]?.email || 'N/A'}</li>
                                            <li className="pb-3"><span className="font-bold text-gray-700">Contact Number:</span> {SelectedUser[0]?.phone_number || 'N/A'}</li>
                                            <li className="pb-3"><span className="font-bold text-gray-700">Date of Birth:</span> {SelectedUser[0]?.date_of_birth || 'N/A'}</li>
                                        </ul>
                                    </div>

                                </>

                            )
                        }




                    </div>
                </div>

                <div className="border rounded-xl p-4 gap-4 flex flex-col ">
                    {/* <CustomMultiSelect
                        options={state.loungeList}
                        value={state.event || ""}
                        onChange={(value: any) => setState({ event: value })}
                        title="Select Lounge"
                        error={state.errors?.event}
                        required
                        placeholder="Select Lounge"
                    /> */}
                    <CustomSelect
                        options={state.loungeList}
                        value={state.event?.value || ""}
                        onChange={(value) => setState({ event: value })}
                        title="Select Lounge"
                        error={state.errors?.event}
                        required
                        placeholder="Select Lounge"
                    />
                    {
                        filteredLoungeData?.length > 0 &&
                        (
                            <Card className="w-[100%] mt-2 mb-4 p-2">
                                <DataTable columns={columns} data={filteredLoungeData} />
                            </Card>
                        )

                    }

                    <CustomSelect
                        options={orderStatusList}
                        value={state.registration_status?.value || ""}
                        onChange={(value) => setState({ registration_status: value })}
                        title="Select Order Status"
                        error={state.errors?.registration_status}
                        required
                        placeholder="Select Order Status"
                    />


                    <div className="flex justify-end gap-5 mt-10">
                        {/* <Button variant="outline" className="sm:w-auto lg:w-[100px]">
              Cancel
            </Button>
            <Button
              className="sm:w-auto lg:w-[100px]"
              onClick={() => onSubmit()}
            >
              Submit
            </Button> */}

                        <PrimaryButton
                            variant={"outline"}
                            name="Cancel"
                            onClick={() => router.back()}
                        />

                        <PrimaryButton
                            name="Submit"
                            onClick={() => onSubmit()}
                            loading={state.submitLoading}
                        />
                    </div>
                </div>
            </div>




        </div>
    );
}
