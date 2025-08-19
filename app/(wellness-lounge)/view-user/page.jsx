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
    userData: [],
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
      const res = await Models.user.getUserId(id);

      setState({
        userData: res,
      });
    } catch (error) {
      console.log("error: ", error);
    }
  };

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
      Cell: (row) => (
        <Label>
          {moment(row?.row?.registration_date).format("DD-MM-YYYY")}
        </Label>
      ),
    },

    {
      Header: "Lounge",
      accessor: "event_title",
      Cell: (row) => <Label>{row?.row?.event_title}</Label>,
    },
  ];

  return (
    <div className="container mx-auto flex items-center">
      <div className="w-full">
        <div className="flex justify-between items-center">
          <h2 className="font-bold md:text-[20px] text-sm mb-3">
            User Details
          </h2>
        </div>

        <div className=" auto-rows-min gap-4 flex flex-col xl:flex-row">
          <div className="border w-full xl:w-2/4 rounded-xl p-4 gap-10 flex flex-row flex-wrap ">
            <div>
              <img
                src={
                  !state?.userData?.profile_picture
                    ? "/assets/images/dummy-profile.jpg"
                    : state?.userData?.profile_picture
                }
                alt="thumbnail"
                className="w-[200px] h-[200px]"
                style={{ borderRadius: "10px", objectFit: "cover" }}
              />
            </div>
            <div>
              <h2 className="mt-3 scroll-m-20 text-xl font-[500] tracking-tight transition-colors first:mt-0 capitalize">
                {state?.userData.first_name} {state?.userData.last_name}
              </h2>
              <blockquote className="italic">
                {state?.userData?.group?.name}
              </blockquote>
              <ul className="mb-6 [&>li]:mt-2">
                {/* {state?.userData?.event_registrations && (
                                    <li>
                                        Event Registrations:{state?.userData?.event_registrations[0]}
                                    </li>
                                )} */}

                {state?.userData?.email && (
                  <li>Email: {state?.userData?.email}</li>
                )}
                {state?.userData?.phone_number && (
                  <li>Phone Number: {state?.userData?.phone_number}</li>
                )}
                {state?.userData?.department && (
                  <li>Department: {state?.userData?.department}</li>
                )}
                {state?.userData?.group?.name == "Alumni" ? (
                  <>
                    {state?.userData?.year_of_graduation && (
                      <li>
                        Year Of Graduation:{" "}
                        {state?.userData?.year_of_graduation}
                      </li>
                    )}
                  </>
                ) : (
                  state?.userData?.group?.name == "Student" && (
                    <>
                      {state?.userData?.year_of_entry && (
                        <li>Year Of Entry: {state?.userData?.year_of_entry}</li>
                      )}
                    </>
                  )
                )}
                {state?.userData?.work && (
                  <li>Work: {state?.userData?.work}</li>
                )}

                {state?.userData?.intrested_topics?.length > 0 && (
                  <li>
                    <div>Interested in Topics:</div>{" "}
                    {state.userData.intrested_topics.map((item, index) => {
                      const topicText =
                        item.topic === "Others"
                          ? `Others ${
                              state?.userData?.lable &&
                              `(${state?.userData?.lable})`
                            }`
                          : item.topic;
                      return (
                        <span key={item.id}>
                          {topicText}
                          {index < state.userData.intrested_topics.length - 1
                            ? ", "
                            : ""}
                        </span>
                      );
                    })}
                  </li>
                )}
                {state?.userData?.university && (
                  <li>University: {state?.userData?.university?.name}</li>
                )}
              </ul>
            </div>
          </div>
          <div className="border w-full xl:w-3/4 rounded-xl p-4 gap-4  flex flex-col ">
            {/* <img
              src="/assets/images/placeholder.jpg"
              alt="thumbnail"
              className="w-[300px] h-50"
            /> */}
            {(state?.userData?.event_registrations ?? []).length > 0 ? (
              <div className=" rounded-xl p-2 gap-4 flex flex-col ">
                <h1 className="font-[500]">Registered Events</h1>

                <div className="rounded-lg border">
                  <DataTable
                    columns={columns}
                    data={state?.userData?.event_registrations ?? []}
                  />
                </div>
              </div>
            ) : (
              <div className=" rounded-xl p-2 gap-4 flex flex-col ">
                <h1 className="font-[500]">No Events Registered yet! </h1>

                {/* <Link
                      href="https://irepute.in/"
                      className="font-bold"
                      target="_blank"
                    >
                      Click here to regester a event
                    </Link> */}
              </div>
            )}
          </div>
        </div>
        {/* {(state?.userData?.event_registrations ?? []).length > 0 && (
          <div className="border rounded-xl p-4 gap-4 mt-5 flex flex-col ">
            <h1 className="font-[500]">Registered Events</h1>

            <div className="rounded-lg border">
              <DataTable
                columns={columns}
                data={state?.userData?.event_registrations ?? []}
              />
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default ProtectedRoute(viewWellnessLounge);
