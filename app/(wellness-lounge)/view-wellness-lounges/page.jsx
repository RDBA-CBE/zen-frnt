"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Models from "@/imports/models.import";
import {
  formatNumber,
  formatTimeRange,
  useSetState,
} from "@/utils/function.utils";
import { useRouter, useSearchParams } from "next/navigation";
import moment from "moment";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import {
  Failure,
  InfinitySuccess,
  Success,
} from "@/components/common-components/toast";
import {
  Calendar,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Clock,
  Clock10Icon,
  Clock1Icon,
  ClockAlert,
  ClockIcon,
  CreditCard,
  Loader,
  Loader2Icon,
  LoaderIcon,
  Timer,
  Video,
} from "lucide-react";
import ProtectedRoute from "@/components/common-components/privateRouter";
import { TimeClock } from "@mui/x-date-pickers/TimeClock";
import { AYURVEDIC_LOUNGE } from "@/utils/constant.utils";

const viewWellnessLounge = () => {
  const router = useRouter();
  console.log("✌️router --->", router?.params);
  const searchParams = useSearchParams();
  const [id, setId] = useState(null);
  const [state, setState] = useSetState({
    orderData: null, // Ensure this is null initially
    isOpen: false,
    group: null,
    loading: false,
    btnLoading: false,
    slotList: [],
  });

  useEffect(() => {
    if (id) {
      localStorage?.setItem("eventId", id);
    }
  }, [id]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const idFromSearchParams = searchParams.get("id");
      if (idFromSearchParams) {
        setId(idFromSearchParams);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const Group = localStorage.getItem("group");
    if (Group) {
      setState({ group: Group });
    }
  }, []);

  useEffect(() => {
    if (id) {
      getDetails();
      regDetails();
      paymentGatewayList();
    }
  }, [id]);

  const getDetails = async () => {
    setState({ loading: true }); // Start loading

    try {
      const res = await Models.session.details(id);
      if (res?.event?.lounge_type?.id == AYURVEDIC_LOUNGE) {
        const response = formatTimeRange(
          res?.slot?.event_slot?.date,
          res?.slot?.start_time,
          res?.event?.interval
        );
        console.log("✌️response --->", response);

        setState({ eventDate: `Date : ${response}` });
      }
      setState({ orderData: res, loading: false }); // Set data and stop loading

      const EventId = localStorage?.getItem("eventId");
      if (EventId) {
        localStorage?.removeItem("eventId");
      }
    } catch (error) {
      console.log("Error:", error);

      if (error?.status == 401) {
        router?.push("/login");
      }
      setState({ loading: false });
    }
  };

  const regDetails = async () => {
    setState({ loading: true }); // Start loading

    try {
      const userId = localStorage.getItem("userId");
      const res = await Models.session.registrationUserDetails(userId, id);
      console.log("regDetails --->", res);

      const formattedSlots = res?.results?.map((item) => {
        const formattedDate = formatTimeRange(
          item?.slot?.event_slot?.date,
          item?.slot?.start_time,
          item?.event?.interval
        );
        return {
          ...item,
          formattedDate,
          combinedDateTime: moment(
            `${item.slot.event_slot.date} ${item.slot.start_time}`,
            "YYYY-MM-DD HH:mm:ss"
          ),
        };
      });

      // Sort slots by date (earliest first)
      formattedSlots?.sort((a, b) => a.combinedDateTime - b.combinedDateTime);
      console.log("✌️formattedSlots --->", formattedSlots);
      setState({ slotList: formattedSlots, loading: false });
    } catch (error) {
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

  const closeDialog = () => {
    setState({ isOpen: false });
  };

  const confirmOrder = async () => {
    try {
      setState({ btnLoading: true });
      const userID = localStorage.getItem("userId");
      let body = {
        user: Number(userID),
        event: [id],
      };

      const EventId = localStorage?.getItem("eventId");
      if (EventId) {
        localStorage?.removeItem("eventId");
      }

      const res = await Models.session.createRegistration(body);
      InfinitySuccess(
        `Thank you! Your booking for the session titled ${state?.orderData.title} has been confirmed. We invite you to explore our calendar and take advantage of additional sessions that may interest you.`,
        () => {
          router?.push(`/view-order?id=${res[0]?.id}`);
        }
      );

      // router.push(`/view-order?id=${res[0]?.id}`);
      // Success(
      //   `Thank you! Your booking for the session titled ${state?.orderData.title} has been confirmed. We invite you to explore our calendar and take advantage of additional sessions that may interest you.`
      // );

      setState({ isOpen: false, btnLoading: false });
    } catch (error) {
      console.log("Error:", error);
      if (error[0]) {
        Failure(error[0]);
        setState({ submitLoading: false, isOpen: false, btnLoading: false });
      }
    }
  };

  const bookingSchedule = () => {
    router.push(`/singleCheckout?id=${id}`);
  };

  const getSlotStatus = (slot) => {
    const now = moment();
    const slotDateTime = slot.combinedDateTime;
    const slotEndTime = slotDateTime
      .clone()
      .add(slot.event.interval, "minutes");

    if (now.isBefore(slotDateTime)) {
      return "upcoming";
    } else if (now.isBetween(slotDateTime, slotEndTime)) {
      return "ongoing";
    } else {
      return "expired";
    }
  };

  const getLastPaymentStatus = (payments) => {
    if (!payments || payments.length === 0) return null;
    const lastPayment = payments[payments.length - 1];
    return lastPayment.status;
  };

  const renderActionButton = (slot) => {
    console.log("✌️slot --->", slot);
    const slotStatus = getSlotStatus(slot);
    const paymentStatus = getLastPaymentStatus(slot.payments);
    const now = moment();
    const slotDateTime = slot.combinedDateTime;

    if (paymentStatus === "completed") {
      // if (
      //   slotStatus === "ongoing" ||
      //   (now.isAfter(slotDateTime) &&
      //     now.isBefore(slotDateTime.clone().add(2, "hours")))
      // ) {
      return (
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Link
            prefetch={true}
            href={state?.orderData.session_link}
            className=" flex items-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Video className="w-4 h-4 mr-2" />
            Join Meeting
          </Link>
        </Button>
      );
      // }
    }

    if (paymentStatus === "pending") {
      return (
        <Button
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={() => createPayment(slot)}
        >
          Retry Payment
        </Button>
      );
    }

    // if (slotStatus === "expired") {
    //   return (
    //     <Button disabled className="bg-gray-400 text-white">
    //       Session Expired
    //     </Button>
    //   );
    // }

    return null;
  };

  const createPayment = async (slot) => {
    try {
      const body = {
        registrations: [slot?.id],
        payment_gateway: state.paymentGatewayList[0]?.id,
        currency: "INR",
        // coupon: 0,
      };
      // if (!objIsEmpty(state.couponData)) {
      //   body.coupon = state.couponData?.id;
      // }

      const res = await Models.payment.create(body);
      // if (res?.length > 0) {
      //   const response = res[0];
      handlePayment(res);
      // }
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
            // router.push(`/order-failed/?id=${state.orderId}`);

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
      await regDetails();
      // setState({ paymentGatewayList: check?.results });
    } catch (error) {
      console.log("error: ", error);
    }
  };

  return (
    <div className="container mx-auto">
      {state?.loading ? (
        <div className="w-full h-[80vh] flex justify-center items-center">
          <LoaderIcon className="w-[30px] h-[30px]" />
        </div>
      ) : (
        state?.orderData && (
          <>
            <div className="grid auto-rows-min gap-4 lg:grid-cols-2">
              <div className="border rounded-xl p-4 gap-4 flex flex-col">
                {state?.orderData?.thumbnail ? (
                  <img
                    src={state?.orderData?.thumbnail}
                    alt="thumbnail"
                    className="w-100"
                    style={{ height: "500px", objectFit: "cover" }}
                  />
                ) : (
                  <p
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    No image uploaded
                  </p>
                )}
              </div>
              <div className="border rounded-xl p-4 flex flex-col">
                <div className="flex flex-col mb-4">
                  <h2 className="mt-10 scroll-m-20 text-2xl font-[500] tracking-tight transition-colors first:mt-0 font-marce">
                    {state?.orderData.title}{" "}
                  </h2>
                  <p className="" style={{ paddingTop: "7px" }}>
                    {state?.orderData?.lounge_type?.name}
                  </p>
                </div>
                {state.slotList?.length > 0 ? (
                  state.slotList?.map((item, index) => {
                    const isOpen = state.openAccordion === item.id;
                    const slotStatus = getSlotStatus(item);
                    const paymentStatus = getLastPaymentStatus(item.payments);

                    return (
                      <div
                        key={item.id}
                        className="mb-4 border rounded-lg overflow-hidden"
                      >
                        {/* Accordion Header */}
                        <div
                          className="p-4 bg-fuchsia-50 flex justify-between items-center cursor-pointer hover:bg-fuchsia-100 transition-colors"
                          onClick={() =>
                            setState({
                              openAccordion:
                                item.id == state.openAccordion ? null : item.id,
                            })
                          }
                        >
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-fuchsia-700" />
                            <div>
                              <p className="font-semibold text-fuchsia-900">
                                Session {index + 1} - {item.formattedDate}
                              </p>
                              <p className="text-sm text-fuchsia-700">
                                Registration ID: {item.registration_id}{" "}
                                {` ${
                                  item?.is_admin_registration
                                    ? "(Admin Order)"
                                    : ""
                                }`}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {slotStatus === "upcoming" && (
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                Upcoming
                              </span>
                            )}
                            {slotStatus === "ongoing" && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                Ongoing
                              </span>
                            )}
                            {slotStatus === "expired" && (
                              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                Expired
                              </span>
                            )}

                            {paymentStatus === "completed" && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                Paid
                              </span>
                            )}
                            {paymentStatus === "pending" && (
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                Pending
                              </span>
                            )}
                            {paymentStatus === "failed" && (
                              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                Failed
                              </span>
                            )}

                            {/* Chevron Icon */}
                            {isOpen ? (
                              <ChevronUp className="w-5 h-5 text-fuchsia-700" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-fuchsia-700" />
                            )}
                          </div>
                        </div>

                        {/* Accordion Content */}
                        {isOpen && (
                          <div className="bg-white p-4 border-t">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Session Details */}
                              <div>
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                  <CalendarClock className="w-4 h-4" />
                                  Session Details
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Date:</span>
                                    <span className="font-medium">
                                      {moment(item.slot.event_slot.date).format(
                                        "DD MMM YYYY"
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Time:</span>
                                    <span className="font-medium">
                                      {moment(
                                        item.slot.start_time,
                                        "HH:mm:ss"
                                      ).format("hh:mm A")}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Duration:
                                    </span>
                                    <span className="font-medium">
                                      {item.event.interval} minutes
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Status:
                                    </span>
                                    <span className="font-medium">
                                      {slotStatus === "upcoming" && "Upcoming"}
                                      {slotStatus === "ongoing" && "Ongoing"}
                                      {slotStatus === "expired" && "Expired"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Payment Details */}
                              <div>
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                  <CreditCard className="w-4 h-4" />
                                  Payment Details
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Amount:
                                    </span>
                                    <span className="font-medium">
                                      ₹{formatNumber(state.orderData?.price)}
                                    </span>
                                  </div>
                                  {formatNumber(item?.discount_amount) > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Discount:
                                      </span>
                                      <span className="font-medium text-green-500">
                                        ₹{formatNumber(item?.discount_amount)}
                                      </span>
                                    </div>
                                  )}

                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Final Amount:
                                    </span>
                                    <span className="font-bold">
                                      ₹{formatNumber(item.amount)}
                                    </span>
                                  </div>
                                  {paymentStatus && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Payment Status:
                                      </span>
                                      <span className="font-medium">
                                        {paymentStatus === "completed" &&
                                          "Completed"}
                                        {paymentStatus === "pending" &&
                                          "Pending"}
                                        {paymentStatus === "failed" && "Failed"}
                                      </span>
                                    </div>
                                  )}
                                  {paymentStatus === "completed" &&
                                    item.payments?.[0]?.payment_date && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Paid on:
                                        </span>
                                        <span className="font-medium">
                                          {moment(
                                            item.payments[0].payment_date
                                          ).format("DD MMM YYYY hh:mm A")}
                                        </span>
                                      </div>
                                    )}
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 pt-4 border-t">
                              {renderActionButton(item)}
                            </div>

                            {/* {(slotStatus === "ongoing" ||
                            slotStatus === "upcoming") &&
                            paymentStatus === "completed" && (
                              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-700">
                                  <strong>Note:</strong> The meeting link will
                                  be available 15 minutes before the session
                                  starts.
                                </p>
                              </div>
                            )} */}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <blockquote className="mt-4 border-l-[5px] border-fuchsia-900 pl-6  bg-fuchsia-100 py-4 mb-4">
                    <div className="flex gap-1 mb-4">
                      <span className="flex gap-1 ">
                        <CalendarClock
                          height={16}
                          width={18}
                          className="relative top-[3px]"
                        />{" "}
                        Starts -
                      </span>
                      <span className="font-bold" style={{ color: "#4a4a4a" }}>
                        {moment(state?.orderData?.start_date).format(
                          "DD MMM YYYY"
                        )}
                        , {""}
                        {moment(
                          state?.orderData?.start_time,
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
                      <span className="font-bold " style={{ color: "#4a4a4a" }}>
                        {moment(state?.orderData?.end_date).format(
                          "DD MMM YYYY"
                        )}
                        , {""}{" "}
                        {moment(state?.orderData?.end_time, "HH:mm:ss").format(
                          "hh:mm A"
                        )}{" "}
                        (IST)
                      </span>
                    </div>
                  </blockquote>
                )}
                {state?.group == "Admin" ? (
                  <div className="flex justify-end">
                    <Button
                      className="bg-themePurple hover:bg-themePurple"
                      onClick={() => router.back()}
                    >
                      Back
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <Button
                      className="bg-themePurple hover:bg-themePurple"
                      onClick={() => bookingSchedule()}
                    >
                      Book new appointment
                    </Button>
                  </div>
                )}
                {/* <div className="mt-3">
                  {state?.group == "Admin" ? (
                    <Button
                      className="bg-themePurple hover:bg-themePurple"
                      onClick={() => router.push("/wellness-lounge-list")}
                    >
                      Back
                    </Button>
                  ) : !state?.orderData?.is_registered ? (
                    state?.orderData?.lounge_type?.id == 15 ? (
                      <Button
                        className="bg-themePurple hover:bg-themePurple"
                        onClick={() => bookingSchedule()}
                      >
                        Book an appointment
                      </Button>
                    ) : (
                      <Button
                        className="bg-themePurple hover:bg-themePurple"
                        onClick={() => setState({ isOpen: true })}
                      >
                        Enroll
                      </Button>
                    )
                  ) : (
                    <div className="flex gap-3">
                      <Button
                        style={{ cursor: "not-allowed" }}
                        className="bg-themeGreen hover:bg-themeGreen"
                      >
                        <span style={{ color: "white", fontSize: "22px" }}>
                          ✓
                        </span>{" "}
                        Already Enrolled
                      </Button>
                      <Button
                        className="bg-themePurple hover:bg-themePurple"
                        onClick={() => bookingSchedule()}
                      >
                        Book new appointment
                      </Button>
                    </div>
                  )}
                </div> */}
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
};

export default ProtectedRoute(viewWellnessLounge);
