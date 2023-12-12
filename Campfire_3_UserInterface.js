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

const PanelIds = {
  SupportAgreement: 'Campfire~SupportNotice',
  Campfire: 'Campfire~CampfirePro'
}

const BuildInterface = {
  SupportAgreement: async function () {
    let xml = `<Extensions>
                <Panel>
                  <Origin>local</Origin>
                  <Location>Hidden</Location>
                  <Icon>Lightbulb</Icon>
                  <Name>Support Notice</Name>
                  <ActivityType>Custom</ActivityType>
                  <Page>
                    <Name>Support Notice</Name>
                    <Row>
                      <Name>Row</Name>
                      <Widget>
                        <WidgetId>Campfire~SupportNotice~Header</WidgetId>
                        <Name>Please read carefully. If you understand and agree with each of the following, activate the toggle to the right. </Name>
                        <Type>Text</Type>
                        <Options>size=4;fontSize=small;align=center</Options>
                      </Widget>
                    </Row>
                    <Row>
                      <Name>Row</Name>
                      <Widget>
                        <WidgetId>Campfire~SupportNotice~Row1~Text</WidgetId>
                        <Name>I understand that Macros running on Cisco Collaboration Devices are considered Custom Code and are NOT supported by Cisco TAC</Name>
                        <Type>Text</Type>
                        <Options>size=3;fontSize=small;align=left</Options>
                      </Widget>
                      <Widget>
                        <WidgetId>Campfire~SupportNotice~Row1~Toggle</WidgetId>
                        <Type>ToggleButton</Type>
                        <Options>size=1</Options>
                      </Widget>
                    </Row>
                    <Row>
                      <Name>Row</Name>
                      <Widget>
                        <WidgetId>Campfire~SupportNotice~Row2~Text</WidgetId>
                        <Name>I understand that these Macros are not a formal product of Cisco, but a blueprint as to what's possible by utilizing the Device xAPI</Name>
                        <Type>Text</Type>
                        <Options>size=3;fontSize=small;align=left</Options>
                      </Widget>
                      <Widget>
                        <WidgetId>Campfire~SupportNotice~Row2~Toggle</WidgetId>
                        <Type>ToggleButton</Type>
                        <Options>size=1</Options>
                      </Widget>
                    </Row>
                    <Row>
                      <Name>Row</Name>
                      <Widget>
                        <WidgetId>Campfire~SupportNotice~Row3~Text</WidgetId>
                        <Name>If issues arise, I'll contact my internal Device Administrator or a Cisco Partner for support</Name>
                        <Type>Text</Type>
                        <Options>size=3;fontSize=small;align=left</Options>
                      </Widget>
                      <Widget>
                        <WidgetId>Campfire~SupportNotice~Row3~Toggle</WidgetId>
                        <Type>ToggleButton</Type>
                        <Options>size=1</Options>
                      </Widget>
                    </Row>
                    <Row>
                      <Name>Row</Name>
                      <Widget>
                        <WidgetId>Campfire~SupportNotice~Row4~Text</WidgetId>
                        <Name>I understand Macros are Editable, and should I receive assistance from the Developer, only the original contents of the Macro will be reviewed</Name>
                        <Type>Text</Type>
                        <Options>size=3;fontSize=small;align=left</Options>
                      </Widget>
                      <Widget>
                        <WidgetId>Campfire~SupportNotice~Row4~Toggle</WidgetId>
                        <Type>ToggleButton</Type>
                        <Options>size=1</Options>
                      </Widget>
                    </Row>
                    <Row>
                      <Name>Row</Name>
                      <Widget>
                        <WidgetId>Campfire~SupportNotice~Decline</WidgetId>
                        <Name>Decline</Name>
                        <Type>Button</Type>
                        <Options>size=2</Options>
                      </Widget>
                      <Widget>
                        <WidgetId>Campfire~SupportNotice~Accept</WidgetId>
                        <Name>Accept</Name>
                        <Type>Button</Type>
                        <Options>size=2</Options>
                      </Widget>
                    </Row>
                    <PageId>Campfire~SupportNotice</PageId>
                    <Options>hideRowNames=1</Options>
                  </Page>
                </Panel>
              </Extensions>`
    await xapi.Command.UserInterface.Extensions.Panel.Save({ PanelId: PanelIds.SupportAgreement }, xml)
    console.debug({ Campfire_3_Debug: `[${PanelIds.SupportAgreement}] Panel Added` })
  },
  Campfire: async function (showManual = false) {
    // Check of for UI
    // if missing, add it, if there, do nothing
  }
}

const RemoveUnusedInterFaces = async function (keepAlive) {
  const panelList = Object.getOwnPropertyNames(PanelIds)

  panelList.forEach(element => {
    if (PanelIds[element] != keepAlive) {
      xapi.Command.UserInterface.Extensions.Panel.Remove({ PanelId: PanelIds[element] })
      console.debug({ Campfire_3_Debug: `[${PanelIds[element]}] Panel Removed` })
    }
  })
}

const CustomPanelIcons = {
  Campfire: ``
}

export { BuildInterface, RemoveUnusedInterFaces }