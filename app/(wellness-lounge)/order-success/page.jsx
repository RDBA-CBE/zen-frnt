"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { CheckCircle, Calendar, Clock, Home, User, MapPin } from "lucide-react";
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

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams();

  const router = useRouter();

  const [state, setState] = useSetState({
    orderDetail: {},
    event: {},
    slotTime: "",
  });

  useEffect(() => {
    const dateParam = searchParams.get("id");

    orderDetail(dateParam);
  }, [searchParams]);

  const orderDetail = async (dateParam) => {
    try {
      const res = await Models.session.detailsRegistration(dateParam);
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
    }
  };

  const handleClick = (type) => {
    if (type == "detail") {
      router.push(`/profile`);
    } else {
      router.push("/calendar");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600 mb-4">
            Your<strong> {state.event?.title} </strong>classes have been
            successfully booked. We're excited to see you on the mat!
          </p>
          {/* <Badge variant="secondary" className="text-sm">
            Booking #: {bookingDetails.bookingId}
          </Badge> */}
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
                <div className="flex justify-between items-start py-3 ">
                  <div className="flex-1">
                    <p className="font-bold">{state.event?.title}</p>
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
                {state.orderDetail?.coupon != null &&
                  state.orderDetail?.coupon?.discount_value != 0 && (
                    <div className="flex justify-between items-start py-3 border-t  ">
                      <div className="flex-1">
                        <p className="font-medium text-green-500">
                          {`Coupon Code : ${ state.orderDetail?.coupon?.code}`}
                        </p>
                      </div>
                      <p className="font-semibold text-green-500">
                        {`- ₹${formatNumber(state.orderDetail?.discount_amount|| 0)}`}
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
                  <p className="text-sm text-gray-600">
                    {state.orderDetail?.payments?.length > 0 &&
                      state.orderDetail?.payments[0]?.payment_gateway != null &&
                      `Paid via RazorPay • `}
                    {moment(state.orderDetail?.registration_date).format(
                      "MMMM Do, YYYY"
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session Details Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Session Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Session Date & Time</p>
                  <p className="text-sm text-gray-600">{state.slotTime}</p>
                </div>
              </div>

              {/* <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Studio Location
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium">
                    {bookingDetails.studioAddress.name}
                  </p>
                  <p>{bookingDetails.studioAddress.street}</p>
                  <p>
                    {bookingDetails.studioAddress.city},{" "}
                    {bookingDetails.studioAddress.state}{" "}
                    {bookingDetails.studioAddress.zip}
                  </p>
                  <p>{bookingDetails.studioAddress.country}</p>
                </div>
              </div> */}

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
        </div>

        {/* Preparation Tips */}
        {/* <Card className="mt-6">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-lg mb-4">Preparation Tips</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2 text-green-600">
                  For Yoga Class
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Wear comfortable, stretchy clothing</li>
                  <li>• Bring your yoga mat and water bottle</li>
                  <li>• Avoid heavy meals 2 hours before class</li>
                  <li>• Arrive 10 minutes early to settle in</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2 text-blue-600">
                  For Meditation
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Wear loose, comfortable clothing</li>
                  <li>• You may want to bring a cushion</li>
                  <li>• Avoid caffeine before the session</li>
                  <li>• Come with an open mind and relaxed attitude</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Button
            asChild
            variant="outline"
            className="flex-1 sm:flex-none"
            onClick={() => handleClick("more")}
          >
            <div className="flex items-center gap-2 cursor-pointer">
              <Home className="h-4 w-4" />
              Book More Classes
            </div>
          </Button>

          <Button
            asChild
            className="flex-1 sm:flex-none poiner"
            onClick={() => handleClick("detail")}
          >
            <div className="flex items-center gap-2 cursor-pointer">
              <Calendar className="h-4 w-4" />
              View My Bookings
            </div>
          </Button>
        </div>

        {/* Support Info */}
        {/* <div className="text-center mt-8 pt-6 border-t">
          <p className="text-sm text-gray-600">
            Running late or need to reschedule?{" "}
            <Link href="/contact" className="text-blue-600 hover:underline">
              Contact us 24 hours in advance
            </Link>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            A confirmation email with detailed instructions has been sent to{" "}
            {bookingDetails.email}
          </p>
        </div> */}
      </div>
    </div>
  );
}
