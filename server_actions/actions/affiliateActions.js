"use server";
import { connectDB } from "../config/mongoose";
import CouponCode from "../models/couponCode";

export async function affiliateLogin(details) {
  await connectDB();
  const couponDetails = await CouponCode.findOne({
    couponCode: details.couponCode,
    password: details.password,
  });
  if (couponDetails) {
    return {
      message: "Details fetched successfully",
      coupon: couponDetails,
      success: true,
    };
  } else {
    return {
      message: "Invalid Credentials, Please try again",
      success: false,
    };
  }
}
