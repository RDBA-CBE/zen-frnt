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
import ProtectedRoute from "@/components/common-components/privateRouter";

const viewWellnessLounge = () => {

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
                <div className="flex md:min-h-[70vh] min-h-[60vh] w-full items-center justify-center md:p-6">
                    <div className="lg:w-[800px] w-full ">

                        <div className="border rounded-xl p-4 gap-4 flex flex-col ">
                            <div>
                                <div className="md:flex justify-between items-center  ">
                                    <div className="md:mb-3">
                                        {
                                            state?.orderData.registration_status && (
                                                <h4 className="mt-5 scroll-m-20 text-[20px]
                                 font-[500] tracking-tight transition-colors first:mt-0">
                                                    Registration Status: {state?.orderData.registration_status}
                                                </h4>
                                            )
                                        }



                                        <p className="text-sm">Order ID: {state?.orderData?.registration_id}</p>
                                    </div>
                                    <div className="mb-3">
                                        <p className="text-sm">Registration Date: {moment(state?.orderData?.registration_date).format("DD-MMM-YYYY")}</p>
                                    </div>
                                </div>

                                <div className="pt-3">
                                    {state?.orderData?.event && (
                                        <>
                                            <p className="pb-1">
                                                <span className="font-[600] text-gray-700">Event Name:</span>  {state?.orderData?.event?.title}

                                            </p>
                                            <p> <span className="font-[600] text-gray-700">Category Name:</span> {state?.orderData?.event?.lounge_type?.name} </p>
                                            {/* <li>Start Date: {moment(state?.orderData.event?.start_date).format("YYYY-MMM-DD")}</li>
                                        <li>End Date: {moment(state?.orderData.end_date?.end_date).format("YYYY-MMM-DD")}</li> */}
                                            {/* <li> <span className="font-[600] text-gray-700">Seat Count:</span> {state?.orderData?.event?.seat_count}</li> */}
                                        </>
                                    )}
                                </div>

                                <blockquote className="mt-6 border-l-2 pl-6   bg-fuchsia-100 py-4  border-l-[5px] border-fuchsia-900 ">
                                    
                                    Starts - <span className="font-bold" style={{color:"#4a4a4a"}}>{moment(state?.orderData?.event?.start_date).format("DD MMM YYYY")}, {""}{moment(state?.orderData?.event?.start_time, "HH:mm:ss").format("hh:mm A")
                                        }</span> <br />
                                    {" "}Ends - <span className="font-bold " style={{color:"#4a4a4a"}}>{moment(state?.orderData?.event?.end_date).format("DD MMM YYYY")}, {""}{moment(state?.orderData?.event?.end_time,"HH:mm:ss").format("hh:mm A")}</span>
                                </blockquote>



                                
                            </div>

                            <div>
                                <h4 className="md:text-[22px] text-[18px]">   Session Link:{" "} <br />
                               <p className="mb-3 italic" style={{fontSize:"16px"}}>Click the below button to join the meeting</p> 
                                    {state?.orderData?.event?.session_link ? (
                                       <Button className="p-2 rounded bg-themePurple hover:bg-themePurple text-white">
                                        <Link href={state.orderData.event?.session_link} className="text-fuchsia-900 text-white" target="_blank" rel="noopener noreferrer">
                                            Join Meeting
                                        </Link>
                                       </Button>
                                       
                                    ) : (
                                        " No session link available"
                                    )}</h4>
                                {/* {state?.orderData?.event?.session_link && (
                                    <Link href={state.orderData.event.session_link} target="_blank" rel="noopener noreferrer">
                                        <img src="/assets/images/join-meeting.webp" alt="thumbnail" className="w-[300px] h-50" />
                                    </Link>
                                )} */}
                            </div>

                        </div>
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

export default ProtectedRoute(viewWellnessLounge);
