/********************************************************
Copyright (c) 2023 Cisco and/or its affiliates.
This software is licensed to you under the terms of the Cisco Sample
Code License, Version 1.1 (the "License"). You may obtain a copy of the
License at
               https://developer.cisco.com/docs/licenses
All use of the material herein must be in accordance with the terms of
the License. All rights not expressly granted by the License are
reserved. Unless required by applicable law or agreed to separately in
writing, stware distributed under the License is distributed on an "AS
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
 * Updated: Dec 15, 2023
*/

/********************************
            Imports
********************************/
import xapi from 'xapi';
import { Settings, CodecInfo, AudioMap } from './Campfire_2_Config';
import { BuildInterface, RemoveUnusedInterFaces } from './Campfire_3_UserInterface';
import { Run_Setup, SendToNodes } from './Campfire_4_Initialization';
import { GMM } from './GMM_Lite_Lib'
import { AZM } from './AZM_Lib';

/********************************
          Prototypes
********************************/

// Alternative Includes prototype that replaces the Strict Equality operator (===) with theEquality Operator (==)
Array.prototype.includish = function (value) {
  for (let i = 0; i < this.length; i++) {
    if (this[i] == value) {
      return true;
    }
  }
  return false;
};


// Enables a Clean Cloning of an Object withoutaltering the original object
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

//Performs a soft check to see if the incoming data is a string before evaluating
String.prototype.safeToLowerCase = function () {
  if (this && typeof this === 'string') {
    return this.toLowerCase();
  } else {
    return this; // Return the original value if it's not a valid string
  }
};

/********************************
        Class Definitions
********************************/

//Instatiates an array, that handles the adding and removing of objects in it's index
//Used to alter the array passed into SetMainSurce for PeopleCount and Conversation based compositions
class CameraCompositionTracker {
  constructor(startingComposition, defaultComposition, label) {
    this.StartingComposition = startingComposition.map(element => parseInt(element));
    this.DefaultComposition = defaultComposition.map(element => parseInt(element));
    this.CurrentComposition = startingComposition.map(element => parseInt(element));
    this.Label = label
  }
  addCamera(cameraId) {
    this.CurrentComposition.push(parseInt(cameraId))
    this.CurrentComposition = [...new Set(this.CurrentComposition)];
    this.CurrentComposition = this.CurrentComposition.sort(function (a, b) { return a - b; });
    console.log({ Campfire_1_Log: `Composition [${this.Label}] Updated`, Action: `Adding Camera [${cameraId}]`, Composition: pretty_Composition_Log(this.CurrentComposition) })
    return this.CurrentComposition;
  }
  removeCamera(cameraId) {
    const index = this.CurrentComposition.indexOf(parseInt(cameraId));
    if (index !== -1) {
      this.CurrentComposition.splice(index, 1);
      if (this.CurrentComposition.length < 1) {
        console.warn({ Campfire_1_Warn: `Composition [${this.Label}] Empty!` })
      }
      this.CurrentComposition = [...new Set(this.CurrentComposition)];
      this.CurrentComposition = this.CurrentComposition.sort(function (a, b) { return a - b; });
      console.log({ Campfire_1_Log: `Composition [${this.Label}] Updated`, Action: `Removing Camera [${cameraId}]`, Composition: pretty_Composition_Log(this.CurrentComposition) })
      return this.CurrentComposition;
    } else {
      console.log({ Campfire_1_Log: `Composition [${this.Label}] Updated`, Action: 'No Action', Composition: pretty_Composition_Log(this.CurrentComposition) })
      return this.CurrentComposition;
    }
  }
  reset() {
    console.debug({ Campfire_1_Debug: `Composition [${this.Label}] Reset` })
    this.CurrentComposition = this.DefaultComposition.clone();
    return this
  }
  get() {
    return this.CurrentComposition;
  }
}

/********************************
          Const/Var/Let
********************************/

//Test that shows when a specific camera mode is slected
const cameraModeDescriptions = {
  Speaker: 'Maintain focus on the active speaker in your room, so your audience doesn\'t lose sight of them',
  Everyone: 'Promote Equity in your space, leveraging all 4 cameras and Frames Camera Intelligence',
  Conversation_SPK: 'Keep all conversations alive, by mixing all cameras with active speakers in front of them',
  Conversation_FR: 'Keep all conversations alive, by mixing all cameras with active speakers in front of them'
}

// Used to track and implement the Active Campfire Camera mode
let activeCameraMode = '';

// Used to track the last know Camera Composition, primarly used to prevent excessive SetMainSource Changes
let lastknownComposition = [];

// Data about the Node Codecs, used for logging and updating node Information
let nodeInfo = [];

// Initialize the array used to track the PeopleCount compostion
const peopleDataComposition = new CameraCompositionTracker([1, 2, 3, 4], [1, 2, 3, 4], 'PeopleCount');

// Initialize the array used to track the Conversation compostion
const conversationComposition = new CameraCompositionTracker([], [1, 2, 3, 4], 'Conversation');

/********************************
      Initialization Function
********************************/

async function init() {
  await AZM.Command.Zone.Setup(AudioMap);
  await Run_Setup();

  //Check Node Connection
  const nodePing = await SendToNodes('Initialization', btoa(JSON.stringify({
    IpAddress: await xapi.Status.Network[1].IPv4.Address.get(),
    Authentication: CodecInfo.PrimaryCodec.Authentication,
  })))

  if (nodePing.Errors.length > 0) {
    nodePing.Errors.forEach(element => {
      console.error({ Campfire_1_Error: `Failed Node Connection on Initialization`, Response: { Destination: element.GMM_Context.Destination, StatusCode: element.data.StatusCode } })
    })
  }

  //Recover Camera Mode
  try {
    activeCameraMode = await GMM.read('activeCameraMode');
  } catch (e) {
    Handle.Error(e, 'GMM.read', 172)
    updateCameraMode(Settings.RoomTypeSettings.Campfire.Camera.Mode.Default, 'Camera Recovery Failed')
  }

  console.log({ Campfire_1_Info: `Camera Mode Identified: [${activeCameraMode}]` })

  //Build UserInterface // ToDo - Remove UI Automation except Suport Agreement?
  switch (Settings.RoomType.safeToLowerCase()) {
    case 'campfire pro':
      BuildInterface.Campfire()
      break;
  }
  RemoveUnusedInterFaces('Campfire~CampfirePro');

  //Re-apply camera mode on startup
  await updateCameraMode(activeCameraMode, 'Init')

  nodeInfo = CodecInfo.NodeCodecs.clone()
  nodeInfo.forEach((e, i) => { delete nodeInfo[i].IpAddress; delete nodeInfo[i].Authentication })

  await SendToNodes('RollAssignment', nodeInfo)

  let connectedNodes = ``;

  nodeInfo.forEach((el, i) => {
    connectedNodes = connectedNodes + `- Label: [${el.Label}] || Index: [${i}]\n\t`
  })

  await xapi.Command.SystemUnit.SignInBanner.Clear().catch(e => Handle.Error(e, 'SignInBanner.Clear', 202));
  await xapi.Command.SystemUnit.SignInBanner.Set({}, `Campfire Blueprint Installed
  SystemRole: [Primary]
  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
  Connected Nodes:\n\t${connectedNodes}
  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
  To configure Campfire, Edit the [Campfire_2_Config] Macro`).catch(e => Handle.Error(e, 'SignInBanner.Set', 203));

  //Update nodes Camera Mode
  await SendToNodes('CameraMode', activeCameraMode)

  //Check if the Codec is already in a state where VuMeter Monitoring should be on or off
  const isOnCall = (await xapi.Status.Call.get()) == '' ? false : true;
  const isStreaming = await checkUSBPassthroughState();
  const isSelfViewOn = (await xapi.Status.Video.Selfview.Mode.get() == 'On' ? true : false);

  if ((isOnCall || isStreaming) || isSelfViewOn) {
    console.info({ Campfire_1_Info: `Video Active on Primary Codec` })
    await AZM.Command.Zone.Monitor.Start('Initialization');
  } else {
    console.info({ Campfire_1_Info: `Video Inactive on Primary Codec` })
    await AZM.Command.Zone.Monitor.Stop('Initialization');
  }

  await StartSubscriptions()
}

/********************************
      Function Definitions
********************************/

//Used to check which version of USB Passthrough is used, and to alter the subscription needed for automation
async function checkUSBPassthroughState() {
  try {
    const hdmiPassthrough = await xapi.Status.Video.Output.HDMI.Passthrough.Status.get();
    if (hdmiPassthrough == 'Active') { return true; } else { return false; };
  } catch (e) { Handle.Error(e, 'HDMI.Passthrough.Status', 236) };

  try {
    const webCam = await xapi.Status.Video.Output.Webcam.Mode.get();
    if (webCam == 'Streaming') { return true; } else { return false; };
  } catch (e) { Handle.Error(e, 'Output.Webcam.Mode', 241) };

  return false;
}

// Used to updated the Campfire Camera Mode
async function updateCameraMode(mode, cause) {
  try {
    clearCameraAutomationTimeouts() //ToDo - Review and Check for Errors
    let previous = activeCameraMode.clone()
    activeCameraMode = mode;
    xapi.Command.UserInterface.Extensions.Widget.SetValue({ WidgetId: 'Campfire~CampfirePro~CameraFeatures~Info', Value: `${mode}: ${cameraModeDescriptions[mode]}` })
    await setSpeakerTrack(mode) // ToDo - Review and Check for Errors
    await SendToNodes('CameraMode', activeCameraMode) //ToDo - Review and Check for Errors
    await GMM.write('activeCameraMode', activeCameraMode)
    if (previous != activeCameraMode) {
      console.log({ Campfire_1_Log: `Camera Mode Updated`, PreviousMode: previous, CurrentMode: activeCameraMode, Cause: cause })
    }
  } catch (e) {
    Handle.Error(e, 'updateCameraMode', 249);
  }
}

//Used to define the Speakertrack behavior in the Camera Modes
async function setSpeakerTrack(mode) {
  try {
    switch (mode) {
      case 'Speaker':
        await xapi.Command.Cameras.SpeakerTrack.Activate()
        await xapi.Command.Cameras.SpeakerTrack.Frames.Deactivate()
        console.info({ Campfire_1_Info: `Camera Mode changed to [${mode}]` })
        break;
      case 'Everyone': case 'Conversation_FR':
        await xapi.Command.Cameras.SpeakerTrack.Activate()
        await xapi.Command.Cameras.SpeakerTrack.Frames.Activate()
        console.info({ Campfire_Node_Info: `Camera Mode changed to [${mode}]` })
        break;
      case 'Conversation_SPK':
        await xapi.Command.Cameras.SpeakerTrack.Activate()
        await xapi.Command.Cameras.SpeakerTrack.Frames.Deactivate()
        console.info({ Campfire_Node_Info: `Camera Mode changed to [${mode}]` })
        break;
      default:
        console.warn({ Campfire_Node_Warn: `Camera Mode [${mode}] not defined.` })
        break
    }
  } catch (e) {
    Handle.Error(e, 'setSpeakerTrack', 267)
  }
}

//Runs Subscriptions found in Subscribe Object, allows for controls start of subscriptions
async function StartSubscriptions() {
  const subs = Object.getOwnPropertyNames(Subscribe);
  subs.sort();
  let mySubscriptions = [];
  subs.forEach(element => {
    Subscribe[element]();
    mySubscriptions.push(element);
    Subscribe[element] = function () {
      console.warn({ Campfire_1_Warn: `The [${element}] subscription is already active, unable to fire it again` });
    };
  });
  console.log({ Campfire_1_Log: 'Subscriptions Set', Details: { Total_Subs: subs.length, Active_Subs: mySubscriptions.join(', ') } });
};

//Define subscriptions and run any other on boot actions requiring a status pull
const Subscribe = {
  WidgetAction: function () {
    xapi.Event.UserInterface.Extensions.Widget.Action.on(Handle.Event.WidgetAction)
  },
  AZM_Zones: function () {
    AZM.Event.TrackZones.on(Handle.Event.AZM_Zones)
  },
  GMM_Receiver: function () {
    GMM.Event.Receiver.on(Handle.Event.GMM_Receiver)
  },
  CallSuccessful: function () {
    xapi.Event.CallSuccessful.on(Handle.Event.CallSuccessful)
  },
  CallDisconnect: function () {
    xapi.Event.CallDisconnect.on(Handle.Event.CallDisconnect)
  },
  SelfViewMode: function () {
    xapi.Status.Video.Selfview.Mode.on(Handle.Status.SelfViewMode)
  },
  StandbyStatus: function () {
    xapi.Status.Standby.State.on(Handle.Status.StandbyStatus)
  },
  FramesStatus: function () {
    xapi.Status.Cameras.SpeakerTrack.Frames.Status.on(Handle.Status.FramesStatus)
  }
}

//Clears timeouts and intervals contained within the Handle object
function clearCameraAutomationTimeouts() { // ToDo - Review for Errors
  try {
    const list = Object.getOwnPropertyNames(Handle.Timeout.CameraMode)
    list.forEach(element => {
      switch (element.safeToLowerCase()) {
        case 'onsilince':
          clearInterval(Handle.Timeout.CameraMode.OnSilence.run)
          break;
        case 'speaker':
          clearInterval(Handle.Timeout.CameraMode.Speaker.run)
          Handle.Timeout.CameraMode.Speaker.active = false;
          break;
        case 'conversation':
          const convList = Object.getOwnPropertyNames(Handle.Timeout.CameraMode.Conversation)
          if (convList.length > 0) {
            convList.forEach(el => {
              clearInterval(Handle.Timeout.CameraMode.Conversation[el].run)
              Handle.Timeout.CameraMode.Conversation[el].active = false
            })
          }
          break;
        case 'everyone':
          break;
        case 'spotlight':
          clearInterval(Handle.Timeout.CameraMode.Spotlight.run)
          Handle.Timeout.CameraMode.Spotlight.active = false;
          break;
      }
    })
  } catch (e) {
    Handle.Error(e, 'clearCameraAutomationTimeouts', 347)
  }
}

//Used to discover the Node ConnectorId based on provided Serial number
function findNodeCameraConnector(codecSerialNumber, cause) {

  for (const device of CodecInfo.NodeCodecs) {
    if (device.CodecSerialNumber == codecSerialNumber) {
      return device.PrimaryCodec_QuadCamera_ConnectorId;
    }
  }
  throw Error({ Campfire_1_Error: `Unable to Node Camera ConnectorId using Serial [${codecSerialNumber}]`, Cause: cause })
}

function buildConversationTimeoutActivity() {
  const zones = AudioMap.Zones.clone()
  let list = {}
  zones.forEach((el, i) => {
    list[i + 1] = { label: el.Label, active: false, run: '' }
  })
  return list
}

// The Handle object contains Objects or Functions that are handled in another process, such as an interval, event or status change
const Handle = {
  Timeout: {
    CameraMode: {
      OnSilence: { run: '' },
      Speaker: {
        active: false,
        run: ''
      },
      Conversation: buildConversationTimeoutActivity(),
      Everyone: '',
      Spotlight: {
        active: false,
        run: ''
      }
    }
  },
  Interval: {
    OnSilence: ''
  },
  Event: {
    CallSuccessful: async function () {
      try {
        await
          await AZM.Command.Zone.Monitor.Start('CallSuccessful')
      } catch (e) {
        Handle.Error(e, 'Handle.Event.CallSuccessful', 400)
      }
    },
    CallDisconnect: async function () {
      try {
        await AZM.Command.Zone.Monitor.Stop('CallDisconnect')
        await updateCameraMode(Settings.RoomTypeSettings.Campfire.Camera.Mode.Default, 'CallDisconnect')
        await xapi.Command.UserInterface.Extensions.Widget.SetValue({ WidgetId: 'Campfire~CampfirePro~CameraFeatures~Mode', Value: activeCameraMode })
      } catch (e) {
        Handle.Error(e, 'Handle.Event.CallDisconnect', 407)
      }
    },
    WidgetAction: async function (action) {
      try {
        if (action.Type == 'released') {
          switch (action.WidgetId) {
            case 'Campfire~CampfirePro~CameraFeatures~Mode':
              await updateCameraMode(action.Value, 'Widget Action')
              if (action.Value == 'Everyone') {
                await composeCamera(false, [1, 2, 3, 4])
              }
              break;
          }
        }
      } catch (e) {
        Handle.Error(e, 'Handle.Event.WidgetAction', 416)
      }
    },
    GMM_Receiver: async function (message) {
      try {
        if (message.App.includes('Campfire_Node')) {
          switch (message.Value.Method) {
            case 'PeopleCountUpdate': {
              if (Settings.RoomTypeSettings.Campfire.Camera.Default_Overview.Mode.safeToLowerCase() == 'auto') {
                if (message.Value.Data <= 0) {
                  peopleDataComposition.removeCamera(findNodeCameraConnector(message.Source.Id))
                } else {
                  peopleDataComposition.addCamera(findNodeCameraConnector(message.Source.Id))
                }
              }
            }
          }
        }
      } catch (e) {
        Handle.Error(e, 'Handle.Event.GMM_Receiver', 432)
      }
    },
    AZM_Zones: async function (zonePayload) {
      console.debug({ Campfire_1_Debug: `[${zonePayload.Zone.Label}] Zone State updated to [${zonePayload.Zone.State}]`, ConnectorId: zonePayload.Connector.Id, SubId: zonePayload.Connector?.SubId })
      switch (Settings.RoomType.safeToLowerCase()) {
        case 'campfire pro':
          switch (activeCameraMode.safeToLowerCase()) {
            case 'speaker':
              try {
                //If Speaker the Speaker onJoin timeout is inactive and the Zone is high
                if (!Handle.Timeout.CameraMode.Speaker.active && zonePayload.Zone.State == `High`) {
                  //Set the Speaker timeout activity to true
                  Handle.Timeout.CameraMode.Speaker.active = true;

                  //Set the Speaker timeout to false after the onjoin timeout clears
                  Handle.Timeout.CameraMode.Speaker.run = setTimeout(function () {
                    Handle.Timeout.CameraMode.Speaker.active = false;
                  }, Settings.RoomTypeSettings.Campfire.Camera.Mode.Speaker.TransitionTimeout.OnJoin);

                  //Clear the on Room Silence Timout, and reset it
                  clearTimeout(Handle.Timeout.CameraMode.OnSilence)
                  clearInterval(Handle.Interval.OnSilence)
                  Handle.Timeout.CameraMode.OnSilence = setTimeout(async function () {
                    await composeCamera(true, [])
                    if (Settings.RoomTypeSettings.Campfire.Camera.Default_Overview.Mode.safeToLowerCase() == 'auto') {
                      Handle.Interval.OnSilence = setInterval(async function () {
                        let peopleComposition = peopleDataComposition.get() == '' ? peopleDataComposition.DefaultComposition : peopleDataComposition.get();
                        await composeCamera(true, peopleComposition.DefaultComposition)
                      }, 2000)
                    }
                  }, Settings.RoomTypeSettings.Campfire.Camera.Default_Overview.TransitionTimeout.OnSilence)

                  //Compose the High Camera
                  await composeCamera(false, zonePayload.Assets.CameraConnectorId)
                }
              } catch (e) {
                Handle.Error(e, 'Handle.Event.AZM > Speaker', 456)
              }
              break;
            case 'everyone':
              clearTimeout(Handle.Timeout.CameraMode.OnSilence)
              clearInterval(Handle.Interval.OnSilence)
              break;
            case 'conversation_spk': case 'conversation_fr':
              try {
                if (!Handle.Timeout.CameraMode.Conversation[zonePayload.Zone.Id].active && zonePayload.Zone.State == `High`) {
                  //Set the Conversation timeout activity to true
                  Handle.Timeout.CameraMode.Conversation[zonePayload.Zone.Id].active = true;
                  conversationComposition.addCamera(zonePayload.Assets.CameraConnectorId)

                  //Set the Conversation timeout to false after the onjoin timeout clears
                  clearTimeout(Handle.Timeout.CameraMode.OnSilence)
                  clearInterval(Handle.Interval.OnSilence)
                  function runHandler(timeout) {
                    Handle.Timeout.CameraMode.Conversation[zonePayload.Zone.Id].run = setTimeout(function () {
                      let checkState = AZM.Status.Audio.Zone[zonePayload.Zone.Id].State.get()
                      if (checkState != 'High') {
                        Handle.Timeout.CameraMode.Conversation[zonePayload.Zone.Id].active = false;
                        conversationComposition.removeCamera(zonePayload.Assets.CameraConnectorId)
                        let checkCompArr = conversationComposition.get()
                        if (checkCompArr.length < 1) {
                          composeCamera(true, [])
                        }
                        if (Settings.RoomTypeSettings.Campfire.Camera.Default_Overview.Mode.safeToLowerCase() == 'auto') {
                          Handle.Interval.OnSilence = setInterval(async function () {
                            let peopleComposition = peopleDataComposition.get() == '' ? peopleDataComposition.DefaultComposition : peopleDataComposition.get();
                            await composeCamera(true, peopleComposition.DefaultComposition)
                          }, 2000)
                        }
                      } else {
                        runHandler(Settings.RoomTypeSettings.Campfire.Camera.Mode.Conversation.TransitionTimeout.Continue)
                      }
                    }, timeout);
                  }

                  runHandler(Settings.RoomTypeSettings.Campfire.Camera.Mode.Conversation.TransitionTimeout.OnJoin)
                }
                //Compose the High Camera
                await composeCamera(false, conversationComposition.get())
              } catch (e) {
                Handle.Error(e, 'Handle.Event.AZM > Conversation', 492)
              }
              break
            default:
              break
          }
          break;
      }
    }
  },
  Status: {
    SelfViewMode: async function (mode) {
      try {
        const isOnCall = (await xapi.Status.Call.get()) == '' ? false : true;
        if (!isOnCall) {
          if (mode.safeToLowerCase() == 'on') {
            await AZM.Command.Zone.Monitor.Start('SelviewMode On Outside Call')
          } else {
            await AZM.Command.Zone.Monitor.Stop('SelviewMode Off Outside Call')
          }
        }
      } catch (e) {
        Handle.Error(e, 'Handle.Status.SelfviewMode', 540)
      }
    },
    StandbyStatus: async function (level) {
      try {
        await SendToNodes('StandbyState', level)
      } catch (e) {
        Handle.Error(e, 'Handle.Status.StandbyStatus', 554)
      }
    },
    FramesStatus: async function (state) {
      try {
        await SendToNodes('FramesState', state)
      } catch (e) {
        Handle.Error(e, 'Handle.Status.FramesStatus', 561)
      }
    },
  },
  Error: function (err, func, lineReference) {
    err['Campfire_Context'] = { "Function": func, "Line": lineReference }
    console.error(err)
  }
}


// Determines the default overview camera composition based on user set configuration
function determineDefaultComposition() {
  let defaultComposition = []
  switch (Settings.RoomTypeSettings.Campfire.Camera.Default_Overview.Mode.safeToLowerCase()) {
    case 'on':
      defaultComposition = Settings.RoomTypeSettings.Campfire.Camera.Default_Overview.Composition.clone();
      break;
    case 'off':
      defaultComposition = 'off'
      break;
    case 'auto': default:
      defaultComposition = peopleDataComposition.get();
      break;
  }
  return defaultComposition;
}

// Used to compose a new MainSource composition based on a provided array
async function composeCamera(isDefault = false, ...connectorIds) {
  try {

    let composition = connectorIds.toString().split(',')
    if (isDefault) {
      composition = determineDefaultComposition()
    }

    if (composition == 'off' || composition == '') {
      return
    }

    const checkForCompositionChanges = (composition.length === lastknownComposition.length) && composition.every((value, index) => value === lastknownComposition[index]);
    //Only switch to the new camera arrangement if it's different from the last known state
    if (!checkForCompositionChanges) {
      try {
        await xapi.Command.Video.Input.SetMainVideoSource({ ConnectorId: composition, Layout: 'Equal' });
        console.log({ Campfire_1_Log: `Updating Camera Composition: ${pretty_Composition_Log(composition)}` })
        lastknownComposition = composition.clone()
      } catch (e) {
        Handle.Error(e, 'checkForCompositionChanges', 561)
      }
    }
  } catch (e) {
    Handle.Error(e, 'composeCamera', 594)
  }
}

// Used to pair the Device Label with it's associated Camera ConnectorId to allow a readable print of the provided composition
function pretty_Composition_Log(comp) {
  const resultString = comp.map(number => {
    const matchingItem = nodeInfo.find(item => item.PrimaryCodec_QuadCamera_ConnectorId === number.toString());
    return matchingItem ? `[${matchingItem.Label}: ${number}]` : `Connector ID ${number} not found`;
  }).join(', ');
  return resultString;
}

//Used to delay an action where neccessary
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }

// Used to handle a device restart, on boot, the script runs too quickly, causing an error.
// This slows that process down by checking the uptime
async function delayedStartup(time = 120) {
  while (true) {
    const upTime = await xapi.Status.SystemUnit.Uptime.get()

    if (upTime > time) {
      await init()
      break;
    } else {
      delay(5000)
    }
  }
}

delayedStartup()
