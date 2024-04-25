"use strict";

exports.__esModule = true;
var _applepay = require("./applepay");
Object.keys(_applepay).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _applepay[key]) return;
  exports[key] = _applepay[key];
});