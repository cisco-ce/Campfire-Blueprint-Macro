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
import { GMM } from './GMM_Lite_Lib';


let PrimaryInfo = '';
let PrimaryConnection = '';
let SendToPrimary = '';
let mutedOverviewPTZPosition = {}

let peopleCountCurrent = 0;

const init = {
  Phase1: async function () {
    console.info({ Campfire_Node_Info: 'Initializing Campfire Node...' })
    await GMM.memoryInit()

    setInterval(function () {
      console.debug({ Campfire_Node_Debug: 'DND Re-Activated' })
      xapi.Command.Conference.DoNotDisturb.Activate({ Timeout: 1440 }).catch(e => { processError(e, 'Failed DND Activation') });
    }, 1440 * 1000 * 60)

    await configureNode()

    try {
      PrimaryInfo = await GMM.read('PrimaryInfo')
      let info = atob(PrimaryInfo)
      info = JSON.parse(info)

      PrimaryConnection = new GMM.Connect.IP(info.Authentication.Username, info.Authentication.Passcode, info.IpAddress.toString());

      SendToPrimary = async function (method, data) {
        console.debug(method, data)
        const request = await PrimaryConnection.status({ Method: method, Data: data }).post()
        return request
      }
      let peopleCount = await xapi.Status.RoomAnalytics.PeopleCount.Current.get()
      if (peopleCount > 0) { peopleCountCurrent = 1 };
      await SendToPrimary('PeopleCountUpdate', peopleCountCurrent);
    } catch (e) {
      PrimaryInfo = 'Unset';
      await GMM.write('PrimaryInfo', 'Unset');
    }
    try {
      mutedOverviewPTZPosition = await GMM.read('mutedOverviewPTZPosition');
      mutedOverviewPTZPosition.CameraId = await findQuadConnectorId();
    } catch (e) {
      mutedOverviewPTZPosition = {
        Pan: -39,
        Tilt: -492,
        Zoom: 8210,
        CameraId: await findQuadConnectorId()
      }
      await GMM.write('mutedOverviewPTZPosition', mutedOverviewPTZPosition)
    }

    await init.Phase2();
  },
  Phase2: async function () {

    await startupCommands()

    console.info({ Campfire_Node_Info: 'Initializing Campfire Node...' });
  }
}

async function Run_Setup() { await init.Phase1() }

async function updatePrimaryInfo(info) {
  await GMM.write('PrimaryInfo', info)
  console.info({ Campfire_Node_Info: `Primary Node Connectivity Information Updated` })
  let peopleCount = await xapi.Status.RoomAnalytics.PeopleCount.Current.get()
  if (peopleCount > 0) { peopleCountCurrent = 1 }
  await SendToPrimary('PeopleCountUpdate', peopleCountCurrent)
}

async function saveMutedPTZ(ptz) {
  await GMM.write('mutedOverviewPTZPosition', ptz);
  console.info({ Campfire_Node_Info: `PTZ Position when muted Updated` });
  mutedOverviewPTZPosition.CameraId = await findQuadConnectorId();
}

async function configureNode() {
  console.info({ Campfire_Node_Info: `Configuring Campfire Node...` })

  await xapi.Config.Audio.Output.ARC[1].Mode.set('Off').catch(e => { processError(e, 'Failed Setting Arc Config') });
  await xapi.Config.Audio.Output.InternalSpeaker.Mode.set('Off').catch(e => { processError(e, 'Failed Setting InternalSpeaker Config') });

  await xapi.Config.Peripherals.Profile.TouchPanels.set(0).catch(e => { processError(e, 'Failed Setting Profile TouchPanels Config') });

  await xapi.Config.RoomAnalytics.PeopleCountOutOfCall.set('On');

  await xapi.Config.Standby.Control.set('Off').catch(e => { processError(e, 'Failed Setting Standby Mode Config') });
  await xapi.Config.Standby.Halfwake.Mode.set('Manual').catch(e => { processError(e, 'Failed Setting Halfwake Mode Config') });

  await xapi.Config.UserInterface.OSD.Mode.set('Unobstructed').catch(e => { processError(e, 'Failed Setting OSD Mode Config') });

  await xapi.Config.Video.Selfview.Default.Mode.set('On');
  await xapi.Config.Video.Selfview.Default.FullscreenMode.set('On');

  console.info({ Campfire_Node_Info: `Configuring Campfire Node Configuration Complete!` })
}

async function startupCommands() {
  await xapi.Command.Conference.DoNotDisturb.Activate({ Timeout: 1440 }).catch(e => { processError(e, 'Failed DND Activation') });
  console.info({ "Campfire_Node_Info": "DND Activated" });
  await xapi.Command.Video.Selfview.Set({ FullscreenMode: 'On', Mode: 'On', OnMonitorRole: 'First' });
  console.info({ "Campfire_Node_Info": "Selview Activated" });
}

function processError(err, context) {
  if (context != undefined) { err.Context = context; };

  if (err.message != 'Invalid or missing Path argument') {
    console.warn({ Campfire_Node_Warn: err });
    return;
  }
  console.debug({ Campfire_Node_Debug: `Error Ignored as it doesn't apply to this product`, Error: err.message, Context: err.Context })
}

async function runCameraMode(mode) {
  switch (mode) {
    case 'Speaker':
      await xapi.Command.Cameras.SpeakerTrack.Activate()
      await xapi.Command.Cameras.SpeakerTrack.Frames.Deactivate()
      console.info({ Campfire_Node_Info: `Camera Mode changed to [${mode}]` })
      break;
    case 'Everyone': case 'Conversation':
      await xapi.Command.Cameras.SpeakerTrack.Activate()
      await xapi.Command.Cameras.SpeakerTrack.Frames.Activate()
      console.info({ Campfire_Node_Info: `Camera Mode changed to [${mode}]` })
      break;
    case 'Muted':
      await xapi.Command.Cameras.SpeakerTrack.Deactivate()
      await xapi.Command.Cameras.SpeakerTrack.Frames.Deactivate()
      break;
    default:
      console.warn({ Campfire_Node_Warn: `Camera Mode [${mode}] not defined.` })
      break
  }
}


GMM.Event.Receiver.on(async event => {
  if (event.App.includes('Campfire_1_Main')) {
    switch (event.Value.Method) {
      case 'Initialization':
        let payload = atob(event.Value.Data)
        payload = JSON.parse(payload)
        if (payload.StandbyStatus.toLowerCase() == 'off') { xapi.Command.Standby.Deactivate(); } else { xapi.Command.Standby.Activate(); };
        updateNodeLabel(payload.RollAssignment, event.Source.Id);
        runCameraMode(payload.CameraMode);
        console.log({ Campfire_Node_Log: `Initialization Payload Received`, CameraMode: payload.CameraMode, StandbyStatus: payload.StandbyStatus, RollAssignment: 'Node' });
        saveMutedPTZ(payload.MutedPTZ);
        delete payload.StandbyStatus;
        delete payload.RollAssignment;
        delete payload.CameraMode;
        delete payload.MutedPTZ;
        updatePrimaryInfo(btoa(JSON.stringify(payload)));
        break;
      case 'RollAssignment':
        updateNodeLabel(event.Value.Data, event.Source.Id)
        break
      case 'StandbyState':
        if (event.Value.Data.toLowerCase() == 'off') {
          xapi.Command.Standby.Deactivate()
        } else {
          xapi.Command.Standby.Activate()
        }
        break;
      case 'FramesState':
        if (event.Value.Data.toLowerCase() == 'active') {
          xapi.Command.Cameras.SpeakerTrack.Frames.Activate();
        } else {
          xapi.Command.Cameras.SpeakerTrack.Frames.Deactivate();
        }
        break;
      case 'CameraMode':
        runCameraMode(event.Value.Data);
        break;
      case 'MutedPTZ':
        if (event.Value.Data == 'Activate') {
          xapi.Command.Camera.PositionSet(mutedOverviewPTZPosition);
        }
        break;
    }
  }
})

async function findQuadConnectorId() {
  const cams = await xapi.Status.Cameras.Camera.get();
  let id = '';

  cams.forEach(el => { if (el.Model.toLowerCase().includes('quad')) { id = el.id } });

  return id
}

xapi.Status.RoomAnalytics.PeopleCount.Current.on(async event => {
  if (event > 0) {
    peopleCountCurrent = 1;
  } else {
    peopleCountCurrent = 0
  }
  await SendToPrimary('PeopleCountUpdate', peopleCountCurrent)
})

xapi.Status.Video.Selfview.on(event => {
  if (event?.Mode == 'Off' || event?.FullscreenMode == 'Off') {
    console.log({ Campfire_Node_Log: `Selfview altered, re-applying selfview...` })
    setTimeout(() => {
      xapi.Command.Video.Selfview.Set({ FullscreenMode: 'On', Mode: 'On', OnMonitorRole: 'First' });
    }, 2000)
  }
})

async function updateNodeLabel(data, primarySerial) {
  const serial = await xapi.Status.SystemUnit.Hardware.Module.SerialNumber.get()

  const findDeviceBySerial = data.find(item => item.CodecSerialNumber === serial);
  const index = data.findIndex(item => item.CodecSerialNumber === serial);
  let label = findDeviceBySerial ? findDeviceBySerial.Label : "";
  await xapi.Command.SystemUnit.SignInBanner.Clear()
  await xapi.Command.SystemUnit.SignInBanner.Set({}, `Campfire Blueprint Installed
  Label: [${label}] || SystemRole: [Node] || Index: [${index}]
  Primary Codec Identifier: [${primarySerial}]
  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
  Configuration for Campfire must be done through the Primary Codec`);
}

Run_Setup()