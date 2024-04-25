"use strict";

exports.__esModule = true;
exports.ORDER_INTENT = exports.FPTI_TRANSITION = exports.FPTI_CUSTOM_KEY = exports.DEFAULT_GQL_HEADERS = exports.DEFAULT_API_HEADERS = void 0;
const DEFAULT_API_HEADERS = exports.DEFAULT_API_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json"
};
const DEFAULT_GQL_HEADERS = exports.DEFAULT_GQL_HEADERS = {
  "x-app-name": "sdk-applepay",
  "Content-Type": "application/json",
  Accept: "application/json",
  origin: process.env.NODE_ENV === "test" ? "https://www.mypaypal.com" : window.location,
  prefer: "return=representation"
};
const FPTI_TRANSITION = exports.FPTI_TRANSITION = {
  APPLEPAY_EVENT: "applepay_event",
  APPLEPAY_FLOW_ERROR: "applepay_flow_error",
  APPLEPAY_ON_CLICK_INVALID: "applepay_onclick_invalid",
  APPLEPAY_MERCHANT_VALIDATION_COMPLETION_ERROR: "applepay_merchant_validation_completion_error",
  APPLEPAY_MERCHANT_VALIDATION_ERROR: "applepay_merchant_validation_error",
  APPLEPAY_CREATE_ORDER_ERROR: "applepay_create_order_error",
  APPLEPAY_GET_DETAILS_ERROR: "applepay_get_details_error",
  APPLEPAY_PAYMENT_ERROR: "applepay_payment_error",
  APPLEPAY_CONFIG_ERROR: "applepay_config_error"
};
const FPTI_CUSTOM_KEY = exports.FPTI_CUSTOM_KEY = {
  ERR_DESC: "int_error_desc",
  INFO_MSG: "info_msg"
};
const ORDER_INTENT = exports.ORDER_INTENT = {
  CAPTURE: "CAPTURE",
  AUTHORIZE: "AUTHORIZE"
};