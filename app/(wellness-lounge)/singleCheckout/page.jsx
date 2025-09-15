"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PrimaryButton from "@/components/common-components/primaryButton";
import { Progress } from "@/components/ui/progress";
import razorPay from "../../../public/assets/images/razorpay.png";
import {
  ChevronDown,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUp,
  X,
} from "lucide-react";
import {
  formatDate,
  formatNumber,
  generateCalendar,
  objIsEmpty,
  timeFormat,
  useSetState,
} from "@/utils/function.utils";
import { TextInput } from "@/components/common-components/textInput";
import { BASEURL, dayNames, monthNames } from "@/utils/constant.utils";
import ProtectedRoute from "@/components/common-components/privateRouter";
import Models from "@/imports/models.import";
import moment from "moment";
import AppoinmentSummary from "@/components/ui/appoinmentSummary";
import { Failure } from "@/components/common-components/toast";
import { CheckboxDemo } from "@/components/common-components/checkbox";
import Checkboxs from "@/components/ui/singleCheckbox";
import Image from "next/image";

const SingleAppointmentBooking = () => {
  const router = useRouter();

  const searchParams = useSearchParams();

  const totalSteps = 2;

  const [state, setState] = useSetState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    errors: {},
    couponCode: "",
    currentStep: 1,
    haveCoupon: false,
    openAccordion: null,
    selectedDate: null,
    selectedTime: null,
    currentMonth: new Date(),
    lines: [],
    isOpenAccordion: false,
    timeSlot: "",
    currentMonth: new Date(),
    orderData: null,
    selectedLine: [],
    total: 0,
    couponAmount: 0,
    subTotal: 0,
    selectedRecord: {},
    slotList: [],
    couponData: {},
    paymentGatewayList: [],
    userDetail: {},
    couponLoading: false,
    submitLoading: false,
    paymentMethod: [],
  });

  useEffect(() => {
    const dateParam = searchParams.get("id");

    if (dateParam) {
      getDetails(dateParam);
      paymentGatewayList();
      userDetail();
    }
  }, [searchParams]);

  // useEffect(() => {
  //   if (!objIsEmpty(state.selectedRecord)) {
  //     getEventSlot();
  //   }
  // }, [state.selectedRecord]);

  const getDetails = async (id) => {
    setState({ loading: true }); // Start loading

    try {
      const res = await Models.session.details(id);
      slotList(id);

      setState({ orderData: res, loading: false }); // Set data and stop loading
    } catch (error) {
      console.log("Error:", error);

      setState({ loading: false });
    }
  };

  const slotList = async (id) => {
    try {
      const res = await Models.session.details(id);

      let total = 0;
      total += parseInt(res.price.replace("₹", "").replace(",", ""));

      const startDate = new Date(res?.start_date);

      const endDate = new Date(res?.end_date);
      setState({ startDate, endDate, total: total, selectedRecord: res });
    } catch (error) {
      if (error?.length > 0) {
        Failure(error[0]);
      }
      console.log("✌️error --->", error);
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

  const calendarDays = generateCalendar(state.currentMonth);

  const navigateMonth = (direction) => {
    setState({
      currentMonth: new Date(
        state.currentMonth.getFullYear(),
        state.currentMonth.getMonth() + direction,
        1
      ),
    });
  };

  const handleDateSelect = async (date) => {
    try {
      const res = await Models.slot.list(state.selectedRecord?.id);
      if (res?.results?.length > 0) {
        const filter = res?.results.find(
          (d) => d.date === moment(date).format("YYYY-MM-DD")
        )?.slots;

        setState({ slotList: filter });
      }

      if (date) {
        setState({ selectedDate: date, timeSlot: "" });
      }
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const handleTimeSelect = (time) => {
    setState({ timeSlot: time });
  };

  const handleNextStep = () => {
    if (state.currentStep < totalSteps) {
      if (state.currentStep == 1) {
        // setState({ selectedDate: new Date() });
      }
      setState({ currentStep: state.currentStep + 1 });
    }
  };

  const handlePreviousStep = () => {
    if (state.currentStep > 1) {
      setState({ currentStep: state.currentStep - 1 });
    }
  };

  const progressValue = (state.currentStep / totalSteps) * 100;

  // API

  const applyCoupon = async () => {
    try {
      setState({ couponLoading: true });
      if (state.couponCode == "") {
        setState({
          errors: { couponCode: "Please enter coupon code" },
          couponAmount: 0,
          couponLoading: false,
        });
      } else {
        const res = await Models.coupon.filter(state.couponCode);
        console.log("✌️res --->", res);
        if (res?.results?.length > 0) {
          const now = new Date();
          const validToDate = new Date(res?.results[0]?.valid_to);
          if (validToDate >= now) {
            let total = 0;
            let couponAmount = 0;
            if (res?.results[0]?.discount_value > 0) {
              if (res?.results[0]?.discount_type == "percentage") {
                const discountAmount =
                  parseInt(state.selectedRecord?.price) *
                  (parseInt(res?.results[0]?.discount_value) / 100);
                console.log("✌️discountAmount --->", discountAmount);

                couponAmount = discountAmount;

                if (
                  parseInt(state.selectedRecord?.price) >=
                  parseInt(discountAmount)
                ) {
                  total =
                    parseInt(state.selectedRecord?.price) -
                    parseInt(discountAmount);
                } else {
                  total = 0;
                }
              } else {
                couponAmount = parseInt(res?.results[0]?.discount_value);
                if (
                  parseInt(state.selectedRecord?.price) >=
                  parseInt(res?.results[0]?.discount_value)
                ) {
                  total =
                    parseInt(state.selectedRecord?.price) -
                    parseInt(res?.results[0]?.discount_value);
                } else {
                  total = 0;
                }
              }
            }
            setState({
              couponAmount: couponAmount,
              haveCoupon: false,
              couponCode: "",
              total,
              couponData: res?.results[0],
              couponLoading: false,
            });
          } else {
            setState({
              errors: { couponCode: "Coupon Code is expired!" },
              total: parseInt(state.selectedRecord?.price),
              couponLoading: false,
            });
          }
        } else {
          setState({
            errors: { couponCode: "Invalid Coupon Code" },
            // couponAmount: 0,
            total: parseInt(state.selectedRecord?.price),
            couponLoading: false,
          });
        }
      }
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const handleSubmit = async () => {
    try {
      setState({ submitLoading: true });
      if (state.total != 0) {
        if (!state.razorpay) {
          Failure("Select Payment Method");
          setState({ submitLoading: false });

          return;
        }
      }
      const userId = localStorage.getItem("userId");
      const body = {
        // coupon: state.couponData?.id,
        event: [state.selectedRecord?.id],
        registration_status: "Draft",
        // registration_date: "2025-08-29T09:00:53.301Z",
        user: userId,
        slot: state.timeSlot?.id,
      };
      if (!objIsEmpty(state.couponData)) {
        body.coupon = state.couponData?.id;
      }

      const res = await Models.session.createRegistration(body);
      if (res?.length > 0) {
        const response = res[0];
        createPayment(response);
      }
      setState({ submitLoading: false });
    } catch (error) {
      setState({ submitLoading: false });

      console.log("✌️error --->", error);
    }
  };

  const createPayment = async (orderData) => {
    console.log("✌️orderData --->", orderData);
    try {
      let body = {};
      if (formatNumber(orderData?.amount) == 0) {
        body = {
          registrations: [orderData?.id],
          // payment_gateway: state.paymentGatewayList[0]?.id,
          currency: "INR",
          // coupon: 0,
        };
      } else {
        body = {
          registrations: [orderData?.id],
          payment_gateway: state.paymentGatewayList[0]?.id,
          currency: "INR",
        };
      }

      const res = await Models.payment.create(body);
      if (formatNumber(orderData?.amount) == 0) {
        router.push(`/order-success/?id=${orderData.id}`);
      } else {
        handlePayment(res, orderData);
      }
      // }
    } catch (error) {
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

  const handlePayment = async (paymentData, orderData) => {
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
            router.push(`/order-failed/?id=${orderData.id}`);

            console.log("Payment modal dismissed");
          },
        },
        handler: async function (response) {
          verifyPayment(response, paymentData, orderData);
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
      router.push(`/order-failed/?id=${orderData.id}`);
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
      router.push(`/order-success/?id=${orderData.id}`);

      // setState({ paymentGatewayList: check?.results });
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const removeCoupon = () => {
    setState({
      couponAmount: 0,
      total: parseInt(state.selectedRecord?.price),
      couponData: {},
    });
  };

  return (
    <div className="container mx-auto max-w-6xl p-4 border border-1 rounded-md">
      <h1 className="text-2xl font-bold mb-3">Book an appointment</h1>
      <p className="text-gray-600 mb-1  font-bold">
        Session : {state.orderData?.title}
      </p>
      <p className="text-gray-600 mb-6">
        Category : {state.orderData?.lounge_type?.name}
      </p>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">
          Step {state.currentStep}/{totalSteps}
        </h2>
        <Progress value={progressValue} className="h-2" />
      </div>

      {/* {state.currentStep === 1 && (
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="w-full">
            <div className="">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <div
                    className="p-4 bg-white cursor-pointer flex justify-between items-center"
                    onClick={() => toggleAccordion(dept.id)}
                  >
                    <div>
                      <h3 className="text-lg font-medium">
                        {state.orderData?.lounge_type?.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {state.orderData?.lounge_type?.description}
                      </p>
                    </div>
                    <div>
                      {state.isOpenAccordion === dept.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {state.isOpenAccordion === dept.id && (
                    <div className="border-t p-4 bg-gray-50">
                      <div className="space-y-3">
                        {state.lines?.map((item) => (
                          <div
                            key={item.id}
                            className={`flex justify-between items-center p-3 rounded-lg cursor-pointer ${
                              state.selectedLine.includes(item.id)
                                ? "bg-blue-50 border border-blue-200"
                                : "bg-white border border-gray-200"
                            }`}
                            onClick={() => {
                              toggleSpecialtySelection(item);
                            }}
                          >
                            <div className="flex items-center">
                              <div
                                className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${
                                  state.selectedLine.includes(item.id)
                                    ? "bg-blue-600 border-blue-600"
                                    : "border-gray-400"
                                }`}
                              >
                                {state.selectedLine.includes(item.id) && (
                                  <svg
                                    className="w-3 h-3 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="3"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </div>
                              <span>{item.title}</span>
                            </div>
                            <span className="font-semibold text-green-600">
                              {formatNumber(item.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-8 gap-4">
              <PrimaryButton
                name={
                  state.currentStep === totalSteps
                    ? "Confirm Appointment"
                    : "Next step"
                }
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleStep1Next}
                disabled={
                  state.currentStep === 1 && state.selectedLine.length === 0
                }
              />
            </div>
          </div>
        </div>
      )} */}

      {state.currentStep === 1 && (
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="md:w-1/2">
            <div className="bg-white border rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <h3 className="text-lg font-semibold">
                  {monthNames[state.currentMonth.getMonth()]}{" "}
                  {state.currentMonth.getFullYear()}
                </h3>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-2">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-gray-500 py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                  if (!day) return <div key={index}></div>;

                  // Normalize day and startDate to midnight
                  const normalize = (d) => {
                    const nd = new Date(d);
                    nd.setHours(0, 0, 0, 0);
                    return nd.getTime();
                  };

                  const start = normalize(state.startDate);
                  const end = normalize(state.endDate);
                  const current = normalize(day);
                  const today = normalize(new Date());

                  // Disable if before today OR before startDate OR after endDate
                  const isDisabled =
                    current < today || current < start || current > end;

                  const isSelected =
                    state.selectedDate &&
                    normalize(state.selectedDate) === current;

                  return (
                    <div
                      key={index}
                      className={`h-10 flex items-center justify-center rounded-full text-sm
        ${
          isDisabled
            ? "text-gray-400 cursor-not-allowed"
            : isSelected
            ? "bg-blue-600 text-white cursor-pointer"
            : "hover:bg-gray-100 cursor-pointer border border-1 rounded-full border-green-500"
        }
        ${day.getDay() === 0 && !isDisabled ? "text-green-500" : ""}
      `}
                      onClick={() => !isDisabled && handleDateSelect(day)}
                    >
                      {day.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right side - Time selection */}
          <div className="md:w-1/2">
            <div className="bg-white border rounded-lg p-4">
              {state.selectedDate ? (
                <>
                  <div className="mb-4 p-2 bg-blue-50 rounded-lg">
                    <p className="font-medium">
                      {formatDate(state.selectedDate)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {state.slotList?.length > 0 ? (
                      state.slotList.map((time, index) => {
                        const isBooked = time.booked;

                        return (
                          <button
                            key={index}
                            className={`p-2 border rounded-lg text-center
          ${
            state.timeSlot === time
              ? "bg-blue-600 text-white border-blue-600"
              : isBooked
              ? "bg-gray-400 text-white border-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
          }
        `}
                            onClick={() => !isBooked && handleTimeSelect(time)}
                            disabled={isBooked} // disables the button if booked
                          >
                            {timeFormat(time?.start_time)}
                          </button>
                        );
                      })
                    ) : (
                      <div>No slots available</div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <p>Please select a date first</p>
                </div>
              )}
            </div>
          </div>
          <div className="md:w-1/3">
            <AppoinmentSummary
              lines={state.lines}
              couponAmount={state.couponAmount}
              selectedRecord={state.selectedRecord}
              total={state.total}
              removeCoupon={() => removeCoupon()}
              selectedDate={state.selectedDate}
              seletedSlot={state.timeSlot}
            />
            <div className="flex justify-end mt-8">
              {/* <PrimaryButton
                variant="outline"
                className="border-gray-300 hover:border-gray-400 text-gray-700"
                name="Back"
                onClick={handlePreviousStep}
              /> */}

              <PrimaryButton
                name={
                  state.currentStep === totalSteps
                    ? "Confirm Appointment"
                    : "Next step"
                }
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleNextStep}
                disabled={state.selectedDate == null || state.timeSlot == ""}
              />
            </div>
          </div>
        </div>
      )}

      {state.currentStep === 2 && (
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="md:w-2/3">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <TextInput
                    value={state.userDetail?.first_name || ""}
                    placeholder="First name"
                    title="First name"
                    type="text"
                    disabled
                  />
                  <TextInput
                    value={state.userDetail?.email || ""}
                    placeholder="Email"
                    title="Email"
                    type="email"
                    disabled
                  />

                  <TextInput
                    value={state.userDetail?.address || ""}
                    placeholder="Address"
                    title="Address"
                    disabled
                  />
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <TextInput
                    value={state.userDetail?.last_name || ""}
                    placeholder="Last name"
                    title="Last name"
                    disabled
                  />

                  <TextInput
                    value={state.userDetail?.phone_number || ""}
                    disabled
                    placeholder="Mobile phone"
                    title="Mobile phone"
                    type="tel"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="md:w-1/3">
            <>
              <div className="flex gap-1">
                <div className="font-medium text-sm mb-4">Have a coupon?</div>

                <div
                  className="font-medium text-sm mb-4 text-blue-600 underline cursor-pointer hover:text-blue-800"
                  onClick={() => setState({ haveCoupon: !state.haveCoupon })}
                >
                  Click here to enter your code
                </div>
              </div>

              {state.haveCoupon && (
                <div className="border p-4 bg-white-50 mb-5">
                  <div className="space-y-3">
                    <div
                      className="flex justify-end pointer"
                      onClick={() => setState({ haveCoupon: false })}
                    >
                      <X
                        className="h-5 w-5"
                        onClick={() => setState({ haveCoupon: false })}
                      />
                    </div>
                    <TextInput
                      value={state.couponCode}
                      onChange={(e) => {
                        setState({
                          couponCode: e.target.value,
                          errors: { ...state.errors, couponCode: "" },
                        });
                      }}
                      placeholder="Coupon Code"
                      title="Coupon Code"
                      error={state.errors?.couponCode}
                      required
                    />
                    <PrimaryButton
                      name={"Apply"}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={applyCoupon}
                      disabled={state.couponCode == ""}
                      loading={state.couponLoading}
                    />
                  </div>
                </div>
              )}
            </>

            <AppoinmentSummary
              lines={state.lines}
              couponAmount={state.couponAmount}
              selectedRecord={state.selectedRecord}
              total={state.total}
              removeCoupon={() => removeCoupon()}
              selectedDate={state.selectedDate}
              seletedSlot={state.timeSlot}
            />
            {state.total != 0 && (
              <div className="pt-4 flex item-center">
                <Checkboxs
                  checked={state.razorpay}
                  onChange={(val) => {
                    setState({ razorpay: val });
                  }}
                />
                <Image
                  src={razorPay}
                  alt="RazorPay logo"
                  width={100}
                  height={100}
                  className="cursor-pointer"
                  onClick={() => setState({ razorpay: !state.razorpay })}
                />
              </div>
            )}

            <div className="flex justify-between mt-8">
              <PrimaryButton
                variant="outline"
                className="border-gray-300 hover:border-gray-400 text-gray-700"
                name="Back"
                onClick={handlePreviousStep}
                disabled={state.currentStep === 1}
              />

              <PrimaryButton
                name={state.currentStep === totalSteps ? "Submit" : "Next step"}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSubmit}
                disabled={state.currentStep === 1 && state.lines.length === 0}
                loading={state.submitLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProtectedRoute(SingleAppointmentBooking);
