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
*********************************************************x

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

/*
 * ToDo
 * 
 * - Initilization
 *  - Port some Initilization functions from main init to initilization script
 *  - check for valid video signals
 * 
 * - Camera Modes
 *  - Focus Mode
 *    - Test current version
 *  - Conversation Mode
 *    - Build and Test
 *  - Spotlight Mode
 *    - Build and Test
 *  - Quad
 *    - Build and Test
 *  
 *  Node Macro
 *    - Build and Test
 *      - Frames Sync
 *      - PeopleCount Status
 *      - Auto-Configure
 *    - Have initilization Deploy Macro
 *      - Perform Macro Get using raw putxml xAPI
 *      - If missing, deploy
 *    - Generate random login for Main and deploy to nodes
 *    - On node boot, request credentials
 */

/********************************
            Imports
********************************/
import xapi from 'xapi';
import { Settings, CodecInfo, AudioMap } from './Campfire_2_Config_V_0-0-1';
import { BuildInterface, RemoveUnusedInterFaces } from './Campfire_3_UserInterface_V_0-0-1';
import { Run_Setup, SendToNodes } from './Campfire_4_Initialization_V_0-0-1';
import { GMM } from './GMM_Lite_Lib'
import { AZM } from './AZM_Lib';

/********************************
          Prototypes
********************************/


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
          Subscriptions
********************************/


/********************************
          Run Macro
********************************/

let activeCameraMode = ''

async function init() {
  await AZM.Command.Zone.Setup(AudioMap);
  await Run_Setup();

  //Check Node Connection
  const nodePing = await SendToNodes('Initialization', btoa(JSON.stringify({
    IpAddress: '',
    Authentication: CodecInfo.PrimaryCodec.Authentication,
  })))

  if (nodePing.Errors.length > 0) {
    nodePing.Errors.forEach(element => {
      console.error({ Campfire_2_Error: `Failed Node Connection on Initialization`, Response: { Destination: element.GMM_Context.Destination, StatusCode: element.data.StatusCode } })
    })
  }

  //Recover Camera Mode
  try {
    activeCameraMode = await GMM.read('activeCameraMode')
  } catch (e) {
    updateCameraMode(Settings.RoomTypeSettings.Campfire.Camera.Mode.Default.clone())
  }

  console.log({ Campfire_2_Info: `Current Camera Mode: [${activeCameraMode}]` })

  //Build UserInterface // ToDo - Remove UI Automation except Suport Agreement?
  switch (Settings.RoomType.toLowerCase()) {
    case 'campfire pro':
      BuildInterface.Campfire()
      break;
  }
  RemoveUnusedInterFaces('Campfire~CampfirePro')

  //Update UI Feedback
  await xapi.Command.UserInterface.Extensions.Widget.SetValue({ WidgetId: 'Campfire~CampfirePro~CameraFeatures~Mode', Value: activeCameraMode })

  //Update nodes Camera Mode
  console.error({ CameraMode: activeCameraMode })
  SendToNodes('CameraMode', activeCameraMode)

  //Check if the Codec is already in a state where VuMeter Monitoring should be on or off
  const isOnCall = (await xapi.Status.Call.get()) == '' ? false : true;
  const isStreaming = await checkUSBPassthroughState();
  const isSelfViewOn = (await xapi.Status.Video.Selfview.Mode.get() == 'On' ? true : false);

  if ((isOnCall || isStreaming) || isSelfViewOn) {
    console.info({ Campfire_2_Info: `Video Active on Primary Codec` })
    await AZM.Command.Zone.Monitor.Start('Initialization');
  } else {
    console.info({ Campfire_2_Info: `Video Inactive on Primary Codec` })
    await AZM.Command.Zone.Monitor.Stop('Initialization');
  }

  await StartSubscriptions()
}

async function checkUSBPassthroughState() {
  try {
    const hdmiPassthrough = await xapi.Status.Video.Output.HDMI.Passthrough.Status.get();
    if (hdmiPassthrough == 'Active') { return true; } else { return false; };
  } catch (e) { console.debug(e) };

  try {
    const webCam = await xapi.Status.Video.Output.Webcam.Mode.get();
    if (webCam == 'Streaming') { return true; } else { return false; };
  } catch (e) { console.debug(e) };

  return false;
}

async function updateCameraMode(mode) {
  let previous = activeCameraMode.clone()
  activeCameraMode = mode;
  clearCameraAutomationTimeouts()
  SendToNodes('CameraMode', activeCameraMode)
  await GMM.write('activeCameraMode', activeCameraMode)
  if (previous != activeCameraMode) {
    console.log({ Campfire_2_Log: `Camera Mode Updated`, PreviousMode: previous, CurrentMode: activeCameraMode })
  }
}

//Runs Subscriptions found in Subscribe Object
async function StartSubscriptions() {
  const subs = Object.getOwnPropertyNames(Subscribe);
  subs.sort();
  let mySubscriptions = [];
  subs.forEach(element => {
    Subscribe[element]();
    mySubscriptions.push(element);
    Subscribe[element] = function () {
      console.warn({ Campfire_2_Warn: `The [${element}] subscription is already active, unable to fire it again` });
    };
  });
  console.log({ Campfire_2_Log: 'Subscriptions Set', Details: { Total_Subs: subs.length, Active_Subs: mySubscriptions.join(', ') } });
};

const Subscribe = {
  WidgetAction: function () {
    xapi.Event.UserInterface.Extensions.Widget.Action.on(Handle.Event.WidgetAction)
  },
  AZM_Zones: function () {
    AZM.Event.TrackZones.on(Handle.Event.AZM_Zones)
  },
  CallSuccessful: function () {
    xapi.Event.CallSuccessful.on(Handle.Event.CallSuccessful)
  },
  CallDisconnect: function () {
    xapi.Event.CallDisconnect.on(Handle.Event.CallDisconnect)
  },
  SelfViewMode: function () {
    xapi.Status.Video.Selfview.Mode.on(Handle.Status.SelfViewMode)
  }
}

function clearCameraAutomationTimeouts() {
  const list = Object.getOwnPropertyNames(Handle.Timeout.CameraMode)
  list.forEach(element => {
    if (element.toLowerCase() == 'conversation') {
      const convList = Object.getOwnPropertyNames(Handle.Timeout.CameraMode[element])
      if (convList.length > 0) {
        convList.forEach(el => {
          clearInterval(Handle.Timeout.CameraMode[element][el].run)
          Handle.Timeout.CameraMode[element][el].active = false
        })
      }
    } else {
      clearInterval(Handle.Timeout.CameraMode[element].run)
      Handle.Timeout.CameraMode[element].active = false;
    }
  })
}

const Handle = {
  Timeout: {
    CameraMode: {
      OnSilence: { run: '' },
      Focus: {
        active: false,
        run: ''
      },
      Conversation: {},
      Spotlight: {
        active: false,
        run: ''
      }
    }
  },
  Interval: {},
  Event: {
    CallSuccessful: async function () {
      await AZM.Command.Zone.Monitor.Start('CallSuccessful')
    },
    CallDisconnect: async function () {
      await AZM.Command.Zone.Monitor.Stop('CallDisconnect')
    },
    WidgetAction: async function (action) {
      if (action.Type == 'released') {
        switch (action.WidgetId) {
          case 'Campfire~CampfirePro~CameraFeatures~Mode':
          updateCameraMode(action.Value)
            break;
        }
      }
      if (action.Type == 'pressed') {
        //Run Logic to Show information Camera Mode
      }
    },
    AZM_Zones: async function (zonePayload) {
      console.debug({ Campfire_2_Debug: `[${zonePayload.Zone.Label}] Zone state updated to [${zonePayload.Zone.State}]` })
      switch (Settings.RoomType.toLowerCase()) {
        case 'campfire pro':
          switch (activeCameraMode.toLowerCase()) {
            case 'focus':
              //If Focus the focus onJoin timeout is inactive and the Zone is high
              if (!Handle.Timeout.CameraMode.Focus.active && zonePayload.Zone.State == `High`) {
                //Set the focus timeout activity to true
                Handle.Timeout.CameraMode.Focus.active = true;

                //Set the focus timeout to false after the onjoin timeout clears
                Handle.Timeout.CameraMode.Focus.run = setTimeout(function () {
                  Handle.Timeout.CameraMode.Focus.active = false;
                }, Settings.RoomTypeSettings.Campfire.Camera.Mode.Focus.TransitionTimeout.OnJoin);

                //Clear the on Room Silence Timout, and reset it
                clearTimeout(Handle.Timeout.CameraMode.OnSilence)
                Handle.Timeout.CameraMode.OnSilence = setTimeout(async function () {
                  await composeCamera(true, [])
                }, Settings.RoomTypeSettings.Campfire.Camera.Default_Overview.TransitionTimeout.OnSilence)

                //Compose the High Camera
                await composeCamera(false, zonePayload.Assets.CameraConnectorId)
              }
              break;
            case 'conversation':
              break
            case 'spotlight':
              break
            case 'quad':
              break
            case 'manual':
              break
          }
          break;
      }
    }
  },
  Status: {
    SelfViewMode: async function (mode) {
      const isOnCall = (await xapi.Status.Call.get()) == '' ? false : true;
      if (!isOnCall) {
        if (mode.toLowerCase() == 'on') {
          await AZM.Command.Zone.Monitor.Start('SelviewMode On Outside Call')
        } else {
          await AZM.Command.Zone.Monitor.Stop('SelviewMode Off Outside Call')
        }
      }
    }
  }
}

let peopleCountOverView = Settings.RoomTypeSettings.Campfire.Camera.Default_Overview.Composition.clone();

function determineDefaultComposition() {
  let defaultComposition = []
  switch (Settings.RoomTypeSettings.Campfire.Camera.Default_Overview.Mode.toLowerCase()) {
    case 'on':
      defaultComposition = Settings.RoomTypeSettings.Campfire.Camera.Default_Overview.Composition.clone();
      break;
    case 'off':
      defaultComposition = 'off'
      break;
    case 'auto': default:
      defaultComposition = peopleCountOverView.clone();
      break;
  }
  console.info({ Campfire_2_Info: `Default Overview Composition is [${defaultComposition}]` });
  return defaultComposition;
}

let lastknownComposition = []

async function composeCamera(isDefault = false, ...connectorIds) {

  let composition = connectorIds.toString().split(',')

  const checkForCompositionChanges = (composition.length === lastknownComposition.length) && composition.every((value, index) => value === lastknownComposition[index]);
  //Only switch to the new camera arrangement if it's different from the last known state
  if (!checkForCompositionChanges) {
    if (isDefault) {
      const defaultComposition = determineDefaultComposition();
      if (defaultComposition != 'off') {
        await xapi.Command.Video.Input.SetMainVideoSource({ ConnectorId: defaultComposition, Layout: 'Equal' });
        composition = defaultComposition
      }
      composition = lastknownComposition
    } else {
      await xapi.Command.Video.Input.SetMainVideoSource({ ConnectorId: composition, Layout: 'Equal' });
    }
    console.info({ Campfire_2_Info: `Updating camera composition to [${composition}]` })
    lastknownComposition = composition.clone()
  }
}

function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }

async function delayedStartup() {
  while (true) {
    const upTime = await xapi.Status.SystemUnit.Uptime.get()

    if (upTime > 120) {
      await init()
      break;
    } else {
      delay(5000)
    }
  }
}

delayedStartup()
