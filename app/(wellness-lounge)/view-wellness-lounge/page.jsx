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
import { Failure, Success } from "@/components/common-components/toast";
import PrimaryButton from "@/components/common-components/primaryButton";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

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
        orderData: [],
        isOpen: false,
        group: null
    });


    useEffect(() => {
        const Group = localStorage.getItem("group")
        if (Group) {
            setState({ group: Group })
        }

    }, []);

    useEffect(() => {
        if (id) {
            getDetails();
        }
    }, [id]);

    const getDetails = async () => {
        try {
            const res = await Models.session.details(id);

            setState({
                orderData: res
            });
            const EventId = localStorage?.getItem("eventId")
            if (EventId) {
                localStorage?.removeItem("eventId")
            }

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

    const closeDialog = (() => {
        setState({ isOpen: false })
    })

    const confirmOrder = (async () => {
        try {
            const userID = localStorage.getItem("userId")
            let body = {
                user: Number(userID),
                event: [id],
            };
            console.log("body: ", body);

            const EventId = localStorage?.getItem("eventId")
            if (EventId) {
                localStorage?.removeItem("eventId")
            }
            console.log("EventId", EventId)

            const res = await Models.session.createRegistration(body);

            router.push(`/view-order?id=${res?.id}`);
            Success("Event Intrested sent successfully");

            setState({ isOpen: false })
        } catch (error) {
            console.log("error", error);

            // If error[0] exists (custom error message like "Registration for event Testing and user Ramesh already exists.")
            // If error[0] exists (custom error message like "Registration for event Testing and user Ramesh already exists.")
            if (error[0]) {
                // You can set the custom error message here
                Failure(error[0])
                setState({
                    submitLoading: false,
                    isOpen: false
                });
            }

        }
    })
    return (
        <div className="container mx-auto">
            <div className="font-bold text-lg mb-3"> Lounge Session Details</div>
            <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                <div className="border rounded-xl p-4 gap-4 flex flex-col ">
                    <img src={state?.orderData?.thumbnail} alt="thumbnail" className="w-100 h-100" />
                </div>
                <div className="border rounded-xl p-4 gap-4 flex flex-col ">
                    <div>
                        <h2 className="mt-10 scroll-m-20 border-b pb-2 text-2xl font-[500] tracking-tight transition-colors first:mt-0">
                            {state?.orderData.title} - {state?.orderData?.lounge_type?.name}
                        </h2>
                        <blockquote className="mt-6 border-l-2 pl-6 italic">
                            Event Start Date and Time <span className="font-bold text-gray-700">{moment(state?.orderData.start_date).format("YYYY-MMM-DD")}, {state?.orderData.start_time}</span>
                            {" "}End Date and Time <span className="font-bold text-gray-700">{moment(state?.orderData.end_date).format("YYYY-MMM-DD")}, {state?.orderData.end_time}</span>
                        </blockquote>

                        <p className="leading-7 [&:not(:first-child)]:mt-6">
                            {state?.orderData?.description}
                        </p>

                        <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                            <li>
                                Session Link:{" "}
                                {state?.orderData?.session_link ? (
                                    <Link href={state.orderData.session_link} target="_blank" rel="noopener noreferrer">
                                        {state.orderData.session_link}
                                    </Link>
                                ) : (
                                    " No session link available"
                                )}
                            </li>
                            <li>Seat Count: {state?.orderData?.seat_count}</li>
                        </ul>
                        {
                            state?.group == "Student" && (
                                <div>
                                    <Button className={`${state?.orderData?.is_registered == true ? "bg-themeGreen hover:bg-themeGreen" : "bg-themePurple hover:bg-themePurple "}`} onClick={() => setState({ isOpen: true })}>Intrested</Button>
                                </div>
                            )
                        }

                    </div>

                </div>

                <Dialog open={state?.isOpen} onOpenChange={closeDialog}>
                    <DialogContent className="bg-white p-6 rounded-lg w-96">
                        <DialogTitle className="text-lg font-semibold mb-2">Are you sure you're interested in this event?</DialogTitle>
                        <div className="flex justify-between gap-2">
                            <Button onClick={closeDialog} className="p-2 bg-themePurple hover:bg-themePurple rounded text-white w-full">
                                Cancel
                            </Button>
                            <Button onClick={confirmOrder} className="w-full bg-themeGreen hover:bg-themeGreen p-2 rounded text-white">
                                Confirm
                            </Button>
                        </div>

                    </DialogContent>
                </Dialog>


            </div>
        </div>
    );
}
