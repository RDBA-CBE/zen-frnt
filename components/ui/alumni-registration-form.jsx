"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Dropdown, useSetState } from "@/utils/function.utils";
import Models from "@/imports/models.import";
import { Failure, Success } from "../common-components/toast";
import CustomSelect from "../common-components/dropdown";
import { mentorList } from "@/utils/constant.utils";
import TextArea from "../common-components/textArea";
import * as Yup from "yup";
import * as Validation from "@/utils/validation.utils";
import { TextInput } from "../common-components/textInput";


const AlumniRegistrationForm = () => {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false); // Track mounting state

    const [state, setState] = useSetState({
        username: "",
        email: "",
        password: "",
        phone_number: "",
        address: "",
        date_of_birth: "",
        university: null,
        intrested_topics: null,
        intrested_topics1: "",
        is_alumni: false,
        year_of_entry: "",
        department: "",
        intrestedTopicsList: null,
        universityList: null,
        alumniUsername: "",
        alumniEmail: "",
        alumniPhone: "",
        alumniDepartment: "",
        work: "",
        country: "",
        is_open_to_be_mentor: false,
        alumniUniversity: null,
        alumniIntrested_topics: null,
        alumniIntrested_topics1: "",
        year_of_graduation: "",
        alumniPassword: ""

    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            setIsMounted(true); // Ensure component is only rendered on client
            getUniversity();
            getIntrestedTopics();
            getCountry();
        }
    }, []);

    const getUniversity = async () => {
        try {
            const res = await Models.auth.getUniversity();
            const Dropdowns = Dropdown(res?.results, "name");
            setState({ universityList: Dropdowns });
            console.log("res", res);
        } catch (error) {
            console.log("error", error);
        }
    };

    const getIntrestedTopics = async () => {
        try {
            const res = await Models.auth.getIntrestedTopics();
            const Dropdowns = Dropdown(res?.results, "topic");

            const updatedDropdowns = [
                ...Dropdowns,
                { label: "Others", value: "others" }
            ];

            setState({ intrestedTopicsList: updatedDropdowns });
            console.log("res", res);
        } catch (error) {
            console.log(error);
        }
    };

    const getCountry = (async () => {
        try {
            const res = await Models.auth.getCountries();
            const Dropdowns = Dropdown(res?.results, "name");
            setState({ countryList: Dropdowns })
            console.log("res", res)
        } catch (error) {
            console.log("error")
        }
    })

    // 🚀 Prevent hydration errors by ensuring the component renders only after mount
    if (!isMounted) return null;

    const StudentRegistration = async () => {

        try {
            const body = {
                username: state?.username,
                email: state?.email,
                department: state?.department,
                year_of_entry: state?.year_of_entry,
                password: state?.password,
                intrested_topics: state?.intrested_topics?.label == "Others" ? state?.intrested_topics1 : state?.intrested_topics?.label, // Ensure this is an array or null
                university: state?.university?.value || "", // Safely access university value
                is_alumni: false
            };

            await Validation.studentRegistration.validate(body, {
                abortEarly: false,
            });
            const res = await Models.auth.registration(body);
            Success("Registration successfully");

        } catch (error) {
            console.log("error", error)
            if (error instanceof Yup.ValidationError) {
                const validationErrors = {};
                error.inner.forEach((err) => {
                    validationErrors[err.path] = err?.message;
                });
                console.log("validationErrors: ", validationErrors);

                setState({
                    errors: validationErrors,
                    submitLoading: false
                });
            } else {
                // If it's neither a custom error nor a validation error, just stop loading
                setState({ submitLoading: false });
            }
        }
    };


    const AlumniRegistration = async () => {

        try {
            const body = {
                username: state?.alumniUsername,
                email: state?.alumniEmail,
                phone_number: state?.alumniPhone,
                department: state?.alumniDepartment,
                work: state?.work,
                country: state?.country?.value,
                address: state?.address,
                year_of_graduation: state?.year_of_graduation,
                password: state?.alumniPassword,
                intrested_topics: state?.alumniIntrested_topics?.label == "Others" ? state?.alumniIntrested_topics1 : state?.alumniIntrested_topics?.label, // Ensure this is an array or null
                alumniUniversity: state?.alumniUniversity?.value || "", // Safely access university value
                is_open_to_be_mentor: state?.is_open_to_be_mentor?.value == "Yes" ? true : false,
                is_alumni: true
            };

            await Validation.AlumniRegistration.validate(body, {
                abortEarly: false,
            });

            const res = await Models.auth.registration(body);
            Success("Registration successfully");
            router?.push("/")
        } catch (error) {
            console.log("error", error)

            if (error instanceof Yup.ValidationError) {
                const validationErrors = {};
                error.inner.forEach((err) => {
                    validationErrors[err.path] = err?.message;
                });

                console.log("validationErrors: ", validationErrors);

                // Set validation errors in state
                setState({ errors: validationErrors });
                setState({ submitLoading: false }); // Stop loading after error
            } else {
                setState({ submitLoading: false }); // Stop loading after unexpected error
                if (error?.email) {
                    Failure(error.email[0])
                } else if (error?.password) {
                    Failure(error.password[0])
                } else {
                    Failure("An error occurred. Please try again.");

                }
            }
        }

    };

    console.log("state?.errors")

    return (
        <div className="flex items-center justify-center w-full">



            <Card className="lg:w-[800px] md:600px sm:w-[100%] w-[100%]">
                <CardHeader>
                    <CardTitle>Alumni Registration</CardTitle>
                    <CardDescription>
                        Update your account information here. Be sure to save your changes once you're finished.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <TextInput
                                id="alumniUsername"
                                type="text"
                                placeholder="Enter Your Name"
                                title="User Name"
                                required
                                value={state.alumniUsername}
                                onChange={(e) => setState({ alumniUsername: e.target.value })}
                                error={state?.errors?.username}
                            />
                        </div>

                        <div className="space-y-1">
                            <TextInput
                                id="alumniEmail"
                                type="email"
                                placeholder="user@gmail.com"
                                required
                                title="E-Mail"
                                value={state.alumniEmail}
                                onChange={(e) => setState({ alumniEmail: e.target.value })}
                                error={state?.errors?.email}
                            />
                        </div>

                        <div className="space-y-1">
                            <TextInput
                                id="alumniPhone"
                                type="tel"
                                placeholder="enter 10 digit number"
                                required
                                title="Phone Number"
                                value={state.alumniPhone}
                                onChange={(e) => setState({ alumniPhone: e.target.value })}
                                error={state?.errors?.phone_number}
                            />
                        </div>

                        <div className="space-y-1">
                            <TextInput
                                id="alumniDepartment"
                                type="text"
                                placeholder="Enter Your Department Name"
                                title="Department"
                                value={state.alumniDepartment}
                                onChange={(e) => setState({ alumniDepartment: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1">
                            {/* <DatePicker
                                        placeholder="Select Year"
                                        selectedDate={state.year_of_entry}
                                        onChange={(date: any) => {
                                            setState({
                                                year_of_entry: date,
                                            });
                                        }}
                                        error={state.errors?.year_of_entry}
                                        required
                                    /> */}
                            <TextInput
                                id="year_of_graduation"
                                type="text"
                                placeholder="Enter Year of Graduated"
                                title="Year Graduated"
                                value={state.year_of_graduation}
                                onChange={(e) => setState({ year_of_graduation: e.target.value })}
                            />

                        </div>

                        <div className="space-y-1">
                            <TextInput
                                id="work"
                                type="text"
                                placeholder="Enter Your Work"
                                title="Work"
                                value={state.work}
                                onChange={(e) => setState({ work: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1">
                            <CustomSelect
                                options={state?.countryList || []} // Safely pass empty array if universityList is null
                                value={state.country?.value || ""}
                                onChange={(value) => setState({ country: value })}
                                error={state.errors?.country}
                                title="country"
                                placeholder="Select Your Country"
                            />
                        </div>

                        <div className="space-y-1">

                            <TextArea
                                placeholder="Enter Your address"
                                title="Address"

                                value={state.address}
                                onChange={(e) => setState({ address: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1">
                            <CustomSelect
                                options={state?.universityList || []} // Safely pass empty array if universityList is null
                                value={state.alumniUniversity?.value || ""}
                                onChange={(value) => setState({ alumniUniversity: value })}
                                error={state.errors?.alumniUniversity}

                                placeholder="Select University"
                                title="University"
                            />
                        </div>

                        <div className="space-y-1">
                            <CustomSelect
                                options={state.intrestedTopicsList || []} // Safely pass empty array if intrestedTopicsList is null
                                value={state.alumniIntrested_topics?.value || ""}
                                onChange={(value) => setState({ alumniIntrested_topics: value })}
                                error={state.errors?.alumniIntrested_topics}

                                placeholder="Select Topics"
                                title="Interests in Topics"
                            />
                        </div>
                        {
                            state.alumniIntrested_topics?.value == "others" &&
                            <div className="space-y-1">

                                <TextInput
                                    id="alumniIntrested_topics1"
                                    type="text"
                                    placeholder="Enter Your Intrested Topics"

                                    value={state.alumniIntrested_topics1}
                                    onChange={(e) => setState({ alumniIntrested_topics1: e.target.value })}
                                    title="Interests in Topics"
                                />
                            </div>
                        }


                        <div className="space-y-1">
                            <CustomSelect
                                options={mentorList || []} // Safely pass empty array if intrestedTopicsList is null
                                value={state.is_open_to_be_mentor?.value || ""}
                                onChange={(value) => setState({ is_open_to_be_mentor: value })}
                                error={state.errors?.is_open_to_be_mentor}
                                title="Are you open to being a mentor?"
                                placeholder="Select Topics"
                            />
                        </div>
                        <div className="space-y-1">
                            <TextInput
                                id="alumniPassword"
                                type="password"
                                placeholder="Enter Your password"
                                title="Password"
                                required
                                value={state.alumniPassword}
                                onChange={(e) => setState({ alumniPassword: e.target.value })}
                                error={state?.errors?.password}
                            />
                        </div>
                    </div>
                    <div className="flex justify-center gap-2">
                        <Button onClick={() => router?.back()} className="w-full">Cancel</Button>
                        <Button onClick={AlumniRegistration} className="w-full">Submit</Button>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
};

export default AlumniRegistrationForm;
