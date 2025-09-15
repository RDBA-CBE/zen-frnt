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
    event:[]
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

      console.log("reportData: ", reportData);

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
    <div className="mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
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
                {state.reportData?.revenueByEachBookings?.total_reservations ||
                  0}
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

      <div className="grid grid-cols-4 ">
        <div className="gap-2 flex flex-col col-span-1 overflow-y-auto h-[900px] relative custom-scroll">
          <div>
            {/* Lounge Sessions → Bar Chart */}
            <div
              className="bg-white rounded-xl shadow-md p-6 cursor-pointer"
              onClick={() => handleClick("session")}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  Lounge Sessions
                </h2>
                <Layers className="h-5 w-5 text-gray-500" />
              </div>
              <p className="text-2xl font-bold">{state.counts?.session ?? 0}</p>
              <ReactApexChart
                options={{
                  chart: { type: "bar", sparkline: { enabled: true } },
                  colors: ["#3b82f6"],
                }}
                series={[
                  { data: [5, 10, 8, 12, 20, 25, state.counts?.session ?? 0] },
                ]}
                type="bar"
                height={100}
              />
            </div>
          </div>
          {/* Categories → Donut */}
          <div className="">
            <div
              className="bg-white rounded-xl shadow-md p-6 cursor-pointer"
              onClick={() => handleClick("category")}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  Categories
                </h2>
                <Package className="h-5 w-5 text-gray-500" />
              </div>
              <p className="text-2xl font-bold">
                {state.counts?.category ?? 0}
              </p>
              <ReactApexChart
                options={{
                  labels: ["Electronics", "Fashion", "Home", "Other"],
                  colors: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"],
                  legend: { show: false },
                }}
                series={[2, 2, 3, 1]} // static example data
                type="donut"
                height={120}
              />
            </div>
          </div>
          {/* Bookings → Area */}
          <div
            className="bg-white rounded-xl shadow-md p-6 cursor-pointer"
            onClick={() => handleClick("booking")}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-800">Bookings</h2>
              <Calendar className="h-5 w-5 text-gray-500" />
            </div>
            <p className="text-2xl font-bold">{state.counts?.booking ?? 0}</p>
            <ReactApexChart
              options={{
                chart: { type: "area", sparkline: { enabled: true } },
                stroke: { curve: "smooth" },
                colors: ["#06b6d4"],
              }}
              series={[
                {
                  data: [5, 15, 20, 25, 30, 40, state.counts?.booking ?? 0],
                },
              ]}
              type="area"
              height={100}
            />
          </div>

          {/* Registered Users → Area */}
          <div
            className="bg-white rounded-xl shadow-md p-6 cursor-pointer"
            onClick={() => handleClick("registerUser")}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-800">
                Registered Users
              </h2>
              <ShoppingCart className="h-5 w-5 text-gray-500" />
            </div>
            <p className="text-2xl font-bold">
              {state.counts?.registerUser ?? 0}
            </p>
            <ReactApexChart
              options={{
                chart: { type: "area", sparkline: { enabled: true } },
                colors: ["#6366f1"],
                stroke: { curve: "smooth" },
              }}
              series={[
                {
                  data: [
                    20,
                    40,
                    35,
                    50,
                    60,
                    100,
                    state.counts?.registerUser ?? 0,
                  ],
                },
              ]}
              type="area"
              height={100}
            />
          </div>

          {/* Cancelled Users → Column */}
          <div
            className="bg-white rounded-xl shadow-md p-6 cursor-pointer"
            onClick={() => handleClick("cancelUser")}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-800">
                Cancelled Users
              </h2>
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold">
              {state.counts?.cancelOrder ?? 0}
            </p>
            <ReactApexChart
              options={{
                chart: { type: "bar", sparkline: { enabled: true } },
                colors: ["#ef4444"],
              }}
              series={[
                {
                  data: [2, 3, 5, 4, 6, 8, state.counts?.cancelOrder ?? 0],
                },
              ]}
              type="bar"
              height={100}
            />
          </div>

          {/* Users → Line */}
          <div
            className="bg-white rounded-xl shadow-md p-6 cursor-pointer"
            onClick={() => handleClick("user")}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-800">Users</h2>
              <Users className="h-5 w-5 text-gray-500" />
            </div>
            <p className="text-2xl font-bold">{state.counts?.user ?? 0}</p>
            <ReactApexChart
              options={{
                chart: { type: "line", sparkline: { enabled: true } },
                stroke: { curve: "smooth", width: 2 },
                colors: ["#10b981"],
              }}
              series={[
                { data: [10, 20, 25, 40, 60, 75, state.counts?.user ?? 0] },
              ]}
              type="line"
              height={100}
            />
          </div>

          {/* Payment Gateways → Radial Bar */}
          <div
            className="bg-white rounded-xl shadow-md p-6 cursor-pointer"
            onClick={() => handleClick("payment")}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-800">
                Payment Gateways
              </h2>
              <CreditCard className="h-5 w-5 text-gray-500" />
            </div>
            <p className="text-2xl font-bold">{state.counts?.payment ?? 0}</p>
            <ReactApexChart
              options={{
                plotOptions: {
                  radialBar: {
                    hollow: { size: "50%" },
                    dataLabels: { show: false },
                  },
                },
                colors: ["#f59e0b"],
              }}
              series={[
                Math.min((state.counts?.payment ?? 0) * 20, 100), // safe cap
              ]}
              type="radialBar"
              height={120}
            />
          </div>

          {/* Reports → Horizontal Bar */}
          <div
            className="bg-white rounded-xl shadow-md p-6 cursor-pointer"
            onClick={() => handleClick("report")}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-800">Reports</h2>
              <FileText className="h-5 w-5 text-gray-500" />
            </div>
            <ReactApexChart
              options={{
                chart: { type: "bar", sparkline: { enabled: true } },
                plotOptions: { bar: { horizontal: true } },
                colors: ["#6366f1"],
              }}
              series={[{ data: [5, 10, 15] }]}
              type="bar"
              height={100}
            />
          </div>

          {/* Coupons → Pie */}
          <div
            className="bg-white rounded-xl shadow-md p-6 cursor-pointer"
            onClick={() => handleClick("coupon")}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-800">Coupons</h2>
              <Ticket className="h-5 w-5 text-gray-500" />
            </div>
            <p className="text-2xl font-bold">{state.counts?.coupon ?? 0}</p>
            <ReactApexChart
              options={{
                labels: ["Used", "Unused"],
                colors: ["#22c55e", "#ec4899"],
                legend: { show: false },
              }}
              series={[12, Math.max((state.counts?.coupon ?? 0) - 12, 0)]}
              type="pie"
              height={120}
            />
          </div>
        </div>

        <div className="col-span-3  p-4">
          <DashboardCalender events={state.event} setEvents={() => {}} />
        </div>
      </div>
    </div>
  );
};

export default ProtectedRoute(Dashboard);
