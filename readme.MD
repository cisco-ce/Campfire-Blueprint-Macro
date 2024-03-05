# Campfire Blueprint

[![Campfire Room Render](/images/campfire_room_render.jpeg)](#)

| Minimum RoomOs Version | Webex Cloud | Webex Edge (Hybrid Cloud) | On-Premise | Microsoft Teams Room<br>On Cisco Devices |
|:-----------------------|:------------|:--------------------------|:-----------|:-----------------------------------------|
| 11.8.X                 | ✅         | ✅                       | ✅        | ❌ - API Limitation<br>(December 2023)      |

## About

Campfire is a Room Design Concept that tackles the challenge of a 360 conference room. It's not a formal product of Cisco, but is a solution put together that takes advantage of native features or the product and uses the devices xAPI to build out a new solution.

The challenge that needed solving was to enable speaker tracking in all side of a space coupled with the fact that a Cisco Codec were built to support 1 speakertracking camera. By leveraging additional codecs in a room design to drive more instances of speakertrack and using the device's xAPI we can coordinate all 4 systems to operate as one and provide a solution to this challenge.

![What is Campfire Slide](/images/what-is-campfire.png)

- - -

## Table of Contents

- [Key Terminology](#key-terminology-)
- [Support Information](#support-information-)
- [User Guide](#user-guide-)
- [Device Requirements](#device-requirements-)
- [Room Dimensions](#room-dimensions-)
- [Device Connectivity Drawings](#device-connectivity-drawings-)
- [Macro Installation](#macro-installation-)
- [Configuration](#configuration-)
  - [Settings](#settings-)
  - [CodecInfo](#codecinfo-)
  - [AudioMap](#audiomap-)
- [Video Tutorials](#video-tutorials-)
- [FAQ](#faq-)

> Press on the Menu Icon to come back to the Table of Contents [<img src="/images/view-list-circle_100_w.png" alt="table of contents" width="25"/>](#table-of-contents)

- - -

## Key Terminology [<img src="/images/view-list-circle_100_w.png" alt="table of contents" width="25"/>](#table-of-contents)

| **Term** | **Definition** |
|---|---|
| AZM/AZM Library | Acronym for the Audio Zone Manager Library. This library contains the logic needed for clean audio based events |
| GMM/GMM Lite Lib | Acronym for the Global Macro Messaging Library. GMM Lite is a modified version of the original GMM, that removes all tools not in use in the Campfire Solution. GMM enables a simplified set of inter-macro/codec communication, read and write functionality |
| Primary/Primary Codec | References the codec in the room design that is the main device for video conferencing and hosts the bulk of the responsibility for the overall campfire solution. |
| Node/Node Codec | References the codec(s) in the room design that report to the primary and functions as a modified peripheral for the Primary Codec. |
| Audio Zone | A concept that defines a region of audio we use to assign microphone too. Each Audio Zone must be defined and mapped to a camera resource in order to enable the solution |                                                                              |

## Support Information [<img src="/images/view-list-circle_100_w.png" alt="table of contents" width="25"/>](#table-of-contents)
- All Macros are considered **Custom Code**. Any and all pieces of Custom Code are **NOT** supported by Cisco. The base Hardware, Software and Device xAPI are covered by the product.
- If you're considering deploying the Campfire Blueprint Macros we recommend you engage a Cisco Vendor Partner, not only for installation, but for configuration and ongoing support.
- The Campfire Blueprint Macros are provided as is, please reference the code license.
- You can join a Community Supported Space on Webex
  - https://eurl.io/#nJWdM3w_T
  - NOTE: This is a community supported space. There is no guarantee of assistance in this space, it's a space filled with community members who may or may not answer questions or provide feedback; all is best effort. Should you need hands on assistance, please engage either your Cisco Sales Engineer and/or Cisco Technical Solutions Engineer or an AV Vendor Partner.

## User Guide [<img src="/images/view-list-circle_100_w.png" alt="table of contents" width="25"/>](#table-of-contents)

### User Interface
- The Campfire Blueprint enables a new UserInterface Panel called **Campfire Controls**. This panel is accessible in both the HomeScreen and Call Controls.

[![Campfire Touch Panel Home Screen](/images/campfire_homescreen.png)](#)

- When selected, several rows of elements are accessible to the user
  - **Info**: Provides a text description of the active Mode 
  - **Mode**: A group of campfire automation behaviors a user can choose. The default choice will be selected when first enabled, and any time a call ends
    - **Speaker**: Updates the MainSource with the last captured active speaker with Closeup active. This mode has a configurable timeout to allow faster or slower switching.
    - **Everyone**: Updates the MainSource to all 4 cameras in a 2x2 grid with Frames active. This is a static mode. The speaker by a combination of the in room microphones and the Speakertracking Camera.
    - **Conversation**: Updates the MainSource dynamically to any and all active speakers with Closeup Active. This modes is configurable to allow faster or slower switching. The speaker by a combination of the in room microphones and the Speakertracking Camera.
  - **Selfview**: Quick access to show/hide the selfview window and the ability to show this in fullscreen

[![Campfire Touch Panel Campfire Controls Interface](/images/campfire_controls.png)](#)

- As a user selects a mode under the Campfire Controls Interface, the group button will reflect the choice, update the info text description and prompt the OSD with a message, indicating the active mode.
  - The OSD message will be visible for only a few seconds, and will prompt again when a user places a call as a visual reminder of the active Campfire Mode

[![Campfire OSD Mode Prompt](/images/campfire_osd.png)](#)

- Not selectable by the user under Campfire Controls is a **Muted** mode.
  - The Muted mode occurs when a user mutes the codec on the touch panel and/or on a Cisco microphone
  - Muted Mode will disabled Speakertracking and microphone automation to provide the remote participant a full view of all participants in the space as well as compose all cameras in a grid.
  - Muted Mode will prompt on the OSD when this occurs
  - While microphones are muted, when a user selects a new Campfire Mode, a reminder prompt will surface on the touch panel, and give them the ability to unmute their audio.
  - When the device unmutes, the currently selected mode will activate.

[![Campfire Touch Panel Mute Prompt](/images/campfire_mutenotice.png)](#)

- - - 

## Device Requirements [<img src="/images/view-list-circle_100_w.png" alt="table of contents" width="25"/>](#table-of-contents)

### Minimum RoomOS Software Version
- RoomOS 11.8.X

### Registration Compatibility

| Webex Cloud | Webex Edge (Hybrid Cloud) | On-Premise | Microsoft Teams Room<br>On Cisco Devices |
|:------------|:--------------------------|:-----------|:-----------------------------------------|
| ✅         | ✅                       | ✅        | ❌ - API Limitation<br>(December 2023)      |

### Device Role Compatibility

| **Device**     | **Primary** | **Node** |
|----------------|-------------|----------|
| **Codec Pro**  | ✅           | ✅        |
| **Codec EQ**   | ❌           | ✅        |
| **Codec Plus** | ❌           | ✅        |

### Recommended Hardware

| **Primary Codec** | **Node Codec** | **Node QTY** | **Microphone**       | **MIC QTY** |
|-------------------|----------------|--------------|----------------------|-------------|
| Codec Pro         | Codec EQ       | 3            | Table Microphone Pro | 8           |

## Room Dimensions [<img src="/images/view-list-circle_100_w.png" alt="table of contents" width="25"/>](#table-of-contents)

- The room should not measure less than 9x9m (30x30’). This will allow for enough space for users to move comfortably around the campfire setup. 
- The provided measurements for the campfire setup has carefully been considered to provide an optimal in-room and far-end experience.
- The mounting height of the cameras, their relative position to the screens and distance to the position where the local participants are seated, ensure good eye contact both in-room and for remote attendees. 
- The fixed distance between the screens and the edge of the table secures a free line of sight from the local participants to the video participants and shared digital content. 

[![Room Dimensions](/images/campfire-room-dimensions.png)](#)

- Segmented table to avoid participants sitting in the blind spots of the cameras
- Segmented tables also offers ease of access for maintenance and cleaning at the center
- Custom design table with the courtesy panels are integrated into the shape*
- Table shape is custom to optimize on footprint and experience
- Make sure the technical equipment in the center island have sufficient ventilation and cooling

[![Furniture TopView](/images/campfire-furniture-topview.png)](#)

- Note the privacy panels in the front of each table. Whereas the Quadcamera is mounted in a format outside it's normal deployment, the camera will have visibility under each table. So it's important to source tables with a privacy panel in the front or at least a table cloth.

[![Furniture SideView](/images/campfire-furniture-sideview.png)](#)

- Cisco table shape reference for ideal user experience
- Courtesy panels is recommended in the setup integration
- Final implementation to be done with furniture partner of choice

[![Table Dimensions](/images/campfire-furniture-table-dimensions.png)](#)

## Device Connectivity Drawings [<img src="/images/view-list-circle_100_w.png" alt="table of contents" width="25"/>](#table-of-contents)

### Solution Components

#### Recommended Components

| Recommended Cisco Hardware | QTY | 3rd Party Components                        | QTY |
|----------------------------|-----|---------------------------------------------|-----|
| Codec Pro (Primary Codec)  | x1  | 50" Display                                 | x8  |
| Codec EQ (Node Codec)      | x3  | HDMI Distribution Amplifier (HDMI Splitter) | x2  |
| Quadcamera                 | x4  | POE Switch (16 Port Minimum)                | x1  |
| Table Microphone Pro       | x8  | Custom Furniture                            | x1  |
| Room Navigator             | x1  | Installation and Configuration              | x1  |

**NOTE**: HDMI DAs/Splitters can break CEC Communication, it's recommended to source a HDMI DA that can address this break in comunication to the displays in order to power them on and off as the codec pro changes Standby State

#### Node Codec Alternatives
- Codec Pro
- Codec Plus

#### Microphone Alternatives
- AES67 Microphones
- Directional Analog Microphones

### Video Output Connections

- Video Output Connectors 1 and 2 from the Codec Pro are fed into the Partner sourced HDMI Distribution Amplifier
- The new Outputs from Each DA are distributed to all 8 displays so that each side of the campfire has a duplicate output feed for both output 1 and 2 of the Codec Pro
- HDMI Output 3 is unused. You could either add another source output in your space, or integrate an HDMI to USB Capture device and leverage the [Call from Laptop BYOD feature](https://help.webex.com/en-us/article/ney3qxe/Call-from-laptop-using-your-Cisco-device-as-a-web-camera#Cisco_Reference.dita_d3c1dbe8-4263-4d55-b19f-6a49478be4c5)

[![Video Output Connections](/images/campfire_connections_videoOut.png)](#)

### Video Input Connections

- HDMI Input 1 on the Codec Pro connects to the Primary Codec's own Quadcamera
- HDMI Inputs 2-4 on the Codec Pro take in the HDMI Output signal of the Codec EQ's HDMI Output 1
  - Each Node Quadcamera's Video Output signal is feed into their respective Node Codec EQ HDMI Input 1
- HDMI Input 5 is reserved for Laptop Connections
  - It may be worthwhile to integrate a 4x1 HDMI switcher, in order to place a Laptop Connection on all 4 tables
  - Keep in mind, these devices also support wireless sharing via Webex Proximity Services, Airplay and Miracast too, so it may not be necessary
- HD-SDI Input 6 is unused, consider integrating a PTZ Camera in you design if needed, just know the Macros would need some edits to allow for that

[![Video Input Connections](/images/campfire_connections_videoIn.png)](#)

### Network Connections

- All 4 Codecs should connect to the customer Lan for Management and Updates
- Primary Codec Pro
  - Connect the Ethernet Control line of the Primary Codec Pro's Quadcamera to the first Link Local Port of the Primary Codec Pro
  - Connect the POE switch to the second Link Local Port of the Primary Codec Pro
    - Connect all 8 Table Microphone Pros to the POE Switch
    - You may connect additional Table Navigators and/or PTZ Camera Control lines to this switch if modifying the solution design
  - Connect the Room Navigator to the fourth Link Local Port of the Primary Codec Pro
    - You may also connect this to the POE switch for simplicity
- Node Codec EQ
  - For each Node Codec EQ, Connect the Ethernet Control line of the Node Codec EQ's Quadcamera to the first Link Local Port of the respective Node Codec EQ

[![Network Connections](/images/campfire_connections_network.png)](#)

### Audio Output Connections

- The Primary Quadcamera will receive audio over ARC
- All other Quadcameras must have a Euroblock to TRS 3.5mm connection
  - All Audio passes though the Primary Codec Pro, do not connect any Audio via the Node Codecs

[![Audio Output Connections](/images/campfire_connections_audioOut.png)](#)

### Audio Input Connections

- For Ethernet Audio Connections (Both AES67 and Cisco Ethernet Mic), connect these to the POE Switch

[![Ethernet Audio Input Connections](/images/campfire_connections_ethernetAudioIn.png)](#)

- For Analog Audio Connections, connect each microphone to the Microphone 4pin Euroblock connectors on the back of the Primary Codec Pro
- If you plan on using a DSP for Audio Expansion, it would be good to break out 8 Analog Audio Lines and feed them into the codec, as each input at this point could serve as a unique audio zone

[![Analog Audio Input Connections](/images/campfire_connections_analogAudioIn.png)](#)

## Macro Installation [<img src="/images/view-list-circle_100_w.png" alt="table of contents" width="25"/>](#table-of-contents)

NOTE: Macro Installation requires several steps, and is best handled in the order outlined below.

### Download Files
1. Download a copy of the following files from this repository
  - Macros
    - AZM_Lib.js
    - Campfire_1_Main.js
    - Campfire_2_Config.js
    - Campfire_3_Initialization.js
    - Campfire_Node.js
    - GMM_Lite_Lib.js
  - UserInterface Extensions
    - Campfire_UserInterface.xml
  - Panel Icon
    - campfire_panel_icon.png

### Node Codec Installation
1. Log into the Node Codec's Web Interface
2. Navigate to the Macro Editor
3. Press the **Import from file...** button
  -  Find the **Campfire_Node.js** file
  - Save this Macro
4. Press the **Import from file...** button
  - Find the **GMM_Lite_Lib.js** file
  - Save this Macro
5. Activate the **Campfire_Node** Macro
6. Refresh your Web Browser, a **Memory_Storage** macros should have spawned
7. Leave the **GMM_Lite_Lib** Macro inactive
  - **GMM_Lite_Lib** is imported in the **Campfire_Node** Macro and adds no value being active
8. Repeat this Process for each Node Codec in your Room Build
9. When complete, each Node Codec should have a the following Macros Installed
  - Campfire_Node
  - GMM_Lite_Lib
  - Memory_Storage

### Primary Codec Installation

NOTE: Step 2 should be completed first, for a clean boot of the solution.

1. Log into the Node Codec's Web Interface
2. Navigate to the UserInterface Extension Editor
3. Find the **Campfire_UserInterface.xml** file, drag and drop this into the UI Extensions Editor
4. Save the Campfire UI Extension to the codec by selecting the blue arrow in the top right of the UI Extensions editor
5. The Campfire Controls panel should be visible on the touch panel
  - If the Campfire Icon is not visible, you can use the **campfire_panel_icon.png** image and upload this to the panel via the UI extensions editor. Be sure to re-save if you performed this step
6. Navigate to the Macro Editor
7. Press the **Import from file...** button
  - Find the **AZM_Lib.js** file
  - Save this Macro
8. Press the **Import from file...** button
  - Find the **Campfire_1_Main.js** file
  - Save this Macro
9. Press the **Import from file...** button
  - Find the **Campfire_2_Config.js** file
  - Save this Macro
10. Press the **Import from file...** button
  - Find the **Campfire_3_Initialization.js** file
  - Save this Macro
11. Press the **Import from file...** button
  - Find the **GMM_Lite_Lib.js** file
  - Save this Macro
12. When complete, the Primary Codec should have a the following Macros installed
  - AZM_Lib
  - Campfire_1_Main
  - Campfire_2_Config
  - Campfire_3_Initialization
  - GMM_Lite_Lib
  - Memory_Storage
13. _If_ you've already updated the **Campfire_2_Config** Macro, then activate the activate the **Campfire_1_Main** Macro
  - _If_ **Campfire_2_Config** is **NOT** updated, please review the Configuration Section to learn how to configure the Campfire Macro
  - Once updated, activate the activate the **Campfire_1_Main** Macro

## Configuration [<img src="/images/view-list-circle_100_w.png" alt="table of contents" width="25"/>](#table-of-contents)

### Before you Start 
- The Campfire Blueprint needs to be given information about the assets you have setup in the space.
- Please review and setup the Settings, CodecInfo, and AudioMap sections below in FULL.
- All configuration [Objects](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Basics) are structured in a [JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON) format and all references to the configuration will be written in Dot Notation, or by [Property Accessors](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors)
- Navigate to the **Campfire_2_Config** Macro, and edit the Settings, CodecInfo, and AudioMap as needed

**NOTE**: Each Campfire Blueprint configuration requires unique information about your assets. Each configuration should be unique and shouldn't be duplicated across systems, unless restoring an identical system from a backup.

### Settings [<img src="/images/view-list-circle_100_w.png" alt="table of contents" width="25"/>](#table-of-contents)

> Settings govern any items that are unique to the campfire blueprint itself, such as camera mode features, timeouts and default behaviors you may want to set. This object can be copied and applied to any Campfire Blueprint installation

#### Code View
```javascript
const Settings = {
  RoomType: 'Campfire Pro',                 // DefaultValue: 'Campfire Pro' || AcceptedValues: <'Campfire Pro'> || Description: Define the RoomType [ NOTE: Future Use ]
  RoomTypeSettings: {                       // Description: Settings that apply to the Configured Room Type
    Campfire: {
      Camera: {
        UserInterface: {
          Visibility: 'Auto',               // DefaultValue: 'Auto' || AcceptedValues: <'Auto', 'Hidden'> || Description: Show/Hide the Campfire Controls UserInterface
        },
        Default_Overview: {
          Mode: 'Auto',                     // DefaultValue: 'Auto' || AcceptedValues: <'On', 'Off', 'Auto'> || Description: Set a Default Camera view when the room falls silent. On: Applies Composition, Off: Does Nothing, Auto: Use PeopleCount Data to determine the composition
          Composition: [1, 2, 3, 4],        // DefaultValue: [1, 2, 3, 4] || AcceptedValues: Array || Description: Mode is set to On, set's this array of CameraIds when the room falls silent
          TransitionTimeout: {
            OnSilence: 5000                 // DefaultValue: 5000 || AcceptedValues: Integer in Milliseconds || Description: Define define how long to wait before allowing a new Camera to come into Speaker
          }
        },
        Mode: {
          Default: 'Speaker',               // DefaultValue: 'Speaker' || AcceptedValues: <'Speaker', 'Everyone', 'Conversation'> || Description: Set the default Camera Behavior. Speaker: Composes last active camera, Conversation: Composes all Active Audio Zones, Everyone: composes all 4 quadcameras using frames
          Speaker: {
            TransitionTimeout: {
              OnJoin: 2500                  // DefaultValue: 2500 || AcceptedValues: Integer in Milliseconds || Description: Define define how long to wait before allowing a new Camera to come into Speaker
            }
          },
          Conversation: {
            TransitionTimeout: {
              OnJoin: 20000,                // DefaultValue: 5000 || AcceptedValues: Integer in Milliseconds || Description: Define how long a camera remains in the composition when it first joins the conversation
              Continue: 15000               // DefaultValue: 2500 || AcceptedValues: Integer in Milliseconds || Description: Define often the camera will continue being composed if the conversation is still active
            }
          }
        }
      }
    }
  }
}
```

#### Settings.RoomType

> Description: Governs the RoomType, currently, this feature is not fully implemented and may be removed

- **Default Value**: 'Campfire Pro'
- **Accepted Values**: ['Campfire Pro']
- **DataType**: String
- **Required**: Yes
- **Value Definitions**:
  - Campfire Pro: Tells the Campfire Blueprint to operate campfire with using 4 speakertracking cameras

#### Settings.RoomTypeSettings.Campfire.UserInterface.Visibility

> Description: Allows you to alter the Campfire UI Extension

- **Default Value**: 'Auto'
- **Accepted Values**: ['Auto', 'Hidden']
- **DataType**: String
- **Required**: Yes
- **Value Definitions**:
  - Auto: Shows the Campfire Controls Panel
  - Hidden: Hidden: Hides the the Campfire Controls Panel

#### Settings.RoomTypeSettings.Campfire.Camera.Default_Overview.Mode

> Description: Change how the Default Overview MainSource composition when the room falls silent

- **Default Value**: 'Auto'
- **Accepted Values**: ['Auto', 'On', 'Off']
- **DataType**: String
- **Required**: Yes
- **Value Definitions**:
  - Auto: The composition will be determined by the PeopleCountCurrent status reported by the Primary and Node Codecs
  - On: The composition is hard set by the value provided in Settings.RoomTypeSettings.Campfire.Camera.Default_Overview.Composition
  - Off: The default composition is turned off, and will remain on the last camera composition

#### Settings.RoomTypeSettings.Campfire.Camera.Default_Overview.Composition

> Description: When Settings.RoomTypeSettings.Campfire.Camera.Default_Overview.Mode is set to On, it will rely on the composition outlined here

- **Default Value**: [ 1, 2, 3, 4 ]
- **Accepted Values**: 1-6, Max Array Size: 4
- **DataType**: Integer Array
- **Required**: Mode Dependant
- **Value Definitions**:
  - The Integers in this array correspond to the Camera Connector ID. By default, campfire is configured with 4 cameras, but can alter this setting to pick another camera or group of cameras


#### Settings.RoomTypeSettings.Campfire.Camera.Default_Overview.TransitionTimeout.OnSilence

> Description: A timeout in milliseconds, that instructs the Campfire Blueprint to wait before composing the Default Overview MainsSource composition when all audio zones fall silent

- **Default Value**: 5000
- **Accepted Values**: Any non-negative whole integer
- **DataType**: Integer
- **Required**: Yes
- **Value Definitions**:
  - NOTE: Not recommended to set this to anything below 500 or any value that takes far too much time.

#### Settings.RoomTypeSettings.Campfire.Camera.Mode.Default

> Description: Set the Default Campfire Camera Mode. This will be applied when the script is first enabled, and any time the devices exits a call

- **Default Value**: 'Speaker'
- **Accepted Values**: ['Speaker', 'Everyone', 'Conversation']
- **DataType**: String
- **Required**: Yes
- **Value Definitions**:
  - Speaker: Sets Speaker as the Default Camera Mode
    - Updates the MainSource with the last captured active speaker with Closeup active. This mode has a configurable timeout to allow faster or slower switching.
  - Everyone: Sets Everyone as the Default Camera Mode
    -Updates the MainSource to all 4 cameras in a 2x2 grid with Frames active. This is a static mode. The speaker by a combination of the in room microphones and the Speakertracking Camera.
  - Conversation: Sets Conversation as the Default Camera Mode
    - Updates the MainSource dynamically to any and all active speakers with Closeup Active. This modes is configurable to allow faster or slower switching. The speaker by a combination of the in room microphones and the Speakertracking Camera.


#### Settings.RoomTypeSettings.Campfire.Camera.Mode.Speaker.TransitionTimeout.OnJoin

> Description: A timeout in milliseconds, that instructs the Campfire Blueprint to wait when a New Active Speaker is determine while Campfire Camera Mode **Speaker** is active. This timeout allows that speaker to stay in view for the alloted time, before allowing a new speaker.

- **Default Value**: 2500
- **Accepted Values**: Any non-negative whole integer
- **DataType**: Integer
- **Required**: Yes
- **Value Definitions**:
  - NOTE: Not recommended to set this to anything below 2000 or any value that takes far too much time.

#### Settings.RoomTypeSettings.Campfire.Camera.Mode.Conversation.TransitionTimeout.OnJoin

> Description: A timeout in milliseconds, that instructs the Campfire Blueprint to wait when a New Active Speaker is determine while Campfire Camera Mode **Conversation** is active. This timeout allows that speaker to stay in view for the alloted time. Note: Each Audio Zone configured has their own independent timeout and are handled separately.

- **Default Value**: 20000
- **Accepted Values**: Any non-negative whole integer
- **DataType**: Integer
- **Required**: Yes
- **Value Definitions**:
  - NOTE: Not recommended to set this to anything below 10000 or any value that takes far too much time.

#### Settings.RoomTypeSettings.Campfire.Camera.Mode.Conversation.TransitionTimeout.Continue

> Description: A timeout in milliseconds, that instructs the Campfire Blueprint to continue to keep that Active Speaker in the MainSource Composition. This Timeout is set once Settings.RoomTypeSettings.Campfire.Camera.Mode.Conversation.TransitionTimeout.OnJoin has concluded on a specific audio zone. If this Zone's audio state is still _High_, then xthis timeout will start, else, it will remove this speaker from the MainSource composition

- **Default Value**: 15000
- **Accepted Values**: Any non-negative whole integer
- **DataType**: Integer
- **Required**: Yes
- **Value Definitions**:
  - NOTE: Not recommended to set this to anything below 10000 or any value that takes far too much time.


### CodecInfo [<img src="/images/view-list-circle_100_w.png" alt="table of contents" width="25"/>](#table-of-contents)
> CodecInfo contains unique information about the Primary and Node Codecs. This information is used to coordinate all devices to operate as 1 unit. This information is unique per space and should not be copied from one space to another

#### Code View
```javascript
const CodecInfo = {
  Authentication: {
    Mode: 'Common',                           // DefaultValue: 'Common' || AcceptedValues: <'Common', 'Independent'> || Description: Define whether to use Common or Independent login information for each node codec
    Common_Username: 'admin',                 // DefaultValue: String || AcceptedValues: String || Description: The username shared across all node codecs. Only accessed when the Mode is set to Common
    Common_Passcode: ''                       // DefaultValue: String || AcceptedValues: String || Description: The passcode shared across all node codecs. Only accessed when the Mode is set to Common
  },
  PrimaryCodec: {
    Label: 'North',                      // DefaultValue: String || AcceptedValue: String || Description: Provide a label for your Primary Codec
    PrimaryCodec_QuadCamera_Id: '1',          // DefaultValue: 1 || AcceptedValue: Integer || Description: Provide the CameraId configured to the quadcamera connected to the Primary Codec
    CodecSerialNumber: '0000000000',          // DefaultValue: String || AcceptedValue: String || Description: Provide the Serial Number of the Primary Codec
    Authentication: {
      Username: 'admin',                      // DefaultValue: String || AcceptedValue: String || Description: Username for the Primary Codec, used for node communication the primary
      Passcode: ''                            // DefaultValue: String || AcceptedValue: String || Description: Passcode for the Primary Codec, used for node communication the primary
    }
  },
  NodeCodecs: [
    {
      Label: 'East',                     // DefaultValue: String || AcceptedValue: String || Description: Provide a label for your Node Codec
      PrimaryCodec_QuadCamera_Id: '2',        // DefaultValue: 1 || AcceptedValue: Integer || Description: Provide the CameraId configured on the Primary Codec this Node Codec's HDMI output is connected to
      CodecSerialNumber: '0000000000',        // DefaultValue: String || AcceptedValue: String || Description: Provide the Serial Number of the Node Codec
      IpAddress: '10.X.X.X',                  // DefaultValue: String || AcceptedValue: String || Description: Provide the IP Address of the Node Codec
      Authentication: {           
        Username: 'admin',                    // DefaultValue: String || AcceptedValue: String || Description: If CodecInfo.Authentication.Mode is set to Independent, assign the username for this Node Codec
        Passcode: ''                          // DefaultValue: String || AcceptedValue: String || Description: If CodecInfo.Authentication.Mode is set to Independent, assign the passcode for this Node Codec
      }
    },
    // For the remaining Node Codecs, follow the same format as above
    {
      Label: 'South',                            
      PrimaryCodec_QuadCamera_Id: '3',         
      CodecSerialNumber: '0000000000',         
      IpAddress: '10.X.X.X',                  
      Authentication: { Username: 'admin', Passcode: '' }
    },
    {
      Label: 'West',
      PrimaryCodec_QuadCamera_Id: '4',
      CodecSerialNumber: '0000000000',
      IpAddress: '10.X.X.X',
      Authentication: { Username: 'admin', Passcode: '' }
    }
  ]
}
```

#### CodecInfo.Authentication.Mode

> Description: Determine how the Campfire Blueprint will apply authentication in the macro.

- **Default Value**: 'Common'
- **Accepted Values**: ['Common','Independent']
- **DataType**: String
- **Required**: Yes
- **Value Definitions**:
  - Common: For simplified deployment, use common auth against on all codecs defined within the scope of the Campfire Blueprint
  - Independent: Apply separate auth details to each codec defined within the scope of the Campfire Blueprint

#### CodecInfo.Authentication.Common_Username

> Description: Only accessed when **CodecInfo.Authentication.Mode** is set to Common. Provide the Common Username to all codecs defined within the scope of the Campfire Blueprint. 

**Warning: Be sure to check with your organization's Security Best Practices before storing any authentication details in this Macro. You may need to alter the macro to adhere to your organization's best practices**

- **Default Value**: ''
- **Accepted Values**: Any String
- **DataType**: String
- **Required**: Dependant on **CodecInfo.Authentication.Mode** Setting
- **Value Definitions**:
  - N/A

#### CodecInfo.Authentication.Common_Passcode

> Description: Only accessed when **CodecInfo.Authentication.Mode** is set to Common. Provide the Common Passcode to all codecs defined within the scope of the Campfire Blueprint. 

**Warning: Be sure to check with your organization's Security Best Practices before storing any authentication details in this Macro. You may need to alter the macro to adhere to your organization's best practices**

- **Default Value**: ''
- **Accepted Values**: Any String
- **DataType**: String
- **Required**: Dependant on **CodecInfo.Authentication.Mode** Setting
- **Value Definitions**:
  - N/A

#### CodecInfo.PrimaryCodec.Label

> Description: Provide a name to help you better define where the Primary Codec when reviewing the macro logs

- **Default Value**: ''
- **Accepted Values**: Any String
- **DataType**: String
- **Required**: No
- **Value Definitions**:
  - N/A

#### CodecInfo.PrimaryCodec.PrimaryCodec_QuadCamera_Id

> Description: This tells the Campfire Blueprint Macro which HDMI Input connector the Quadcamera of the Primary Codec is plugged into. 

- **Default Value**: 1
- **Accepted Values**: Any non-negative whole integer
- **DataType**: Integer
- **Required**: Yes
- **Value Definitions**: 
  - N/A

#### CodecInfo.PrimaryCodec.CodecSerialNumber

> Description: This the Serial Number of the Primary Codec and helps the Campfire Blueprint Macro determine which codec is in charge of operating the solution

- **Default Value**: ''
- **Accepted Values**: Codec Serial Number
- **DataType**: String
- **Required**: Yes
- **Value Definitions**:
  - N/A

#### CodecInfo.PrimaryCodec.Authentication.Username

> Description: Only accessed when **CodecInfo.Authentication.Mode** is set to Independent. Provide the Username to the Primary Codec. 

**Warning: Be sure to check with your organization's Security Best Practices before storing any authentication details in this Macro. You may need to alter the macro to adhere to your organization's best practices**

- **Default Value**: ''
- **Accepted Values**: Any String
- **DataType**: String
- **Required**: Dependant on **CodecInfo.Authentication.Mode** Setting
- **Value Definitions**:
  - N/A

#### CodecInfo.PrimaryCodec.Authentication.Passcode

> Description: Only accessed when **CodecInfo.Authentication.Mode** is set to Independent. Provide the Passcode to the Primary Codec. 

**Warning: Be sure to check with your organization's Security Best Practices before storing any authentication details in this Macro. You may need to alter the macro to adhere to your organization's best practices**

- **Default Value**: ''
- **Accepted Values**: Any String
- **DataType**: String
- **Required**: Dependant on **CodecInfo.Authentication.Mode** Setting
- **Value Definitions**:
  - N/A

#### CodecInfo.NodeCodecs[{Array}]

> NOTE: The NodeCodecs Nest contains multiple blocks of similar properties. Below will reference how to setup 1 node codec. This will need to be expanded to 3 times to include all Node Codecs for the Campfire Blueprint, please reference the Code View for full sample syntax

##### CodecInfo.NodeCodecs[{Array}].Label

> Description: Provide a name to help you better define where this Node Codec when reviewing the macro logs

- **Default Value**: ''
- **Accepted Values**: Any String
- **DataType**: String
- **Required**: No
- **Value Definitions**:
  - N/A

##### CodecInfo.NodeCodecs[{Array}].PrimaryCodec_QuadCamera_Id

> Description: This tells the Campfire Blueprint Macro which HDMI Input connector of the Primary Codec this Node Codec's HDMI Output is plugged into. 

- **Default Value**: 2
- **Accepted Values**: Any non-negative whole integer
- **DataType**: Integer
- **Required**: Yes
- **Value Definitions**: 
  - N/A

##### CodecInfo.NodeCodecs[{Array}].CodecSerialNumber

> Description: This the Serial Number of this **Node Codec** and helps the Campfire Blueprint Macro determine how to communicate to the correct node when applicable

- **Default Value**: ''
- **Accepted Values**: Codec Serial Number
- **DataType**: String
- **Required**: Yes
- **Value Definitions**:
  - N/A

##### CodecInfo.NodeCodecs[{Array}].Authentication.Username

> Description: Only accessed when **CodecInfo.Authentication.Mode** is set to Independent. Provide the Username to this Node Codec. 

**Warning: Be sure to check with your organization's Security Best Practices before storing any authentication details in this Macro. You may need to alter the macro to adhere to your organization's best practices**

- **Default Value**: ''
- **Accepted Values**: Any String
- **DataType**: String
- **Required**: Dependant on **CodecInfo.Authentication.Mode** Setting
- **Value Definitions**:
  - N/A

##### CodecInfo.NodeCodecs[{Array}].Authentication.Passcode

> Description: Only accessed when **CodecInfo.Authentication.Mode** is set to Independent. Provide the Passcode to this Node Codec. 

**Warning: Be sure to check with your organization's Security Best Practices before storing any authentication details in this Macro. You may need to alter the macro to adhere to your organization's best practices**

- **Default Value**: ''
- **Accepted Values**: Any String
- **DataType**: String
- **Required**: Dependant on **CodecInfo.Authentication.Mode** Setting
- **Value Definitions**:
  - N/A

### AudioMap [<img src="/images/view-list-circle_100_w.png" alt="table of contents" width="25"/>](#table-of-contents)
> AudioMap allows you to define the AudioZones within your space. These zones teach the Primary Codec how to make use of your microphone data. This Object defined by the AZM Library Macro.

#### Code View
```javascript
const AudioMap = {
  Settings: {                   // Description: The Settings node effects all audio processing by AZM
    Sample: {
      Size: 4,                  // DefaultValue: 4 || AcceptedValue: Integer || Description: Set the sample size for AZM Audio Collection
      Rate_In_Ms: 500           // DefaultValue: 4 || AcceptedValue: 10-1000 || Description: Set the sample rate for AZM Audio Collection
    },
    GlobalThreshold: {
      Mode: 'On',               // DefaultValue: 'On' || AcceptedValue: <'On', 'Off'> || Description: On: Enable Global Audio Thresholds for All Audio Zones; Off: Enable Independent Audio Thresholds for All Audio Zones
      High: 25,                 // DefaultValue: 35   || AcceptedValue: 1-60          || Description: Set the High Global Threshold
      Low: 15                   // DefaultValue: 20   || AcceptedValue: 1-60          || Description: Set the High Global Threshold
    }
  },
  Zones: [                      // Description: The Zones node allows you to define one or more audio zones for the AZM Automation. This is an array.
    /*
      Below is an example configuration for a single Ethernet/AES67 Microphone Zone
    */
    {
      Label: 'Example Ethernet Configuration',  // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      Independent_Threshold: {
        High: 35,                               // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 20                                 // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
      },
      MicrophoneAssignment: {
        Type: 'Ethernet',                       // DefaultValue: 'Microphone' || AcceptedValue: <'Microphone' or 'Analog', 'Ethernet' or 'AES67'> || Description: Define the Type of Microphone placed in this Zone
        Connectors: [                           // Description: Assign one of more connectors to your Zone. This is an Array
          {
            Serial: '',                         // DefaultValue: String || AcceptedValue: String || Description: For Cisco Ethernet Microphones Only, assign the Serial address of the Microphone associated to this Zone
            StreamName: '',                     // DefaultValue: String || AcceptedValue: String || Description: For Ethernet/AES67 Microphones, assign the StreamName associated to the Zone
            SubId: [2, 3]                       // DefaultValue: Array  || AcceptedValue: [1-8]  || Description: For Ethernet/AES67 Microphones, SubIds to subscribe to. 3rd party microphones may vary
          }
        ]
      },
      Assets: {                                 // Description: Define any object associated to this Audio Zone. Asset Information will be provided when an Event Fires
        CameraConnectorId: 1                    // 
      }
    },
    /*
      This ends the First Zone, add more Zones using the Same Format as above for Ethernet Microphones
      ---
        NOTE: Not recommended to mix Microphone Types as of December 2023
      ---
      Below is an example configuration for a single Analog Microphone Zone
    */
    {
      Label: 'Example Analog Configuration',    // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      Independent_Threshold: {
        High: 15,                               // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 9                                  // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
      },
      MicrophoneAssignment: {
        Type: 'Microphone',                     // DefaultValue: 'Microphone' || AcceptedValue: <'Microphone' or 'Analog', 'Ethernet' or 'AES67'> || Description: Define the Type of Microphone placed in this Zone
        Connectors: [
          {
            Id: 1                               // DefaultValue: Integer || AcceptedValue: Integer || Description: For Analog Microphones, assign the ConnectorId associated to the Zone
          }
        ]
      },
      Assets: {                                 // Description: Define any object associated to this Audio Zone. Asset Information will be provided when an Event Fires
        CameraConnectorId: 1                    // 
      }
    }
  ]
}
```

#### AudioMap.Settings.Sample.Size

> Description: The Sample Size refers to how many VuMeter samples the AZM Library connects across all microphone connectors before determining the Audio Zone's state

- **Default Value**: 4
- **Accepted Values**: Any non-negative, non-zero, whole integer
- **DataType**: Integer
- **Required**: Yes
- **Value Definitions**:
  - NOTE: This value effects the performance and speed of the Audio Zone Status

#### AudioMap.Settings.Sample.Rate

> Description: The Sample Rate refers to how often a VuMeter sampled by the AZM is collected in milliseconds across all microphone connectors

- **Default Value**: 500
- **Accepted Values**: 10 to 1000
- **DataType**: Integer
- **Required**: Yes
- **Value Definitions**:
  - NOTE: This value effects the performance and speed of the Audio Zone Status

#### AudioMap.Settings.GlobalThreshold.Mode

> Description: Choose how you want audio thresholds handled in your space

- **Default Value**: 'On'
- **Accepted Values**: ['On', 'Off']
- **DataType**: String
- **Required**: Yes
- **Value Definitions**:
  - On: Applies the **AudioMap.Settings.GlobalThreshold.High/Low** values across all microphone connectors

#### AudioMap.Settings.GlobalThreshold.High

> Description: The High threshold defined for all microphone connectors. Any Audio Zone that is greater than or equal too this value will transition to a _High_ state

- **Default Value**: 25
- **Accepted Values**: 1 to 60
- **DataType**: Integer
- **Required**: Yes
- **Value Definitions**:
  - NOTE: The High threshold should have a value greater than the Low threshold

#### AudioMap.Settings.GlobalThreshold.Low

> Description: The High threshold defined for all microphone connectors. Any Audio Zone that is lesser than or equal too this value will transition to a _Low_ state

- **Default Value**: 15
- **Accepted Values**: 1 to 60
- **DataType**: Integer
- **Required**: Yes
- **Value Definitions**:
  - NOTE: The Low threshold should have a value lesser than the High threshold

#### AudioMap.Zones[{Array}]

> NOTE: The Zones nested values contains multiple blocks of similar properties. Below will cover all nested properties, but not all values belong to each connector type. You will need 4 Zones total for the Campfire Blueprint.

**Warning: It's best practice _NOT to mix Analog and Ethernet Microphones_ due to latency between the to microphone types. Please choose 1 microphone typw for your room design, follow the format for that microphone type listed below.**

##### AudioMap.Zones[{Array}].Label

> Description: A label you can assign to the zone. This is used to identify zones in your space. 

- **Default Value**: 'Zone_N'
- **Accepted Values**: String
- **DataType**: String
- **Required**: No
- **Value Definitions**:
  - N/A

##### AudioMap.Zones[{Array}].Independent_Threshold.High

> Description: The High threshold defined for the Zone it's defined within. Any Audio Zone that is greater than or equal too this value will transition to a _High_ state

- **Default Value**: 35
- **Accepted Values**: 1-60
- **DataType**: Integer
- **Required**: No
- **Value Definitions**:
  - NOTE: The High threshold should have a value greater than the Low threshold

##### AudioMap.Zones[{Array}].Independent_Threshold.Low

> Description:  The Low threshold defined for the Zone it's defined within. Any Audio Zone that is greater than or equal too this value will transition to a _Low_ state

- **Default Value**: 20
- **Accepted Values**: 1-60
- **DataType**: Integer
- **Required**: No
- **Value Definitions**:
  - NOTE: The Low threshold should have a value lesser than the High threshold

##### AudioMap.Zones[{Array}].MicrophoneAssignment.Connectors[{SubArray}].Serial

> Description: For Cisco Ethernet Microphones Only, assign the microphone's Serial address of the Microphone associated to this Zone. This tells the Macro how to find the Connector ID and map the correct audio information to your Zone

- **Default Value**: ''
- **Accepted Values**: String
- **DataType**: String
- **Required**: Only if using Cisco Ethernet Microphones
- **Value Definitions**:
  - N/A

##### AudioMap.Zones[{Array}].MicrophoneAssignment.Connectors[{SubArray}].StreamName

> Description: For AES67 Microphones Only, assign the microphone's StreamName of the Microphone associated to this Zone.This tells the Macro how to find the Connector ID and map the correct audio information to your Zone

- **Default Value**: ''
- **Accepted Values**: String
- **DataType**: String
- **Required**: Only if using AES67 Ethernet Microphones
- **Value Definitions**:
  - N/A

##### AudioMap.Zones[{Array}].MicrophoneAssignment.Connectors[{SubArray}].SubId

> Description: For Ethernet based Microphones, these are the SubIds (or media channels) to subscribe to. 3rd party microphones may vary in # of streams

- **Default Value**: []
- **Accepted Values**: [1-8] (Microphone Dependant)
- **DataType**: Integer Array
- **Required**: Only if using Ethernet based Microphones
- **Value Definitions**:
  - NOTE: Not all microphones have multiple SubIds. Many may mix the stream and output 1 channel

##### AudioMap.Zones[{Array}].MicrophoneAssignment.Connectors[{SubArray}].Id

> Description: For Analog Microphones, assign the ConnectorId associated to the Zone. This is the physical connector id on the found on the codec body.

- **Default Value**: 1
- **Accepted Values**: 1-N
- **DataType**: Integer
- **Required**: Only if using Analog Microphones
- **Value Definitions**:
  - NOTE: Recommended to use Direction Analog Microphones

##### AudioMap.Zones[{Array}].Assets

> Description: Assign unique objects under Assets to be assigned to this zone. This could contain any nest object for your design

- **Default Value**: {}
- **Accepted Values**: JSON Object Literal
- **DataType**: JSON Object Literal
- **Required**: No
- **Value Definitions**:
  - NOTE: Assets may change from project to project

- - -

## Video Tutorials [<img src="/images/view-list-circle_100_w.png" alt="table of contents" width="25"/>](#table-of-contents)

```
Coming Soon

Stay Tuned
```

## FAQ [<img src="/images/view-list-circle_100_w.png" alt="table of contents" width="25"/>](#table-of-contents)

### Is Campfire supported by Cisco Technical Assistance Center (TAC)?
- No, Cisco TAC will not support the Campfire Solution as it's considered customer code
- TAC will support the RoomOS Software and your Codec Hardware for it's normal operation, such as Speakertrack.
- You will need to engage your AV Partner for support, but the code is open for anyone to troubleshoot

### Will Campfire work on a Codec Pro running as a Microsoft Teams Room (MTR)?
- As of January 2024, no, there is an API limitation in the Macro Code. This API limitation stops the campfire solution from operating.

### Can I use the Room Bar or the Room Bar Pro as the camera, instead of a Codec with a Quadcamera
- The Campfire blueprint in it's current state, is outlined to use all Quadcameras
- If your space is uniquely different, the Room Bar/RoomBar Pro can be used, but the Macros will need to be altered to suit that build.
  - Not impossible, but may need a little extra TLC to get going

### Can I add a PTZ Camera?
- Yes and No
  - Yes, as you have an extra HD-SDI input available to add a Camera
  - No, as the camera switching in the Macro is on all the time, so you'll need to edit the Macro to include a PTZ in your solution

### How can I get help?
- Review the Guides above, there is alot of detail that can help :smiley:
- You can join a Community Supported Space on Webex
  - https://eurl.io/#nJWdM3w_T
  - NOTE: This is a community supported space. There is no guarantee of assistance in this space, it's a space filled with community members who may or may not answer questions or provide feedback; all is best effort. Should you need hands on assistance, please engage either your Cisco Sales Engineer and/or Cisco Technical Solutions Engineer or an AV Vendor Partner.

### How do I register the Node Codec's?
#### Cloud/Webex Edge (Preferred)
- Register all Nodes as a Shared Mode Device in their own Workspace
- Keep all Nodes and the Primary Codec workspaces on the same Software Channel
  - This keeps feature parity across all systems
- Do not assign telephony or a calendar resource account to the Node codecs

- **NOTE**: DO NOT register the Node Codecs to the same workspace as the Primary Codec
  - This will cause call sync and performance issues, which will break the campfire experience.

> It's recommended to tag all 4 devices so it's easier to find in Webex Control Hub

#### On Premise
- Register all Devices in CUCM/TMS as an independent device
- Keep all Nodes and the Primary codecs on the same RoomOS software version
- Do not assign telephony or a calendar resource account to the Node codecs


#### Unregistered (Not Recommended)
- You can keep the node devices unregistered
- Some configurations will be needed to prevent errors from showing on the OSD
- This can save on licensing, but runs the risk of falling out of sync on the software side
- This would increase the management difficulty of the Node codecs