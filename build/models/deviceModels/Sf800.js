"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var Sf800_exports = {};
__export(Sf800_exports, {
  Sf800: () => Sf800
});
module.exports = __toCommonJS(Sf800_exports);
var import_solarflow800ControlStates = require("../../constants/solarflow800ControlStates");
var import_solarflow800States = require("../../constants/solarflow800States");
var import_ZenHaDevice = require("./ZenHaDevice");
class Sf800 extends import_ZenHaDevice.ZenHaDevice {
  constructor(_adapter, _productKey, _deviceKey, _productName, _deviceName, _zenHaDeviceDetails) {
    super(
      _adapter,
      _productKey,
      _deviceKey,
      _productName,
      _deviceName,
      _zenHaDeviceDetails
    );
    this.maxInputLimit = 800;
    this.maxOutputLimit = 800;
    this.states = import_solarflow800States.solarflow800States;
    this.controlStates = import_solarflow800ControlStates.solarflow800ControlStates;
  }
  async setAcMode(acMode) {
    var _a;
    if (this.adapter.mqttClient && this.productKey && this.deviceKey) {
      if (acMode >= 0 && acMode <= 3) {
        const topic = `iot/${this.productKey}/${this.deviceKey}/properties/write`;
        const setAcMode = { properties: { acMode } };
        this.adapter.log.debug(`[setAcMode] Set AC mode to ${acMode}!`);
        (_a = this.adapter.mqttClient) == null ? void 0 : _a.publish(topic, JSON.stringify(setAcMode));
        const smartMode = await this.adapter.getStateAsync(
          this.productKey + "." + this.deviceKey + ".control.smartMode"
        );
        if (smartMode && !smartMode.val) {
          this.adapter.log.warn(
            `[setAcMode] AC mode was switched and smartMode is false - changes will be written to flash memory. In the worst case, the device may break or changes may no longer be saved!`
          );
        }
      } else {
        this.adapter.log.error(
          `[setAcMode] AC mode must be a value between 0 and 3!`
        );
      }
    }
  }
  setAcSwitch(acSwitch) {
    var _a;
    if (this.adapter.mqttClient && this.productKey && this.deviceKey) {
      const setAcSwitchContent = {
        properties: { acSwitch: acSwitch ? 1 : 0 }
      };
      this.adapter.log.debug(
        `[setAcSwitch] Set AC Switch for device ${this.deviceKey} to ${acSwitch}!`
      );
      (_a = this.adapter.mqttClient) == null ? void 0 : _a.publish(
        this.iotTopic,
        JSON.stringify(setAcSwitchContent)
      );
    }
  }
  async setDeviceAutomationInOutLimit(limit) {
    var _a;
    if (this.adapter.mqttClient && this.productKey && this.deviceKey) {
      this.adapter.log.debug(
        `[setDeviceAutomationInOutLimit] Set device Automation limit to ${limit}!`
      );
      if (limit) {
        limit = Math.round(limit);
      } else {
        limit = 0;
      }
      if (this.adapter.config.useLowVoltageBlock) {
        const lowVoltageBlockState = await this.adapter.getStateAsync(
          this.productKey + "." + this.deviceKey + ".control.lowVoltageBlock"
        );
        if (lowVoltageBlockState && lowVoltageBlockState.val && lowVoltageBlockState.val == true && limit > 0) {
          limit = 0;
        }
        const fullChargeNeeded = await this.adapter.getStateAsync(
          this.productKey + "." + this.deviceKey + ".control.fullChargeNeeded"
        );
        if (fullChargeNeeded && fullChargeNeeded.val && fullChargeNeeded.val == true && limit > 0) {
          limit = 0;
        }
      }
      if (limit < 0) {
        if (limit < this.maxInputLimit) {
          limit = this.maxInputLimit;
        }
      } else {
        if (limit > this.maxOutputLimit) {
          limit = this.maxOutputLimit;
        }
      }
      this.adapter.msgCounter += 1;
      const timestamp = /* @__PURE__ */ new Date();
      timestamp.setMilliseconds(0);
      this.adapter.log.debug(
        `[setDeviceAutomationInOutLimit] Using HEMS Variant of device automation, as deviceKey '${this.deviceKey}' detected!`
      );
      let _arguments = {
        outputPower: limit > 0 ? limit : 0,
        chargeState: limit > 0 ? 0 : 1,
        chargePower: limit > 0 ? 0 : -limit,
        mode: 9
      };
      const hemsEP = {
        arguments: _arguments,
        function: "hemsEP",
        messageId: this.adapter.msgCounter,
        deviceKey: this.deviceKey,
        timestamp: timestamp.getTime() / 1e3
      };
      (_a = this.adapter.mqttClient) == null ? void 0 : _a.publish(
        this.functionTopic,
        JSON.stringify(hemsEP)
      );
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Sf800
});
//# sourceMappingURL=Sf800.js.map
