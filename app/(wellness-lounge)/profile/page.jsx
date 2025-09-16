"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Models from "@/imports/models.import";
import { useSetState } from "@/utils/function.utils";
import moment from "moment";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/dataTable";
import { Label } from "@radix-ui/react-dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthData, setAuthData } from "@/store/slice/AuthSlice";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../../../components/ui/dialog";
import Link from "next/link";
import ProtectedRoute from "@/components/common-components/privateRouter";
import { Loader } from "lucide-react";
import { AYURVEDIC_LOUNGE } from "@/utils/constant.utils";

const ProfilePage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const tokens = useSelector((state) => state.auth.tokens);
  const groups = useSelector((state) => state.auth.groups);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [state, setState] = useSetState({
    userData: [],
    id: null,
    group: null,
    logoutLoading: false,
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const storedToken = localStorage.getItem("zentoken");
      const storedGroup = localStorage.getItem("group");
      if (storedToken && storedGroup) {
        dispatch(setAuthData({ tokens: storedToken, groups: storedGroup }));
      }
    }
  }, [isClient, dispatch]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ID = localStorage.getItem("userId");
      const Group = localStorage.getItem("group");
      setState({ id: ID, group: Group });
    }
  }, []);

  useEffect(() => {
    if (state?.id) {
      getDetails();
      orderList(1);
    }
  }, [state?.id]); // Fetch details when the user ID is available

  const getDetails = async () => {
    try {
      if (state?.id) {
        console.log("Fetching user details for ID:", state?.id);
        const res = await Models.user.getUserId(state?.id);
        console.log("User details fetched:", res);
        setState({
          userData: res,
        });
      }
    } catch (error) {
      console.log("Error fetching user details: ", error);
    }
  };
  console.log("✌️state?.id --->", state?.id);

  const orderList = async (page) => {
    try {
      if (state?.id) {
        const body = {
          user: state?.id,
        };
        const res = await Models.session.registrationList(page, body);
        console.log("orderList:", res);
        setState({
          orderList: res?.results,
          next: res.next,
          previous: res.previous,
          currentPage: page,
        });
      }
    } catch (error) {
      console.log("Error fetching user details: ", error);
    }
  };

  const handleLogout = async () => {
    try {
      setState({ logoutLoading: true });
      const refresh = localStorage.getItem("refreshToken");

      const body = {
        refresh,
      };
      const res = await Models.auth.logOut(body);
      setState({ logoutLoading: false });

      localStorage.removeItem("zentoken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("group");
      localStorage.removeItem("eventId");
      localStorage.removeItem("username");
      localStorage.clear();
      document.cookie = "";
      setDialogOpen(false);
      router.push("/login");
      window.location.reload();
      dispatch(clearAuthData());
    } catch (error) {
      setState({ logoutLoading: false });

      console.log("✌️error --->", error);
    }
  };

  // Cancel function to close the dialog without performing any action
  const handleCancel = () => {
    setDialogOpen(false);
    window?.location?.reload();
  };

  const handleNextPage = () => {
    if (state.next) {
      const newPage = state.currentPage + 1;
      orderList(newPage);
    }
  };

  const handlePreviousPage = () => {
    if (state.previous) {
      const newPage = state.currentPage - 1;
      orderList(newPage);
    }
  };

  const columns = [
    {
      Header: "Order ID",
      accessor: "registration_id",
      Cell: ({ row }) => {
        console.log("✌️row --->", row);

        return (
          <Link
            href={
              row?.event?.lounge_type?.id == AYURVEDIC_LOUNGE
                ? `/view-paid-order?id=${row?.id}`
                : `/view-order?id=${row?.id}`
            }
            className="pointer"
            prefetch={true}
          >
            {row?.registration_id}
          </Link>
        );
      },
    },
    {
      Header: "Lounge",
      accessor: "event_title",
      Cell: (row) => <Label>{row?.row?.event?.title}</Label>,
    },
    {
      Header: "Order Status",
      accessor: "registration_status",
    },
    {
      Header: "Registration Date",
      accessor: "registration_date",
      Cell: (row) => (
        <Label>
          {moment(row?.row?.registration_date).format("DD-MM-YYYY")}
        </Label>
      ),
    },
  ];

  return (
    <div className="container mx-auto flex items-center">
      <div className="w-full">
        {/* <div className="flex justify-between items-center">
          <div className="font-bold text-lg mb-3">Profile</div>
        </div> */}
        <div className="flex justify-between items-center w-[100%]">
          <Tabs
            defaultValue="profile"
            className="lg:flex lg:gap-20 gap-4 w-[100%]"
          >
            <TabsList className="flex lg:flex-col flex-row lg:w-[20%] w-[100%] h-[100%] overflow-scroll sm:overflow-hidden sm:justify-center justify-start pl-5 lg:space-y-2 space-y-0  lg:space-x-0 space-x-2 lg:p-5 p-2">
              <TabsTrigger
                value="profile"
                className="w-[100%] p-2  md:text-md text-sm lg:justify-start"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="w-[100%] p-2 md:text-md text-sm lg:justify-start"
              >
                Orders
              </TabsTrigger>
              <TabsTrigger
                value="change-password"
                className="w-[100%] p-2 md:text-md text-sm lg:justify-start"
                onClick={() => router?.push("/change-password-confirm")}
              >
                Change Password
              </TabsTrigger>
              <TabsTrigger
                value="logout"
                className="w-[100%] p-2 md:text-md text-sm lg:justify-start"
                onClick={() => setDialogOpen(true)}
              >
                Logout
              </TabsTrigger>
            </TabsList>
            <div className="lg:flex-1 lg:w-[75%] w-[100%]">
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    {/* <CardDescription>
                      Make changes to your account here. Click save when you're done.
                    </CardDescription> */}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="lg:w-1/2 w-[100%]">
                        <div className="flex justify-between items-center">
                          <div className="flex justify-between gap-2">
                            {/* <div>
                              {state?.userData?.profile_picture ? (
                                <img
                                  src={state?.userData?.profile_picture}
                                  alt="profile"
                                  className="w-[70px] h-[70px] rounded"
                                />
                              ) : (
                                <img
                                  src="/assets/images/dummy-profile.jpg"
                                  alt="profile"
                                  className="w-[70px] h-[70px] rounded"
                                />
                              )}
                            </div> */}
                            <div>
                              <h2 className="mt-2 scroll-m-20 text-xl font-[500] tracking-tight transition-colors first:mt-0">
                                {state?.userData.first_name}{" "}
                                {state?.userData.last_name}
                              </h2>
                              <blockquote className="italic">
                                {state?.userData?.group?.name}
                              </blockquote>
                            </div>
                          </div>
                        </div>
                        <div>
                          <ul className="my-6  [&>li]:mt-2">
                            {state?.userData?.email && (
                              <li>Email: {state?.userData?.email}</li>
                            )}
                            {state?.userData?.phone_number && (
                              <li>
                                Phone Number: {state?.userData?.phone_number}
                              </li>
                            )}
                            {state?.userData?.date_of_birth && (
                              <li>
                                Date of Birth: {state?.userData?.date_of_birth}
                              </li>
                            )}
                            {state?.userData?.address && (
                              <li>
                                Address: {state?.userData?.address},
                                {state?.userData?.country?.name}{" "}
                              </li>
                            )}
                            {state?.userData?.department && (
                              <li>Department: {state?.userData?.department}</li>
                            )}
                            {state?.userData?.year_of_entry && (
                              <li>
                                Year of Entry: {state?.userData?.year_of_entry}
                              </li>
                            )}
                            {state?.userData?.intrested_topics?.length > 0 && (
                              <li>
                                <div>Interested in Topics:</div>{" "}
                                {state.userData.intrested_topics.map(
                                  (item, index) => {
                                    const topicText =
                                      item.topic === "Others"
                                        ? `Others ${
                                            state?.userData?.lable &&
                                            `(${state?.userData?.lable})`
                                          }`
                                        : item.topic;
                                    return (
                                      <span key={item.id}>
                                        {topicText}
                                        {index <
                                        state.userData.intrested_topics.length -
                                          1
                                          ? ", "
                                          : ""}
                                      </span>
                                    );
                                  }
                                )}
                              </li>
                            )}

                            {/* {state?.userData?.intrested_topics?.length > 0 && (
                              <li>
                                Intrested in Topics:{" "}
                                {state?.userData?.intrested_topics
                                  ?.map((topic) => topic?.topic)
                                  .join(", ")}
                              </li>
                            )} */}

                            {state?.userData?.university && (
                              <li>
                                University: {state?.userData?.university.name}
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                      <div className="lg:w-1/2 w-[100%] md:block hidden">
                        {state?.userData?.profile_picture ? (
                          <img
                            src={state?.userData?.profile_picture}
                            alt="thumbnail"
                            // className="w-[100] h-[100]"
                            className="w-[200px] h-[200px]"
                            style={{
                              objectFit: "cover",
                              borderRadius: "10px",
                              objectPosition: "top",
                            }}
                          />
                        ) : (
                          <img
                            src="/assets/images/dummy-profile.jpg"
                            alt="thumbnail"
                            // className="w-[100] h-[100]"
                            className="w-[200px] h-[200px]"
                            style={{
                              objectFit: "cover",
                              borderRadius: "10px",
                              objectPosition: "top",
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div>
                      <Button
                        className="bg-themeGreen hover:bg-themeGreen"
                        onClick={() =>
                          router.push(`/update-user/?id=${state?.userData.id}`)
                        }
                      >
                        Edit Profile
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle>Orders</CardTitle>
                    {/* <CardDescription>
                      Change your password here. After saving, you'll be logged out.
                    </CardDescription> */}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(state?.orderList ?? []).length > 0 ? (
                      <div>
                        <div className="rounded-lg border">
                          <DataTable
                            columns={columns}
                            data={state?.orderList ?? []}
                          />
                        </div>
                      </div>
                    ) : (
                      "No Orders"
                    )}
                  </CardContent>
                  <div className="mt-5 mb-5 flex justify-center gap-3">
                    <Button
                      disabled={!state.previous}
                      onClick={handlePreviousPage}
                      className={`btn ${
                        !state.previous
                          ? "btn-disabled bg-themeGreen"
                          : "bg-themeGreen hover:bg-themeGreen"
                      }`}
                    >
                      Prev
                    </Button>
                    <Button
                      disabled={!state.next}
                      onClick={handleNextPage}
                      className={`btn ${
                        !state.next
                          ? "btn-disabled bg-themeGreen"
                          : "bg-themeGreen hover:bg-themeGreen"
                      }`}
                    >
                      Next
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* <TabsContent value="change-password">
                <Card>
                  <CardHeader>
                    <CardTitle>Change-password</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex justify-between gap-2">
                        <div>
                          {state?.userData?.profile_picture ? (
                            <img
                              src={state?.userData?.profile_picture}
                              alt="profile"
                              className="w-[70px] h-[70px] rounded"
                            />
                          ) : (
                            <img
                              src="/assets/images/dummy-profile.jpg"
                              alt="profile"
                              className="w-[70px] h-[70px] rounded"
                            />
                          )}
                        </div>
                        <div>
                          <h2 className="mt-10 scroll-m-20 text-xl font-[500] tracking-tight transition-colors first:mt-0">
                            {state?.userData.username}
                          </h2>
                          <blockquote className="italic">
                            {state?.userData?.group?.name}
                          </blockquote>
                        </div>
                      </div>
                      <div>
                        <img
                          src="/assets/images/placeholder.jpg"
                          alt="thumbnail"
                          className="w-[300px] h-50"
                        />
                      </div>
                    </div>
                    <div>

                      <ul className="my-6  [&>li]:mt-2">
                        {state?.userData?.email && (
                          <li>Email: {state?.userData?.email}</li>
                        )}
                        {state?.userData?.phone_number && (
                          <li>Phone Number: {state?.userData?.phone_number}</li>
                        )}
                        {state?.userData?.date_of_birth && (
                          <li>Date of Birth: {state?.userData?.date_of_birth}</li>
                        )}
                        {state?.userData?.address && (
                          <li>Address: {state?.userData?.address},{state?.userData?.country?.name} </li>
                        )}
                        {state?.userData?.department && (
                          <li>Department: {state?.userData?.department}</li>
                        )}
                        {state?.userData?.year_of_entry && (
                          <li>Year of Entry: {state?.userData?.year_of_entry}</li>
                        )}
                        {state?.userData?.intrested_topics && (
                          <li>Interested in Topics: {state?.userData?.intrested_topics}</li>
                        )}
                        {state?.userData?.university && (
                          <li>University: {state?.userData?.university.name}</li>
                        )}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div>
                      <Button
                        onClick={() =>
                          router.push(`/update-user/?id=${state?.userData.id}`)
                        }
                      >
                        Edit Profile
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent> */}

              {/* <TabsContent value="logout">
                <Card>

                  <CardContent className="space-y-2 pt-4">
                    <div className="flex justify-between items-center">
                      <div className="flex justify-between gap-2">
                        <div>
                          {state?.userData?.profile_picture ? (
                            <img
                              src={state?.userData?.profile_picture}
                              alt="profile"
                              className="w-[70px] h-[70px] rounded"
                            />
                          ) : (
                            <img
                              src="/assets/images/dummy-profile.jpg"
                              alt="profile"
                              className="w-[70px] h-[70px] rounded"
                            />
                          )}
                        </div>
                        <div>
                          <h2 className="mt-10 scroll-m-20 text-xl font-[500] tracking-tight transition-colors first:mt-0">
                            {state?.userData.username}
                          </h2>
                          <blockquote className="italic">
                            {state?.userData?.group?.name}
                          </blockquote>
                        </div>
                      </div>

                    </div>
                    <div className="pt-[30px]">
                      <p className="text-lg font-semibold">Confirm Logout</p>
                      <div className="mb-4">Are you sure you want to log out?</div>
                      <div className="flex justify-end gap-4">

                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Button onClick={handleLogout} className="px-4 py-2 text-white rounded text-sm">Confirm</Button>
                    </div>
                  </CardContent>

                </Card>
              </TabsContent> */}

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-white p-6 rounded-lg md:w-96 w-full ">
                  <DialogTitle className="text-lg font-semibold">
                    Confirm Logout
                  </DialogTitle>
                  <div className="mb-4">Are you sure you want to log out?</div>
                  <div className="flex justify-end gap-4">
                    <Button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-themePurple hover:bg-themePurple rounded text-sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleLogout}
                      className="px-4 py-2 bg-themeGreen hover:bg-themeGreen text-white rounded text-sm"
                    >
                      {state.logoutLoading ? <Loader /> : "Confirm"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </Tabs>
        </div>
        {/* 
        <div className="grid auto-rows-min gap-4 md:grid-cols-2">
          <div className="border rounded-xl p-4 gap-4 flex flex-col ">
            <div className="flex justify-between items-center">
              <div className="flex justify-between gap-2">
                <div>
                  {state?.userData?.profile_picture ? (
                    <img
                      src={state?.userData?.profile_picture}
                      alt="profile"
                      className="w-[70px] h-[70px] rounded"
                    />
                  ) : (
                    <img
                      src="/assets/images/dummy-profile.jpg"
                      alt="profile"
                      className="w-[70px] h-[70px] rounded"
                    />
                  )}
                </div>
                <div>
                  <h2 className="mt-10 scroll-m-20 text-xl font-[500] tracking-tight transition-colors first:mt-0">
                    {state?.userData.username}
                  </h2>
                  <blockquote className="italic">
                    {state?.userData?.group?.name}
                  </blockquote>
                </div>
              </div>
              <div>
                <Button
                  onClick={() =>
                    router.push(`/update-user/?id=${state?.userData.id}`)
                  }
                >
                  Edit Profile
                </Button>
              </div>
            </div>
            <div>
              <ul className="my-6 ml-6 [&>li]:mt-2">
                {state?.userData?.email && (
                  <li>Email: {state?.userData?.email}</li>
                )}
                {state?.userData?.phone_number && (
                  <li>Phone Number: {state?.userData?.phone_number}</li>
                )}
                {state?.userData?.date_of_birth && (
                  <li>Date of Birth: {state?.userData?.date_of_birth}</li>
                )}
                {state?.userData?.address && (
                  <li>Address: {state?.userData?.address},{state?.userData?.country?.name} </li>
                )}
                {state?.userData?.department && (
                  <li>Department: {state?.userData?.department}</li>
                )}
                {state?.userData?.year_of_entry && (
                  <li>Year of Entry: {state?.userData?.year_of_entry}</li>
                )}
                {state?.userData?.intrested_topics && (
                  <li>Interested in Topics: {state?.userData?.intrested_topics}</li>
                )}
                {state?.userData?.university && (
                  <li>University: {state?.userData?.university.name}</li>
                )}
              </ul>
            </div>
          </div>

          <div className="border rounded-xl p-4 gap-4 justify-center items-center flex flex-col ">
            <img
              src="/assets/images/placeholder.jpg"
              alt="thumbnail"
              className="w-[300px] h-50"
            />
          </div>
        </div>

        {
          (state?.userData?.event_registrations ?? []).length > 0 && (
            <div className="border rounded-xl p-4 gap-4 mt-5 flex flex-col ">
              <h1 className="font-[500]">Registered Events</h1>

              <div className="rounded-lg border">
                <DataTable
                  columns={columns}
                  data={state?.userData?.event_registrations ?? []}
                />
              </div>
            </div>
          )
        } */}
      </div>
    </div>
  );
};

export default ProtectedRoute(ProfilePage);
