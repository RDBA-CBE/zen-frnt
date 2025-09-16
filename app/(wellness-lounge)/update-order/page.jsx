"use client";

import { useEffect, useState } from "react";
import Models from "@/imports/models.import";
import {
  Dropdown,
  UserDropdown,
  formatNumber,
  useSetState,
} from "@/utils/function.utils";

import CustomSelect from "@/components/common-components/dropdown";
import moment from "moment";
import { useRouter, useSearchParams } from "next/navigation";

import * as Yup from "yup";
import * as Validation from "../../../utils/validation.utils";
import { Failure, Success } from "@/components/common-components/toast";
import PrimaryButton from "@/components/common-components/primaryButton";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/dataTable";
import { Label } from "@radix-ui/react-label";
import { orderStatusList } from "@/utils/constant.utils";
import ProtectedRoute from "@/components/common-components/privateRouter";
import LoadMoreDropdown from "@/components/common-components/loadMoreDropdown";

const UpdateOrder = () => {
  const router = useRouter();

  const searchParams = useSearchParams();

  const [id, setId] = useState(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const idFromSearchParams = searchParams.get("id");
      if (idFromSearchParams) {
        setId(idFromSearchParams);
      }
    }
  }, [searchParams]);

  const [state, setState] = useSetState({
    seat_count: 0,
    session_link: "",
    price: 0,
    lounge_type: {},
    end_time: "",
    start_time: "",
    valid_to: "",
    valid_from: "",
    Description: "",
    title: "",
    categoryName: "",
    userList: [],
    user: {},
    loungeList: [],
    event: {},
    registration_status: {},
    thumbnail_image: "",
    errors: {},
    submitLoading: false,
    isBooked: false,
  });

  useEffect(() => {
    if (id) {
      getDetails();
      getUsersList();
      getLoungeList();
    }
  }, [id]);

  const getDetails = async () => {
    try {
      const res = await Models.session.detailsRegistration(id);
      const data = {
        value: res?.user?.id,
        label: res?.user?.first_name + " " + res?.user?.last_name,
      };
      if (res?.slot?.booked) {
        setState({ isBooked: res?.slot?.booked });
      }

      setState({
        user: {
          value: res?.user?.id,
          label: res?.user?.first_name + " " + res?.user?.last_name,
        },
        registration_status: {
          value: res?.registration_status,
          label: res?.registration_status,
        },
        event: {
          value: res?.event?.id,
          label: res?.event?.title,
        },
      });
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const getUsersList = async () => {
    let page = 1;
    let allResults = [];
    let nextPage = true;

    while (nextPage) {
      const res = await Models.user.dropdownUserserList(page);
      allResults = [...allResults, ...(res?.results || [])];

      page += 1;
      nextPage = !!res?.next;
    }
    setState({ userData: allResults });
  };
  const getLoungeList = async () => {
    try {
      const res = await Models.session.dropdownLoungelist();
      const Dropdowns = Dropdown(res, "title");
      setState({ loungeList: Dropdowns, loungeData: res });
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const onSubmit = async () => {
    try {
      setState({ submitLoading: true });
      let body = {
        user: state?.user?.value,
        registration_status: state?.registration_status?.value,
        event: state?.event?.value,
      };

      await Validation.updateSessionOrder.validate(body, {
        abortEarly: false,
      });
      const res = await Models.session.updateRegistration(body, id);
      setState({ submitLoading: false });

      router.push("/order-list");
      Success("Session updated successfully");
    } catch (error) {
      console.log("error", error);

      // If error[0] exists (custom error message like "Registration for event Testing and user Ramesh already exists.")
      if (error[0]) {
        // You can set the custom error message here
        Failure(error[0]);
        setState({
          submitLoading: false,
        });
      }

      // Handle Yup validation errors
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });

        setState({
          errors: validationErrors,
          submitLoading: false,
        });
      } else {
        // If it's neither a custom error nor a validation error, just stop loading
        setState({ submitLoading: false });
      }
    }
  };

  const SelectedUser = state?.userData?.filter(
    (item) => item?.id == state?.user?.value
  );

  const filteredLoungeData = state?.loungeData?.filter(
    (lounge) => lounge?.id == state?.event?.value
  );

  const columns = [
    {
      Header: "Title",
      accessor: "title",
    },
    {
      Header: "Lounge Type",
      accessor: "lounge_type",
      Cell: (row) => <Label>{row?.row?.lounge_type?.name}</Label>,
    },
    {
      Header: "Start Date",
      accessor: "start_date",
      Cell: (row) => (
        <Label>{moment(row?.row?.start_date).format("DD-MM-YYYY")}</Label>
      ),
    },
    {
      Header: "End Date",
      accessor: "end_date",
      Cell: (row) => (
        <Label>{moment(row?.row?.end_date).format("DD-MM-YYYY")}</Label>
      ),
    },
    {
      Header: "Start Time",
      accessor: "start_time",
      Cell: (row) => <Label>{row?.row?.start_time}</Label>,
    },
    {
      Header: "End Time",
      accessor: "end_time",
      Cell: (row) => <Label>{row?.row?.end_time}</Label>,
    },
    {
      Header: "Price",
      accessor: "price",
      Cell: (row) => <Label>{formatNumber(row?.row?.price)}</Label>,
    },

    // {
    //     Header: "Action",
    //     accessor: "action",
    //     Cell: (row: any) => (
    //         <XIcon onClick={setState({lounge: null})}/>
    //     )
    // }
  ];

  const loadUserOptions = async (search, loadedOptions, { page }) => {
    try {
      const res = await Models.user.dropdownUserserList(page); // API should support pagination
      const Dropdowns = UserDropdown(
        res?.results,
        (item) => `${item.first_name} ${item.last_name}`
      );
      return {
        options: Dropdowns,
        hasMore: !!res?.next,
        additional: {
          page: page + 1,
        },
      };
    } catch (error) {
      return {
        options: [],
        hasMore: false,
        additional: {
          page: page,
        },
      };
    }
  };

  return (
    <div className="container mx-auto">
      <h2 className="font-bold md:text-[20px] text-sm mb-3">Update Session</h2>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="border rounded-xl p-4 gap-4 flex flex-col md:col-span-1">
          {/* <CustomSelect
            options={state.userList}
            value={state.user?.value || ""}
            onChange={(value) => setState({ user: value,
               errors:{...state.errors, user:""}
             })}
            title="Select User"
            error={state.errors?.user}
            required
            placeholder="Select User"
          /> */}

          <LoadMoreDropdown
            value={state.user}
            onChange={(value) => {
              setState({
                user: value,
                errors: { ...state.errors, user: "" },
              });
            }}
            title="Select User"
            error={state.errors?.user}
            required
            placeholder="Select User"
            loadOptions={loadUserOptions}
            height={"25px"}
            disabled={state.isBooked}
          />
          <div>
            {SelectedUser?.length > 0 && (
              <>
                <h3 className="text-lg font-medium">User Details:</h3>

                <div className="pl-3 pt-3">
                  <ul className="text-sm">
                    <li className="pb-3">
                      <span className="font-bold text-gray-700">
                        Profile Picture:
                      </span>{" "}
                      {SelectedUser[0]?.profile_picture ? (
                        <img
                          src={SelectedUser[0]?.profile_picture}
                          alt="Profile"
                          className="w-[100px] h-[100px] rounded mt-2"
                          style={{ borderRadius: "15px", objectFit: "cover" }}
                        />
                      ) : (
                        <img
                          src="/assets/images/dummy-profile.jpg"
                          alt="Profile"
                          className="w-[100px] h-[100px] rounded mt-2"
                          style={{ borderRadius: "15px", objectFit: "cover" }}
                        />
                      )}
                    </li>
                    <li className="pb-3">
                      <span className="font-bold text-gray-700">Name:</span>{" "}
                      {SelectedUser[0]?.first_name}{" "}
                      {SelectedUser[0]?.last_name || "N/A"}
                    </li>
                    <li className="pb-3">
                      <span className="font-bold text-gray-700">Email:</span>{" "}
                      {SelectedUser[0]?.email || "N/A"}
                    </li>
                    <li className="pb-3">
                      <span className="font-bold text-gray-700">
                        Contact Number:
                      </span>{" "}
                      {SelectedUser[0]?.phone_number || "N/A"}
                    </li>
                    <li className="pb-3">
                      <span className="font-bold text-gray-700">
                        Date of Birth:
                      </span>{" "}
                      {SelectedUser[0]?.date_of_birth || "N/A"}
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="border rounded-xl p-4 gap-4 flex flex-col md:col-span-2">
          {/* <CustomMultiSelect
                        options={state.loungeList}
                        value={state.event || ""}
                        onChange={(value: any) => setState({ event: value })}
                        title="Select Lounge"
                        error={state.errors?.event}
                        required
                        placeholder="Select Lounge"
                    /> */}
          <CustomSelect
            options={state.loungeList}
            value={state.event?.value || ""}
            onChange={(value) =>
              setState({ event: value, errors: { ...state.errors, event: "" } })
            }
            title="Select Lounge"
            error={state.errors?.event}
            required
            placeholder="Select Lounge"
            disabled={state.isBooked}
          />
          {filteredLoungeData?.length > 0 && (
            <Card
              className=" mt-2 mb-4 p-2 order-table"
              style={{ overflowX: "scroll", scrollbarWidth: "thin" }}
            >
              <DataTable columns={columns} data={filteredLoungeData} />
            </Card>
          )}

          <CustomSelect
            options={orderStatusList}
            value={state.registration_status?.value || ""}
            onChange={(value) =>
              setState({
                registration_status: value,
                errors: { ...state.errors, registration_status: "" },
              })
            }
            title="Select Session Status"
            error={state.errors?.registration_status}
            required
            placeholder="Select Session Status"
            disabled={state.isBooked}
          />

          <div className="flex justify-end gap-5 mt-10">
            {/* <Button variant="outline" className="sm:w-auto lg:w-[100px]">
              Cancel
            </Button>
            <Button
              className="sm:w-auto lg:w-[100px]"
              onClick={() => onSubmit()}
            >
              Submit
            </Button> */}

            <PrimaryButton
              variant={"outline"}
              className="border-themeGreen hover:border-themeGreen text-themeGreen hover:text-themeGreen "
              name="Cancel"
              onClick={() => router.push("/order-list")}
            />

            <PrimaryButton
              name="Submit"
              className="bg-themeGreen hover:bg-themeGreen"
              onClick={() => onSubmit()}
              loading={state.submitLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtectedRoute(UpdateOrder);
