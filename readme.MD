# Campfire Blueprint

[![Campfire Room Render](/images/campfire_room_render.jpeg)](#)

| Minimum RoomOs Version | Webex Cloud | Webex Edge (Hybrid Cloud) | On-Premise | Microsoft Teams Room<br>On Cisco Devices |
|:-----------------------|:------------|:--------------------------|:-----------|:-----------------------------------------|
| 11.8.X                 | ✅         | ✅                       | ✅        | ❌ - API Limitation<br>(December 2023)      |

## About

- - -

## Table of Contents (TOC)
- [Campfire Best Practices](#)
- [Key Terminology](#)
- [Device Requirements](#)
- [Support Information](#)
- [User Guide](#)
- [Macro Installation](#)
- [Configuration](#)
  - [Settings](#)
  - [CodecInfo](#)
  - [AudioMap](#)
- [3rd Party Hardware Integration](#)
- [FAQ](#)

- - -

## Campfire Best Practices

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
 - Campfire_1_Main
 - Campfire_1_Main
 - GMM_Lite_Lib
 - Memory_Storage
13. _If_ you've already updated the **Campfire_2_Config** Macro, then activate the activate the **Campfire_1_Main** Macro
 - _If_ **Campfire_2_Config** is **NOT** updated, please review the Configuration Section to learn how to configure the Campfire Macro
 - Once updated, activate the activate the **Campfire_1_Main** Macro

## Configuration

Though automating this would have been nice, the Campfire Blueprint does require some configuration before it can fully work. The solution needs to be given information about the assets you have setup in the space.

NOTE: Each Campfire Blueprint configuration requires unique information about your assets. Each configuration should be unique and shouldn't be duplicated across systems, unless restoring an identical system from a backup.
- - -