"use client";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Users,
  ShoppingCart,
  XCircle,
  CreditCard,
  FileText,
  Ticket,
  Layers,
  Package,
  Calendar,
  TrendingUp,
  DollarSign,
} from "lucide-react";

import { useRouter } from "next/navigation";
import Models from "@/imports/models.import";
import { useSetState } from "@/utils/function.utils";
import ProtectedRoute from "@/components/common-components/privateRouter";
import DashboardCalender from "@/components/ui/dashboardCalender";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface CountResponse {
  count?: number;
}

const Dashboard = () => {
  const router = useRouter();
  const [state, setState] = useSetState({
    counts: {},
    reportData: {},
    event: [],
  });

  useEffect(() => {
    getCount();
    getReportData();
  }, []);

  const getCount = async () => {
    try {
      const [
        session,
        category,
        registerUser,
        cancelOrder,
        payment,
        coupon,
        user,
      ] = await Promise.all<CountResponse>([
        Models.session.list(1, {}),
        Models.category.list(),
        Models.session.registrationList(1, {}),
        Models.session.cancelRegistrationList(1, {}),
        Models.payment_gateway.list(),
        Models.coupon.list(),
        Models.user.userList(1, {}),
      ]);

      const counts = {
        session: session?.count || 0,
        category: category?.count || 0,
        registerUser: registerUser?.count || 0,
        cancelOrder: cancelOrder?.count || 0,
        payment: payment?.count || 0,
        coupon: coupon?.count || 0,
        user: user?.count || 0,
        booking: registerUser?.count || 0, // assuming bookings = registrations
      };
      console.log("Counts: ", counts);
      setState({ counts: counts });
    } catch (error) {
      console.log("error: ", error);
      return {};
    }
  };

  const getReportData = async () => {
    try {
      setState({ loading: true });
      const reports = [
        { id: "9.1", name: "revenueByEachBookings" },
        { id: "9.2", name: "revenueByEachCategory" },
        { id: "9.3", name: "revenueByEachMentor" },
        { id: "9.4", name: "revenueByEachCustomer" },
      ];

      if (!reports || !Array.isArray(reports)) {
        console.error("Reports is not defined or not an array");
        setState({
          loading: false,
          error: "Reports configuration is invalid",
        });
        return;
      }

      const responses = await Promise.all(
        reports.map((report) => Models.session.reports(report.id))
      );

      const reportData = {};
      let index = 0;
      for (const report of reports) {
        reportData[report.name] = responses[index];
        index++;
      }

      setState({
        loading: false,
        reportData: reportData,
        error: null,
      });
    } catch (error) {
      console.log("error: ", error);
      setState({
        loading: false,
        error: error.message || "Failed to fetch reports",
      });
    }
  };

  const handleClick = (type) => {
    const routes = {
      session: "/wellness-lounge-list",
      category: "/categories-list",
      booking: "/booking_list",
      registerUser: "/order-list",
      cancelUser: "/cancel-order",
      user: "/user-list",
      payment: "/payment-gateway-list",
      report: "/reports",
      coupon: "/coupon-list",
    };

    router.push(routes[type] || "/"); // fallback to home if type not found
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "₹0.00";
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="">
      {/* <div className="shadow border border-1 p-4 mb-4 ">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Ayurvedic Lounge Session
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  gap-6 ">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(
                    state.reportData?.revenueByEachBookings?.total_revenue
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Reservations
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {state.reportData?.revenueByEachBookings
                    ?.total_reservations || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Discount
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(
                    state.reportData?.revenueByEachBookings?.total_discount
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg. Revenue/Booking
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(
                    (state.reportData?.revenueByEachBookings?.total_revenue ||
                      0) /
                      (state.reportData?.revenueByEachBookings
                        ?.total_reservations || 1)
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div> */}

        <div className=" p-4">
          <DashboardCalender events={state.event} setEvents={() => {}} />
        </div>
    </div>
  );
};

export default ProtectedRoute(Dashboard);
