"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from "react";
import ProtectedRoute from "@/components/common-components/privateRouter";
import {
  capitalizeFLetter,
  formatDuration,
  getTimes,
  objIsEmpty,
  useSetState,
} from "@/utils/function.utils";
import Models from "@/imports/models.import";
import dynamic from "next/dynamic";
import {
  AYURVEDIC_LOUNGE_NAME,
  HEAD,
  TABLE_HEAD,
} from "@/utils/constant.utils";
import moment from "moment";
import { DatePickers } from "@/components/common-components/datePickers";
import { Loader } from "lucide-react";
import PrimaryButton from "@/components/common-components/primaryButton";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const Dashboard = () => {
  const [state, setState] = useSetState({
    isMounted: false,
    orderList: [],
    start_date: null,
    end_date: null,
    event: null,
    lounge_status: null,
    reports_user_activity: null,
    reports_usage: null,
    reports_session_duration: null,
    reports_registrations: null,
    reports_meetings: null,
    // reports_engagement: null,
    reports_attendance: null,
    activeTab: "booking",
    regChartOptions: {},
    regChartSeries: [],
    catChartOptions: {},
    catChartSeries: [],
    participatedChartOptions: {},
    participatedChartSeries: [],

    activityHead: [],
    activityBody: [],
    loading: false,
    loungeList: [],
    registrationList: [],
    showUserModal: false,
    participatedList: [],
    showPartModal: false,
    selectedPart: {},
    participationUser: [],
  });

  useEffect(() => {
    setState({ isMounted: true });
    // reports_user_activity();
    // // reports_usage();
    // // reports_session_duration();
    // reports_registrations();
    // // reports_meetings();
    // reports_engagement();
    // reports_attendance();
    // // getReportData();
    reports_engagement();
  }, []);

  useEffect(() => {
    if (state.activeTab == "booking") {
      reports_engagement();
    } else if (state.activeTab == "customers") {
      reports_registrations();
    } else if (state.activeTab == "participate") {
      reports_attendance();
    } else if (state.activeTab == "activity") {
      reports_user_activity();
    }
  }, [
    // state.lounge_status,
    state.start_date,
    state.end_date,
    state.activeTab,
    // state.event,
  ]);

  useEffect(() => {
    setState({ start_date: null, end_date: null });
  }, [state.activeTab]);

  const bodyData = () => {
    const body: { [key: string]: any } = {};
    if (state.start_date) {
      body.start_date = moment(state.start_date).format("YYYY-MM-DD");
    }
    if (state.end_date) {
      body.end_date = moment(state.end_date).format("YYYY-MM-DD");
    }
    return body;
  };

  // const getReportData = async () => {
  //   try {
  //     setState({ loading: true });
  //     const reports = [
  //       { id: "9.1", name: "revenueByEachBookings" },
  //       { id: "9.2", name: "revenueByEachCategory" },
  //       { id: "9.3", name: "revenueByEachMentor" },
  //       { id: "9.4", name: "revenueByEachCustomer" },
  //     ];

  //     if (!reports || !Array.isArray(reports)) {
  //       setState({
  //         loading: false,
  //         error: "Reports configuration is invalid",
  //       });
  //       return;
  //     }

  //     const responses = await Promise.all(
  //       reports.map((report) => Models.session.reports(report.id))
  //     );

  //     const reportData = {};
  //     let index = 0;
  //     for (const report of reports) {
  //       reportData[report.name] = responses[index];
  //       index++;
  //     }

  //     setState({
  //       loading: false,
  //       reportData: reportData,
  //       error: null,
  //     });
  //   } catch (error) {
  //     console.log("error: ", error);
  //     setState({
  //       loading: false,
  //       error: error.message || "Failed to fetch reports",
  //     });
  //   }
  // };

  const reports_user_activity = async () => {
    try {
      setState({ loading: true });
      const body = bodyData();
      const res: any = await Models.session.reports_user_activity(body);
      const tableBody = res?.activities?.map((item) => ({
        "Activity Type": capitalizeFLetter(item?.activity_type),
        Name: item?.user?.name,
        Email: item?.user?.email,
        "Event Name": item?.details?.event_title
          ? capitalizeFLetter(item?.details?.event_title)
          : "",
        "Event Date": item?.details?.event_date,
        "Event Time": item?.details?.event_time,
        "Meeting ID": item?.details?.meeting_id,
        "Join Time": item?.details?.join_time
          ? getTimes(item?.details?.join_time)
          : "",
        "Leave Time": item?.details?.leave_time
          ? getTimes(item?.details?.leave_time)
          : "",
        Duration: item?.details?.duration_minutes
          ? formatDuration(item?.details?.duration_minutes)
          : "",
      }));

      setState({
        reports_user_activity: res,
        activityBody: tableBody,
        loading: false,
      });
    } catch (error) {
      setState({ loading: false });

      console.log("✌️error --->", error);
    }
  };

  // const reports_usage = async () => {
  //   try {
  //     const body = bodyData();

  //     const res = await Models.session.reports_usage(body);
  //     // console.log("reports_usage --->", res);
  //     setState({ reports_usage: res });
  //   } catch (error) {
  //     console.log("✌️error --->", error);
  //   }
  // };

  // const reports_session_duration = async () => {
  //   try {
  //     const body = bodyData();

  //     const res = await Models.session.reports_session_duration(body);
  //     // console.log("reports_session_duration --->", res);
  //     setState({ reports_session_duration: res });
  //   } catch (error) {
  //     console.log("✌️error --->", error);
  //   }
  // };

  const reports_registrations = async () => {
    try {
      setState({ loading: true });

      const body = bodyData();

      const res: any = await Models.session.reports_registrations(body);
      const registrations = res?.registrations;

      const processRegistrationData = () => {
        const eventCounts = {};

        registrations.forEach((registration) => {
          const eventTitle = registration.event.title;
          if (eventCounts[eventTitle]) {
            eventCounts[eventTitle]++;
          } else {
            eventCounts[eventTitle] = 1;
          }
        });

        return eventCounts;
      };

      const eventCounts = processRegistrationData();

      const eventTitles = Object.keys(eventCounts);
      const registrationCounts = Object.values(eventCounts);

      const regChartOptions = {
        chart: {
          type: "bar",
          height: 350,
          toolbar: {
            show: false,
          },
        },
        plotOptions: {
          bar: {
            borderRadius: 4,
            columnWidth: "45%",
          },
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          categories: eventTitles.map((title) =>
            title.length > 20 ? title.substring(0, 20) + "..." : title
          ),
          labels: {
            rotate: -45,
            style: {
              fontSize: "12px",
            },
          },
        },
        yaxis: {
          title: {
            text: "Registration Count",
          },
          tickAmount: 5,
        },
        colors: ["#3b82f6"],
        title: {
          text: "",
          align: "center",
          style: {
            fontSize: "16px",
            fontWeight: "bold",
          },
        },
        tooltip: {
          y: {
            formatter: function (value) {
              return value;
            },
          },
        },
      };

      const regChartSeries = [
        {
          name: "Registration Count",
          data: registrationCounts,
        },
      ];

      setState({ regChartOptions, regChartSeries, loading: false });

      registrationList(res);

      setState({ reports_registrations: res });
    } catch (error) {
      setState({ loading: false });

      console.log("✌️error --->", error);
    }
  };

  const registrationList = async (res) => {
    try {
      const groupedEvents = res?.registrations?.reduce((acc, registration) => {
        const eventTitle = registration.event.title;
        if (!acc[eventTitle]) {
          acc[eventTitle] = {
            title: eventTitle,
            lounge_type: registration.event.category,
            start_date: registration.event.start_date,
            start_time: registration.event.start_time,
            user_count: 0,
            registrations: [],
          };
        }
        acc[eventTitle].user_count++;
        acc[eventTitle].registrations.push(registration);
        return acc;
      }, {});

      const groupedEventsArray = groupedEvents
        ? Object.values(groupedEvents)
        : [];
      console.log("✌️groupedEventsArray --->", groupedEventsArray);
      setState({ registrationList: groupedEventsArray });

      // Function to show user details modal
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const showUserDetails = (event) => {
    console.log("✌️event --->", event);
    setState({
      selectedEvent: event,
      showUserModal: true,
    });

    // setState((prev) => ({
    //   ...prev,
    //   selectedEvent: event,
    //   showUserModal: true,
    // }));
  };

  const showPartDetails = (event) => {
    console.log("✌️event --->", event);
    setState({
      selectedPart: event?.event,
      showPartModal: true,
      participationUser: event?.participants,
    });
  };

  // const reports_meetings = async () => {
  //   try {
  //     const body = bodyData();

  //     const res = await Models.session.reports_meetings(body);
  //     // console.log("reports_meetings --->", res);
  //     setState({ reports_meetings: res });
  //   } catch (error) {
  //     console.log("✌️error --->", error);
  //   }
  // };

  const reports_engagement = async () => {
    try {
      setState({ loading: true });
      const body = bodyData();
      const res: any = await Models.session.reports_engagement(body);
      const filter = res?.category_performance?.filter(
        (item) => item?.lounge_type__name != AYURVEDIC_LOUNGE_NAME
      );

      const promises = filter?.map((item) => LoungeList(item?.event_ids));
      const allResults = await Promise.all(promises);
      console.log("✌️allResults --->", allResults);
      const combinedData = allResults.flat();
      console.log("✌️combinedData --->", combinedData);
      setState({ loungeList: combinedData });

      // filter?.map((item) => LoungeList(item?.event_ids));

      const catChartOptions = {
        chart: {
          type: "bar",
          height: 350,
          toolbar: {
            show: false,
          },
        },
        plotOptions: {
          bar: {
            borderRadius: 4,
            columnWidth: "45%",
          },
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          categories: filter?.map((item) =>
            item.lounge_type__name.length > 15
              ? item.lounge_type__name.substring(0, 15) + "..."
              : item.lounge_type__name
          ),
        },
        yaxis: {
          title: {
            text: "Count",
          },
        },
        colors: ["#10b981", "#3b82f6"], // Green for events, blue for registrations
        series: [
          {
            name: "Event Count",
            data: filter?.map((item) => item.event_count),
          },
          {
            name: "Registration Count",
            data: filter?.map((item) => item.total_registrations),
          },
        ],
        legend: {
          position: "bottom",
        },
      };

      const catChartSeries = [
        {
          name: "Session Count",
          data: filter?.map((item) => item.event_count),
        },
        {
          name: "Registration Count",
          data: filter?.map((item) => item.total_registrations),
        },
      ];
      setState({
        reports_engagement: res,
        catChartOptions,
        catChartSeries,
        loading: false,
      });
    } catch (error) {
      setState({ loading: false });

      console.log("✌️error --->", error);
    }
  };

  const LoungeList = async (arr) => {
    try {
      // const arr = ["208", "207", "206", "205"];

      const body = {
        ids: arr,
      };
      const res: any = await Models.session.list(1, body);
      const response = res?.results?.map((item) => ({
        title: item?.title,
        lounge_type: item?.lounge_type?.name,
        start_date: item?.start_date
          ? moment(item?.start_date).format("DD-MM-YYYY")
          : "",
        end_date: item?.end_date
          ? moment(item?.end_date).format("DD-MM-YYYY")
          : "",
        start_time: item?.start_time,
        end_time: item?.end_time,
        event_registrations_count: item?.event_registrations_count,
      }));
      console.log("✌️response --->", response);

      return response;
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const reports_attendance = async () => {
    try {
      setState({ loading: true });

      const body = bodyData();

      const res: any = await Models.session.reports_attendance(body);
      const data = res?.events;

      const eventTitles = data.map((item) =>
        item.event.title.length > 20
          ? item.event.title.substring(0, 20) + "..."
          : item.event.title
      );

      const totalAttended = data.map(
        (item) => item.attendance_summary.total_attended
      );
      // const totalRegistered = data.map(
      //   (item) => item.attendance_summary.total_registered
      // );

      const participatedChartOptions = {
        chart: {
          type: "bar",
          height: 400,
          toolbar: {
            show: true,
          },
          zoom: {
            enabled: false,
          },
        },
        plotOptions: {
          bar: {
            borderRadius: 4,
            columnWidth: "55%",
            dataLabels: {
              position: "bottom",
            },
          },
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          categories: eventTitles,
          labels: {
            rotate: -45,
            style: {
              fontSize: "10px",
              fontFamily: "Arial, sans-serif",
            },
            formatter: function (value) {
              return value?.length > 15
                ? value?.substring(0, 15) + "..."
                : value;
            },
          },
          tickPlacement: "on",
        },
        yaxis: {
          title: {
            text: "Number of Participants",
          },
          min: 0,

          forceNiceScale: true, // Force nice whole numbers
          labels: {
            formatter: function (value) {
              return Math.round(value); // Round to whole numbers
            },
          },
        },
        colors: ["#3b82f6", "#10b981"], // Blue for attended, Green for registered
        legend: {
          position: "top",
          horizontalAlign: "center",
        },
        title: {
          text: "",
          align: "center",
          style: {
            fontSize: "16px",
            fontWeight: "bold",
          },
        },
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: function (value) {
              return value;
            },
          },
        },
        grid: {
          borderColor: "#f1f1f1",
        },
      };

      const participatedChartSeries = [
        {
          name: "Total Participated Count",
          data: totalAttended,
        },
        // {
        //   name: "Total Registered Count",
        //   data: totalRegistered,
        // },
      ];
      console.log("✌️participatedChartOptions --->", participatedChartOptions);

      setState({
        participatedList: res?.events,
        reports_attendance: res,
        participatedChartOptions,
        loading: false,
        participatedChartSeries,
      });
    } catch (error) {
      setState({ loading: false });

      console.log("✌️error --->", error);
    }
  };
  console.log("✌️state.participatedList --->", state.participatedList);

  return (
    <div className="container mt-0 mx-auto calendar-wrapper md:p-4 ">
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setState({ activeTab: "booking" })}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                state.activeTab === "booking"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Lounge Summary
            </button>
            <button
              onClick={() => setState({ activeTab: "customers" })}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                state.activeTab === "customers"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Session Summary
            </button>

            <button
              onClick={() => setState({ activeTab: "participate" })}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                state.activeTab === "participate"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Session Participation
            </button>
            <button
              onClick={() => setState({ activeTab: "activity" })}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                state.activeTab === "activity"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              User Activity
            </button>
          </nav>
        </div>
      </div>
      {state.activeTab === "booking" ? (
        <>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Lounge Summary
              </h2>

              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="w-full sm:w-50">
                  <DatePickers
                    fromDate={null}
                    placeholder="Start date"
                    closeIcon={true}
                    selectedDate={state.start_date}
                    onChange={(date) => {
                      setState({
                        start_date: date,
                      });
                    }}
                  />
                </div>

                <div className="w-full sm:w-50">
                  <DatePickers
                    placeholder="End date"
                    closeIcon={true}
                    selectedDate={state.end_date}
                    onChange={(date) => {
                      setState({
                        end_date: date,
                      });
                    }}
                  />
                </div>

                <PrimaryButton
                  name="Export"
                  variant={""}
                  className="bg-themeGreen hover:bg-themeGreen"
                  onClick={() => {}}
                  loading={state.submitLoading}
                />
              </div>
            </div>
            {state.loading ? (
              <div className="flex items-center justify-center w-full">
                <Loader />
              </div>
            ) : (
              <>
                {ReactApexChart && !objIsEmpty(state.catChartOptions) && (
                  <ReactApexChart
                    options={state.catChartOptions}
                    series={state.catChartSeries}
                    type="bar"
                    height={350}
                  />
                )}
                <div className="flex justify-start py-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Session List
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {TABLE_HEAD?.map((item, i) => (
                          <th
                            key={i}
                            className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {item}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    {state.loading ? (
                      <tbody>
                        <tr>
                          <td
                            colSpan={TABLE_HEAD?.length}
                            className="px-6 py-4 text-center"
                          >
                            <div className="flex justify-center items-center w-full">
                              <Loader />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    ) : (
                      <tbody className="bg-white divide-y divide-gray-200">
                        {state.loungeList?.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {item?.title || ""}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {item?.lounge_type || ""}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {item?.start_date || ""}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {item?.start_time || ""}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {item?.end_time || ""}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {item?.event_registrations_count}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    )}
                  </table>
                </div>
              </>
            )}
          </div>
        </>
      ) : state.activeTab === "customers" ? (
        <>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Session Registration Summary
              </h2>

              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="w-full sm:w-50">
                  <DatePickers
                    placeholder="Start date"
                    closeIcon={true}
                    selectedDate={state.start_date}
                    onChange={(date) => {
                      setState({
                        start_date: date,
                      });
                    }}
                  />
                </div>

                <div className="w-full sm:w-50">
                  <DatePickers
                    placeholder="End date"
                    closeIcon={true}
                    selectedDate={state.end_date}
                    onChange={(date) => {
                      setState({
                        end_date: date,
                      });
                    }}
                  />
                </div>
                <PrimaryButton
                  name="Export"
                  variant={""}
                  className="bg-themeGreen hover:bg-themeGreen"
                  onClick={() => {}}
                  loading={state.submitLoading}
                />
              </div>
            </div>
            {state.loading ? (
              <div className="flex items-center justify-center w-full">
                <Loader />
              </div>
            ) : (
              <>
                {ReactApexChart && !objIsEmpty(state.regChartOptions) && (
                  <ReactApexChart
                    options={state.regChartOptions}
                    series={state.regChartSeries}
                    type="bar"
                    height={350}
                  />
                )}

                <div className="flex justify-start py-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Registration List
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {[
                          "Session Title",
                          "Lounge Type",
                          "Start Date",
                          "Start Time",
                          "Registered Users",
                          "Actions",
                        ]?.map((item, i) => (
                          <th
                            key={i}
                            className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {item}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    {state.loading ? (
                      <tbody>
                        <tr>
                          <td
                            colSpan={
                              [
                                "Session Title",
                                "Lounge Type",
                                "Start Date",
                                "Start Time",
                                "Registered Users",
                                "Actions",
                              ]?.length
                            }
                            className="px-6 py-4 text-center"
                          >
                            <div className="flex justify-center items-center w-full">
                              <Loader />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    ) : (
                      <tbody className="bg-white divide-y divide-gray-200">
                        {state.registrationList?.map((event, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {event?.title || ""}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {event?.lounge_type || ""}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {event?.start_date
                                ? moment(event?.start_date).format("DD-MM-YYYY")
                                : ""}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {event?.start_time || ""}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-blue-800 bg-blue-100 rounded-full">
                                {event?.user_count} users
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              <button
                                onClick={() => showUserDetails(event)}
                                className="text-blue-600 hover:text-blue-900 font-medium text-sm bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors"
                              >
                                Quick View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    )}
                  </table>

                  {state.showUserModal && state.selectedEvent && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {state.selectedEvent?.title} - Registered Users
                            </h3>
                            <button
                              onClick={() =>
                                setState({
                                  showUserModal: false,
                                })
                              }
                              className="text-gray-400 hover:text-gray-600"
                            >
                              ✕
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Total {state.selectedEvent?.user_count} registered
                            users
                          </p>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                  Name
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                  Email
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                  University
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                  Registration Date
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {state.selectedEvent.registrations.map(
                                (reg, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                      {reg?.user?.name || "N/A"}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                      {reg?.user?.email}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                      {reg?.user?.university || "N/A"}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                      {reg?.registration_date
                                        ? moment(reg?.registration_date).format(
                                            "DD-MM-YYYY"
                                          )
                                        : ""}
                                    </td>

                                    <td className="px-4 py-3 text-sm">
                                      <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                          reg?.registration_status ===
                                          "Completed"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-yellow-100 text-yellow-800"
                                        }`}
                                      >
                                        {reg?.registration_status}
                                      </span>
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>

                        <div className="bg-gray-50 px-6 py-3 border-t flex justify-end">
                          <button
                            onClick={() =>
                              setState({
                                showUserModal: false,
                              })
                            }
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      ) : state.activeTab === "participate" ? (
        <>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Session Participation Summary (Zoom)
              </h2>

              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="w-full sm:w-50">
                  <DatePickers
                    placeholder="Start date"
                    closeIcon={true}
                    selectedDate={state.start_date}
                    onChange={(date) => {
                      setState({
                        start_date: date,
                      });
                    }}
                  />
                </div>

                <div className="w-full sm:w-50">
                  <DatePickers
                    placeholder="End date"
                    closeIcon={true}
                    selectedDate={state.end_date}
                    onChange={(date) => {
                      setState({
                        end_date: date,
                      });
                    }}
                  />
                </div>
                <PrimaryButton
                  name="Export"
                  variant={""}
                  className="bg-themeGreen hover:bg-themeGreen"
                  onClick={() => {}}
                  loading={state.submitLoading}
                />
              </div>
            </div>
            {state.loading ? (
              <div className="flex items-center justify-center w-full">
                <Loader />
              </div>
            ) : (
              <>
                {ReactApexChart &&
                  !objIsEmpty(state.participatedChartOptions) && (
                    <ReactApexChart
                      options={state.participatedChartOptions}
                      series={state.participatedChartSeries}
                      type="bar"
                      height={350}
                    />
                  )}

                <div className="flex justify-start py-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Participated List
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {[
                          "Session Title",
                          "Lounge Type",
                          "Start Date",
                          "Start Time",
                          "Registered Users",
                          "Actions",
                        ]?.map((item, i) => (
                          <th
                            key={i}
                            className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {item}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    {state.loading ? (
                      <tbody>
                        <tr>
                          <td
                            colSpan={
                              [
                                "Session Title",
                                "Lounge Type",
                                "Start Date",
                                "Start Time",
                                "Participated Users",
                                "Actions",
                              ]?.length
                            }
                            className="px-6 py-4 text-center"
                          >
                            <div className="flex justify-center items-center w-full">
                              <Loader />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    ) : (
                      <tbody className="bg-white divide-y divide-gray-200">
                        {state.participatedList?.map((event, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {event?.event?.title || ""}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {event.event?.category || ""}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {event?.event?.start_date
                                ? moment(event?.event?.start_date).format(
                                    "DD-MM-YYYY"
                                  )
                                : ""}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {event.event?.start_time || ""}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-blue-800 bg-blue-100 rounded-full">
                                {event.participants?.length} users
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              <button
                                onClick={() => showPartDetails(event)}
                                className="text-blue-600 hover:text-blue-900 font-medium text-sm bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors"
                              >
                                Quick View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    )}
                  </table>

                  {state.showPartModal &&
                    state.selectedPart &&
                    state.participationUser?.length > 0 && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
                          {/* Modal Header */}
                          <div className="bg-gray-50 px-6 py-4 border-b">
                            <div className="flex justify-between ">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {state.selectedPart?.title} - Participant
                                  Details
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {state.selectedPart?.category} •{" "}
                                  {/* {formatDate(state.selectedPart?.start_date)} •{" "}
                                {formatTime(state.selectedPart?.start_time)} */}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  setState({
                                    showPartModal: false,
                                  })
                                }
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                              >
                                ✕
                              </button>
                            </div>
                          </div>

                          {/* Modal Body */}
                          <div className="p-6 overflow-y-auto max-h-[70vh]">
                            {/* Participants Section */}
                            <div className="mb-8">
                              {/* <h4 className="text-lg font-semibold text-gray-900 mb-4">
                              Participants (
                              {state.participationUser?.length})
                            </h4> */}
                              {state.participationUser?.length > 0 ? (
                                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                          Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                          Email
                                        </th>

                                        {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Session Date
                                      </th> */}
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                          Join Time
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                          Leave Time
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                          Duration
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {state.participationUser?.map(
                                        (participant, index) => (
                                          <tr
                                            key={index}
                                            className="hover:bg-gray-50"
                                          >
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                              {participant.name || "Anonymous"}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                              {participant.email || "N/A"}
                                            </td>
                                            {/* <td className="px-4 py-3 text-sm text-gray-600">
                                            {getTimes(participant.join_time)}
                                           
                                          </td> */}
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                              {getTimes(participant.join_time)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                              {getTimes(participant.leave_time)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                              {formatDuration(
                                                participant.duration
                                              )}
                                            </td>
                                            {/* <td className="px-4 py-3 text-sm">
                                            <span
                                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                participant.is_registered
                                                  ? "bg-green-100 text-green-800"
                                                  : "bg-gray-100 text-gray-800"
                                              }`}
                                            >
                                              {participant.is_registered
                                                ? "Yes"
                                                : "No"}
                                            </span>
                                          </td> */}
                                          </tr>
                                        )
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <p className="text-gray-500 text-center py-4">
                                  No participants attended this event
                                </p>
                              )}
                            </div>

                            {/* Registered Users Section */}
                            {/* {state.selectedEvent.registered_users.length > 0 && (
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Registered Users (
                                {state.selectedEvent.registered_users.length})
                              </h4>
                              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Name
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Email
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Registration Date
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Attended
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Credits Granted
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {state.selectedEvent.registered_users.map(
                                      (user, index) => (
                                        <tr
                                          key={index}
                                          className="hover:bg-gray-50"
                                        >
                                          <td className="px-4 py-3 text-sm text-gray-900">
                                            {user.name || "N/A"}
                                          </td>
                                          <td className="px-4 py-3 text-sm text-gray-600">
                                            {user.email}
                                          </td>
                                          <td className="px-4 py-3 text-sm text-gray-600">
                                            {new Date(
                                              user.registration_date
                                            ).toLocaleDateString()}
                                          </td>
                                          <td className="px-4 py-3 text-sm">
                                            <span
                                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                user.attended
                                                  ? "bg-green-100 text-green-800"
                                                  : "bg-red-100 text-red-800"
                                              }`}
                                            >
                                              {user.attended ? "Yes" : "No"}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3 text-sm">
                                            <span
                                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                user.credits_granted
                                                  ? "bg-green-100 text-green-800"
                                                  : "bg-gray-100 text-gray-800"
                                              }`}
                                            >
                                              {user.credits_granted
                                                ? "Yes"
                                                : "No"}
                                            </span>
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )} */}
                          </div>

                          {/* Modal Footer */}
                          <div className="bg-gray-50 px-6 py-3 border-t flex justify-end">
                            <button
                              onClick={() =>
                                setState({
                                  showPartModal: false,
                                })
                              }
                              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </>
            )}
            {/* {state.regChartOptions.length === 0 && ( */}
            {/* <div className="h-64 flex items-center justify-center text-gray-500">
                No category revenue data available
              </div> */}
            {/* )} */}
          </div>
        </>
      ) : state.activeTab === "activity" ? (
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              User Activity
            </h2>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="w-full sm:w-50">
                <DatePickers
                  placeholder="Start date"
                  closeIcon={true}
                  selectedDate={state.start_date}
                  onChange={(date) => {
                    setState({
                      start_date: date,
                    });
                  }}
                />
              </div>

              <div className="w-full sm:w-50">
                <DatePickers
                  placeholder="End date"
                  closeIcon={true}
                  selectedDate={state.end_date}
                  onChange={(date) => {
                    setState({
                      end_date: date,
                    });
                  }}
                />
              </div>
              <PrimaryButton
                name="Export"
                variant={""}
                className="bg-themeGreen hover:bg-themeGreen"
                onClick={() => {}}
                loading={state.submitLoading}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {HEAD?.map((item, i) => (
                    <th
                      key={i}
                      className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>
              {state.loading ? (
                <tbody>
                  <tr>
                    <td
                      colSpan={HEAD?.length}
                      className="px-6 py-4 text-center"
                    >
                      <div className="flex justify-center items-center w-full">
                        <Loader />
                      </div>
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody className="bg-white divide-y divide-gray-200">
                  {state.activityBody?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {item.Name || ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {item.Email || ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {item["Activity Type"] || ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {item["Event Name"] || ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {item["Event Date"] || ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {item["Event Time"] || ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {item["Meeting ID"] || ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {item["Join Time"] || ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {item["Leave Time"] || ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {item.Duration || ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>
        </div>
      ) : null}

      {/* <RevenueDashboard reportData={state.reportData} /> */}
    </div>
  );
};

export default ProtectedRoute(Dashboard);
