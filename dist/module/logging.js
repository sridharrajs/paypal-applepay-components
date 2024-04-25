"use strict";

exports.__esModule = true;
exports.logApplePayEvent = logApplePayEvent;
var _src = require("@paypal/sdk-client/src");
var _src2 = require("@paypal/sdk-constants/src");
var _constants = require("./constants");
function logApplePayEvent(event, payload) {
  const data = payload || {};
  (0, _src.getLogger)().info(`${_constants.FPTI_TRANSITION.APPLEPAY_EVENT}_${event}`, data).track({
    [_src2.FPTI_KEY.TRANSITION]: `${_constants.FPTI_TRANSITION.APPLEPAY_EVENT}_${event}`,
    [_constants.FPTI_CUSTOM_KEY.INFO_MSG]: JSON.stringify(data)
  }).flush();
}