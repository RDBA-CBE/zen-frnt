// import test from 'models/test.model';

import auth from "@/models/auth.model";
import category from "@/models/category.model";
import Common from "@/models/common.model";
import coupon from "@/models/coupon.model";
import payment_gateway from "@/models/payment-gateway";
import payment from "@/models/payment.model";
import session from "@/models/session.model";
import test from "@/models/test.model";
import user from "@/models/user.model";

export const Models = {
  auth,
  test,
  user,
  Common,
  coupon,
  category,
  session,
  payment,
  payment_gateway
};

export default Models;
