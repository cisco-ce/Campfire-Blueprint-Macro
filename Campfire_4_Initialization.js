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

 * Author:                  Robert(Bobby) McGonigle Jr
 *                          Technical Marketing Engineer
 *                          Cisco Systems
 *                          bomcgoni@cisco.com
 * 
 ********************************************************
 * 
 * THIS IS AN EARLY BUILD, PLEASE DO NOT REDISTROBUTE
 * 
 ********************************************************
 * 
 * Description:
 *   - 
 *
 * Started: November 20, 2023
 * Updated: Dec 8, 2023
*/

import xapi from 'xapi';
import { Settings, CodecInfo, AudioMap } from './Campfire_2_Config';
import { BuildInterface } from './Campfire_3_UserInterface';
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
  console.info({ Campfire_4_Info: `Checking Installed Macros for Campfire...` })
  const checklist = {
    [`Campfire_1_Main`]: false,
    [`Campfire_2_Config`]: false,
    [`Campfire_3_UserInterface`]: false,
    [`Campfire_4_Initialization`]: false,
    [`Campfire_Node`]: false,
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
        console.debug({ Campfire_4_Debug: `Deactivating Macro [${mac.Name}]`, Cause: `Imported Macros, should be inactive` });
        restartRunTime = true;
      }
    }
  }
  console.info({ Campfire_4_Info: `Campfire Macros Installed!` })

  for (const key in checklist) {
    if (checklist.hasOwnProperty(key) && checklist[key] !== true) {
      let e = `Macro validation failed: [${key}] macro not found!`
      await disableSolution(e);
      throw new Error(e);
    }
  }

  if (restartRunTime) {
    console.debug({ Campfire_4_Debug: `Restarting Macro Runtime`, Cause: `Imported Macros Active` });
    await xapi.Command.Macros.Runtime.Restart();
  }
}

/* 
  Ensures all Campfire Configurations are set properly
*/
Validate.Configuration = async function () {
  console.info({ Campfire_4_Info: `Checking Campfire Configuration...` })
  console.info({ Campfire_4_Info: `Campfire Configuration Checks Out!` })
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
  if (CodecInfo.Authentication.Mode.toLowerCase() == 'independant') {
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
      console.warn({ Campfire_4_Warn: `RoomType not definied, unable to validate Room Scope: [${Settings.RoomType}]` })
      break;
  }
}

/* 
  Checks the Support Notice Agreement
*/
let agreement;

Validate.SupportAgreement = async function () {
  console.info({ Campfire_4_Info: `Checking Campfire Support Agreement...` })

  try {
    agreement = await GMM.read('SupportNoticeTerms');
  } catch (e) {
    let baseTerms = {
      Status: 'Declined',
      Row1: { Description: `I understand that Macros running on Cisco Collaboration Devices are considered Custom Code and are not supported by Cisco TAC` },
      Row2: { Description: `I understand that these Macros are not a formal product of Cisco, but a blueprint as to what's possible by utilizing the Device xAPI` },
      Row3: { Description: `If issues arise, I'll contact my internal Device Administrator or a Cisco Partner for support` },
      Row4: { Description: `I acknowledge that those with Macro Access can edit its content. If I ever meet with the Developer, only the original Macro Code will be considered` }
    }
    await GMM.write('SupportNoticeTerms', baseTerms);
    agreement = baseTerms
  }

  console.info({ Campfire_4_Info: `Support Notice Status: [${agreement.Status}]` })

  return agreement.Status;
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


/* 
  Objects to subscribe and track the Support Notice Process
*/
let SupportHandler = {
  WidgetAction: 'off',
  PageClosed: 'off',
  PageOpened: 'off',
  Standby: 'off',
  PromptDisplay: 'off',
  RowStatus: {
    Row1: false,
    Row2: false,
    Row3: false,
    Row4: false
  }
}

/* 
  Function to Start the Support Notice Process
*/
async function SupportNoticeStart() {
  console.warn({ Campfire_4_Warn: 'Starting Support Notice Process, Waiting for User Decisions...' })
  await xapi.Command.Standby.Deactivate()
  await BuildInterface.SupportAgreement()

  // Checks the SupportHandler Row values to make sure all are true
  function areAllRowsTrue() {
    for (const key in SupportHandler.RowStatus) {
      if (SupportHandler.RowStatus.hasOwnProperty(key) && key !== 'WidgetAction') {
        if (!SupportHandler.RowStatus[key]) {
          return false;
        }
      }
    }
    return true;
  }
  //Set the Support Notice Toggles to off, to match the Row Values
  for (let i = 0; i < 4; i++) { xapi.Command.UserInterface.Extensions.Widget.SetValue({ WidgetId: `Campfire~SupportNotice~Row${i + 1}~Toggle`, Value: 'Off' }) };

  //Close any open panels, and open the Support Notice Panel
  await xapi.Command.UserInterface.Extensions.Panel.Close()
  await delay(500)
  await xapi.Command.UserInterface.Extensions.Panel.Open({ PanelId: 'Campfire~SupportNotice' })
  // Subscribe to the Panel Closed event, in order to keep the Support Notice Panel Open
  // Both Page Opened and Closed are tracked, in order to handle a Logic Loop
  let handlePageLoop = ''
  SupportHandler.PageClosed = xapi.Event.UserInterface.Extensions.Event.PageClosed.on(async event => {
    clearTimeout(handlePageLoop)
    handlePageLoop = setTimeout(async function () {
      if (event.PageId == `Campfire~SupportNotice` && agreement.Status != 'Accepted') {
        await xapi.Command.UserInterface.Extensions.Panel.Open({ PanelId: 'Campfire~SupportNotice' })
        await delay(250);
        await xapi.Command.UserInterface.Message.Alert.Display({ Text: 'Please Read and Review the Support Notice or Turn Off this Macro', Duration: 5 });
      }
    }, 250)
  })
  SupportHandler.PageOpened = xapi.Event.UserInterface.Extensions.Event.PageOpened.on(async event => {
    if (event) {
      clearTimeout(handlePageLoop)
    }
  })

  // Subscribe to the Standby State, in order to keep the Support Notice Panel Open
  SupportHandler.Standby = xapi.Status.Standby.State.on(async event => {
    if (event.toLowerCase() != 'off') {
      console.error(event)
      await xapi.Command.Standby.Deactivate()
      await delay(250)
      await xapi.Command.UserInterface.Extensions.Panel.Open({ PanelId: 'Campfire~SupportNotice' })
    }
  })

  SupportHandler.PromptDisplay = xapi.Event.UserInterface.Message.Prompt.Response.on(event => {
    if (event.FeedbackId == 'Campfire~DeclinePrompt' && event.OptionId.toString() == '1') {
      disableSolution('User Declined Support Notice')
    }
  })

  let proceed = false;
  //Subscribe to Support Notice widgets, to track the 
  SupportHandler.WidgetAction = xapi.Event.UserInterface.Extensions.Widget.Action.on(async event => {
    if ((event.Type == 'changed' || event.Type == 'released') && event.WidgetId.includes('Campfire~SupportNotice')) {
      switch (event.WidgetId) {
        case 'Campfire~SupportNotice~Row1~Toggle':
          SupportHandler.RowStatus.Row1 = event.Value == 'on' ? true : false;
          break;
        case 'Campfire~SupportNotice~Row2~Toggle':
          SupportHandler.RowStatus.Row2 = event.Value == 'on' ? true : false;
          break;
        case 'Campfire~SupportNotice~Row3~Toggle':
          SupportHandler.RowStatus.Row3 = event.Value == 'on' ? true : false;
          break;
        case 'Campfire~SupportNotice~Row4~Toggle':
          SupportHandler.RowStatus.Row4 = event.Value == 'on' ? true : false;
          break;
        case 'Campfire~SupportNotice~Decline':
          //Are you sure Message
          console.log(event)
          xapi.Command.UserInterface.Message.Prompt.Display({
            Title: `Are you sure?`,
            Text: `Choosing Decline will deactivate the Macro. You'll have to re-enable it in the Macro Editor after deactivation`,
            FeedbackId: 'Campfire~DeclinePrompt',
            "Option.1": 'Yes, Decline and Disable Macro',
            "Option.2": 'No, Let me Review the Support Notice'
          })
          break;
        case 'Campfire~SupportNotice~Accept':
          if (areAllRowsTrue()) {
            xapi.Command.UserInterface.Message.Prompt.Display({ Title: 'Thanks', Text: 'Your response has been captured and is stored in the Memory_Storage Macro on this Device', Duration: 10 })
            agreement.Status = 'Accepted';
            await GMM.write('SupportNoticeTerms', agreement)
            await SupportNoticeStop()
            proceed = true;
          } else {
            xapi.Command.UserInterface.Message.Prompt.Display({ Title: 'Unable to Submit', Text: 'The Macro will not start unless all toggles are on.<p>Please continue to review the support notice', Duration: 10 })
          }
          break;
      }
    }
  })
  return new Promise((resolve, reject) => {
    let checkState = setInterval(function () {
      if (proceed) {
        clearInterval(checkState)
        resolve()
      }
    }, 250)
  })
}

/* 
  Function to Stop the Support Notice Process
*/
async function SupportNoticeStop() {
  SupportHandler.WidgetAction(); SupportHandler.WidgetAction = 'off';
  SupportHandler.PageClosed(); SupportHandler.PageClosed = 'off';
  SupportHandler.PageOpened(); SupportHandler.PageOpened = 'off';
  SupportHandler.Standby(); SupportHandler.Standby = 'off';
  SupportHandler.PromptDisplay(); SupportHandler.PromptDisplay = 'off';
  xapi.Command.UserInterface.Extensions.Panel.Close();
  await init.Phase2();
  return new Promise(resolve => {
    resolve()
  })
}

const init = {}

init.Phase1 = async function () {
  console.info({ Campfire_4_Info: `Campfire Phase 1 initializing...` })

  await GMM.memoryInit()

  await Validate.Macros();
  await Validate.Configuration();
  await Validate.SupportAgreement();

  if (agreement.Status == 'Declined') {
    await SupportNoticeStart()
  } else {
    await init.Phase2()
    return new Promise(resolve => {
      resolve()
    })
  }
}

init.Phase2 = async function () {
  console.info({ Campfire_4_Info: `Campfire Phase 1 complete, initializing phase 2...` })

  await Validate.RoomScope();

  await SetupNodeClassConnector();

  return new Promise(resolve => {
    console.info({ Campfire_4_Info: `Campfire initialization Complete!` })
    resolve()
  })
}

async function Run_Setup() { await init.Phase1() }

export { Run_Setup, SendToNodes }