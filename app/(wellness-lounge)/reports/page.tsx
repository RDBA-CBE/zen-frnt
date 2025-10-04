"use client";
import React, { useEffect } from "react";
import ProtectedRoute from "@/components/common-components/privateRouter";
import { useSetState } from "@/utils/function.utils";
import Models from "@/imports/models.import";
import RevenueDashboard from "../../../components/ui/revenueDashboard";

const Dashboard = () => {
  const [state, setState] = useSetState({
    isMounted: false,
    orderList: [],
    start_date: null,
    end_date: null,
    event: null,
    lounge_status: null,
  });

  useEffect(() => {
    setState({ isMounted: true });

    getReportData();
  }, []);

  useEffect(() => {
  }, [state.lounge_status, state.start_date, state.end_date, state.event]);

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


  return (
    <div className="container mt-0 mx-auto calendar-wrapper md:p-4 ">
      <RevenueDashboard reportData={state.reportData} />

</div>
  );
};

export default ProtectedRoute(Dashboard);
