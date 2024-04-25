"use strict";

exports.__esModule = true;
exports.PayPalApplePayError = void 0;
exports.getCurrency = getCurrency;
exports.getMerchantDomain = getMerchantDomain;
exports.mapGetConfigResponse = mapGetConfigResponse;
var _src = require("@paypal/sdk-client/src");
function getMerchantDomain() {
  const url = window.location.origin;
  return url.split("//")[1];
}
function getCurrency() {
  return (0, _src.getSDKQueryParam)("currency", "USD");
}
function mapGetConfigResponse(applepayConfig) {
  return {
    ...applepayConfig,
    currencyCode: getCurrency(),
    countryCode: applepayConfig.merchantCountry
  };
}
class PayPalApplePayError extends Error {
  constructor(name, message, paypalDebugId) {
    super(message);
    this.paypalDebugId = void 0;
    this.errorName = void 0;
    this.name = "PayPalApplePayError";
    this.errorName = name;
    this.paypalDebugId = paypalDebugId;
  }
}
exports.PayPalApplePayError = PayPalApplePayError;