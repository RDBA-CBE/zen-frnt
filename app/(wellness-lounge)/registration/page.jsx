"use client";

import StudentRegistrationForm from "@/components/ui/student-registration-form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dropdown, useSetState } from "@/utils/function.utils";
import { CheckboxDemo } from "@/components/common-components/checkbox";
import AlumniRegistrationForm from "@/components/ui/alumni-registration-form";
import CounselorRegForm from "@/components/ui/counselor-reg-form";

import { ROLE } from "@/utils/constant.utils";
import { Loader, Loader2 } from "lucide-react";
import { useEffect } from "react";
import Models from "@/imports/models.import";

export default function studentRegistration() {
  const [state, setState] = useSetState({
    role: "",
    countryList: [],
    universityList: [],
    intrestedTopicsList: [],
    loading: false,
    currentInterestPage: 1,
  });

  useEffect(() => {
    getUniversity();
    getIntrestedTopics(1);
    getCountry();
  }, []);

  const getUniversity = async () => {
    try {
      setState({ loading: true });
      const res = await Models.auth.getUniversity();
      const Dropdowns = Dropdown(res, "name");
      setState({ universityList: Dropdowns, loading: false });
    } catch (error) {
      console.log("error", error);
    }
  };

  const getIntrestedTopics = async (page=1) => {
      try {
        const res = await Models.auth.getIntrestedTopics(page);
        const Dropdownss = Dropdown(res?.results, "topic");
        const filter = Dropdownss?.filter((item) => item?.label !== "");
  
        setState({ intrestedTopicsList: filter,
          hasMoreInterest:res?.next
         });
        console.log("res", res);
      } catch (error) {
        console.log(error);
      }
    };
  
    
  
    const interestedListLoadMore = async () => {
      console.log("hello");
      
      try {
        if (state.hasMoreInterest) {
          console.log("hasMoreInterest");
          const res = await Models.auth.getIntrestedTopics(state.currentInterestPage+1);
          const Dropdownss = Dropdown(res?.results, "topic");
          const filter = Dropdownss?.filter((item) => item?.label !== "");
  
          setState({
            intrestedTopicsList: [...state.intrestedTopicsList, ...filter],
            hasMoreInterest: res?.next,
            currentInterestPage: state.currentInterestPage + 1,
          });
        } else {
          setState({ intrestedTopicsList: state.intrestedTopicsList });
        }
      } catch (error) {
              console.log('error: ', error);
      }
    };

  const getCountry = async () => {
    try {
      setState({ loading: true });

      const res = await Models.auth.getCountries();
      const Dropdowns = Dropdown(res?.results, "name");
      setState({ countryList: Dropdowns, loading: false });
    } catch (error) {
      console.log("error");
    }
  };

  return (
    <div className="flex md:min-h-[70vh] min-h-[60vh] w-full items-center  md:p-6 pb-5 md:pb-0">
      <div className="flex items-center justify-center w-full">
        <Card className="lg:w-[800px] md:600px sm:w-[100%] w-[100%]">
          <CardHeader>
            <CardTitle className="text-xl">
              {" "}
              <h2 className="font-semibold">Registration</h2>{" "}
            </CardTitle>
            <CardDescription>
              Update your account information here. Be sure to save your changes
              once you&lsquo;re finished.
            </CardDescription>
            <div className="flex gap-5 pt-5 flex-col md:flex-row">
              {ROLE?.map((item) => (
                <CheckboxDemo
                  key={item.value}
                  label={item.name}
                  value={item.value}
                  selectedValues={
                    state.role === item.value
                      ? [{ value: item.value, label: item.name }]
                      : []
                  }
                  onChange={(newSelectedValues) => {
                    const selected = newSelectedValues?.[0]?.value || "";
                    console.log("✌️ Selected Value --->", selected);
                    setState({ role: selected });
                  }}
                  isMulti={false}
                  className={" text-lg"}
                />
              ))}
            </div>
            {/* {state.loading ? (
              <div className="w-full items-center justify-center flex">
              <Loader />
              </div>
            ) :  */}

            {state.role === "student" ? (
              <StudentRegistrationForm
                intrestedTopicsList={state.intrestedTopicsList}
                universityList={state.universityList}
              />
            ) : state.role === "alumni" ? (
              <AlumniRegistrationForm
                countryList={state.countryList}
                intrestedTopicsList={state.intrestedTopicsList}
                universityList={state.universityList}
              />
            ) : state.role === "counselor" ? (
              <CounselorRegForm
                countryList={state.countryList}
                intrestedTopicsList={state.intrestedTopicsList}
                universityList={state.universityList}
              />
            ) : null}
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
