"use strict";

exports.__esModule = true;
exports.Applepay = Applepay;
var _src = require("@paypal/sdk-client/src");
var _src2 = require("@paypal/sdk-constants/src");
var _util = require("./util");
var _constants = require("./constants");
var _logging = require("./logging");
function config() {
  return fetch(`${(0, _src.getPayPalDomain)()}/graphql?GetApplepayConfig`, {
    method: "POST",
    headers: {
      ..._constants.DEFAULT_GQL_HEADERS
    },
    body: JSON.stringify({
      query: `
                  query GetApplepayConfig(
                    $buyerCountry: CountryCodes
                    $clientId: String!
                    $merchantId: [String]!
                  ) {
                    applepayConfig(
                      buyerCountry: $buyerCountry
                      clientId: $clientId
                      merchantId: $merchantId
                    ) {
                      merchantCountry,
                      supportedNetworks,
                      isEligible,
                      merchantCapabilities
                    }
                  }`,
      variables: {
        buyerCountry: (0, _src.getBuyerCountry)(),
        clientId: (0, _src.getClientID)(),
        merchantId: (0, _src.getMerchantID)()
      }
    })
  }).then(res => {
    if (!res.ok) {
      const {
        headers
      } = res;
      throw new _util.PayPalApplePayError("INTERNAL_SERVER_ERROR", "An internal server error has occurred", headers.get("Paypal-Debug-Id"));
    }
    return res.json();
  }).then(({
    data,
    errors,
    extensions
  }) => {
    if (Array.isArray(errors) && errors.length) {
      var _errors$;
      const message = ((_errors$ = errors[0]) == null ? void 0 : _errors$.message) ?? JSON.stringify(errors[0]);
      throw new _util.PayPalApplePayError("APPLEPAY_CONFIG_ERROR", message, extensions == null ? void 0 : extensions.correlationId);
    }
    return (0, _util.mapGetConfigResponse)(data.applepayConfig);
  }).catch(err => {
    (0, _src.getLogger)().error(_constants.FPTI_TRANSITION.APPLEPAY_CONFIG_ERROR).track({
      [_src2.FPTI_KEY.TRANSITION]: _constants.FPTI_TRANSITION.APPLEPAY_CONFIG_ERROR,
      [_constants.FPTI_CUSTOM_KEY.ERR_DESC]: `Error: ${err.message}) }`
    }).flush();
    throw err;
  });
}
function decodeBase64(base64) {
  const text = atob(base64);
  const length = text.length;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = text.charCodeAt(i);
  }
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}
function validateMerchant({
  validationUrl,
  displayName
}) {
  (0, _logging.logApplePayEvent)("validatemerchant", {
    validationUrl,
    displayName
  });
  return fetch(`${(0, _src.getPayPalDomain)()}/graphql?GetApplePayMerchantSession`, {
    method: "POST",
    headers: {
      ..._constants.DEFAULT_GQL_HEADERS
    },
    body: JSON.stringify({
      query: `
                query GetApplePayMerchantSession(
                    $url : String!
                    $displayName : String
                    $clientID : String!
                    $merchantID : [String]
                    $merchantDomain : String!
                ) {
                    applePayMerchantSession(
                        url: $url
                        displayName: $displayName
                        clientID: $clientID
                        merchantID: $merchantID
                        merchantDomain: $merchantDomain
                    ) {
                        session
                    }
                }`,
      variables: {
        url: validationUrl,
        displayName,
        clientID: (0, _src.getClientID)(),
        merchantID: (0, _src.getMerchantID)(),
        merchantDomain: (0, _util.getMerchantDomain)()
      }
    })
  }).then(res => {
    if (!res.ok) {
      const {
        headers
      } = res;
      throw new _util.PayPalApplePayError("INTERNAL_SERVER_ERROR", "An internal server error has occurred", headers.get("Paypal-Debug-Id"));
    }
    return res.json();
  }).then(({
    data,
    errors,
    extensions
  }) => {
    if (Array.isArray(errors) && errors.length) {
      var _errors$2, _errors$3;
      const error = {
        name: ((_errors$2 = errors[0]) == null ? void 0 : _errors$2.name) || "ERROR_VALIDATING_MERCHANT",
        fullDescription: ((_errors$3 = errors[0]) == null ? void 0 : _errors$3.message) ?? JSON.stringify(errors[0]),
        paypalDebugId: extensions == null ? void 0 : extensions.correlationId
      };
      throw new _util.PayPalApplePayError(error.name, error.fullDescription, error.paypalDebugId);
    }
    const {
      applePayMerchantSession
    } = data;
    const payload = applePayMerchantSession ? decodeBase64(applePayMerchantSession.session) : data;
    return {
      merchantSession: JSON.parse(payload),
      paypalDebugId: extensions == null ? void 0 : extensions.correlationId
    };
  }).catch(err => {
    (0, _src.getLogger)().error(_constants.FPTI_TRANSITION.APPLEPAY_MERCHANT_VALIDATION_ERROR).track({
      [_src2.FPTI_KEY.TRANSITION]: _constants.FPTI_TRANSITION.APPLEPAY_MERCHANT_VALIDATION_ERROR,
      [_constants.FPTI_CUSTOM_KEY.ERR_DESC]: `Error: ${err.message}) }`
    }).flush();
    throw err;
  });
}
function confirmOrder({
  orderId,
  token,
  billingContact,
  shippingContact
}) {
  (0, _logging.logApplePayEvent)("paymentauthorized");
  if (shippingContact != null && shippingContact.countryCode) {
    shippingContact.countryCode = shippingContact.countryCode.toUpperCase();
  }
  if (billingContact != null && billingContact.countryCode) {
    billingContact.countryCode = billingContact.countryCode.toUpperCase();
  }
  const partnerAttributionId = (0, _src.getPartnerAttributionID)();
  return fetch(`${(0, _src.getPayPalDomain)()}/graphql?ApproveApplePayPayment`, {
    method: "POST",
    headers: {
      ..._constants.DEFAULT_GQL_HEADERS,
      "PayPal-Partner-Attribution-Id": partnerAttributionId || ""
    },
    body: JSON.stringify({
      query: `
                    mutation ApproveApplePayPayment(
                      $token: ApplePayPaymentToken!
                      $orderID: String!
                      $clientID : String!
                      $billingContact: ApplePayPaymentContact!
                      $shippingContact: ApplePayPaymentContact
                      $productFlow: String
                    ) {
                      approveApplePayPayment(
                        token: $token
                        orderID: $orderID
                        clientID: $clientID
                        billingContact: $billingContact
                        shippingContact: $shippingContact
                        productFlow: $productFlow
                      )
                    }`,
      variables: {
        token,
        billingContact,
        shippingContact,
        clientID: (0, _src.getClientID)(),
        orderID: orderId,
        productFlow: "CUSTOM_DIGITAL_WALLET"
      }
    })
  }).then(res => {
    if (!res.ok) {
      const {
        headers
      } = res;
      const error = {
        name: "INTERNAL_SERVER_ERROR",
        fullDescription: "An internal server error has occurred",
        paypalDebugId: headers.get("Paypal-Debug-Id")
      };
      throw new _util.PayPalApplePayError(error.name, error.fullDescription, error.paypalDebugId);
    }
    return res.json();
  }).then(({
    data,
    errors,
    extensions
  }) => {
    if (Array.isArray(errors) && errors.length) {
      var _errors$4, _errors$5;
      const error = {
        name: ((_errors$4 = errors[0]) == null ? void 0 : _errors$4.name) || "APPLEPAY_PAYMENT_ERROR",
        fullDescription: ((_errors$5 = errors[0]) == null ? void 0 : _errors$5.message) ?? JSON.stringify(errors[0]),
        paypalDebugId: extensions == null ? void 0 : extensions.correlationId
      };
      throw new _util.PayPalApplePayError(error.name, error.fullDescription, error.paypalDebugId);
    }
    return data;
  }).catch(err => {
    (0, _src.getLogger)().error(_constants.FPTI_TRANSITION.APPLEPAY_PAYMENT_ERROR).track({
      [_src2.FPTI_KEY.TRANSITION]: _constants.FPTI_TRANSITION.APPLEPAY_PAYMENT_ERROR,
      [_constants.FPTI_CUSTOM_KEY.ERR_DESC]: `Error: ${err.message}) }`
    }).flush();
    throw err;
  });
}
function Applepay() {
  return {
    config,
    validateMerchant,
    confirmOrder
  };
}