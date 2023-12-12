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
import { GMM } from './GMM_Lite_Lib';

let SendToPrimiry = ''

let PrimaryInfo = ''

let Run_Automation = false;

const init = {
  Phase1: async function () {
    console.info({ Campfire_Node_Info: 'Initializing Campfire Node...' })
    await GMM.memoryInit()

    setInterval(function () {
      console.debug({ Campfire_Node_Debug: 'Infinite DND Re-Activated' })
      xapi.Command.Conference.DoNotDisturb.Activate({ Timeout: 1440 }).catch(e => { processError(e, 'Failed DND Activation') });
    }, 1440)
    await configureNode()
    try {
      PrimaryInfo = await GMM.read('PrimaryInfo')
      let info = atob(PrimaryInfo)


    } catch (e) {
      PrimaryInfo = 'Unset'
      await GMM.write('PrimaryInfo', 'Unset')
    }
  },
  Phase2: async function () {

    console.info({ Campfire_Node_Info: 'Initializing Campfire Node...' })
  }
}

async function Run_Setup() { await init.Phase1() }

async function updatPrimaryInfo(info) {
  await GMM.write('PrimaryInfo', info)
  console.info({ Campfire_Node_Info: `Primary Node Connectivity Information Updated` })
}

async function configureNode() {
  console.info({ Campfire_Node_Info: `Cofiguring Campfire Node...` })
  await xapi.Command.Conference.DoNotDisturb.Activate({ Timeout: 1440 }).catch(e => { processError(e, 'Failed DND Activation') });
  console.info({ "Campfire_Node_Info": "Infinite DND Activated" });
  await xapi.Config.Standby.Control.set('Off').catch(e => { processError(e, 'Failed Setting Standby Mode Config') });
  await xapi.Config.Audio.Input.ARC[1].Mode.set('Off').catch(e => { processError(e, 'Failed Setting Arc Config') });
  await xapi.Config.UserInterface.OSD.Mode.set('Unobstructed').catch(e => { processError(e, 'Failed Setting OSD Mode Config') });
  await xapi.Config.Peripherals.Profile.TouchPanels.set(0).catch(e => { processError(e, 'Failed Setting Profile TouchPanels Config') });
  await xapi.Config.Audio.Output.InternalSpeaker.Mode.set('Off').catch(e => { processError(e, 'Failed Setting InternalSpeaker Config') });
  await xapi.Config.Standby.Halfwake.Mode.set('Manual').catch(e => { processError(e, 'Failed Setting Halfwake Mode Config') });;

  console.info({ Campfire_Node_Info: `Cofiguring Campfire Node Configuration Complete!` })
}

function processError(err, context) {

  err['Context'] = context

  console.warn({Campfire_Node_Warn: err})
}

async function runCameraMode(mode) {
  switch (mode) {
    case 'Focus':
      await xapi.Command.Cameras.SpeakerTrack.Activate()
      await xapi.Command.Cameras.SpeakerTrack.Frames.Deactivate()
      console.info({ Campfire_Node_Info: `Camera Mode changed to [${mode}]` })
      break;
    case 'Conversation':
      await xapi.Command.Cameras.SpeakerTrack.Activate()
      await xapi.Command.Cameras.SpeakerTrack.Frames.Deactivate()
      console.info({ Campfire_Node_Info: `Camera Mode changed to [${mode}]` })
      break;
    default:
      console.warn({ Campfire_Node_Warn: `Camera Mode [${mode}] not defined.` })
      break
  }
}


GMM.Event.Receiver.on(event => {
  if (event.App.includes('Campfire_1_Main')) {
    console.log(event)
    switch (event.Value.Method) {
      case 'Initialization':
        updatPrimaryInfo(event.Value.Data);
        break;
      case 'StatusUpdate':
        runCameraMode(event.Value.Data.CameraMode);
        break;
      case 'CameraMode':
        runCameraMode(event.Value.Data);
        break;
    }

  }
})

Run_Setup()