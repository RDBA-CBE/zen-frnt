"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import Models from "@/imports/models.import";
import {
    Dropdown,
    convertUrlToFile,
    getFileNameFromUrl,
    isValidImageUrl,
    useSetState,
} from "@/utils/function.utils";
import { TextInput } from "@/components/common-components/textInput";
import TextArea from "@/components/common-components/textArea";
import { DatePicker } from "@/components/common-components/datePicker";
import CustomSelect from "@/components/common-components/dropdown";
import TimePicker from "@/components/common-components/timePicker";
import moment from "moment";
import { useRouter, useSearchParams } from "next/navigation";

import * as Yup from "yup";
import * as Validation from "../../../utils/validation.utils";
import { CheckboxDemo } from "@/components/common-components/checkbox";
import { Trash2, X } from "lucide-react";
import { Success } from "@/components/common-components/toast";
import PrimaryButton from "@/components/common-components/primaryButton";
import Link from "next/link";
import { DataTable } from "@/components/ui/dataTable";
import { Label } from "@radix-ui/react-dropdown-menu";

export default function viewWellnessLounge() {
    const router = useRouter();

    const searchParams = useSearchParams();

    const id = searchParams.get("id");

    const [state, setState] = useSetState({
        userData: []
    });

    // useEffect(() => {
    //     getCategoryList();
    // }, []);

    useEffect(() => {
        getDetails();
    }, [id]);

    const getDetails = async () => {
        try {
            const res: any = await Models.user.getUserId(id);

            setState({
                userData: res
            });
        } catch (error) {
            console.log("error: ", error);
        }
    };
    console.log("userData", state?.userData)

    // const getCategoryList = async () => {
    //     try {
    //         const res: any = await Models.category.list();
    //         console.log("res: ", res);
    //         const Dropdowns = Dropdown(res?.results, "name");
    //         setState({ categoryList: Dropdowns });
    //     } catch (error) {
    //         console.log("error: ", error);
    //     }
    // };


    const columns = [
        {
            Header: "Order ID",
            accessor: "registration_id",
        },
        {
            Header: "Order Status",
            accessor: "registration_status",
        },
        {
            Header: "Registration Date",
            accessor: "registration_date",
            Cell: (row: any) => (
                <Label>{moment(row?.row?.registration_date).format("DD-MM-YYYY")}</Label>
            ),
        },

        {
            Header: "Lounge",
            accessor: "event_title",
            Cell: (row: any) => <Label>{row?.row?.event_title}</Label>,
        },
    ];

    return (
        <div className="container mx-auto h-[85vh] flex items-center">
            <div className="w-full">
                <div className="flex justify-between items-center">
                    <div className="font-bold text-lg mb-3">User Details</div>
                </div>



                <div className="grid auto-rows-min gap-4 md:grid-cols-2">

                    <div className="border rounded-xl p-4 gap-4 flex flex-col ">
                        <div>
                            <h2 className="mt-10 scroll-m-20 text-xl font-[500] tracking-tight transition-colors first:mt-0">
                                {state?.userData.username}
                            </h2>
                            <blockquote className="italic">
                                {state?.userData?.group_name}
                            </blockquote>
                        </div>
                        <div>
                            <ul className="my-6 ml-6 [&>li]:mt-2">
                                {/* {state?.userData?.event_registrations && (
                                    <li>
                                        Event Registrations:{state?.userData?.event_registrations[0]}
                                    </li>
                                )} */}

                                {
                                    state?.userData?.email && (
                                        <li>Email: {state?.userData?.email}</li>
                                    )
                                }
                                {
                                    state?.userData?.department && (
                                        <li>Date of Birth: {state?.userData?.department}</li>
                                    )
                                }

                                {
                                    state?.userData?.year_of_entry && (
                                        <li>Phone Number: {state?.userData?.year_of_entry}</li>
                                    )
                                }
                                {
                                    state?.userData?.intrested_topics && (
                                        <li>Intrested in: {state?.userData?.intrested_topics}</li>
                                    )
                                }
                                {
                                    state?.userData?.university && (
                                        <li>University: {state?.userData?.university}</li>
                                    )
                                }

                            </ul>
                        </div>

                    </div>
                    <div className="border rounded-xl p-4 gap-4 justify-center items-center flex flex-col ">

                        <img src="/assets/images/placeholder.jpg" alt="thumbnail" className="w-[300px] h-50" />
                    </div>



                </div>
                {(state?.userData?.event_registrations ?? []).length > 0 && (
                    <div className="border rounded-xl p-4 gap-4 mt-5 flex flex-col ">
                        <h1 className="font-[500]">Registered Events</h1>

                        <div className="rounded-lg border">
                            <DataTable columns={columns} data={state?.userData?.event_registrations ?? []} />
                        </div>


                    </div>
                )}
            </div>



        </div>

    );
}
