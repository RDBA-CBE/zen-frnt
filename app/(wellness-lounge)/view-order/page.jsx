"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Models from "@/imports/models.import";
import { extractZoomMeetingId, useSetState } from "@/utils/function.utils";

import moment from "moment";
import { useRouter, useSearchParams } from "next/navigation";

import { CalendarClock, Loader } from "lucide-react";

import Link from "next/link";

import ProtectedRoute from "@/components/common-components/privateRouter";
import NoEventFound from "@/components/common-components/noEventFound";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
    orderData: [],
    error: null,
    group:null
  });

  useEffect(() => {
    if (id) {
      getDetails();
    }
  }, [id]);

  const getDetails = async () => {
    try {
      const res = await Models.session.registrationDetails(id);
      console.log("✌️res --->", res);
      setState({
        orderData: res,
      });
      const link = extractZoomMeetingId(res?.event?.session_link);
      console.log("✌️link --->", link);
      attendanceList(link);
      const group=localStorage.getItem("group")
console.log('✌️group --->', group);
setState({group:group})
    } catch (error) {
      setState({ error: error?.detail });
      console.log("error: ", error);
    }
  };

  const attendanceList = async (meeting_id) => {
    try {
      setState({ loading: true });

      const res = await Models.attendance.list(meeting_id);
      console.log("attendanceList: ", res);
      setState({
        attendanceList: res?.results,
        loading: false,
        count: res.next,
        prev: res.previous,
      });
    } catch (error) {
      setState({ loading: false });
      console.log("error: ", error);
    }
  };

  const isExpired = () => {
    if (!state?.orderData?.event) return false;

    const { end_date, end_time } = state.orderData.event;

    if (!end_date || !end_time) return false;

    const eventEnd = moment(`${end_date} ${end_time}`, "YYYY-MM-DD HH:mm:ss");

    return moment().isAfter(eventEnd);
  };

  return (
    <div className="container mx-auto flex items-center">
      {state.loading ? (
        <div className="w-full flex justify-center items-center h-[70vh]">
          <Loader />
        </div>
      ) : (
        <div className="w-full">
          {state.error ? (
            <div>
              <NoEventFound />
            </div>
          ) : (
            <>
              <div className="flex flex-col  w-full items-center justify-center md:p-6">
                <div className="lg:w-[800px] w-full ">
                  <div className="border rounded-xl p-4 gap-4 flex flex-col ">
                    <div>
                      <div className="md:flex justify-between items-center  ">
                        <div className="md:mb-3">
                          {state?.orderData.registration_status && (
                            <h4
                              className="mt-5 scroll-m-20 text-[20px]
                                 font-[500] tracking-tight transition-colors first:mt-0"
                            >
                              Registration Status:{" "}
                              {state?.orderData.registration_status}
                            </h4>
                          )}

                          <p className="text-sm">
                            Order ID: {state?.orderData?.registration_id}
                          </p>
                        </div>
                        <div className="mb-3">
                          <p className="text-sm">
                            Registration Date:{" "}
                            {moment(state?.orderData?.registration_date).format(
                              "DD-MMM-YYYY"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3">
                        {state?.orderData?.event && (
                          <>
                            <p className="pb-1">
                              <span className="font-[600] text-gray-700">
                                Event Name:
                              </span>{" "}
                              {state?.orderData?.event?.title}
                            </p>
                            <p>
                              {" "}
                              <span className="font-[600] text-gray-700">
                                Category Name:
                              </span>{" "}
                              {state?.orderData?.event?.lounge_type?.name}{" "}
                            </p>
                            {/* <li>Start Date: {moment(state?.orderData.event?.start_date).format("YYYY-MMM-DD")}</li>
                                        <li>End Date: {moment(state?.orderData.end_date?.end_date).format("YYYY-MMM-DD")}</li> */}
                            {/* <li> <span className="font-[600] text-gray-700">Seat Count:</span> {state?.orderData?.event?.seat_count}</li> */}
                          </>
                        )}
                      </div>

                      <blockquote className="mt-6 border-l-2 pl-6   bg-fuchsia-100 py-4  border-l-[5px] border-fuchsia-900 ">
                        <div className="flex gap-1 mb-4">
                          <span className="flex gap-1 ">
                            <CalendarClock
                              height={16}
                              width={18}
                              className="relative top-[3px]"
                            />{" "}
                            Starts -
                          </span>
                          <span
                            className="font-bold"
                            style={{ color: "#4a4a4a" }}
                          >
                            {moment(state?.orderData?.event?.start_date).format(
                              "DD MMM YYYY"
                            )}
                            , {""}
                            {moment(
                              state?.orderData?.event?.start_time,
                              "HH:mm:ss"
                            ).format("hh:mm A")}{" "}
                            (IST)
                          </span>{" "}
                        </div>
                        <div className="flex gap-x-1">
                          <span className="flex gap-1">
                            <CalendarClock
                              height={16}
                              width={18}
                              className="relative top-[3px]"
                            />
                            Ends -{" "}
                          </span>
                          <span
                            className="font-bold "
                            style={{ color: "#4a4a4a" }}
                          >
                            {moment(state?.orderData?.event?.end_date).format(
                              "DD MMM YYYY"
                            )}
                            , {""}
                            {moment(
                              state?.orderData?.event?.end_time,
                              "HH:mm:ss"
                            ).format("hh:mm A")}{" "}
                            (IST)
                          </span>
                        </div>
                      </blockquote>
                    </div>

                    <div>
                      <h4 className="md:text-[22px] text-[18px]">
                        {" "}
                        Session Link: <br />
                        <p className="mb-3 italic" style={{ fontSize: "16px" }}>
                          Click the below button to join the meeting
                        </p>
                        {isExpired() ? (
                          <span className="text-red-500 font-semibold">
                            Session Expired
                          </span>
                        ) : state?.orderData?.event?.session_link ? (
                          <Button className="p-2 rounded bg-themePurple hover:bg-themePurple text-white">
                            <Link
                              href={state.orderData.event?.session_link}
                              className="rounded-sm"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Join Meeting
                            </Link>
                          </Button>
                        ) : (
                          "No session link available"
                        )}
                      </h4>
                      {/* {state?.orderData?.event?.session_link && (
                                    <Link href={state.orderData.event.session_link} target="_blank" rel="noopener noreferrer">
                                        <img src="/assets/images/join-meeting.webp" alt="thumbnail" className="w-[300px] h-50" />
                                    </Link>
                                )} */}
                    </div>
                  </div>
                </div>
                {state.attendanceList?.length > 0 && state.group == "Admin" && (
                  <div className="lg:w-[800px] mx-auto border rounded-xl p-4 gap-4 flex flex-col mt-3">
                    <div className="">
                      <h5 className="text-xl font-semibold text-gray-800 mb-3">
                        Participated List
                      </h5>
                      {/* User list */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                        {state.attendanceList?.map((user) => (
                          <Card
                            key={user?.user_id}
                            className="shadow-md rounded-2xl"
                          >
                            <CardContent className="flex flex-col items-center p-6">
                              {user?.user?.profile_picture ? (
                                <img
                                  src={user?.user?.profile_picture}
                                  alt="Profile"
                                  className="w-[80px] h-[80px] rounded mt-2"
                                  style={{
                                    borderRadius: "100px",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <Avatar className="h-16 w-16 mb-3">
                                  <AvatarFallback>
                                    {user.name
                                      ? user.name
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")
                                          .toUpperCase()
                                      : "?"}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <p className="text-base font-semibold">
                                {user?.user?.first_name} {user?.user?.last_name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {user.user_email || "Guest"}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Pagination */}
                    {/* <div className="flex justify-center gap-4 mt-4">
              <Button
                variant="outline"
                disabled={!state?.prev || state.loading}
                onClick={() => handlePageChange(data?.previous)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={!state?.next || loading}
                onClick={() => handlePageChange(data?.next)}
              >
                Next
              </Button>
            </div> */}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProtectedRoute(viewWellnessLounge);
