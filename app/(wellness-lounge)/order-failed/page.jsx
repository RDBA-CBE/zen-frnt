"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  XCircle,
  Calendar,
  Clock,
  Home,
  User,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatNumber,
  formatTime,
  formatTimeRange,
  useSetState,
} from "@/utils/function.utils";
import { useRouter, useSearchParams } from "next/navigation";
import Models from "@/imports/models.import";
import moment from "moment";
import { Failure } from "@/components/common-components/toast";

export default function BookingFailedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [state, setState] = useSetState({
    orderDetail: {},
    event: {},
    slotTime: "",
    errorMessage: "Payment failed. Please try again.",
    orderId: "",
  });

  useEffect(() => {
    const orderId = searchParams.get("id");
    const error = searchParams.get("error");

    if (error) {
      setState({ errorMessage: decodeURIComponent(error) });
    }

    if (orderId) {
      orderDetail(orderId);
      paymentGatewayList();
      setState({ orderId });
      userDetail();
    }
  }, [searchParams]);

  const orderDetail = async (id) => {
    try {
      const res = await Models.session.detailsRegistration(id);
      console.log("✌️res --->", res);

      const response = formatTimeRange(
        res?.slot?.event_slot?.date,
        res?.slot?.start_time,
        res?.event?.interval
      );
      console.log("✌️response --->", response);
      setState({ orderDetail: res, event: res?.event, slotTime: response });
    } catch (error) {
      console.log("✌️error --->", error);
      setState({
        errorMessage: "Failed to load booking details. Please try again.",
      });
    }
  };

  const userDetail = async (id) => {
    setState({ loading: true }); // Start loading
    try {
      const userId = localStorage.getItem("userId");

      const res = await Models.auth.userDetails(userId);
      console.log("✌️res --->", res);

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
        registrations: [state.orderId],
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
      console.log("✌️error --->", error.error);
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
            router.push(`/order-failed/?id=${state.orderId}`);

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
      router.push(`/order-success/?id=${state.orderId}`);

      // setState({ paymentGatewayList: check?.results });
    } catch (error) {
      console.log("error: ", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Error Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Failed!
          </h1>
          <p className="text-gray-600 mb-4">
            We couldn't process your booking for{" "}
            <strong> {state.event?.title}. </strong> Please try again or contact
            support if the issue persists.
          </p>

          {/* Error Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{state.errorMessage}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Booking Summary Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Booking Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {state.event?.title && (
                  <div className="flex justify-between items-start py-3 ">
                    <div className="flex-1">
                      <p className="font-medium">{state.event?.title}</p>
                      <p className="font-medium">
                        {`(${state.event?.lounge_type?.name})`}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <span>{formatTime(state.event?.interval)} </span>
                        <span>•</span>
                        <span>
                          With {state.event?.moderator?.first_name}{" "}
                          {state.event?.moderator?.last_name}
                        </span>
                      </div>
                    </div>
                    <p className="font-semibold">
                      ₹{formatNumber(state.event?.price || 0)}
                    </p>
                  </div>
                )}
                {state.orderDetail?.coupon != null &&
                  state.orderDetail?.coupon?.discount_value != 0 && (
                    <div className="flex justify-between items-start py-3 border-t  ">
                      <div className="flex-1">
                        <p className="font-medium text-green-500">
                          {`Coupon Code : ${state.orderDetail?.coupon?.code}`}
                        </p>
                      </div>
                      <p className="font-semibold text-green-500">
                        {`- ₹${formatNumber(
                          state.orderDetail?.discount_amount || 0
                        )}`}
                      </p>
                    </div>
                  )}

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount</span>
                    <span>
                      ₹ {formatNumber(state.orderDetail?.amount || 0)}
                    </span>
                  </div>
                  {state.orderDetail?.registration_date && (
                    <p className="text-sm text-gray-600">
                      Attempted on •{" "}
                      {moment(state.orderDetail?.registration_date).format(
                        "MMMM Do, YYYY"
                      )}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session Details Card */}
          {state.slotTime && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Session Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium">Selected Date & Time</p>
                    <p className="text-sm text-gray-600">{state.slotTime}</p>
                  </div>
                </div>
              </CardContent>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Contact Information
                  </h4>
                  <p className="text-sm text-gray-600">
                    {state.event?.moderator?.email}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Help Section */}
        {/* <Card className="mt-6">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-lg mb-4 text-red-600">
              Need Help?
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border border-red-100 rounded-lg bg-red-50">
                <h4 className="font-medium mb-2 text-red-700">
                  Common Issues
                </h4>
                <ul className="text-sm text-red-600 space-y-1">
                  <li>• Insufficient funds in your account</li>
                  <li>• Payment method declined</li>
                  <li>• Network connectivity issues</li>
                  <li>• Browser payment restrictions</li>
                </ul>
              </div>

              <div className="p-4 border border-blue-100 rounded-lg bg-blue-50">
                <h4 className="font-medium mb-2 text-blue-700">
                  Quick Solutions
                </h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Try a different payment method</li>
                  <li>• Check your account balance</li>
                  <li>• Refresh and try again</li>
                  <li>• Contact your bank if needed</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Button
            onClick={() => createPayment()}
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Retry Payment
            </div>
          </Button>
          <Button
            asChild
            className="flex-1 sm:flex-none poiner"
            onClick={() => router.push("/profile")}
          >
            <div className="flex items-center gap-2 cursor-pointer">
              <Calendar className="h-4 w-4" />
              View My Bookings
            </div>
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex-1 sm:flex-none"
            onClick={() =>
              router.push(`/singleCheckout?id=${state.orderDetail?.event?.id}`)
            }
          >
            <div className="flex items-center gap-2 cursor-pointer">
              <Home className="h-4 w-4" />
              Book More Classes
            </div>
          </Button>
          {/* <Button
            asChild
            variant="outline"
            className="flex-1 sm:flex-none"
            onClick={() => handleClick("more")}
          >
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Browse Other Classes
            </div>
          </Button> */}

          {/* <Button
            asChild
            variant="secondary"
            className="flex-1 sm:flex-none"
            onClick={() => handleClick("detail")}
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              View Booking Status
            </div>
          </Button> */}
        </div>

        {/* Support Info */}
        <div className="text-center mt-8 pt-6 border-t">
          <p className="text-sm text-gray-600">
            Still having trouble?{" "}
            <Link
              href="/contact"
              className="text-blue-600 hover:underline font-medium"
            >
              Contact our support team
            </Link>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            We're available 24/7 to help you complete your booking
          </p>
        </div>
      </div>
    </div>
  );
}
