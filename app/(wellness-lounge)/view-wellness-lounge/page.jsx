"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Models from "@/imports/models.import";
import { useSetState } from "@/utils/function.utils";
import { useRouter, useSearchParams } from "next/navigation";
import moment from "moment";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { Failure, InfinitySuccess, Success } from "@/components/common-components/toast";
import { Loader, Loader2Icon, LoaderIcon } from "lucide-react";
import ProtectedRoute from "@/components/common-components/privateRouter";


const viewWellnessLounge = () => {

  const router = useRouter();
  const searchParams = useSearchParams();
  const [id, setId] = useState(null);
  const [state, setState] = useSetState({
    orderData: null, // Ensure this is null initially
    isOpen: false,
    group: null,
    loading: false,
    btnLoading: false,
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
    }
  }, [id]);

  const getDetails = async () => {
    setState({ loading: true }); // Start loading

    try {
      const res = await Models.session.details(id);
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
                  style={{height:"600px",objectFit: "cover"}}
                />
                ) : (<p style={{width:"100%", height:"100%", display:"flex", justifyContent:"center", alignItems:"center"}}>No image uploaded</p>)}
               
              </div>
              <div className="border rounded-xl p-4 flex flex-col">
                <h2 className="mt-10 scroll-m-20 text-2xl font-[500] tracking-tight transition-colors first:mt-0">
                  {state?.orderData.title} -{" "}
                  {state?.orderData?.lounge_type?.name}
                </h2>
                <blockquote className="mt-4 border-l-[5px] border-fuchsia-900 pl-6 italic bg-fuchsia-100 py-4">
                  Event Start Date and Time:{" "}
                  <span className="font-bold text-gray-700">
                    {moment(state?.orderData.start_date).format("YYYY-MMM-DD")},{" "}
                    {state?.orderData.start_time}
                  </span>{" "}
                  End Date and Time:{" "}
                  <span className="font-bold text-gray-700">
                    {moment(state?.orderData.end_date).format("YYYY-MMM-DD")},{" "}
                    {state?.orderData.end_time}
                  </span>
                </blockquote>

                <p className="leading-8 text-[18px] [&:not(:first-child)]:mt-4">
                  {state?.orderData?.description}
                </p>

                <p className="pt-5 md:text-[20px] text-[18px]">
                  Session Link:{" "}
                  {state?.orderData?.session_link ? (
                    <Link
                      prefetch={true}
                      href={state?.orderData.session_link}
                      className="text-fuchsia-900"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Join Meeting
                    </Link>
                  ) : (
                    " No session link available"
                  )}
                </p>

                {(state?.group === "Student" && state?.orderData?.is_registered === false)?  (
                  <div>
                    <Button
                      className={`mt-3 ${
                        state?.orderData?.is_registered
                          ? "bg-themeGreen hover:bg-themeGreen"
                          : "bg-themePurple hover:bg-themePurple"
                      }`}
                      onClick={() => setState({ isOpen: true })}
                    >
                      Enroll
                    </Button>
                  </div>
                ) : <div>
                    <Button
                    style={{cursor:"not-allowed"}}
                      className={`mt-3 ${
                        state?.orderData?.is_registered
                          ? "bg-themeGreen hover:bg-themeGreen"
                          : "bg-themePurple hover:bg-themePurple"
                      }`}
                      // onClick={() => setState({ isOpen: true })}
                    >
                     <span style={{color: "white",fontSize:"22px"}}>✓</span> Already Enrolled <span style={{color:" #88c742"}}></span>

                    </Button>
                  </div>}
              </div>
            </div>

            <Dialog open={state?.isOpen} onOpenChange={closeDialog}>
              <DialogContent className="bg-white p-6 rounded-lg w-96">
                <DialogTitle className="text-lg font-semibold mb-2">
                  You want to enroll in this event?
                </DialogTitle>
                <div className="flex justify-between gap-2">
                  <Button
                    onClick={closeDialog}
                    className="p-2 bg-themePurple hover:bg-themePurple rounded text-white w-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmOrder}
                    className="w-full bg-themeGreen hover:bg-themeGreen p-2 rounded text-white"
                  >
                    {state.btnLoading ? <Loader /> : "Confirm"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )
      )}
    </div>
  );
}


export default ProtectedRoute(viewWellnessLounge);
