"use strict";

var _isomorphicFetch = _interopRequireDefault(require("isomorphic-fetch"));
var _btoa = _interopRequireDefault(require("btoa"));
var _atob = _interopRequireDefault(require("atob"));
var _applepay = require("../applepay");
var _util = require("../util");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
jest.mock("@paypal/sdk-client/src", () => ({
  getPartnerAttributionID: () => "bn_code",
  getClientID: () => "AULQUSZXzZoRWVCZRo6sRd78d6a3CFxrMB92LPBWhJInHA3R5Fx67ZYEy0fjMhL9NP429OFDGphvvn5W",
  getMerchantID: () => ["LM7TUQJVSUPRQ"],
  getPayPalAPIDomain: () => "https://cors.api.sandbox.paypal.com",
  getPayPalDomain: () => "https://www.sandbox.paypal.com",
  getBuyerCountry: () => "US",
  getLogger: () => ({
    info: () => ({
      track: () => ({
        flush: () => ({})
      })
    }),
    error: () => ({
      track: () => ({
        flush: () => ({})
      })
    })
  }),
  getSDKQueryParam: param => {
    if (param === "currency") {
      return "USD";
    }
    return "";
  }
}));
jest.mock("../util", () => {
  const originalModule = jest.requireActual("../util");
  return {
    __esModule: true,
    ...originalModule,
    getMerchantDomain: jest.fn(),
    getPayPalHost: () => "paypal.com"
  };
});
global.fetch = _isomorphicFetch.default;
global.btoa = _btoa.default;
global.atob = _atob.default;
describe("applepay", () => {
  describe("Config", () => {
    it("GetAppelPayConfig", async () => {
      const applepay = (0, _applepay.Applepay)();
      const config = await applepay.config();
      expect(config).toEqual({
        merchantCountry: "US",
        countryCode: "US",
        currencyCode: "USD",
        supportedNetworks: ["masterCard", "discover", "visa", "amex"],
        isEligible: true,
        merchantCapabilities: ["supports3DS", "supportsCredit", "supportsDebit"]
      });
    });
  });
  it("should fail for invalid domain", async () => {
    const applepay = (0, _applepay.Applepay)();
    _util.getMerchantDomain.mockReturnValueOnce("xxx.com");
    try {
      await applepay.validateMerchant({
        validationUrl: "https://apple-pay-gateway-cert.apple.com/paymentservices/startSession"
      });
    } catch (err) {
      expect(err.name).toBe("PayPalApplePayError");
      expect(err.message.includes("NOT_ENABLED_FOR_APPLE_PAY")).toBe(true);
      expect(err.paypalDebugId).toEqual(expect.any(String));
    }
  });
  describe("Validate Merchant", () => {
    it("should validate a valid url", async () => {
      const applepay = (0, _applepay.Applepay)();
      _util.getMerchantDomain.mockReturnValueOnce("sandbox-applepay-paypal-js-sdk.herokuapp.com");
      const response = await applepay.validateMerchant({
        validationUrl: "https://apple-pay-gateway-cert.apple.com/paymentservices/startSession"
      });
      expect(response.merchantSession.displayName).toEqual("Test Store");
      expect(response.merchantSession.signature).toEqual(expect.any(String));
      expect(response.merchantSession.nonce).toEqual(expect.any(String));
      expect(response.paypalDebugId).toEqual(expect.any(String));
    });
    it("should accept an optional display name for the apple pay button", async () => {
      const applepay = (0, _applepay.Applepay)();
      _util.getMerchantDomain.mockReturnValueOnce("sandbox-applepay-paypal-js-sdk.herokuapp.com");
      const response = await applepay.validateMerchant({
        validationUrl: "https://apple-pay-gateway-cert.apple.com/paymentservices/startSession",
        displayName: "Custom Business Name"
      });
      expect(response.merchantSession.displayName).toEqual("Custom Business Name");
      expect(response.merchantSession.signature).toEqual(expect.any(String));
      expect(response.merchantSession.nonce).toEqual(expect.any(String));
      expect(response.paypalDebugId).toEqual(expect.any(String));
    });
  });
});