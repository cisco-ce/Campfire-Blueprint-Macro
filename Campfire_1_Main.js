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

/********************************
            Imports
********************************/
import xapi from 'xapi';
import { Settings, CodecInfo, AudioMap } from './Campfire_2_Config';
import { Run_Setup, SendToNodes } from './Campfire_3_Initialization';
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


// Enables a Clean Cloning of an Object without altering the original object
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
    console.log({ Campfire_1_Log: `Composition [${this.Label}] Updated`, Action: `Adding Camera [${cameraId}]`, Composition: prettyCompositionLog_nodeInfo(this.CurrentComposition) })
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
      console.log({ Campfire_1_Log: `Composition [${this.Label}] Updated`, Action: `Removing Camera [${cameraId}]`, Composition: prettyCompositionLog_nodeInfo(this.CurrentComposition) })
      return this.CurrentComposition;
    } else {
      console.log({ Campfire_1_Log: `Composition [${this.Label}] Updated`, Action: 'No Action', Composition: prettyCompositionLog_nodeInfo(this.CurrentComposition) })
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

//Test that shows when a specific camera mode is selected
const cameraModeDescriptions = {
  Speaker: 'Maintain focus on the active speaker in your room, so your audience doesn\'t lose sight of them',
  Everyone: 'Promote Equity in your space, leveraging all 4 cameras and Frames Camera Intelligence',
  Conversation: 'Keep the conversations alive, by mixing all cameras with a closeup of each active speaker',
  Side_By_Side: 'Mix the Active Speakers into view, framing all others near them'
}

//Default PTZ Position for all Quadcameras when someone actively mutes a the room
const mutedOverviewPTZPosition = { Pan: -39, Tilt: -492, Zoom: 8210, Lens: 'Wide' }

// Used to track and implement the Active Campfire Camera mode
let activeCameraMode = '';

// Used to track for changes in Camera mode selection
let previousCameraMode = Settings.RoomTypeSettings.Campfire.Camera.Mode.Default.clone();

// Used to track the currentCamera Composition
let currentComposition = [];

// Used to track the last known Camera Composition, primarily used to prevent excessive SetMainSource Changes
let lastknownComposition = [];

// Data about the Node Codecs, used for logging and updating node Information
let nodeInfo = [];

// Initialize the array used to track the PeopleCount composition
const peopleDataComposition = new CameraCompositionTracker([], [1, 2, 3, 4], 'PeopleCount');

// Initialize the array used to track the Conversation composition
const conversationComposition = new CameraCompositionTracker([], [1, 2, 3, 4], 'Conversation');

// Used to check the last known audio zone trigger in Camera Mode Speaker, helps clean up logs
let lastknownSpeaker_ZoneId = 0;

//Used to check if Speakertracking is available on this codec
let spkState = '';

/********************************
      Initialization Function
********************************/

async function init() {
  console.warn({ Campfire_1_Warn: `Initializing Campfire Blueprint...` })
  await AZM.Command.Zone.Setup(AudioMap);
  await Run_Setup();

  spkState = (await xapi.Status.Cameras.SpeakerTrack.Availability.get()) == 'Available' ? true : false;

  nodeInfo = CodecInfo.NodeCodecs.clone();
  nodeInfo.forEach((e, i) => { delete nodeInfo[i].IpAddress; delete nodeInfo[i].Authentication });
  //If a 4 Codec Design, add the Primary Codec to the nodeInfo
  if (CodecInfo.PrimaryCodec.PrimaryCodec_QuadCamera_ConnectorId > 0 && spkState) {
    nodeInfo.unshift(CodecInfo.PrimaryCodec.clone());
    nodeInfo.forEach((e, i) => { delete nodeInfo[i].IpAddress; delete nodeInfo[i].Authentication });
  }

  let signinBannerArray = nodeInfo.clone();

  if (spkState) {
    Subscribe.PeopleCountCurrent = async function () {
      if (Settings.RoomTypeSettings.Campfire.Camera.Default_Overview.Mode.safeToLowerCase() == 'auto') {
        let currentPeople = await xapi.Status.RoomAnalytics.PeopleCount.Current.get()
        if (currentPeople <= 0) {
          peopleDataComposition.removeCamera(CodecInfo.PrimaryCodec.PrimaryCodec_QuadCamera_ConnectorId);
        } else {
          peopleDataComposition.addCamera(CodecInfo.PrimaryCodec.PrimaryCodec_QuadCamera_ConnectorId);
        }
      }
      xapi.Status.RoomAnalytics.PeopleCount.Current.on(Handle.Status.PeopleCountCurrent);
    }
  }

  await StartSubscriptions();

  if (Settings.RoomTypeSettings.Campfire.Camera.UserInterface.Visibility.toLowerCase() == 'hidden') {
    console.debug({ Campfire_1_Debug: `Campfire Panel hidden away` })
    xapi.Command.UserInterface.Extensions.Panel.Update({ PanelId: 'Campfire~CampfirePro', Visibility: 'Hidden' })
    xapi.Command.UserInterface.Extensions.Panel.Close();
  } else {
    xapi.Command.UserInterface.Extensions.Panel.Update({ PanelId: 'Campfire~CampfirePro', Visibility: 'Auto' })
  }

  mutedOverviewPTZPosition.CameraId = await findPrimaryQuadCameraId();

  //Recover Camera Mode
  try {
    activeCameraMode = await GMM.read('activeCameraMode');
  } catch (e) {
    Handle.Error(e, 'GMM.read', 172)
    updateCameraMode(Settings.RoomTypeSettings.Campfire.Camera.Mode.Default, 'Camera Recovery Failed')
  }

  console.log({ Campfire_1_Info: `Camera Mode Identified: [${activeCameraMode}]` })

  let standbyState = (await xapi.Status.Standby.State.get()) == 'Standby' ? 'Standby' : 'Off';

  //Check Node Connection
  const initializeNodes = await SendToNodes('Initialization', btoa(JSON.stringify({
    IpAddress: await xapi.Status.Network[1].IPv4.Address.get(),
    Authentication: CodecInfo.PrimaryCodec.Authentication,
    CameraMode: activeCameraMode,
    RollAssignment: nodeInfo,
    StandbyStatus: standbyState,
    MutedPTZ: mutedOverviewPTZPosition
  })))

  if (initializeNodes.Errors.length > 0) {
    initializeNodes.Errors.forEach(element => {
      xapi.Command.UserInterface.Message.Alert.Display({ Title: `⚠️ Campfire Macro Error ⚠️`, Text: `Please review the [${_main_macro_name()}] Macro for more details` })
      throw new Error({
        Campfire_1_Error: `Failed to initialize node on macro startup`,
        Response: { Destination: element.GMM_Context.Destination, StatusCode: element.data.StatusCode }
      })
    })
  }

  // Get current Mute Status
  let muteStatus = await xapi.Status.Audio.Microphones.Mute.get();

  //Re-apply camera mode on startup, unless codec is muted
  if (muteStatus == 'Off') { await updateCameraMode(activeCameraMode, 'Init'); } else { await runMuteState(); };

  //Assemble Signin Banner Message
  let nodeBannerMessage = ``;

  signinBannerArray.forEach((el, i) => {
    nodeBannerMessage = nodeBannerMessage + `- Label: [${el.Label}] || Index: [${i}]\n\t`;
  })

  // Set primary Signin Banner Message
  await xapi.Command.SystemUnit.SignInBanner.Clear().catch(e => Handle.Error(e, 'SignInBanner.Clear', 202));
  await xapi.Command.SystemUnit.SignInBanner.Set({}, `Campfire Blueprint Installed
  SystemRole: [Primary]
  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
  Connected Nodes:\n\t${nodeBannerMessage}
  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
  To configure Campfire, Edit the [Campfire_2_Config] Macro`).catch(e => Handle.Error(e, 'SignInBanner.Set', 203));

  //Check for active video, then start VuMeter when appropriate
  const isOnCall = (await xapi.Status.Call.get()) == '' ? false : true;
  const isStreaming = await checkUSBPassthroughState();
  const isSelfViewOn = (await xapi.Status.Video.Selfview.Mode.get()) == 'On' ? true : false;
  const isSelfviewFull = (await xapi.Status.Video.Selfview.FullscreenMode.get()) == 'On' ? true : false;

  if ((isOnCall || isStreaming) || isSelfViewOn) { await AZM.Command.Zone.Monitor.Start('Initialization'); } else { await AZM.Command.Zone.Monitor.Stop('Initialization'); };

  // Check Selfview mode and fullscreen mode, then update the campfire UI extension
  await xapi.Command.UserInterface.Extensions.Widget.SetValue({ WidgetId: 'Campfire~CampfirePro~CameraFeatures~SelfviewShow', Value: isSelfViewOn == true ? 'On' : 'Off' });
  await xapi.Command.UserInterface.Extensions.Widget.SetValue({ WidgetId: 'Campfire~CampfirePro~CameraFeatures~SelfviewFullscreen', Value: isSelfviewFull == true ? 'On' : 'Off' });
  console.warn({ Campfire_1_Warn: `Campfire Blueprint Initialized!` })
  console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -')
}

/********************************
      Function Definitions
********************************/


//Builds Timeout Objects used to handle Conversation and Side By Side Mode
function buildConversationTimeoutActivity() {
  const zones = AudioMap.Zones.clone()
  let list = {}
  zones.forEach((el, i) => {
    list[i + 1] = { label: el.Label, active: false, run: '' }
  })
  return list
}

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

//Clears timeouts and intervals contained within the Handle object
function clearCameraAutomationTimeouts() { // ToDo - Review for Errors
  try {
    const list = Object.getOwnPropertyNames(Handle.Timeout.CameraMode)
    list.forEach(element => {
      switch (element.safeToLowerCase()) {
        case 'onsilence':
          clearTimeout(Handle.Timeout.CameraMode.OnSilence.run)
          break;
        case 'speaker':
          clearTimeout(Handle.Timeout.CameraMode.Speaker.run)
          Handle.Timeout.CameraMode.Speaker.active = false;
          break;
        case 'conversation':
          const convList = Object.getOwnPropertyNames(Handle.Timeout.CameraMode.Conversation)
          if (convList.length > 0) {
            convList.forEach(el => {
              clearTimeout(Handle.Timeout.CameraMode.Conversation[el].run)
              Handle.Timeout.CameraMode.Conversation[el].active = false
            })
          }
          break;
        case 'everyone':
          Handle.Timeout.CameraMode.Speaker.active = false
          break;
        case 'spotlight':
          clearTimeout(Handle.Timeout.CameraMode.Spotlight.run)
          Handle.Timeout.CameraMode.Spotlight.active = false;
          break;
      }
    })
  } catch (e) {
    Handle.Error(e, 'clearCameraAutomationTimeouts', 347)
  }
}

// Used to compose a new MainSource composition based on a provided array
async function composeCamera(isDefault = false, ...connectorIds) {
  try {
    let composition = connectorIds.toString().split(',')
    if (isDefault) {
      composition = determineDefaultComposition()
    }
    currentComposition = composition.clone()

    if (composition == 'off' || composition == '') {
      return
    }

    const checkForCompositionChanges = (composition.length === lastknownComposition.length) && composition.every((value, index) => value === lastknownComposition[index]);
    //Only switch to the new camera arrangement if it's different from the last known state
    if (!checkForCompositionChanges) {
      try {
        let primaryQuadavailable = false;

        composition.forEach(el => {
          if (el == CodecInfo.PrimaryCodec.PrimaryCodec_QuadCamera_ConnectorId) { primaryQuadavailable = true }
        })

        if (primaryQuadavailable) {
          await xapi.Command.Cameras.SpeakerTrack.BackgroundMode.Deactivate();
        } else {
          await xapi.Command.Cameras.SpeakerTrack.BackgroundMode.Activate()
        }

        await xapi.Command.Video.Input.SetMainVideoSource({ ConnectorId: composition, Layout: 'Equal' });

        console.info({ Campfire_1_Info: `Updating Camera Composition: ${prettyCompositionLog_nodeInfo(composition)}` })
        lastknownComposition = composition.clone()
      } catch (e) {
        Handle.Error(e, 'checkForCompositionChanges', 561)
      }
    }
  } catch (e) {
    Handle.Error(e, 'composeCamera', 594)
  }
}

//Used to delay an action where necessary
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }

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

//Used to discover the Node ConnectorId based on provided Serial number
function findNodeCameraConnector(codecSerialNumber, cause) {

  for (const device of CodecInfo.NodeCodecs) {
    if (device.CodecSerialNumber == codecSerialNumber) {
      return device.PrimaryCodec_QuadCamera_ConnectorId;
    }
  }
  throw Error({ Campfire_1_Error: `Unable to Node Camera ConnectorId using Serial [${codecSerialNumber}]`, Cause: cause })
}

// Locate the Camera Id for the Primary Codec Quadcamera
async function findPrimaryQuadCameraId() {
  const cams = await xapi.Status.Cameras.Camera.get();
  let id = '';
  cams.forEach(el => { if (el.Model.toLowerCase().includes('quad')) { id = el.id } });
  return id;
};

// Used to pair the Device Label with it's associated Camera ConnectorId to allow a readable print of the provided composition
function prettyCompositionLog_nodeInfo(comp) {
  const resultString = comp.map(number => {
    const matchingItem = nodeInfo.find(item => item.PrimaryCodec_QuadCamera_ConnectorId === number.toString());
    return matchingItem ? `[${matchingItem.Label}: ${number}]` : `Connector ID ${number} not found`;
  }).join(', ');
  return resultString;
}

// Used to execute the Muted Automation in Campfire
async function runMuteState() {
  clearTimeout(Handle.Timeout.CameraMode.OnSilence)
  clearInterval(Handle.Interval.OnSilence)
  clearCameraAutomationTimeouts();
  updateCameraMode('Muted', 'Microphones Muted');
  await SendToNodes('MutedPTZ', 'Activate');
  await composeCamera(true, [])
  if (spkState) {
    await xapi.Command.Cameras.SpeakerTrack.Frames.Activate()
    await xapi.Command.Cameras.SpeakerTrack.Activate()
    await xapi.Command.Camera.PositionSet(mutedOverviewPTZPosition);
  }
  console.info({ Campfire_1_Info: `Microphones Muted, setting muted overview PTZ position` })
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
      case 'Everyone': case 'Side_By_Side':
        await xapi.Command.Cameras.SpeakerTrack.Activate()
        await xapi.Command.Cameras.SpeakerTrack.Frames.Activate()
        console.info({ Campfire_Node_Info: `Camera Mode changed to [${mode}]` })
        break;
      case 'Conversation':
        await xapi.Command.Cameras.SpeakerTrack.Activate()
        await xapi.Command.Cameras.SpeakerTrack.Frames.Deactivate()
        console.info({ Campfire_Node_Info: `Camera Mode changed to [${mode}]` })
        break;
      case 'Muted':
        await xapi.Command.Cameras.SpeakerTrack.Activate()
        await xapi.Command.Cameras.SpeakerTrack.Frames.Activate()
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

// Used to updated the Campfire Camera Mode
async function updateCameraMode(mode, cause) {
  try {
    clearCameraAutomationTimeouts() //ToDo - Review and Check for Errors

    let previous = activeCameraMode.clone()

    if (activeCameraMode != 'Muted') {
      previousCameraMode = activeCameraMode.clone()
    }
    activeCameraMode = mode;

    xapi.Command.UserInterface.Message.TextLine.Display({ Text: `Campfire: ${mode.replace(/_/gm, ' ')}`, Duration: 5, X: 10000, Y: 500 })
    if (activeCameraMode != 'Muted') {
      xapi.Command.UserInterface.Extensions.Widget.SetValue({ WidgetId: 'Campfire~CampfirePro~CameraFeatures~Info', Value: `${mode.replace(/_/gm, ' ')}: ${cameraModeDescriptions[mode]}` });
      await xapi.Command.UserInterface.Extensions.Widget.SetValue({ WidgetId: 'Campfire~CampfirePro~CameraFeatures~Mode', Value: activeCameraMode })
    }
    await setSpeakerTrack(mode) // ToDo - Review and Check for Errors
    await SendToNodes('CameraMode', activeCameraMode) //ToDo - Review and Check for Errors
    if (activeCameraMode != 'Muted') {
      await GMM.write('activeCameraMode', activeCameraMode)
    }
    if (previous != activeCameraMode) {
      console.log({ Campfire_1_Log: `Camera Mode Updated`, CurrentMode: activeCameraMode, PreviousMode: previous, Cause: cause })
    }
  } catch (e) {
    Handle.Error(e, 'updateCameraMode', 249)
  }
}

/********************************
      Subscription Definitions
********************************/

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
  PanelClicked: function () {
    xapi.Event.UserInterface.Extensions.Panel.Clicked.on(Handle.Event.PanelClicked)
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
  SelfView: function () {
    xapi.Status.Video.Selfview.on(Handle.Status.SelfView)
  },
  StandbyStatus: function () {
    xapi.Status.Standby.State.on(Handle.Status.StandbyStatus)
  },
  FramesStatus: function () {
    xapi.Status.Cameras.SpeakerTrack.Frames.Status.on(Handle.Status.FramesStatus)
  },
  MicrophonesMute: function () {
    xapi.Status.Audio.Microphones.Mute.on(Handle.Status.MicrophonesMute);
  },
  PromptResponse: function () {
    xapi.Event.UserInterface.Message.Prompt.Response.on(Handle.Event.PromptResponse);
  }
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
      Everyone: { active: false },
      Spotlight: {
        active: false,
        run: ''
      }
    }
  },
  Interval: {
    OnSilence: ''
  },
  Error: function (err, func, lineReference) {
    err['Campfire_Context'] = { "Function": func, "Line": lineReference }
    console.error(err)
  }
}

// Event Handler definitions
Handle.Event = {
  CallSuccessful: async function () {
    try {
      xapi.Command.UserInterface.Message.TextLine.Display({ Text: `Campfire: ${activeCameraMode.replace(/_/gm, ' ')}`, Duration: 5, X: 10000, Y: 500 })
      await AZM.Command.Zone.Monitor.Start('CallSuccessful')
      composeCamera(true, [])
    } catch (e) {
      Handle.Error(e, 'Handle.Event.CallSuccessful', 400)
    }
  },
  CallDisconnect: async function () {
    try {
      await AZM.Command.Zone.Monitor.Stop('CallDisconnect')
      await updateCameraMode(Settings.RoomTypeSettings.Campfire.Camera.Mode.Default, 'CallDisconnect')
    } catch (e) {
      Handle.Error(e, 'Handle.Event.CallDisconnect', 407)
    }
  },
  PromptResponse: async function (response) {
    if (response.FeedbackId == 'campfire~unmute~microphones~prompt' && response.OptionId == '1') {
      xapi.Command.Audio.Microphones.Unmute()
    }
  },
  WidgetAction: async function (action) {
    try {
      if (action.Type == 'released') {
        switch (action.WidgetId) {
          case 'Campfire~CampfirePro~CameraFeatures~Mode':
            if (activeCameraMode != 'Muted') {
              await updateCameraMode(action.Value, 'Widget Action')
            } else {
              xapi.Command.UserInterface.Message.Prompt.Display({
                Title: `Your Microphones are Muted`,
                Text: `Campfire Modes won't take effect until you Unmute your Microphones.`,
                Duration: 8,
                FeedbackId: `campfire~unmute~microphones~prompt`,
                "Option.1": 'Unmute Microphones',
                "Option.2": 'Dismiss'
              });
              previousCameraMode = action.Value;
            }
            break;
        }
      }
      if (action.Type == 'changed') {
        switch (action.WidgetId) {
          case 'Campfire~CampfirePro~CameraFeatures~SelfviewShow':
            await xapi.Command.Video.Selfview.Set({ Mode: action.Value });
            break;
          case 'Campfire~CampfirePro~CameraFeatures~SelfviewFullscreen':
            await xapi.Command.Video.Selfview.Set({ FullscreenMode: action.Value });
            break;
        }
      }
    } catch (e) {
      Handle.Error(e, 'Handle.Event.WidgetAction', 416)
    }
  },
  PanelClicked: async function (event) {
    try {
      if (event.PanelId == 'Campfire~CampfirePro') {
        xapi.Command.UserInterface.Extensions.Panel.Open({ PanelId: 'Campfire~CampfirePro', PageId: 'Campfire~CampfirePro~CameraFeatures' })
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
    switch (Settings.RoomType.safeToLowerCase()) {
      case 'campfire pro':
        switch (activeCameraMode.safeToLowerCase()) {
          case 'speaker':
            try {
              //If Speaker the Speaker onJoin timeout is inactive and the Zone is high
              if (!Handle.Timeout.CameraMode.Speaker.active && zonePayload.Zone.State == `High`) {
                if (lastknownSpeaker_ZoneId != zonePayload.Zone.Id) {
                  lastknownSpeaker_ZoneId = zonePayload.Zone.Id.clone()
                  console.info({ Campfire_1_Info: `New Speaker Acquired in [${zonePayload.Zone.Label}] Zone || Id: [${zonePayload.Zone.Id}]` })
                }
                //Set the Speaker timeout activity to true
                Handle.Timeout.CameraMode.Speaker.active = true;

                //Set the Speaker timeout to false after the onjoin timeout clears
                Handle.Timeout.CameraMode.Speaker.run = setTimeout(function () {
                  console.debug({ Campfire_1_Debug: `New Speaker Timeout Passed, waiting for new speaker...` })
                  Handle.Timeout.CameraMode.Speaker.active = false;
                }, Settings.RoomTypeSettings.Campfire.Camera.Mode.Speaker.TransitionTimeout.OnJoin);

                //Clear the on Room Silence Timeout, and reset it
                clearTimeout(Handle.Timeout.CameraMode.OnSilence)
                clearInterval(Handle.Interval.OnSilence)
                Handle.Timeout.CameraMode.OnSilence = setTimeout(async function () {
                  console.info({ Campfire_1_Info: `All Zones Quiet, setting defaults` })
                  lastknownSpeaker_ZoneId = 0;
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
            if (!Handle.Timeout.CameraMode.Speaker.active) {
              Handle.Timeout.CameraMode.Speaker.active = true;
              clearTimeout(Handle.Timeout.CameraMode.OnSilence)
              clearInterval(Handle.Interval.OnSilence)
              await composeCamera(true, [])
              if (Settings.RoomTypeSettings.Campfire.Camera.Default_Overview.Mode.safeToLowerCase() == 'auto') {
                Handle.Interval.OnSilence = setInterval(async function () {
                  let peopleComposition = peopleDataComposition.get() == '' ? peopleDataComposition.DefaultComposition : peopleDataComposition.get();
                  await composeCamera(true, peopleComposition.DefaultComposition)
                }, 2000)
              }
            }
            break;
          case 'conversation': case 'side_by_side':
            try {
              if (!Handle.Timeout.CameraMode.Conversation[zonePayload.Zone.Id].active && zonePayload.Zone.State == `High`) {
                console.info({ Campfire_1_Info: ` Zone [${zonePayload.Zone.Label}] added to the conversation || ZoneId: [${zonePayload.Zone.Id}]` })
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
                      console.info({ Campfire_1_Info: `Timeout for Zone [${zonePayload.Zone.Label}] passed, removing Zone Id: [${zonePayload.Zone.Id}] from the conversation` })
                      Handle.Timeout.CameraMode.Conversation[zonePayload.Zone.Id].active = false;
                      conversationComposition.removeCamera(zonePayload.Assets.CameraConnectorId)
                      let checkCompArr = conversationComposition.get()
                      if (checkCompArr.length < 1) {
                        console.info({ Campfire_1_Info: `All Zones Quiet, setting defaults` })
                        composeCamera(true, [])
                      }
                      if (Settings.RoomTypeSettings.Campfire.Camera.Default_Overview.Mode.safeToLowerCase() == 'auto') {
                        Handle.Interval.OnSilence = setInterval(async function () {
                          let peopleComposition = peopleDataComposition.get() == '' ? peopleDataComposition.DefaultComposition : peopleDataComposition.get();
                          await composeCamera(true, peopleComposition.DefaultComposition)
                        }, 2000)
                      }
                    } else {
                      console.debug({ Campfire_1_Debug: `Zone [${zonePayload.Zone.Label}] conversation still active, continuing the conversation for Zone Id: [${zonePayload.Zone.Id}]` })
                      runHandler(Settings.RoomTypeSettings.Campfire.Camera.Mode.Conversation.TransitionTimeout.Continue)
                    }
                  }, timeout);
                }
                runHandler(Settings.RoomTypeSettings.Campfire.Camera.Mode.Conversation.TransitionTimeout.OnJoin)
                //Compose the High Camera
                await composeCamera(false, conversationComposition.get())
              }
            } catch (e) {
              Handle.Error(e, 'Handle.Event.AZM > Conversation', 492)
            }
            break
          case 'muted':
            break;
          default:
            break
        }
        break;
    }
  }
}

// Status Handler Definitions
Handle.Status = {
  SelfView: async function (view) {
    try {
      const isOnCall = (await xapi.Status.Call.get()) == '' ? false : true;
      if (view?.Mode) {
        await xapi.Command.UserInterface.Extensions.Widget.SetValue({ WidgetId: 'Campfire~CampfirePro~CameraFeatures~SelfviewShow', Value: view.Mode });
        if (!isOnCall) {
          switch (view.Mode) {
            case 'On':
              await AZM.Command.Zone.Monitor.Start('SelviewMode On Outside Call')
              await xapi.Command.UserInterface.Extensions.Widget.SetValue({ WidgetId: 'Campfire~CampfirePro~CameraFeatures~SelfviewShow', Value: 'On' });
              break;
            case 'Off':
              await AZM.Command.Zone.Monitor.Stop('SelviewMode Off Outside Call')
              await xapi.Command.UserInterface.Extensions.Widget.SetValue({ WidgetId: 'Campfire~CampfirePro~CameraFeatures~SelfviewShow', Value: 'Off' });
              break;
          }
        }
      }
      if (view?.FullscreenMode) {
        await xapi.Command.UserInterface.Extensions.Widget.SetValue({ WidgetId: 'Campfire~CampfirePro~CameraFeatures~SelfviewFullscreen', Value: view.FullscreenMode });
      }
    } catch (e) {
      Handle.Error(e, 'Handle.Status.Selfview', 540)
    }
  },
  StandbyStatus: async function (level) {
    try {
      if (level == 'Standby' || level == 'Off') {
        await SendToNodes('StandbyState', level)
      }
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
  MicrophonesMute: async function (mute) {
    if (mute == 'On') {
      await runMuteState()
    } else {
      await updateCameraMode(previousCameraMode);
    }
  },
  PeopleCountCurrent: async function (count) {
    if (Settings.RoomTypeSettings.Campfire.Camera.Default_Overview.Mode.safeToLowerCase() == 'auto') {
      if (count <= 0) {
        peopleDataComposition.removeCamera(CodecInfo.PrimaryCodec.PrimaryCodec_QuadCamera_ConnectorId)
      } else {
        peopleDataComposition.addCamera(CodecInfo.PrimaryCodec.PrimaryCodec_QuadCamera_ConnectorId)
      }
    }
  }
}

/********************************
        Start Macro
********************************/

// Used to handle a device restart, on boot, the script runs too quickly, causing an error.
// This slows that process down by checking the uptime
async function delayedStartup(time = 120) {
  while (true) {
    const upTime = await xapi.Status.SystemUnit.Uptime.get()

    if (upTime > time) {
      await init();
      break;
    } else {
      delay(5000);
    }
  }
}

delayedStartup();