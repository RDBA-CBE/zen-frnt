"use client";
import { Edit, Eye, MoreHorizontal, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Models from "@/imports/models.import";
import { Dropdown, objIsEmpty, useSetState } from "@/utils/function.utils";
import { Label } from "@radix-ui/react-label";
import moment from "moment";
import useDebounce from "@/components/common-components/useDebounce";
import { Success } from "@/components/common-components/toast";
import Calendar from "./(wellness-lounge)/calendar/page";
import Dashboard from "./(wellness-lounge)/dashboard/page";
import Script from "next/script";
import LoginForm from "@/components/ui/login-form";

const App = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  const [state, setState] = useSetState({
    loungeList: [],
    categoryList: [],
    search: "",
    currentPage: 1,
    previous: null,
    next: null,
    deleteId: null,
    submitLoading: false,
    loading: false,
    token: "",
  });

  const [group, setGroup] = useState(null);

  const debouncedSearch = useDebounce(state.search, 500);

  useEffect(() => {
    const Group = localStorage?.getItem("group");
    const token = localStorage?.getItem("zentoken");

    if (Group) {
      setGroup(Group);
    }

    if (token) {
      setState({ token });
    }

    setIsLoading(false); // Set loading to false after checking

    getLoungeList(state.currentPage);
    getCategoryList();
  }, []);

  useEffect(() => {
    getLoungeList(state.currentPage);
  }, [debouncedSearch, state.lounge_type, state.start_date, state.end_date]);


  const getLoungeList = async (page) => {
    try {
      setState({ loading: true });
      let pages = 1;
      let body = bodyData();
      if (objIsEmpty(body)) {
        pages = page;
      } else {
        pages = 1;
      }
      const res = await Models.session.list(pages, body);
      setState({
        loungeList: res?.results,
        next: res.next,
        previous: res.previous,
        currentPage: pages,
        loading: false,
      });
    } catch (error) {
      setState({ loading: false });
      console.log("error: ", error);
    }
  };

  const bodyData = () => {
    let body = {};
    if (state.search) {
      body.search = state.search;
    }
    if (state.start_date) {
      body.start_date = moment(state.start_date).format("YYYY-MM-DD");
    }
    if (state.end_date) {
      body.end_date = moment(state.end_date).format("YYYY-MM-DD");
    }
    if (state.lounge_type) {
      body.lounge_type = state.lounge_type?.value;
    }
    return body;
  };

  const getCategoryList = async () => {
    try {
      setState({ loading: true });
      const res = await Models.category.list();
      const dropdowns = Dropdown(res?.results, "name");
      setState({ categoryList: dropdowns, loading: false });
    } catch (error) {
      setState({ loading: false });
      console.log("error: ", error);
    }
  };


  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.jsx"
        strategy="afterInteractive"
      />
      
      {isLoading ? (
        // Show loading spinner or skeleton while checking auth
        <div className="flex md:min-h-[70vh] min-h-[60vh] w-full items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : state.token ? (
        group == "Admin" ? (
          <Dashboard />
        ) : (
          <Calendar />
        )
      ) : (
        <div className="flex md:min-h-[70vh] min-h-[60vh] w-full items-center justify-center md:p-6">
          <LoginForm isRefresh={true} />
        </div>
      )}
    </>
  );
};

export default App;