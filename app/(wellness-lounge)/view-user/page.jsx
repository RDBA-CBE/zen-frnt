"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Models from "@/imports/models.import";
import { useSetState } from "@/utils/function.utils";
import moment from "moment";
import { useRouter, useSearchParams } from "next/navigation";
import { DataTable } from "@/components/ui/dataTable";
import { Label } from "@radix-ui/react-dropdown-menu";
import ProtectedRoute from "@/components/common-components/privateRouter";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const FormSection = ({ title, children }) => (
  <div className="mb-3">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-1.5 h-4 bg-[#7f4099] rounded-full" />
      <h4 className="text-xs font-bold uppercase tracking-wider text-[#7f4099]">{title}</h4>
    </div>
    <div className="bg-gray-50 rounded-lg divide-y divide-gray-100">{children}</div>
  </div>
);

const FormField = ({ label, value }) => {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start justify-between px-3 py-2 gap-4">
      <p className="text-xs text-gray-500 w-1/2 shrink-0">{label}</p>
      <p className="text-xs text-gray-800 font-semibold text-right">{value}</p>
    </div>
  );
};

const FormSubmissionsModal = ({ entries }) => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);

  return (
    <>
      <div className="mt-5">
        <Button
          onClick={() => setOpen(true)}
          className="bg-[#7f4099] hover:bg-purple-700 text-white flex items-center gap-2"
        >
          <FileText size={15} />
          Form Details
          <span className="bg-white text-purple-600 text-xs font-bold px-2 py-0.5 rounded-full">
            {entries?.length}
          </span>
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white rounded-xl md:w-[680px] w-full max-h-[85vh] overflow-y-auto p-0">
          <div className="sticky top-0 bg-[#7f4099] px-6 py-4 rounded-t-xl z-10">
            <DialogTitle className="text-white text-lg font-bold flex items-center gap-2">
              <FileText size={18} />  Form Details
            </DialogTitle>
            <p className="text-purple-200 text-xs mt-0.5">{entries.length} submission(s)</p>
          </div>

          <div className="p-4 space-y-2">
            {entries.map((entry, idx) => (
              <div key={entry.id} className="border border-gray-200 rounded-xl overflow-hidden">
                {/* Accordion Header */}
                <button
                  onClick={() => setExpanded(expanded === idx ? null : idx)}
                  className="w-full bg-purple-50 px-4 py-3 flex items-center justify-between hover:bg-purple-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">{entry.full_name}</p>
                      <p className="text-xs text-gray-500">{entry.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      entry.google_form ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {entry.google_form ? "Google Form" : "Direct"}
                    </span> */}
                    {expanded === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {/* Accordion Body */}
                {expanded === idx && (
                  <div className="p-4 space-y-4">
                    <FormSection title="Basic Information">
                      <FormField label="Age" value={entry.age} />
                      <FormField label="Gender" value={entry.gender} />
                      <FormField label="Phone" value={entry.phone} />
                      <FormField label="Consent" value={entry.consent} />
                    </FormSection>

                    {(entry.health_goals || entry.health_concerns || entry.medical_conditions || entry.medications) && (
                      <FormSection title="Health Overview">
                        <FormField label="What are your main health goals for this consultation?" value={entry.health_goals} />
                        <FormField label="Describe your main health concern(s), duration, and severity" value={entry.health_concerns} />
                        <FormField label="Any diagnosed medical conditions? (If yes, please list)" value={entry.medical_conditions} />
                        <FormField label="Current medications, supplements, or herbs (name + dose if known)" value={entry.medications} />
                      </FormSection>
                    )}

                    {(entry.appetite || entry.stress_level || entry.energy_level || entry.bowel_movements) && (
                      <FormSection title="Vitals">
                        <FormField label="Appetite" value={entry.appetite} />
                        <FormField label="Stress level (past 7 days)" value={entry.stress_level} />
                        <FormField label="Energy level (past 7 days)" value={entry.energy_level} />
                        <FormField label="Bowel Movements" value={entry.bowel_movements} />
                      </FormSection>
                    )}

                    {(entry.body_frame_build || entry.skin_type || entry.sleep) && (
                      <FormSection title="Prakriti / Body Type">
                        <FormField label="Body frame / build" value={entry.body_frame_build} />
                        <FormField label="Skin Type" value={entry.skin_type} />
                        <FormField label="Hair" value={entry.hair} />
                        <FormField label="Appetite" value={entry.appetite_pattern} />
                        <FormField label="Digestion after meals" value={entry.digestion_after_meals} />
                        <FormField label="Bowel Movements" value={entry.body_bowel_movements} />
                        <FormField label="Sleep" value={entry.sleep} />
                        <FormField label="Body temperature preference" value={entry.body_temperature_preference} />
                        <FormField label="Sweating" value={entry.sweating} />
                        <FormField label="Energy Pattern" value={entry.energy_pattern} />
                        <FormField label="Speech Style" value={entry.speech_style} />
                        <FormField label="Emotional Tendency" value={entry.emotional_tendency} />
                        <FormField label="Memory" value={entry.memory} />
                      </FormSection>
                    )}

                    {(entry.general || entry.head || entry.cardiovascular) && (
                      <FormSection title="Systems Review">
                        <FormField label="General" value={entry.general} />
                        <FormField label="Skin & Hair" value={entry.skin_and_hair} />
                        <FormField label="Head" value={entry.head} />
                        <FormField label="Eyes/Ears/Nose/Throat" value={entry.eyes_ears_nose_throat} />
                        <FormField label="Cardiovascular" value={entry.cardiovascular} />
                        <FormField label="Respiratory" value={entry.respiratory} />
                        <FormField label="Musculoskeletal" value={entry.musculoskeletal} />
                        <FormField label="Gastrointestinal" value={entry.gastrointestinal} />
                        <FormField label="Genito-Urinary" value={entry.genito_urinary} />
                        <FormField label="Neuropsychological" value={entry.neuropsychological} />
                      </FormSection>
                    )}

                    {(entry.heaviness_in_body || entry.groggy_in_morning || entry.indigestion_common) && (
                      <FormSection title="Kapha Scores">
                        <FormField label="I feel heaviness in my body" value={entry.heaviness_in_body} />
                        <FormField label="In the morning I feel groggy and it takes time to feel awake" value={entry.groggy_in_morning} />
                        <FormField label="I commonly have indigestion" value={entry.indigestion_common} />
                        <FormField label="I often have low energy/tiredness" value={entry.low_energy_tiredness} />
                        <FormField label="I get colds or similar conditions several times a year" value={entry.frequent_colds} />
                      </FormSection>
                    )}

                    {(entry.meals_description || entry.water_intake || entry.daily_routine) && (
                      <FormSection title="Lifestyle">
                        <FormField label="Describe your typical breakfast, lunch, dinner, and snacks." value={entry.meals_description} />
                        <FormField label="Water intake (approx cups/day)" value={entry.water_intake} />
                        <FormField label="Do you skip meals?" value={entry.skip_meals} />
                        <FormField label="Wake-up time (weekday)" value={entry.wakeup_time_weekday} />
                        <FormField label="Bedtime (weekday)" value={entry.bedtime_weekday} />
                        <FormField label="Describe your daily routine (work, movement, stress, self-care)." value={entry.daily_routine} />
                      </FormSection>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="sticky bottom-0 bg-white border-t px-6 py-3 rounded-b-xl">
            <Button onClick={() => setOpen(false)} className="w-full bg-[#7f4099] hover:bg-purple-700 text-white">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const viewWellnessLounge = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [id, setId] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const idFromSearchParams = searchParams.get("id");
      if (idFromSearchParams) setId(idFromSearchParams);
    }
  }, [searchParams]);

  const [state, setState] = useSetState({ userData: [] });

  useEffect(() => {
    if (id) getDetails();
  }, [id]);

  const getDetails = async () => {
    try {
      const res = await Models.user.getUserId(id);
      setState({ userData: res });
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const hasGoogleEventData = (state?.userData?.event_registrations ?? []).some(
    (r) => r?.google_event_data?.start?.dateTime
  );

  const columns = [
    { Header: "Order ID", accessor: "registration_id" },
    { Header: "Order Status", accessor: "registration_status" },
    {
      Header: "Registration Date",
      accessor: "registration_date",
      Cell: (row) => (
        <Label>{moment(row?.row?.registration_date).format("DD-MM-YYYY")}</Label>
      ),
    },
    ...(hasGoogleEventData ? [{
      Header: "Session Slot",
      accessor: "google_event_data",
      Cell: (row) => (
        <Label>
          {row?.row?.google_event_data?.start?.dateTime
            ? moment(row.row.google_event_data.start.dateTime).format(" hh:mm A")
            : "-"}
        </Label>
      ),
    }] : []),
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
          <h2 className="font-semibold md:text-[20px] text-sm mb-3">User Details</h2>
        </div>

        <div className="auto-rows-min gap-4 flex flex-col xl:flex-row">
          {/* Profile Card */}
          <div className="border w-full xl:w-2/4 rounded-xl p-4 gap-10 flex flex-row flex-wrap">
            <div>
              <img
                src={
                  !state?.userData?.profile_picture
                    ? "/assets/images/dummy-profile.jpg"
                    : state?.userData?.profile_picture
                }
                alt="thumbnail"
                className="w-[200px] h-[200px]"
                style={{ borderRadius: "10px", objectFit: "cover" }}
              />
            </div>
            <div>
              <h2 className="mt-3 scroll-m-20 text-xl font-[500] tracking-tight transition-colors first:mt-0 capitalize">
                {state?.userData.first_name} {state?.userData.last_name}
              </h2>
              <blockquote className="italic">{state?.userData?.group?.name}</blockquote>
              <ul className="mb-6 [&>li]:mt-2">
                {state?.userData?.email && <li>Email: {state?.userData?.email}</li>}
                {state?.userData?.phone_number && <li>Phone Number: {state?.userData?.phone_number}</li>}
                {state?.userData?.department && <li>Department: {state?.userData?.department}</li>}
                {state?.userData?.group?.name == "Alumni" ? (
                  <>
                    {state?.userData?.year_of_graduation && (
                      <li>Year Of Graduation: {state?.userData?.year_of_graduation}</li>
                    )}
                  </>
                ) : (
                  state?.userData?.group?.name == "Student" && (
                    <>
                      {state?.userData?.year_of_entry && (
                        <li>Year Of Entry: {state?.userData?.year_of_entry}</li>
                      )}
                    </>
                  )
                )}
                {state?.userData?.work && <li>Work: {state?.userData?.work}</li>}
                {state?.userData?.intrested_topics?.length > 0 && (
                  <li>
                    <div>Interested in Topics:</div>{" "}
                    {state.userData.intrested_topics.map((item, index) => {
                      const topicText =
                        item.topic === "Others"
                          ? `Others ${state?.userData?.lable && `(${state?.userData?.lable})`}`
                          : item.topic;
                      return (
                        <span key={item.id}>
                          {topicText}
                          {index < state.userData.intrested_topics.length - 1 ? ", " : ""}
                        </span>
                      );
                    })}
                  </li>
                )}
                {state?.userData?.university && (
                  <li>University: {state?.userData?.university?.name}</li>
                )}
              </ul>
            </div>
          </div>

          {/* Registered Events */}
          <div className="border w-full xl:w-3/4 rounded-xl p-4 gap-4 flex flex-col">
            {(state?.userData?.event_registrations ?? []).length > 0 ? (
              <div className="rounded-xl p-2 gap-4 flex flex-col">
                <h1 className="font-[500]">Registered Events</h1>
                <div className="rounded-lg border">
                  <DataTable
                    columns={columns}
                    data={state?.userData?.event_registrations ?? []}
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-xl p-2 gap-4 flex flex-col">
                <h1 className="font-[500]">No Events Registered yet!</h1>
              </div>
            )}
          </div>
        </div>

        {/* Google Form Entries */}
        {(state?.userData?.google_form_entries ?? []).length > 0 && (
          <FormSubmissionsModal entries={state.userData.google_form_entries} />
        )}
      </div>
    </div>
  );
};

export default ProtectedRoute(viewWellnessLounge);
