import moment from "moment";
import * as Yup from "yup";

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
});

export const createSessionOrder = Yup.object().shape({
  user: Yup.string().required("User is required"),
  registration_status: Yup.string().required("Registration  is required"),
  event: Yup.array().required("Event is required"),
});

export const updateSessionOrder = Yup.object().shape({
  user: Yup.string().required("User is required"),
  registration_status: Yup.string().required("Registration  is required"),
  event: Yup.string().required("Event is required"),
});
export const createUser = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  // phone_number: Yup.string().required("Phone number is required"),
  // address: Yup.string().nullable(), // Optional field, allows empty string
  user_type: Yup.string().required("User type is required"),
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
  username: Yup.string().required("Name is required"),
  email: Yup.string().required("Email is required"),
  password: Yup.string().required("Password is required"),
  year_of_entry: Yup.string().required("Year of entry is required"),
  // .typeError("Year of entry must be a number")
  // .integer("Year of entry must be a valid year"),
});

export const AlumniRegistration = Yup.object().shape({
  username: Yup.string().required("Name is required"),
  email: Yup.string().required("Email is required").email("Email is not valid"),
  // email: Yup.string().required("Email is required"),
  // password: Yup.string().required("Password is required"),
  phone_number: Yup.string().required("Phone number is required"),
  year_of_graduation: Yup.string().required("Year of graduation is required"),
});

export const change_password = Yup.object().shape({
  confirm_password: Yup.string()
    .required("Confirm password is required")
    .oneOf([Yup.ref("new_password")], "Passwords must match"),

  new_password: Yup.string().required("New password is required"),
  old_password: Yup.string().required("Old password is required"),
});
