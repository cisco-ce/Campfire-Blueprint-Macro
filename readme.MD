# Campfire Blueprint

[![Campfire Room Render](/images/campfire_room_render.jpeg)](#)

| Minimum RoomOs Version | Webex Cloud | Webex Edge (Hybrid Cloud) | On-Premise | Microsoft Teams Room<br>On Cisco Devices |
|:-----------------------|:------------|:--------------------------|:-----------|:-----------------------------------------|
| 11.8.X                 | ✅         | ✅                       | ✅        | ❌ - API Limitation<br>(December 2023)      |

## About

- - -

## Table of Contents

- [Campfire Best Practices](#campfire-best-practices)
- [Key Terminology](#)
- [Device Requirements](#)
- [Support Information](#)
- [User Guide](#user-guide)
- [Macro Installation](#)
- [Configuration](#)
  - [Settings](#)
  - [CodecInfo](#)
  - [AudioMap](#)
- [3rd Party Hardware Integration](#)
- [FAQ](#)

> Press on the Menu Icon to come back to the Table of Contents [<img src="/images/view-list-circle_100_w.png" alt="drawing" width="25"/>](#)

- - -

## Campfire Best Practices [<img src="/images/view-list-circle_100_w.png" alt="drawing" width="25"/>](#table-of-contents)
- ToDo

## Key Terminology

| **Term** | **Definition** |
|---|---|
| AZM/AZM Library | Acronym for the Audio Zone Manager Library. This library contains the logic needed for clean audio based events |
| GMM/GMM Lite Lib | Acronym for the Global Macro Messaging Library. GMM Lite is a modified version of the original GMM, that removes all tools not in use in the Campfire Solution. GMM enables a simplified set of inter-macro/codec communication, read and write functionality |
| Primary/Primary Codec | References the codec in the room design that is the main device for video conferencing and hosts the bulk of the responsibility for the overall campfire solution. |
| Node/Node Codec | References the codec(s) in the room design that report to the primary and functions as a modified peripheral for the Primary Codec. |
| Audio Zone | A concept that defines a region of audio we use to assign microphone too. Each Audio Zone must be defined and mapped to a camera resource in order to enable the solution |                                                                              |

## Device Requirements

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

## Support Information
- All Macros are considered **Custom Code**. Any and all pieces Custom Code are **NOT** supported by Cisco. The base Hardware, Software and Device xAPI are covered by the product.
- If you're considering deploying the Campfire Blueprint Macros we recommend you engage a Cisco Vendor Partner, not only for installation, but for configuration and ongoing support.
- The Campfire Blueprint Macros are provided as is, please reference the code license.

## User Guide

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
## Macro Installation

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

## Configuration

### Before you Start 
- The Campfire Blueprint needs to be given information about the assets you have setup in the space.
- Please review and setup the Settings, CodecInfo, and AudioMap sections below in FULL.
- All configuration [Objects](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Basics) are structured in a [JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON) format and all references to the configuration will be written in Dot Notation, or by [Property Accessors](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors)
- Navigate to the **Campfire_2_Config** Macro, and edit the Settings, CodecInfo, and AudioMap as needed

**NOTE**: Each Campfire Blueprint configuration requires unique information about your assets. Each configuration should be unique and shouldn't be duplicated across systems, unless restoring an identical system from a backup.

### Configuring the Settings Object

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
          Default: 'Speaker',               // DefaultValue: 'Speaker' || AcceptedValues: <'Speaker', 'Conversation', 'Spotlight', 'Quad'> || Description: Set the default Camera Behavior. Speaker: Composes last active camera, Conversation: Composes all Active Audio Zones, Spotlight: Keeps 1 target camera composed, ignores default overview, composes any additional high zones; Quad: composes all 4 quadcameras
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


### Configuring the CodecInfo Object
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

### Configuring the AudioMap Object
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
        CustomAsset_1: 'Define My First Asset', // NOTE: Any Objects nested within Assets are defined by You and have no based key or value pairing. This us an example of a custom asset
        CameraId: 1                             // A more real world example of an Asset
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
        CustomAsset_2: 'Define My Second Asset',// NOTE: Any Objects nested within Assets are defined by You and have no based key or value pairing. This us an example of a custom asset
        PresetId: 30                            // A more real world example of an Asset
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

> NOTE: The Zones Nest contains multiple blocks of similar properties. Below will cover all nested properties, but not all values belong to each connector type. You will need 4 Zones total for the Campfire Blueprint.

**Warning: It's best practice _NOT to mix Analog and Ethernet Microphones_ due to latency between the to microphone types. Please choose 1 microphone typw for your room design, follow the format for that microphone type listed below.**

##### AudioMap.Zones[{Array}].Label

> Description: 

- **Default Value**: 
- **Accepted Values**: 
- **DataType**: 
- **Required**: 
- **Value Definitions**:
  - 

##### AudioMap.Zones[{Array}].Independent_Threshold.High

> Description: 

- **Default Value**: 
- **Accepted Values**: 
- **DataType**: 
- **Required**: 
- **Value Definitions**:
  - 

##### AudioMap.Zones[{Array}].Independent_Threshold.Low

> Description: 

- **Default Value**: 
- **Accepted Values**: 
- **DataType**: 
- **Required**: 
- **Value Definitions**:
  - 

##### AudioMap.Zones[{Array}].MicrophoneAssignment.Connectors[{SubArray}].Serial

> Description: 

- **Default Value**: 
- **Accepted Values**: 
- **DataType**: 
- **Required**: 
- **Value Definitions**:
  - 

##### AudioMap.Zones[{Array}].MicrophoneAssignment.Connectors[{SubArray}].StreamName

> Description: 

- **Default Value**: 
- **Accepted Values**: 
- **DataType**: 
- **Required**: 
- **Value Definitions**:
  - 

##### AudioMap.Zones[{Array}].MicrophoneAssignment.Connectors[{SubArray}].SubId

> Description: 

- **Default Value**: 
- **Accepted Values**: 
- **DataType**: 
- **Required**: 
- **Value Definitions**:
  - 

##### AudioMap.Zones[{Array}].MicrophoneAssignment.Connectors[{SubArray}].Id

> Description: 

- **Default Value**: 
- **Accepted Values**: 
- **DataType**: 
- **Required**: 
- **Value Definitions**:
  - 

##### AudioMap.Zones[{Array}].Assets.CameraConnectorId

> Description: 

- **Default Value**: 
- **Accepted Values**: 
- **DataType**: 
- **Required**: 
- **Value Definitions**:
  - 

- - -