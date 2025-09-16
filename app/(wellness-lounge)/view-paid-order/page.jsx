"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Models from "@/imports/models.import";
import {
  Dropdown,
  capitalizeFLetter,
  convertUrlToFile,
  extractZoomMeetingId,
  formatNumber,
  formatTimeRange,
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
import {
  AlertCircle,
  CalendarClock,
  Loader,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { Failure, Success } from "@/components/common-components/toast";
import PrimaryButton from "@/components/common-components/primaryButton";
import Link from "next/link";
import { DataTable } from "@/components/ui/dataTable";
import { Label } from "@radix-ui/react-dropdown-menu";
import ProtectedRoute from "@/components/common-components/privateRouter";
import { AYURVEDIC_LOUNGE } from "@/utils/constant.utils";
import NoEventFound from "@/components/common-components/noEventFound";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

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
    lastPayment: null,
    user: null,
    error: null,
    count: 0,
    prev: null,
    attendanceList: [],
    next: null,
  });

  // useEffect(() => {
  //     getCategoryList();
  // }, []);

  useEffect(() => {
    if (id) {
      getDetails();
      paymentGatewayList();
      userDetail();
    }
  }, [id]);

  const getDetails = async () => {
    try {
      const res = await Models.session.registrationDetails(id);
      console.log("res: ", res);
      if (res?.event?.lounge_type?.id == AYURVEDIC_LOUNGE) {
        const response = formatTimeRange(
          res?.slot?.event_slot?.date,
          res?.slot?.start_time,
          res?.event?.interval
        );

        const link = extractZoomMeetingId(res?.event?.session_link);
        attendanceList(link);

        setState({ eventDate: `Date : ${response}` });
      }
      if (res?.payments?.length > 0) {
        const lastPayment = res?.payments?.[res?.payments?.length - 1];
        console.log("✌️lastPayment --->", lastPayment);
        setState({
          lastPayment,
        });
      }
      const user = localStorage.getItem("group");
      console.log("✌️user --->", user);
      setState({
        orderData: res,
        user,
      });
    } catch (error) {
      setState({ error: error?.detail });
      console.log("errorerror: ", error);
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

  const userDetail = async (id) => {
    setState({ loading: true }); // Start loading
    try {
      const userId = localStorage.getItem("userId");

      const res = await Models.auth.userDetails(userId);

      setState({ userDetail: res, loading: false }); // Set data and stop loading
    } catch (error) {
      console.log("Error:", error);

      setState({ loading: false });
    }
  };

  const paymentGatewayList = async () => {
    try {
      setState({ loading: true });

      const res = await Models.payment_gateway.list();

      setState({ paymentGatewayList: res?.results });
    } catch (error) {
      setState({ loading: false });

      console.log("error: ", error);
    }
  };

  const createPayment = async () => {
    try {
      const body = {
        registrations: [id],
        payment_gateway: state.paymentGatewayList[0]?.id,
        currency: "INR",
      };

      const res = await Models.payment.create(body);

      handlePayment(res);
    } catch (error) {
      if (error?.error) {
        Failure(error?.error);
      }
      console.log("✌️error --->", error);
    }
  };

  const loadRazorpayScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (paymentData) => {
    try {
      const resp = await loadRazorpayScript(
        "https://checkout.razorpay.com/v1/checkout.js"
      );
      if (!resp) {
        alert("Razorpay SDK failed to load. Are you online?");
        return;
      }

      const options = {
        key: "rzp_test_tEMCtcfElFdYts",
        currency: "INR",
        order_id: paymentData?.id,
        modal: {
          ondismiss: function () {
            router.push(`/order-failed/?id=${id}`);

            console.log("Payment modal dismissed");
          },
        },
        handler: async function (response) {
          verifyPayment(response, paymentData);
        },
        prefill: {
          name: `${state.userDetail?.first_name} ${state.userDetail?.last_name}`,
          email: `${state.userDetail?.email}`,
          contact: `${state?.userDetail?.phone_number}`,
        },
        notes: {
          address: "Sample Address",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      router.push(`/order-failed/?id=${state.orderId}`);
      console.error("Payment error: ", error);
    }
  };

  const verifyPayment = async (razorpayData, paymentData, orderData) => {
    try {
      const body = {
        payment_id: paymentData.payment_id,
        razorpay_order_id: razorpayData.razorpay_order_id,
        razorpay_payment_id: razorpayData.razorpay_payment_id,
        razorpay_signature: razorpayData.razorpay_signature,
      };

      const check = await Models.session.verifyPayment(body);
      console.log("paymentGatewayList --->", check);
      await getDetails();
      // router.push(`/order-success/?id=${state.orderId}`);

      // setState({ paymentGatewayList: check?.results });
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const isExpired = () => {
    if (!state?.orderData?.slot) return false;

    const { date, end_time } = state?.orderData?.slot?.event_slot;

    if (!date || !end_time) return false;

    const eventEnd = moment(`${date} ${end_time}`, "YYYY-MM-DD HH:mm:ss");

    return moment().isAfter(eventEnd);
  };

  return (
    <div className="container mx-auto py-6">
      {state.loading ? (
        <div className="w-full flex justify-center items-center h-[70vh]">
          <Loader />
        </div>
      ) : state.error ? (
        <div>
          <NoEventFound />
        </div>
      ) : (
        <>
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  {state?.orderData.registration_status && (
                    <h4 className="text-2xl font-semibold text-gray-800 mb-2">
                      Registration Status:{" "}
                      <span className="text-themePurple">
                        {state?.orderData.registration_status}
                      </span>
                    </h4>
                  )}
                  <p className="text-gray-600">
                    Order ID: {state?.orderData?.registration_id}
                  </p>
                  {state?.orderData?.is_admin_registration && (
                    <p className="text-green-600 pt-3">
                      Created By : {"Admin"}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-gray-600">
                    Registration Date:{" "}
                    {moment(state?.orderData?.registration_date).format(
                      "DD-MMM-YYYY"
                    )}
                  </p>
                </div>
              </div>

              {/* Event Details */}
              {state?.orderData?.event && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h5 className="text-lg font-semibold text-gray-800 mb-3">
                    Event Details
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-700">
                        <span className="font-semibold">Event Name:</span>{" "}
                        {state?.orderData?.event?.title}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-700">
                        <span className="font-semibold">Category:</span>{" "}
                        {state?.orderData?.event?.lounge_type?.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Date & Time Section */}
            <div className="bg-fuchsia-50 border-l-4 border-fuchsia-600 rounded-lg p-6 mb-6">
              {state.orderData?.event?.lounge_type?.id == AYURVEDIC_LOUNGE ? (
                <div className="text-fuchsia-800 font-semibold">
                  {state?.eventDate}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CalendarClock className="w-5 h-5 text-fuchsia-700" />
                    <div>
                      <span className="font-semibold text-gray-700">
                        Starts -{" "}
                      </span>
                      <span className="text-gray-800">
                        {moment(state?.orderData?.event?.start_date).format(
                          "DD MMM YYYY"
                        )}
                        ,{" "}
                        {moment(
                          state?.orderData?.event?.start_time,
                          "HH:mm:ss"
                        ).format("hh:mm A")}{" "}
                        (IST)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarClock className="w-5 h-5 text-fuchsia-700" />
                    <div>
                      <span className="font-semibold text-gray-700">
                        Ends -{" "}
                      </span>
                      <span className="text-gray-800">
                        {moment(state?.orderData?.event?.end_date).format(
                          "DD MMM YYYY"
                        )}
                        ,{" "}
                        {moment(
                          state?.orderData?.event?.end_time,
                          "HH:mm:ss"
                        ).format("hh:mm A")}{" "}
                        (IST)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Section */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h5 className="text-xl font-semibold text-gray-800 mb-4">
                Order Summary
              </h5>

              <div className="space-y-3">
                {/* Original Price */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">
                    {state?.orderData?.event?.title}
                  </span>
                  <span className="font-medium">
                    ₹{formatNumber(state?.orderData?.event?.price || 0)}
                  </span>
                </div>

                {/* Coupon Discount */}
                {state?.orderData?.coupon?.discount_value > 0 && (
                  <div className="flex justify-between items-center py-2 border-t border-gray-100">
                    <span className="text-gray-600">
                      Discount{" "}
                      {state?.orderData?.coupon?.discount_type == "percent" &&
                        `${state?.orderData?.coupon?.discount_value}% off`}
                    </span>
                    <span className="text-green-600 font-medium">
                      -₹
                      {formatNumber(
                        state?.orderData?.coupon?.discount_value || 0
                      )}
                    </span>
                  </div>
                )}

                {/* Tax (if applicable) */}
                {/* {state?.orderData?.tax_amount > 0 && (
              <div className="flex justify-between items-center py-2 border-t border-gray-100">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">
                  +₹{formatNumber(state?.orderData?.tax_amount || 0)}
                </span>
              </div>
            )} */}

                {/* Total Amount */}
                <div className="flex justify-between items-center py-3 border-t border-gray-200 mt-2">
                  <span className="text-lg font-semibold text-gray-800">
                    Total Amount
                  </span>
                  <span className="text-lg font-bold text-themePurple">
                    ₹{formatNumber(state?.orderData?.amount || 0)}
                  </span>
                </div>

                {/* Payment Status */}
                {state?.orderData?.payments?.length > 0 &&
                  state.lastPayment && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Payment Status</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          state.lastPayment?.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {capitalizeFLetter(state.lastPayment?.status)}
                      </span>
                    </div>
                  )}
                {state.lastPayment?.status == "pending" &&
                  state.user !== "Admin" && (
                    <Button
                      onClick={() => createPayment()}
                      className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700"
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Retry Payment
                      </div>
                    </Button>
                  )}
              </div>
            </div>

            {state.orderData?.event?.lounge_type?.id == AYURVEDIC_LOUNGE ? (
              state.lastPayment?.status == "completed" && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h5 className="text-xl font-semibold text-gray-800 mb-3">
                    Session Access
                  </h5>

                  {isExpired() ? (
                    <span className="text-red-500 font-semibold">
                      Session Expired
                    </span>
                  ) : state?.orderData?.event?.session_link ? (
                    <div className="space-y-4">
                      <p className="text-gray-600 italic">
                        Click the button below to join your yoga session meeting
                      </p>
                      <Button className="bg-themePurple hover:bg-themePurple/90 text-white px-6 py-3 rounded-lg">
                        <Link
                          href={state.orderData.event.session_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <Video className="w-5 h-5" />
                          Join Meeting
                        </Link>
                      </Button>

                      {/* <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700">
                      💡 <strong>Tip:</strong> Join 5 minutes early to set up
                      your space and get comfortable.
                    </p>
                  </div> */}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      {/* <div className="text-gray-400 mb-2">
            <VideoOff className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-600">Session link will be available soon</p>
          <p className="text-sm text-gray-500 mt-1">
            We'll notify you when the meeting link is ready
          </p> */}
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h5 className="text-xl font-semibold text-gray-800 mb-3">
                  Session Access
                </h5>

                {isExpired() ? (
                  <span className="text-red-500 font-semibold">
                    Session Expired
                  </span>
                ) : state?.orderData?.event?.session_link ? (
                  <div className="space-y-4">
                    <p className="text-gray-600 italic">
                      Click the button below to join your yoga session meeting
                    </p>
                    <Button className="bg-themePurple hover:bg-themePurple/90 text-white px-6 py-3 rounded-lg">
                      <Link
                        href={state.orderData.event.session_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <Video className="w-5 h-5" />
                        Join Meeting
                      </Link>
                    </Button>

                    {/* <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Tip:</strong> Join 5 minutes early to set up your
                    space and get comfortable.
                  </p>
                </div> */}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    {/* <div className="text-gray-400 mb-2">
          <VideoOff className="w-12 h-12 mx-auto" />
        </div>
        <p className="text-gray-600">Session link will be available soon</p>
        <p className="text-sm text-gray-500 mt-1">
          We'll notify you when the meeting link is ready
        </p> */}
                  </div>
                )}
              </div>
            )}
          </div>
          {state.attendanceList?.length > 0 && state.user == "Admin" && (
            <div className="max-w-4xl mx-auto space-y-4 mt-4">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h5 className="text-xl font-semibold text-gray-800 mb-3">
                  Participated List
                </h5>
                {/* User list */}
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                  {state.attendanceList?.map((user) => (
                    <Card key={user?.user_id} className="shadow-md rounded-2xl">
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
        </>
      )}
    </div>

    // <div className="container mx-auto flex items-center">
    //   <div className="w-full">
    //     <div className="flex md:min-h-[70vh] min-h-[60vh] w-full items-center justify-center md:p-6">
    //       <div className="lg:w-[800px] w-full ">
    //         <div className="border rounded-xl p-4 gap-4 flex flex-col ">
    //           <div>
    //             <div className="md:flex justify-between items-center  ">
    //               <div className="md:mb-3">
    //                 {state?.orderData.registration_status && (
    //                   <h4
    //                     className="mt-5 scroll-m-20 text-[20px]
    //                              font-[500] tracking-tight transition-colors first:mt-0"
    //                   >
    //                     Registration Status:{" "}
    //                     {state?.orderData.registration_status}
    //                   </h4>
    //                 )}

    //                 <p className="text-sm">
    //                   Order ID: {state?.orderData?.registration_id}
    //                 </p>
    //               </div>
    //               <div className="mb-3">
    //                 <p className="text-sm">
    //                   Registration Date:{" "}
    //                   {moment(state?.orderData?.registration_date).format(
    //                     "DD-MMM-YYYY"
    //                   )}
    //                 </p>
    //               </div>
    //             </div>

    //             <div className="pt-3">
    //               {state?.orderData?.event && (
    //                 <>
    //                   <p className="pb-1">
    //                     <span className="font-[600] text-gray-700">
    //                       Event Name:
    //                     </span>{" "}
    //                     {state?.orderData?.event?.title}
    //                   </p>
    //                   <p>
    //                     {" "}
    //                     <span className="font-[600] text-gray-700">
    //                       Category Name:
    //                     </span>{" "}
    //                     {state?.orderData?.event?.lounge_type?.name}{" "}
    //                   </p>
    //                   </>
    //               )}
    //             </div>

    //             <blockquote className="mt-6 border-l-2 pl-6   bg-fuchsia-100 py-4  border-l-[5px] border-fuchsia-900 ">
    //               {state.orderData?.event?.lounge_type?.id == 15 ? (
    //                 <div>{state?.eventDate}</div>
    //               ) : (
    //                 <>
    //                   <div className="flex gap-1 mb-4">
    //                     <span className="flex gap-1 ">
    //                       <CalendarClock
    //                         height={16}
    //                         width={18}
    //                         className="relative top-[3px]"
    //                       />{" "}
    //                       Starts -
    //                     </span>
    //                     <span
    //                       className="font-bold"
    //                       style={{ color: "#4a4a4a" }}
    //                     >
    //                       {moment(state?.orderData?.event?.start_date).format(
    //                         "DD MMM YYYY"
    //                       )}
    //                       , {""}
    //                       {moment(
    //                         state?.orderData?.event?.start_time,
    //                         "HH:mm:ss"
    //                       ).format("hh:mm A")}{" "}
    //                       (IST)
    //                     </span>{" "}
    //                   </div>
    //                   <div className="flex gap-x-1">
    //                     <span className="flex gap-1">
    //                       <CalendarClock
    //                         height={16}
    //                         width={18}
    //                         className="relative top-[3px]"
    //                       />
    //                       Ends -{" "}
    //                     </span>
    //                     <span
    //                       className="font-bold "
    //                       style={{ color: "#4a4a4a" }}
    //                     >
    //                       {moment(state?.orderData?.event?.end_date).format(
    //                         "DD MMM YYYY"
    //                       )}
    //                       , {""}
    //                       {moment(
    //                         state?.orderData?.event?.end_time,
    //                         "HH:mm:ss"
    //                       ).format("hh:mm A")}{" "}
    //                       (IST)
    //                     </span>
    //                   </div>
    //                 </>
    //               )}
    //             </blockquote>
    //           </div>

    //           <div>
    //             <h4 className="md:text-[22px] text-[18px]">
    //               {" "}
    //               Session Link: <br />
    //               <p className="mb-3 italic" style={{ fontSize: "16px" }}>
    //                 Click the below button to join the meeting
    //               </p>
    //               {state?.orderData?.event?.session_link ? (
    //                 <Button className="p-2 rounded bg-themePurple hover:bg-themePurple text-white">
    //                   <Link
    //                     href={state.orderData.event?.session_link}
    //                     className="text-fuchsia-900 text-white"
    //                     target="_blank"
    //                     rel="noopener noreferrer"
    //                   >
    //                     Join Meeting
    //                   </Link>
    //                 </Button>
    //               ) : (
    //                 " No session link available"
    //               )}
    //             </h4>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
};

export default ProtectedRoute(viewWellnessLounge);
