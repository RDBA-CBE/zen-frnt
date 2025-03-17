"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
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
        orderData: []
    });

    // useEffect(() => {
    //     getCategoryList();
    // }, []);

    useEffect(() => {
        if (id) {
            getDetails();
        }

    }, [id]);

    const getDetails = async () => {
        try {
            const res = await Models.session.registrationDetails(id);

            setState({
                orderData: res
            });
        } catch (error) {
            console.log("error: ", error);
        }
    };
    console.log("orderData", state?.orderData)

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

    console.log("state?.orderData", state?.orderData)

    return (
        <div className="container mx-auto flex items-center">
            <div className="w-full">
                <div className="flex justify-between items-center">
                    <div className="mb-3">
                        <p className="font-bold text-lg">Order Details</p>
                        <p className="text-sm">Order ID: {state?.orderData?.registration_id}</p>
                    </div>
                    <div className="mb-3">
                        <p className="text-sm">Registration Date: {moment(state?.orderData?.registration_date).format("DD-MMM-YYYY")}</p>
                    </div>
                </div>



                <div className="grid auto-rows-min gap-4 md:grid-cols-2">

                    <div className="border rounded-xl p-4 gap-4 flex flex-col ">
                        {
                            state?.orderData.registration_status && (
                                <h4 className="mt-5 scroll-m-20 text-lg
                                 font-[500] tracking-tight transition-colors first:mt-0">
                                    Registration Status: {state?.orderData.registration_status}
                                </h4>
                            )
                        }


                        <div>
                            <ul className="my-6 ml-6  [&>li]:mt-2">
                                {state?.orderData?.event && (
                                    <>
                                        <li>
                                            Event Name:{state?.orderData?.event?.title} - {state?.orderData?.event?.lounge_type?.name}

                                        </li>
                                        <li>Start Date: {moment(state?.orderData.event?.start_date).format("YYYY-MMM-DD")}</li>
                                        <li>End Date: {moment(state?.orderData.end_date?.end_date).format("YYYY-MMM-DD")}</li>
                                        <li>Seat Count: {state?.orderData?.event?.seat_count}</li>
                                    </>
                                )}

                            </ul>
                        </div>
                    </div>
                    <div className="border rounded-xl p-4 gap-4 justify-center items-center flex flex-col ">
                        <h3 className="mt-2">
                            Meet Link:{" "}
                            {state?.orderData?.event?.session_link ? (
                                <Link href={state.orderData.event.session_link} target="_blank" rel="noopener noreferrer" className="bg-black text-white px-3 py-3 rounded-lg">
                                    Join Meeting
                                </Link>
                            ) : (
                                "N/A"
                            )}
                        </h3>
                        {state?.orderData?.event?.session_link && (
                            <Link href={state.orderData.event.session_link} target="_blank" rel="noopener noreferrer">
                                <img src="/assets/images/join-meeting.webp" alt="thumbnail" className="w-[300px] h-50" />
                            </Link>
                        )}
                    </div>

                    {/* <div>
                    <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                        {state?.orderData?.event_registrations && (
                            <li>
                                Event Registrations:{state?.orderData?.event_registrations[0]}
                            </li>
                        )}
                        {
                            state?.orderData?.date_of_birth && (
                                <li>Date of Birth: {state?.orderData?.date_of_birth}</li>
                            )
                        }
                        {
                            state?.orderData?.email && (
                                <li>Email: {state?.orderData?.email}</li>
                            )
                        }

                        {
                            state?.orderData?.phone_number && (
                                <li>Phone Number: {state?.orderData?.phone_number}</li>
                            )
                        }

                        {
                            state?.orderData?.address && (
                                <li>Address: {state?.orderData?.address}</li>
                            )
                        }

                    </ul>
                </div> */}

                </div>

            </div>


            {/* {(state?.orderData?.event_registrations ?? []).length > 0 && (
                    <div className="border rounded-xl p-4 gap-4 flex flex-col ">
                        <h1 className="font-[500]">Event Registratiopn</h1>

                        <div className="rounded-lg border">
                            <DataTable columns={columns} data={state?.orderData?.event_registrations ?? []} />
                        </div>


                    </div>
                )} */}

        </div>
    );
}
