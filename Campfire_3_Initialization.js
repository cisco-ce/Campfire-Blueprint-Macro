/********************************************************
Copyright (c) 2023 Cisco and/or its affiliates.
This software is licensed to you under the terms of the Cisco Sample
Code License, Version 1.1 (the "License"). You may obtain a copy of the
License at
               https://developer.cisco.com/docs/licenses
All use of the material herein must be in accordance with the terms of
the License. All rights not expressly granted by the License are
reserved. Unless required by applicable law or agreed to separately in
writing, software distributed under the License is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
or implied.
*********************************************************
*
*/

import xapi from 'xapi';
import { Settings, CodecInfo } from './Campfire_2_Config';
import { GMM } from './GMM_Lite_Lib';

const DevConfig = {
  Version: '0-0-1'
}

/********************************
    [ Prototypes ]
*********************************/

/* 
  Alternative Includes prototype that replaces
  the Strict Equality operator (===) with the
  Equality Operator (==)
*/
Array.prototype.includish = function (value) {
  for (let i = 0; i < this.length; i++) {
    if (this[i] == value) {
      return true;
    }
  }
  return false;
};

/* 
  Enables a Clean Cloning of an Object without
  altering the original object
*/
Object.prototype.clone = Array.prototype.clone = function () {
  if (Object.prototype.toString.call(this) === '[object Array]') {
    var clone = [];
    for (var i = 0; i < this.length; i++) {
      clone[i] = this[i].clone();
    }
    return clone;
  } else if (typeof (this) == "object") {
    var clone = {};
    for (var prop in this)
      if (this.hasOwnProperty(prop)) {
        clone[prop] = this[prop].clone();
      }
    return clone;
  } else {
    return this;
  }
}
/********************************
    [ Functions ]
*********************************/

/* 
  Enables an asynchronous delay in Milliseconds
*/
function delay(ms) { return new Promise(resolve => { setTimeout(resolve, ms) }) }

const Validate = {};
/* 
  Ensures all Campfire Macros are installed
*/
Validate.Macros = async function (version = DevConfig.Version) {
  console.log({ Campfire_3_Log: `Checking Installed Macros for Campfire...` })
  const checklist = {
    [`Campfire_1_Main`]: false,
    [`Campfire_2_Config`]: false,
    [`Campfire_3_Initialization`]: false,
    "GMM_Lite_Lib": false,
    "AZM_Lib": false
  }

  let arr = Object.getOwnPropertyNames(checklist)

  let restartRunTime = false;

  const macros = await xapi.Command.Macros.Macro.Get()

  for (let mac of macros.Macro) {
    if (arr.includes(mac.Name)) {
      checklist[mac.Name] = true;
      if (!mac.Name.includes('Main') && mac.Active == 'True') {
        await xapi.Command.Macros.Macro.Deactivate({ Name: mac.Name });
        console.debug({ Campfire_3_Debug: `Deactivating Macro [${mac.Name}]`, Cause: `Imported Macros, should be inactive` });
        restartRunTime = true;
      }
    }
  }
  console.log({ Campfire_3_Log: `Campfire Macros Installed!` })

  for (const key in checklist) {
    if (checklist.hasOwnProperty(key) && checklist[key] !== true) {
      let e = `Macro validation failed: [${key}] macro not found!`
      await disableSolution(e);
      throw new Error(e);
    }
  }

  if (restartRunTime) {
    console.debug({ Campfire_3_Debug: `Restarting Macro Runtime`, Cause: `Imported Macros Active` });
    await xapi.Command.Macros.Runtime.Restart();
  }
}

/* 
  Ensures all Campfire Configurations are set properly
*/
Validate.Configuration = async function () {
  console.log({ Campfire_3_Log: `Checking Campfire Configuration...` })
  console.log({ Campfire_3_Log: `Campfire Configuration Checks Out!` })
}

async function checkVideoInputSignal() {

}

async function checkMicrophoneInputConnection() {

}

let Nodes = undefined;
let subNodes = {};
let SendToNodes = undefined;

async function SetupNodeClassConnector() {
  if (CodecInfo.Authentication.Mode.toLowerCase() == 'common') {
    let ipList = [];
    CodecInfo.NodeCodecs.forEach(element => { ipList.push(element.IpAddress) });
    Nodes = new GMM.Connect.IP(CodecInfo.Authentication.Common_Username, CodecInfo.Authentication.Common_Passcode, ipList)
    SendToNodes = async function (method, data) {
      const request = await Nodes.status({ Method: method, Data: data }).post()
      return request
    }
  }
  if (CodecInfo.Authentication.Mode.toLowerCase() == 'independent') {
    CodecInfo.NodeCodecs.forEach(element => {
      subNodes[element.CodecSerialNumber] = new GMM.Connect.IP(element.Authentication.Username, element.Authentication.Passcode, element.IpAddress);
    });
    SendToNodes = async function (method, data) {
      let destination = Object.getOwnPropertyNames(subNodes);
      let responses = []

      for (let node of destination) {
        const request = await subNodes[node].status({ Method: method, Data: data }).post();
        responses.push(request)
      }
      //Reduce Responses to match common auth response
      responses = responses.reduce((result, item) => {
        result.Responses = result.Responses.concat(item.Responses);
        result.Errors = result.Errors.concat(item.Errors);;
        return result;
      }, { Responses: [], Errors: [] });
      return responses;
    }
  }
}


Validate.RoomScope = async function () {
  switch (Settings.RoomType) {
    case 'Campfire Pro':

      break;
    default:
      console.warn({ Campfire_3_Warn: `RoomType not defined, unable to validate Room Scope: [${Settings.RoomType}]` })
      break;
  }
}

/* 
  Disables the Macro in cases where it's unresolvable
  Context provided to help guide the Device Admin to a resolution
*/
async function disableSolution(cause, showMessage = true) {
  if (showMessage) {
    await xapi.Command.UserInterface.Message.Alert.Display({
      Title: `⚠️ [${Settings.RoomType}] Solution Disabled ⚠️`,
      Text: cause + '<p>Contact System Admin'
    });
  };
  console.error({ Error: `Unresolvable Error Detected`, Cause: cause, Action: 'Disabling Macro' });
  await xapi.Command.Macros.Macro.Deactivate({ Name: `Campfire_2_Main` });
  await xapi.Command.Macros.Runtime.Restart();
}

const init = {}

init.Phase1 = async function () {
  console.log({ Campfire_3_Log: `Campfire Phase 1 initializing...` })

  await GMM.memoryInit()

  await Validate.Macros();
  await Validate.Configuration();

  await init.Phase2()
  return new Promise(resolve => {
    resolve()
  })
}

init.Phase2 = async function () {
  console.log({ Campfire_3_Log: `Campfire Phase 1 complete, initializing phase 2...` })

  await Validate.RoomScope();

  await SetupNodeClassConnector();

  return new Promise(resolve => {
    console.log({ Campfire_3_Log: `Campfire initialization Complete!` })
    resolve()
  })
}

async function Run_Setup() { await init.Phase1() }

export { Run_Setup, SendToNodes }