import moment from "moment";
import * as Yup from "yup";
import { AYURVEDIC_LOUNGE } from "./constant.utils";

export const createCoupon = Yup.object().shape({
  code: Yup.string().required("Discount code is required"),
  discount_type: Yup.string().required("Discount type is required"),
  discount_value: Yup.string().required("Discount value is required"),
  valid_from: Yup.date()
    .required("Valid from date is required")
    .typeError("Valid from date must be a valid date"),
  valid_to: Yup.date()
    .required("Valid to date is required")
    .typeError("Valid to date must be a valid date"),
});

export const createSession = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  start_date: Yup.date()
    .required("Start date and Time is required")
    .typeError("Invalid start date"),
  end_date: Yup.date()
    .required("End date and Time is required")
    .typeError("Invalid end date"),
  start_time: Yup.string().required("Start date and time is required"),
  end_time: Yup.string().required("End date and time is required"),

  session_link: Yup.string()
    .required("Session link is required")
    .url("Invalid session link"),
  lounge_type: Yup.string().required("Lounge type is required"),
  thumbnail_image: Yup.string().required("Session Image is required"),
  slot: Yup.array()
    .of(
      Yup.object().shape({
        date: Yup.string().required("Date is required"),
        slot: Yup.array().of(Yup.string()).required("Slot is required"),
      })
    )
    .when("lounge_type", {
      is: (val) => String(val) == "15",
      then: (schema) =>
        schema
          .test("validate-slot", "At least one slot is required", (value) => {
            if (!value || value.length === 0) return false; // outer array empty
            return value.some((item) => item.slot && item.slot.length > 0); // at least one inner slot
          })
          .required("Slot is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  interval: Yup.string().when("lounge_type", {
    is: (val) => String(val) == "15",
    then: (schema) => schema.required("Interval is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  moderator: Yup.string().required("Mentor is required"),
  timezone: Yup.string().required("Timezone is required"),
  // intrested_topics: Yup.array().required("Topics is required"),
  intrested_topics: Yup.array()
    .min(1, "Topics are required") // This ensures array is not empty
    .required("Topics are required"), // This ensures the field exists
  // lable: Yup.string().when("intrested_topics", {
  //   is: (intrested_topics:any) =>
  //     intrested_topics?.some((topic) => topic.value === 13),
  //   then: (schema) => schema.required("Please specify the topic name"),
  //   otherwise: (schema) => schema.notRequired(),
  // }),
});

export const createFreeSession = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  start_date: Yup.date()
    .required("Start date and Time is required")
    .typeError("Invalid start date"),
  end_date: Yup.date()
    .required("End date and Time is required")
    .typeError("Invalid end date"),
  start_time: Yup.string().required("Start date and time is required"),
  end_time: Yup.string().required("End date and time is required"),
  session_link: Yup.string()
    .required("Session link is required")
    .url("Invalid session link"),
  lounge_type: Yup.string().required("Lounge type is required"),
  thumbnail_image: Yup.string().required("Session Image is required"),
  moderator: Yup.string().required("Mentor is required"),
  timezone: Yup.string().required("Timezone is required"),
  intrested_topics: Yup.array()
    .min(1, "Topics are required") // This ensures array is not empty
    .required("Topics are required"), // This ensures the field exists
});

export const createPaidSession = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  start_date: Yup.date()
    .required("Start Date is required")
    .typeError("Invalid start date"),
    end_date: Yup.date()
    .required("End Date is required")
    .typeError("Invalid start date"),

  session_link: Yup.string()
    .required("Session link is required")
    .url("Invalid session link"),
  lounge_type: Yup.string().required("Lounge type is required"),
  thumbnail_image: Yup.string().required("Session Image is required"),
  slot: Yup.array()
    .of(
      Yup.object().shape({
        date: Yup.string().required("Date is required"),
        slot: Yup.array().of(Yup.string()).required("Slot is required"),
      })
    )
    .when("lounge_type", {
      is: (val) => String(val) == "15",
      then: (schema) =>
        schema
          .test("validate-slot", "At least one slot is required", (value) => {
            if (!value || value.length === 0) return false; // outer array empty
            return value.some((item) => item.slot && item.slot.length > 0); // at least one inner slot
          })
          .required("Slot is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  interval: Yup.string().when("lounge_type", {
    is: (val) => String(val) == "15",
    then: (schema) => schema.required("Interval is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  moderator: Yup.string().required("Mentor is required"),
  timezone: Yup.string().required("Timezone is required"),
  intrested_topics: Yup.array()
    .min(1, "Topics are required") // This ensures array is not empty
    .required("Topics are required"), // This ensures the field exists
});

export const calenderCreateFreeSession = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  start_date: Yup.date()
    .required("Start date is required")
    .typeError("Invalid start date"),
  end_date: Yup.date()
    .required("End date is required")
    .typeError("Invalid end date"),
  start_time: Yup.string().required("Start time is required"),
  end_time: Yup.string().required("End time is required"),
  session_link: Yup.string()
    .required("Session link is required")
    .url("Invalid session link"),
  lounge_type: Yup.string().required("Lounge type is required"),
  thumbnail_image: Yup.string().required("Session Image is required"),
  moderator: Yup.string().required("Mentor is required"),
  timezone: Yup.string().required("Timezone is required"),
  intrested_topics: Yup.array()
    .min(1, "Topics are required") // This ensures array is not empty
    .required("Topics are required"), // This ensures the field exists
});

export const createSessionOrder = Yup.object().shape({
  user: Yup.string().required("User is required"),
  registration_status: Yup.string().test(
    "is-required",
    "Registration status is required",
    function (value) {
      const { lounge_type } = this.parent;
      if (lounge_type !== AYURVEDIC_LOUNGE) {
        return value != null && value !== "";
      }
      return true;
    }
  ),
  event: Yup.string()
    .required("Lounge is required")
    .nonNullable("Lounge is required"),
  slot: Yup.string().when("lounge_type", {
    is: 15,
    then: (schema) => schema.required("Slot is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  lounge_type: Yup.number().nonNullable("Lounge is required"),
});

export const updateSessionOrder = Yup.object().shape({
  user: Yup.string().required("User is required"),
  registration_status: Yup.string().required("Registration  is required"),
  event: Yup.string().required("Event is required"),
});
export const createUser = Yup.object().shape({
  first_name: Yup.string().required("First Name is required"),
  last_name: Yup.string().required("Last Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phone_number: Yup.string().required("Phone number is required"),
  user_type: Yup.string().required("User type is required"),
  // year_of_entry:Yup.string().required("Year of entry is required"),
  year_of_graduation: Yup.string().required("Year of graduation is required"),
  country: Yup.string().required("Country is required"),
  university: Yup.string().required("University is required"),
  department: Yup.string().required("Department is required"),

  // address: Yup.string().nullable(), // Optional field, allows empty string

  // dob: Yup.string().required("Date of birth is required"), // Optional array of strings
});

export const createStudentUser = Yup.object().shape({
  first_name: Yup.string().required("First Name is required"),
  last_name: Yup.string().required("Last Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  // phone_number: Yup.string().required("Phone number is required"),
  user_type: Yup.string().required("User type is required"),
  year_of_entry: Yup.string().required("Year of entry is required"),
  university: Yup.string().required("University is required"),
  department: Yup.string().required("Department is required"),
  // address: Yup.string().nullable(), // Optional field, allows empty string

  // dob: Yup.string().required("Date of birth is required"), // Optional array of strings
});

export const createPaymetGayway = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  secret_key: Yup.string().required("Secret key is required"),
  public_key: Yup.string().required("Public key is required"),
});

export const createCategory = Yup.object().shape({
  name: Yup.string().required("Name is required"),
});

export const studentRegistration = Yup.object().shape({
  first_name: Yup.string().required("First Name is required"),
  last_name: Yup.string().required("Last Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
  year_of_entry: Yup.string().required("Year of entry is required"),
  university: Yup.string().required("University is required"),
  department: Yup.string().required("Department is required"),
  // .typeError("Year of entry must be a number")
  // .integer("Year of entry must be a valid year"),
});
export const aluminiRegistration = Yup.object().shape({
  first_name: Yup.string().required("First Name is required"),
  last_name: Yup.string().required("Last Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
  phone_number: Yup.string().required("Phone Number is required"),
  year_of_entry: Yup.string().required("Year of entry is required"),
  // .typeError("Year of entry must be a number")
  // .integer("Year of entry must be a valid year"),
});

export const login = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export const forgetPassword = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
});

export const AlumniRegistration = Yup.object().shape({
  first_name: Yup.string().required("First Name is required"),
  last_name: Yup.string().required("Last Name is required"),
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email address"),
  // email: Yup.string().required("Email is required"),
  password: Yup.string().required("Password is required"),
  phone_number: Yup.string().required("Phone number is required"),
  year_of_graduation: Yup.string().required("Year of graduation is required"),
  country: Yup.string().required("Country is required"),
  university: Yup.string().required("University is required"),
  department: Yup.string().required("Department is required"),
});

export const change_password = Yup.object().shape({
  confirm_password: Yup.string()
    .required("Confirm password is required")
    .oneOf([Yup.ref("new_password")], "Passwords must match"),
  // .min(8, "New Password must be at least 8 characters"),

  new_password: Yup.string()
    .required("New password is required")
    .min(8, "New Password must be at least 8 characters"),

  old_password: Yup.string().required("Old password is required"),
});

export const reset_password = Yup.object().shape({
  confirm_password: Yup.string()
    .required("Confirm password is required")
    .oneOf([Yup.ref("new_password")], "Passwords must match"),
  // .min(8, "New Password must be at least 8 characters"),

  new_password: Yup.string()
    .required("New password is required")
    .min(8, "New Password must be at least 8 characters"),
});

export const sessionCreate = Yup.object().shape({
  lounge_type: Yup.string().required("Lounge type is required"),
  start_time: Yup.string().when("lounge_type", {
    is: (val) => String(val) != "15",
    then: (schema) => schema.required("Start time is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});
