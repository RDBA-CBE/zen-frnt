// import test from 'models/test.model';

import auth from "@/models/auth.model";
import category from "@/models/category.model";
import Common from "@/models/common.model";
import coupon from "@/models/coupon.model";
import payment_gateway from "@/models/payment-gateway";
import payment from "@/models/payment.model";
import reports from "@/models/reports.models";
import session from "@/models/session.model";
import slot from "@/models/slot.model";
import test from "@/models/test.model";
import user from "@/models/user.model";
import attendance from "@/models/attendance";

export const Models = {
  auth,
  test,
  user,
  Common,
  coupon,
  category,
  session,
  payment,
  payment_gateway,
  slot,
  reports,
  attendance
};

export default Models;
