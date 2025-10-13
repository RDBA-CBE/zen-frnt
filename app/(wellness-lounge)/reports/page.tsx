"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from "react";
import ProtectedRoute from "@/components/common-components/privateRouter";
import {
  capitalizeFLetter,
  Dropdown,
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
import CustomSelect from "@/components/common-components/dropdown";
import * as FileSaver from "file-saver";
import ExcelJS from "exceljs";

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
    reports_registrations: [],
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
    lounge_type: null,
    attendanceDropdown: [],
    userList: [],
    user_id: null,
    exportLoading: false,
    activityLoading: false,
    attendanceLoading:false
  });

  useEffect(() => {
    setState({ isMounted: true });
    reports_engagement();
  }, []);

  useEffect(() => {
    setState({ isMounted: true });
    reports_engagement();
    if (state.activeTab == "booking") {
      getCategoryList();
    }
    if (state.activeTab == "customers") {
      getSessionRegList();
    }
    if (state.activeTab == "participate") {
      getSessionPartList();
    }
    if (state.activeTab == "activity") {
      getUserList();
    }
    setState({ exportLoading: false });
  }, [state.activeTab]);

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
    state.lounge_type,
    state.start_date,
    state.end_date,
    state.activeTab,
    state.event,
    state.user_id,
  ]);

  useEffect(() => {
    setState({
      start_date: null,
      end_date: null,
      lounge_type: null,
      event: null,
      user_id: null,
    });
  }, [state.activeTab]);

  const bodyData = () => {
    const body: { [key: string]: any } = {};
    if (state.start_date) {
      body.start_date = moment(state.start_date).format("YYYY-MM-DD");
    }
    if (state.end_date) {
      body.end_date = moment(state.end_date).format("YYYY-MM-DD");
    }
    if (state.lounge_type?.value) {
      body.category = state.lounge_type?.label;
    }

    if (state.event?.value) {
      body.event = state.event?.label;
    }
    if (state.user_id?.value) {
      body.user_id = state.user_id?.value;
    }

    return body;
  };

  //Dropdown list

  const getCategoryList = async () => {
    try {
      setState({ loading: true });

      const res: any = await Models.category.catDropDownList();
      const dropdowns = Dropdown(res?.results, "name");

      const role = localStorage.getItem("group");
      setState({ categoryList: dropdowns, loading: false, role: role });
    } catch (error) {
      setState({ loading: false });

      console.log("error: ", error);
    }
  };

  const getSessionRegList = async () => {
    try {
      setState({ loading: true });
      const body = {};

      const res: any = await Models.session.reports_registrations(body);

      const groupedEvents = res?.registrations?.reduce((acc, registration) => {
        const eventTitle = registration?.event?.title;
        if (!acc[eventTitle]) {
          acc[eventTitle] = {
            title: eventTitle,
            lounge_type: registration?.event?.category,
            start_date: registration?.event?.start_date,
            start_time: registration?.event?.start_time,
            user_count: 0,
            registrations: [],
            id: registration?.event?.id,
          };
        }
        acc[eventTitle].user_count++;
        acc[eventTitle].registrations.push(registration);
        return acc;
      }, {});

      const groupedEventsArray = groupedEvents
        ? Object.values(groupedEvents)
        : [];

      const regDropDownList = groupedEventsArray?.map((item: any) => ({
        value: item?.id,
        label: item?.title,
      }));

      setState({ reports_registrations: regDropDownList });
    } catch (error) {
      setState({ loading: false });

      console.log("error: ", error);
    }
  };

  const getSessionPartList = async () => {
    try {
      setState({ loading: true});
      const body = {};

      const res: any = await Models.session.reports_attendance(body);
      const dropdownEvents = res?.events?.map((item) => ({
        value: item?.event?.id,
        label: item?.event?.title,
      }));

      setState({ attendanceDropdown: dropdownEvents, loading: false });
    } catch (error) {
      setState({ loading: false});

      console.log("error: ", error);
    }
  };

  const getUserList = async () => {
    try {
      setState({ loading: true });
      const body = {};

      const res: any = await Models.session.reports_user_activity(body);

      const usersById = res?.activities?.reduce((acc, activity) => {
        const user = activity?.user;
        if (!acc[user.id]) {
          acc[user.id] = {
            id: user?.id,
            name: user?.name,
            email: user?.email,
            activities: [],
          };
        }
        acc[user.id]?.activities?.push(activity);
        return acc;
      }, {});

      const userList = Object?.values(usersById).sort(
        (a: any, b: any) => a.id - b.id
      );

      const filterByDropdownFormat = userList?.map((item: any) => ({
        value: item?.id,
        label: item?.name,
      }));

      setState({
        userList: filterByDropdownFormat,
        loading: false,
      });
    } catch (error) {
      setState({ loading: false});

      console.log("error: ", error);
    }
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

  // Chart

  const reports_user_activity = async () => {
    try {
      setState({ loading: true,activityLoading: true });
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
        "Last Login":
          item?.activity_type == "login"
            ? item?.timestamp
              ? moment(item?.timestamp).format("DD-MM-YYYY")
              : ""
            : "",
      }));

      setState({
        reports_user_activity: res,
        activityBody: tableBody,
        loading: false,
        activityLoading: false
      });
    } catch (error) {
      setState({ loading: false,activityLoading: false });

      console.log("✌️error --->", error);
    }
  };

  const reports_registrations = async () => {
    try {
      setState({ loading: true });

      const body = bodyData();

      const res: any = await Models.session.reports_registrations(body);
      const registrations = res?.registrations;

      const processRegistrationData = () => {
        const eventCounts = {};

        registrations.forEach((registration) => {
          const eventTitle = registration?.event?.title;
          if (eventCounts[eventTitle]) {
            eventCounts[eventTitle]++;
          } else {
            eventCounts[eventTitle] = 1;
          }
        });

        return eventCounts;
      };

      const eventCounts = processRegistrationData();

      const eventTitles = Object?.keys(eventCounts);
      const registrationCounts = Object?.values(eventCounts);

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
    } catch (error) {
      setState({ loading: false });

      console.log("✌️error --->", error);
    }
  };

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
      const combinedData = allResults.flat();
      setState({ loungeList: combinedData });

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
          categories: filter?.map((item) => item?.lounge_type__name),
        },
        yaxis: {
          title: {
            text: "Count",
          },
        },
        colors: ["#10b981", "#3b82f6"],
        series: [
          {
            name: "Event Count",
            data: filter?.map((item) => item?.event_count),
          },
          {
            name: "Registration Count",
            data: filter?.map((item) => item?.total_registrations),
          },
        ],
        legend: {
          position: "bottom",
        },
      };

      const catChartSeries = [
        {
          name: "Session Count",
          data: filter?.map((item) => item?.event_count),
        },
        {
          name: "Registration Count",
          data: filter?.map((item) => item?.total_registrations),
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

  const reports_attendance = async () => {
    try {
      setState({ loading: true,attendanceLoading:true });

      const body = bodyData();

      const res: any = await Models.session.reports_attendance(body);

      const data = res?.events;

      const eventTitles = data.map((item) =>
        item.event.title.length > 20
          ? item?.event?.title.substring(0, 20) + "..."
          : item?.event?.title
      );

      const totalAttended = data.map(
        (item) => item?.attendance_summary?.total_attended
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

          forceNiceScale: true,
          labels: {
            formatter: function (value) {
              return Math.round(value);
            },
          },
        },
        colors: ["#3b82f6", "#10b981"],
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

      setState({
        participatedList: res?.events,
        reports_attendance: res,
        participatedChartOptions,
        loading: false,
        participatedChartSeries,
        attendanceLoading:false
      });
    } catch (error) {
      setState({ loading: false ,attendanceLoading:false});

      console.log("✌️error --->", error);
    }
  };

  // Table List

  const registrationList = async (res) => {
    try {
      const groupedEvents = res?.registrations?.reduce((acc, registration) => {
        const eventTitle = registration?.event?.title;
        if (!acc[eventTitle]) {
          acc[eventTitle] = {
            title: eventTitle,
            lounge_type: registration?.event?.category,
            start_date: registration?.event?.start_date,
            start_time: registration?.event?.start_time,
            user_count: 0,
            registrations: [],
            id: registration?.event?.id,
          };
        }
        acc[eventTitle].user_count++;
        acc[eventTitle]?.registrations?.push(registration);
        return acc;
      }, {});

      const groupedEventsArray = groupedEvents
        ? Object.values(groupedEvents)
        : [];
      setState({ registrationList: groupedEventsArray });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const LoungeList = async (arr) => {
    try {
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

      return response;
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const exportToExcel = async () => {
    try {
      setState({ exportLoading: true });
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Lounge Summary");

      // Define columns for Excel - Use simple array for headers
      const headers = [
        "Title",
        "Lounge Type",
        "Start Date",
        "End Date",
        "Start Time",
        "End Time",
        "Registration Count",
      ];

      const headerRow = worksheet.addRow(headers);
      headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "7f4099" },
      };

      state.loungeList.forEach((event) => {
        const rowData = [
          event.title,
          event.lounge_type,
          event.start_date,
          event.end_date,
          event.start_time,
          event.end_time,
          event.event_registrations_count,
        ];
        worksheet.addRow(rowData);
      });

      // Style the data rows
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          // Skip header row
          if (rowNumber % 2 === 0) {
            row.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "F8F9FA" },
            };
          }
        }
        row.alignment = { vertical: "middle", horizontal: "left" };
        row.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Auto-fit columns
      worksheet.columns = [
        { width: 30 }, // Title
        { width: 25 }, // Lounge Type
        { width: 15 }, // Start Date
        { width: 15 }, // End Date
        { width: 15 }, // Start Time
        { width: 15 }, // End Time
        { width: 15 }, // Registrations
      ];

      // Generate and save the Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      FileSaver.saveAs(
        new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        "Lounge Summary.xlsx"
      );
      setState({ exportLoading: false });
    } catch (error) {
      setState({ exportLoading: false });

      console.error("❌ Error exporting Excel:", error);
    } finally {
      setState({ exportLoading: false });

      // setBtnLoading(false);
    }
  };

  const exportToExcelRegList = async () => {
    try {
      setState({ exportLoading: true });
      const workbook = new ExcelJS.Workbook();

      const eventSheet = workbook.addWorksheet("Session Registration Summary");

      const eventHeaders = [
        "Session Title",
        "Lounge Type",
        "Start Date",
        "Start Time",
        "Total Users",
        "User Details",
      ];

      const eventHeaderRow = eventSheet.addRow(eventHeaders);
      eventHeaderRow.font = { bold: true, color: { argb: "FFFFFF" } };
      eventHeaderRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "2E86AB" },
      };

      state.registrationList.forEach((event) => {
        let userDetails = "";
        if (event.registrations && event.registrations.length > 0) {
          userDetails = event.registrations
            .map((registration, index) => {
              const userName = registration.user?.name || "";
              const userEmail = registration.user?.email || "";
              return `${index + 1}. Name: ${userName}, Email: ${userEmail}`;
            })
            .join(", ");
        } else {
          userDetails = "No registrations";
        }

        eventSheet.addRow([
          event.title,
          event.lounge_type,
          event.start_date,
          event.start_time,
          event.user_count,
          userDetails,
        ]);
      });

      const registrationSheet = workbook.addWorksheet("Registration Details");

      const regHeaders = [
        "Event Title",
        "Lounge Type",
        "Start Date",
        "Start Time",
        "Registration ID",
        "User Name",
        "User Email",
        "University",
        "Registration Date",
        "Registration Status",
        "Amount",
        "Discount Amount",
        "Coupon Used",
        "Slot",
        "Credits Granted",
        "Admin Registration",
      ];

      const regHeaderRow = registrationSheet.addRow(regHeaders);
      regHeaderRow.font = { bold: true, color: { argb: "FFFFFF" } };
      regHeaderRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "2E86AB" },
      };

      state.registrationList.forEach((event) => {
        if (event.registrations && event.registrations.length > 0) {
          event.registrations.forEach((registration) => {
            registrationSheet.addRow([
              event.title,
              event.lounge_type,
              event.start_date,
              event.start_time,
              registration.registration_id,
              registration.user?.name || "",
              registration.user?.email || "",
              registration.user?.university || "",
              new Date(registration.registration_date).toLocaleString(),
              registration.registration_status,
              registration.amount,
              registration.discount_amount,
              registration.coupon_used || "None",
              registration.slot || "",
              registration.credits_granted ? "Yes" : "No",
              registration.is_admin_registration ? "Yes" : "No",
            ]);
          });
        }
      });

      [eventSheet, registrationSheet].forEach((sheet) => {
        sheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) {
            if (rowNumber % 2 === 0) {
              row.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "F8F9FA" },
              };
            }
          }
          row.alignment = { vertical: "middle", horizontal: "left" };
          row.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      eventSheet.columns = [
        { width: 25 },
        { width: 30 },
        { width: 12 },
        { width: 12 }, // Start Time
        { width: 12 }, // Total Users
        { width: 50 }, // User Details (wider column for user information)
      ];

      registrationSheet.columns = [
        { width: 25 }, // Event Title
        { width: 30 }, // Lounge Type
        { width: 12 }, // Start Date
        { width: 12 }, // Start Time
        { width: 20 }, // Registration ID
        { width: 20 }, // User Name
        { width: 25 }, // User Email
        { width: 20 }, // University
        { width: 20 }, // Registration Date
        { width: 18 }, // Registration Status
        { width: 10 }, // Amount
        { width: 15 }, // Discount Amount
        { width: 15 }, // Coupon Used
        { width: 15 }, // Slot
        { width: 15 }, // Credits Granted
        { width: 18 }, // Admin Registration
      ];

      const buffer = await workbook.xlsx.writeBuffer();
      FileSaver.saveAs(
        new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        "Session Registration Summary.xlsx"
      );
      setState({ exportLoading: false });
    } catch (error) {
      setState({ exportLoading: false });

      console.error("❌ Error exporting Excel:", error);
    }
  };

  const exportToExcelAttendance = async () => {
    try {
      setState({ exportLoading: true });
      const workbook = new ExcelJS.Workbook();

      const eventSheet = workbook.addWorksheet("Session Participated Summary");

      const eventHeaders = [
        "Session Title",
        "Lounge Type",
        "Start Date",
        "Moderator",
        "Total Attended",
        "User Details", // User details from participants array
      ];

      const eventHeaderRow = eventSheet.addRow(eventHeaders);
      eventHeaderRow.font = { bold: true, color: { argb: "FFFFFF" } };
      eventHeaderRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "2E86AB" },
      };

      state.participatedList.forEach((item) => {
        // Format user details from participants array
        let userDetails = "";
        if (item.participants && item.participants.length > 0) {
          userDetails = item.participants
            .map((participant, index) => {
              const userName = participant.name || "";
              const userEmail = participant.email || "";
              return `${index + 1}. Name: ${userName}, Email: ${userEmail}`;
            })
            .join(", ");
        } else {
          userDetails = "No participants";
        }

        eventSheet.addRow([
          item.event.title,
          item.event.category,
          item.event.start_date,
          item.event.moderator || "",
          item.attendance_summary.total_attended, // Only total attended
          userDetails, // Add the formatted user details from participants
        ]);
      });

      // Sheet 2: Detailed Participants Information
      const participantsSheet = workbook.addWorksheet("Participants Details");

      const participantHeaders = [
        "Event Title",
        "Lounge Type",
        "Start Date",
        "Moderator",
        "Participant Name",
        "Participant Email",
        "Join Time",
        "Leave Time",
        "Duration (seconds)",
        "Is Registered",
      ];

      const participantHeaderRow = participantsSheet.addRow(participantHeaders);
      participantHeaderRow.font = { bold: true, color: { argb: "FFFFFF" } };
      participantHeaderRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "2E86AB" },
      };

      // Sheet 3: Registered Users Information
      const registeredSheet = workbook.addWorksheet("Registered Users");

      const registeredHeaders = [
        "Event Title",
        "Lounge Type",
        "Start Date",
        "User Name",
        "User Email",
        "Registration ID",
        "Attended",
        "Credits Granted",
      ];

      const registeredHeaderRow = registeredSheet.addRow(registeredHeaders);
      registeredHeaderRow.font = { bold: true, color: { argb: "FFFFFF" } };
      registeredHeaderRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "2E86AB" },
      };

      // Add data to Participants Details sheet
      state.participatedList.forEach((item) => {
        if (item.participants && item.participants.length > 0) {
          item.participants.forEach((participant) => {
            participantsSheet.addRow([
              item.event.title,
              item.event.category,
              item.event.start_date,
              item.event.moderator || "",
              participant.name || "",
              participant.email || "",
              new Date(participant.join_time).toLocaleString(),
              new Date(participant.leave_time).toLocaleString(),
              participant.duration,
              participant.is_registered ? "Yes" : "No",
            ]);
          });
        } else {
          // If no participants, still show the event
          participantsSheet.addRow([
            item.event.title,
            item.event.category,
            item.event.start_date,
            item.event.moderator || "",
            "No participants",
            "",
            "",
            "",
            "",
            "No",
          ]);
        }
      });

      // Add data to Registered Users sheet
      state.participatedList.forEach((item) => {
        if (item.registered_users && item.registered_users.length > 0) {
          item.registered_users.forEach((user) => {
            registeredSheet.addRow([
              item.event.title,
              item.event.category,
              item.event.start_date,
              user.name || "",
              user.email || "",
              user.registration_id,
              user.attended ? "Yes" : "No",
              user.credits_granted ? "Yes" : "No",
            ]);
          });
        } else {
          // If no registered users, still show the event
          registeredSheet.addRow([
            item.event.title,
            item.event.category,
            item.event.start_date,
            "No registered users",
            "",
            "",
            "No",
            "No",
          ]);
        }
      });

      // Apply styling to all sheets
      [eventSheet, participantsSheet, registeredSheet].forEach((sheet) => {
        sheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) {
            if (rowNumber % 2 === 0) {
              row.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "F8F9FA" },
              };
            }
          }
          row.alignment = { vertical: "middle", horizontal: "left" };
          row.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      // Set column widths for Event Summary (only 5 columns + User Details)
      eventSheet.columns = [
        { width: 25 }, // Session Title
        { width: 30 }, // Lounge Type
        { width: 12 }, // Start Date
        { width: 20 }, // Moderator
        { width: 15 }, // Total Attended
        { width: 50 }, // User Details
      ];

      participantsSheet.columns = [
        { width: 25 }, // Event Title
        { width: 30 }, // Lounge Type
        { width: 12 }, // Start Date
        { width: 20 }, // Moderator
        { width: 20 }, // Participant Name
        { width: 25 }, // Participant Email
        { width: 20 }, // Join Time
        { width: 20 }, // Leave Time
        { width: 15 }, // Duration
        { width: 12 }, // Is Registered
      ];

      registeredSheet.columns = [
        { width: 25 }, // Event Title
        { width: 30 }, // Lounge Type
        { width: 12 }, // Start Date
        { width: 20 }, // User Name
        { width: 25 }, // User Email
        { width: 20 }, // Registration ID
        { width: 10 }, // Attended
        { width: 15 }, // Credits Granted
      ];

      const buffer = await workbook.xlsx.writeBuffer();
      FileSaver.saveAs(
        new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        "Session Participated Summary.xlsx"
      );

      setState({ exportLoading: false });
    } catch (error) {
      setState({ exportLoading: false });
      console.error("❌ Error exporting Excel:", error);
    }
  };

  const exportToExcelUser = async () => {
    try {
      setState({ exportLoading: true });
      const workbook = new ExcelJS.Workbook();

      // Sheet: User Activity
      const activitySheet = workbook.addWorksheet("User Activity");

      const headers = [
        "Name",
        "Email",
        "Activity Type",
        "Last Login",
        "Event Name",
        "Event Date",
        "Event Time",
        "Meeting ID",
        "Join Time",
        "Leave Time",
        "Duration",
      ];

      const headerRow = activitySheet.addRow(headers);
      headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "2E86AB" },
      };

      // Add data rows with conditional formatting
      state.activityBody.forEach((activity) => {
        const activityType = activity["Activity Type"];

        // Only show Last Login if activity type is Login, otherwise empty string
        const lastLogin =
          activityType === "Login" ? activity["Last Login"] || "" : "";

        const row = activitySheet.addRow([
          activity.Name || "",
          activity.Email || "",
          activityType || "",
          lastLogin, // Only populated for Login activities
          activity["Event Name"] || "",
          activity["Event Date"] || "",
          activity["Event Time"] || "",
          activity["Meeting ID"] || "",
          activity["Join Time"] || "",
          activity["Leave Time"] || "",
          activity.Duration || "",
        ]);

        // Optional: Add color coding based on activity type
        if (activityType === "Login") {
          row.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "E8F5E8" }, // Light green for login
          };
        } else if (activityType === "Registration") {
          row.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "E3F2FD" }, // Light blue for registration
          };
        } else if (activityType === "Meeting_join") {
          row.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF3E0" }, // Light orange for meeting join
          };
        }
      });

      // Apply basic styling to all rows
      activitySheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          // If no conditional color applied, apply zebra striping
          if (!row.fill) {
            if (rowNumber % 2 === 0) {
              row.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "F8F9FA" },
              };
            }
          }
        }
        row.alignment = { vertical: "middle", horizontal: "left" };
        row.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Set column widths
      activitySheet.columns = [
        { width: 20 }, // Name
        { width: 25 }, // Email
        { width: 15 }, // Activity Type
        { width: 20 }, // Last Login
        { width: 25 }, // Event Name
        { width: 12 }, // Event Date
        { width: 12 }, // Event Time
        { width: 20 }, // Meeting ID
        { width: 15 }, // Join Time
        { width: 15 }, // Leave Time
        { width: 12 }, // Duration
      ];

      const buffer = await workbook.xlsx.writeBuffer();
      FileSaver.saveAs(
        new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        "User Activity.xlsx"
      );

      setState({ exportLoading: false });
    } catch (error) {
      setState({ exportLoading: false });
      console.error("❌ Error exporting Excel:", error);
    }
  };

  // Handle View

  const showUserDetails = (event) => {
    setState({
      selectedEvent: event,
      showUserModal: true,
    });
  };

  const showPartDetails = (event) => {
    setState({
      selectedPart: event?.event,
      showPartModal: true,
      participationUser: event?.participants,
    });
  };


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
                <div className="w-auto sm:w-100">
                  <CustomSelect
                    options={state.categoryList}
                    value={state.lounge_type?.value || ""}
                    onChange={(value) => setState({ lounge_type: value })}
                    placeholder="Select Lounge Type"
                  />
                </div>

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
                  onClick={() => exportToExcel()}
                  loading={state.exportLoading}
                />
              </div>
            </div>
            {state.loading ? (
              <div className="flex items-center justify-center w-full">
                <Loader className="animate-spin" />
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
                            <Loader className="animate-spin" />

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
                <div className="w-auto sm:w-100">
                  <CustomSelect
                    options={state.reports_registrations}
                    value={state.event?.value || ""}
                    onChange={(value) => setState({ event: value })}
                    placeholder="Select Session"
                  />
                </div>
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
                  onClick={() => exportToExcelRegList()}
                  loading={state.exportLoading}
                />
              </div>
            </div>
            {state.loading ? (
              <div className="flex items-center justify-center w-full">
                <Loader className="animate-spin" />
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
                          "Moderator",
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
                                "Moderator",
                                "Registered Users",
                                "Actions",
                              ]?.length
                            }
                            className="px-6 py-4 text-center"
                          >
                            <div className="flex justify-center items-center w-full">
                              <Loader className="animate-spin" />
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
                              {event?.start_date
                                ? moment(event?.start_date).format("DD-MM-YYYY")
                                : ""}
                            </td>
                            {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {event?.start_time || ""}
                            </td> */}
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
                                      {reg?.user?.name || ""}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                      {reg?.user?.email}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                      {reg?.user?.university || ""}
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
                <div className="w-auto sm:w-100">
                  <CustomSelect
                    options={state.attendanceDropdown}
                    value={state.event?.value || ""}
                    onChange={(value) => setState({ event: value })}
                    placeholder="Select Session"
                  />
                </div>
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
                  onClick={() => exportToExcelAttendance()}
                  loading={state.exportLoading}
                />
              </div>
            </div>
            {state.loading  || state.attendanceLoading? (
              <div className="flex items-center justify-center w-full">
                <Loader className="animate-spin" />
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
                          "Moderator",
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
                              <Loader className="animate-spin" />
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
                              {event.event?.moderator || ""}
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
                          <div className="bg-gray-50 px-6 py-4 border-b">
                            <div className="flex justify-between ">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {state.selectedPart?.title} - Participant
                                  Details
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {state.selectedPart?.category} •{" "}
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

                          <div className="p-6 overflow-y-auto max-h-[70vh]">
                            <div className="mb-8">
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
                                              {participant.email || ""}
                                            </td>

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
          </div>
        </>
      ) : state.activeTab === "activity" ? (
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              User Activity (Zoom)
            </h2>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="w-auto sm:w-100">
                <CustomSelect
                  options={state.userList}
                  value={state.user_id?.value || ""}
                  onChange={(value) => setState({ user_id: value })}
                  placeholder="Select User"
                />
              </div>
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
                onClick={() => exportToExcelUser()}
                loading={state.exportLoading}
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
              {state.loading || state.activityLoading ? (
                <tbody>
                  <tr>
                    <td
                      colSpan={HEAD?.length}
                      className="px-6 py-4 text-center"
                    >
                      <div className="flex justify-center items-center w-full">
                        <Loader className="animate-spin" />
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
                        {item["Last Login"] || ""}
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
