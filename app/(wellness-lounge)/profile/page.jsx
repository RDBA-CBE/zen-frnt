"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import Models from "@/imports/models.import";
import { useSetState } from "@/utils/function.utils";
import moment from "moment";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/dataTable";
import { Label } from "@radix-ui/react-dropdown-menu";

export default function ProfilePage() {
  const router = useRouter();

  const [state, setState] = useSetState({
    userData: [],
    id: null,
    group: null,
  });

  // Only fetch from localStorage after the component mounts in the client
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Ensure that localStorage is available only on the client-side
      const ID = localStorage.getItem("userId");
      const Group = localStorage.getItem("group");
      setState({ id: ID, group: Group });
    }
  }, []); // This runs only once when the component is mounted

  useEffect(() => {
    if (state?.id) {
      getDetails();
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

  const columns = [
    {
      Header: "Order ID",
      accessor: "registration_id",
    },
    {
      Header: "Order Status",
      accessor: "registration_status",
    },
    {
      Header: "Registration Date",
      accessor: "registration_date",
      Cell: (row) => (
        <Label>{moment(row?.row?.registration_date).format("DD-MM-YYYY")}</Label>
      ),
    },
    {
      Header: "Lounge",
      accessor: "event_title",
      Cell: (row) => <Label>{row?.row?.event_title}</Label>,
    },
  ];

  return (
    <div className="container mx-auto flex items-center">
      <div className="w-full">
        <div className="flex justify-between items-center">
          <div className="font-bold text-lg mb-3">Profile</div>
        </div>

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

        {(state?.userData?.event_registrations ?? []).length > 0 && (
          <div className="border rounded-xl p-4 gap-4 mt-5 flex flex-col ">
            <h1 className="font-[500]">Registered Events</h1>

            <div className="rounded-lg border">
              <DataTable
                columns={columns}
                data={state?.userData?.event_registrations ?? []}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
