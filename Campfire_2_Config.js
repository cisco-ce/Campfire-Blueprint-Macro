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

const Settings = {
  RoomType: 'Campfire Pro',             // DefaultValue: 'Campfire Pro' || AcceptedValues: <'Campfire Pro'> || Description: Define the RoomType [ NOTE: Future Use ]
  RoomTypeSettings: {                   // Description: Settings that apply to the Configured Room Type
    Campfire: {                                 //Description: Settings that apply to the Campfire Solution
      Camera: {                                 //Description: Settings assoicited to Cameras
        UserInterface: {
          Visibility: 'Auto',                   // DefaultValue: 'Auto' || AcceptedValues: <'Auto', 'Hidden'> || Description: Show/Hide the Campfire Controls UserInterface
          Location: 'HomeScreenAndCallControls' // DefaultValue: 'HomeScreenAndCallControls' || AcceptedValues: Any Panel Location || Description: Specify the Campfire Controls location
        },
        Default_Overview: {
          Mode: 'Auto',                         // DefaultValue: 'On' || AcceptedValues: <'On', 'Off', 'Auto'> || Description: Set a Default Camera view when the room falls silent. On: Applies Composition, Off: Does Nothing, Auto: Use PeopleCount Data to determine the composition
          Composition: [1, 2, 3, 4],            // DefaultValue: [1, 2, 3, 4] || AcceptedValues: Array || Description: Mode is set to On, set's this array of CameraIds when the room falls silent
          TransitionTimeout: {
            OnSilence: 5000                     // DefaultValue: 2500 || AcceptedValues: Integer in Milliseconds || Description: Define define how long to wait before allowing a new Camera to come into focus
          }
        },
        Mode: {
          Default: 'Focus',                     // DefaultValue: 'Focus' || AcceptedValues: <'Focus', 'Conversation', 'Spotlight', 'Quad'> || Description: Set the default Camera Behavior. Focus: Composes last active camera, Conversation: Composes all Active Audio Zones, Spotlight: Keeps 1 target camera composed, ignores default overview, composes any additional high zones; Quad: composes all 4 quadcameras
          Focus: {
            TransitionTimeout: {
              OnJoin: 2500                      // DefaultValue: 2500 || AcceptedValues: Integer in Milliseconds || Description: Define define how long to wait before allowing a new Camera to come into focus
            }
          },
          Conversation: {
            TransitionTimeout: {
              OnJoin: 5000,                     // DefaultValue: 5000 || AcceptedValues: Integer in Milliseconds || Description: Define how long a camera remains in the composition when it first joins the conversation
              Continue: 2500                    // DefaultValue: 2500 || AcceptedValues: Integer in Milliseconds || Description: Define often the camera will continue being composed if the conversation is still active
            }
          },
          Spotlight: {
            Mode: 'Off',                      // DefaultValue: 'Off' || AcceptedValues: Integer in Milliseconds || Description: Enable/Disable Spotlight Mode
            Source: 0,                        // DefaultValue: 0 || AcceptedValues: Integer || Description: Assign the CameraId of the Spotlight Camera
            TransitionTimeout: {
              OnJoin: 5000,                   // DefaultValue: 5000 || AcceptedValues: Integer in Milliseconds || Description: Define how long a camera remains in the composition when it first joins the conversation
              Continue: 2500                  // DefaultValue: 2500 || AcceptedValues: Integer in Milliseconds || Description: Define often the camera will continue being composed if the conversation is still active
            }
          },
          Quad: {
            //Future Use
          },
          PresetnerTrack: {
            //Future Use
          }
        }
      }
    }
  }
}


const CodecInfo = {
  Authentication: {
    Mode: 'Common',                             // DefaultValue: 'Common' || AcceptedValues: <'Common', 'Independant'> || Description: Define whether to use Common or Independant login information for each node codec
    Common_Username: 'campfire',                   // DefaultValue: String || AcceptedValues: String || Description: The username shared accross all node codecs. Only accessed when the Mode is set to Common
    Common_Passcode: ''              // DefaultValue: String || AcceptedValues: String || Description: The passcode shared accross all node codecs. Only accessed when the Mode is set to Common
  },
  PrimaryCodec: {
    Label: 'Zone_0',                            // DefaultValue: String || AcceptedValue: String || Description: Provide a label for your Primary Codec
    PrimaryCodec_QuadCamera_Id: '0',            // DefaultValue: 1 || AcceptedValue: Integer || Description: Provide the CameraId configured to the quadcamera connected to the Primary Codec
    CodecSerialNumber: '0000000000',            // DefaultValue: String || AcceptedValue: String || Description: Provide the Serial Number of the Primary Codec
    Authentication: {
      Username: 'campfire',                  // DefaultValue: String || AcceptedValue: String || Description: If CodecInfo.Authentication.Mode is set to Indpendant, assign the username for this Primary Codec
      Passcode: ''                // DefaultValue: String || AcceptedValue: String || Description: If CodecInfo.Authentication.Mode is set to Indpendant, assign the passcode for this Primary Codec
    }
  },
  NodeCodecs: [
    {
      Label: 'Aux_1',
      PrimaryCodec_QuadCamera_Id: '1',
      CodecSerialNumber: '0000000000',
      IpAddress: '10.47.72.229',
      Authentication: { Username: 'tempadmin', Passcode: '' }
    },
    {
      Label: 'Aux_2',                            // DefaultValue: String || AcceptedValue: String || Description: Provide a label for your Node Codec
      PrimaryCodec_QuadCamera_Id: '2',          // DefaultValue: 1 || AcceptedValue: Integer || Description: Provide the CameraId configured on the Primary Codec this Node Codec's HDMI output is connected to
      CodecSerialNumber: '0000000000',         // DefaultValue: String || AcceptedValue: String || Description: Provide the Serial Number of the Node Codec
      IpAddress: '10.47.72.129',                  // DefaultValue: String || AcceptedValue: String || Description: Provide the IP Address of the Node Codec
      Authentication: {
        Username: 'tempadmin',                  // DefaultValue: String || AcceptedValue: String || Description: If CodecInfo.Authentication.Mode is set to Indpendant, assign the username for this Node Codec
        Passcode: ''                   // DefaultValue: String || AcceptedValue: String || Description: If CodecInfo.Authentication.Mode is set to Indpendant, assign the passcode for this Node Codec
      }
    },
    //For the reamining Node Codecs, follow the same format as above
    {
      Label: 'Aux_3',
      PrimaryCodec_QuadCamera_Id: '3',
      CodecSerialNumber: '0000000000',
      IpAddress: '10.47.72.53',
      Authentication: { Username: 'tempadmin', Passcode: '' }
    },
    {
      Label: 'Aux_4',
      PrimaryCodec_QuadCamera_Id: '4',
      CodecSerialNumber: '0000000000',
      IpAddress: '10.47.72.228',
      Authentication: { Username: 'tempadmin', Passcode: '' }
    }
  ]
}

const AudioMap = {
  Settings: {                   // Description: The Settings node effects all audio processing by AZM
    Sample: {
      Size: 4,                  // DefaultValue: 4 || AcceptedValue: Integer || Description: Set the sample size for AZM Audio Collection
      Rate_In_Ms: 500           // DefaultValue: 4 || AcceptedValue: 10-1000 || Description: Set the sample rate for AZM Audio Collection
    },
    GlobalThreshhold: {
      Mode: 'On',               // DefaultValue: 'On' || AcceptedValue: <'On', 'Off'> || Description: On: Enable Global Audio Thresholds for All Audio Zones; Off: Enable Independant Audio Thresholds for All Audio Zones
      High: 25,                 // DefaultValue: 35   || AcceptedValue: 1-60          || Description: Set the High Global Threshhold
      Low: 15                   // DefaultValue: 20   || AcceptedValue: 1-60          || Description: Set the High Global Threshhold
    }
  },
  Zones: [                      // Description: The Zones node allows you to define one or more audio zones for the AZM Automation. This is an array.
    //Anaolog Zones
    /*
    {
      Label: 'A_Zone_1',                             // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      Independent_Threshhold: {
        High: 35,                                 // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independant Threshhold. Settings > Global > Threshhold > Mode must be set to Off to access
        Low: 20                                   // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independant Threshhold. Settings > Global > Threshhold > Mode must be set to Off to access
      },
      MicrophoneAssignment: {
        Type: 'Microphone',                         // DefaultValue: 'Microphone' || AcceptedValue: <'Microphone' or 'Analog', 'Ethernet' or 'AES67'> || Description: Define the Type of Microphone placed in this Zone
        Connectors: [                             // Description: Assign one of more connectors to your Zone. This is an Array
          {
            //StreamName: '54:51:de:a3:5c:7a',      // DefaultValue: String || AcceptedValue: String || Description: For Ethernet/AES67 Microphones Only, assign the StreamName assoiciated to this Zone
            //SubId: [2, 3],                        // DefaultValue: Array  || AcceptedValue: [1-8]  || Description: For Ethernet/AES67 Microphones Only, SubIds to subscribe to. 3rd party microphones may vary
            Id: 1                               // DefaultValue: Integer || AcceptedValue: Integer || Description: For Analog Microphones Only, assign the ConnectorId assoiciated to this Zone
          }
        ]
      },
      Assets: {                                   // Description: Define any object associated to this Audio Zone. Asset Information will be provided when an Event Fires
        CameraConnectorId: 1
      }
    },
    {
      Label: 'A_Zone_2',
      Independent_Threshhold: {
        High: 15,
        Low: 9
      },
      MicrophoneAssignment: {
        Type: 'Microphone',
        Connectors: [
          {
            Id: 2
          }
        ]
      },
      Assets: {
        CameraConnectorId: 2
      }
    },
    {
      Label: 'A_Zone_3',
      Independent_Threshhold: {
        High: 15,
        Low: 9
      },
      MicrophoneAssignment: {
        Type: 'Microphone',
        Connectors: [
          {
            Id: 3
          }
        ]
      },
      Assets: {
        CameraConnectorId: 3
      }
    },
    {
      Label: 'A_Zone_4',
      Independent_Threshhold: {
        High: 15,
        Low: 9
      },
      MicrophoneAssignment: {
        Type: 'Microphone',
        Connectors: [
          {
            Id: 4
          }
        ]
      },
      Assets: {
        CameraConnectorId: 4
      }
    },
    //Ethernet Zones
    */
    {
      Label: 'E_Zone_1',                             // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      Independent_Threshhold: {
        High: 25,                                 // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independant Threshhold. Settings > Global > Threshhold > Mode must be set to Off to access
        Low: 15                                   // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independant Threshhold. Settings > Global > Threshhold > Mode must be set to Off to access
      },
      MicrophoneAssignment: {
        Type: 'Ethernet',                         // DefaultValue: 'Microphone' || AcceptedValue: <'Microphone' or 'Analog', 'Ethernet' or 'AES67'> || Description: Define the Type of Microphone placed in this Zone
        Connectors: [                             // Description: Assign one of more connectors to your Zone. This is an Array
          {
            StreamName: 'd4:77:98:4f:10:5e',      // DefaultValue: String || AcceptedValue: String || Description: For Ethernet/AES67 Microphones Only, assign the StreamName assoiciated to this Zone
            SubId: [2, 3],                        // DefaultValue: Array  || AcceptedValue: [1-8]  || Description: For Ethernet/AES67 Microphones Only, SubIds to subscribe to. 3rd party microphones may vary
            //Id: 1                               // DefaultValue: Integer || AcceptedValue: Integer || Description: For Analog Microphones Only, assign the ConnectorId assoiciated to this Zone
          }
        ]
      },
      Assets: {                                   // Description: Define any object associated to this Audio Zone. Asset Information will be provided when an Event Fires
        CameraConnectorId: 3
      }
    },
    {
      Label: 'E_Zone_2',
      Independent_Threshhold: {
        High: 15,
        Low: 9
      },
      MicrophoneAssignment: {
        Type: 'Ethernet',
        Connectors: [
          {
            StreamName: 'd4:77:98:4f:10:58',
            SubId: [2, 3],
          }
        ]
      },
      Assets: {
        CameraId: 3
      }
    },
    {
      Label: 'E_Zone_3',
      Independent_Threshhold: {
        High: 15,
        Low: 9
      },
      MicrophoneAssignment: {
        Type: 'Ethernet',
        Connectors: [
          {
            StreamName: 'e4:62:c4:c4:67:21',
            SubId: [2, 3],
          }
        ]
      },
      Assets: {
        CameraId: 1
      }
    },
    /*
    {
      Label: 'E_Zone_4',
      Independent_Threshhold: {
        High: 15,
        Low: 9
      },
      MicrophoneAssignment: {
        Type: 'Ethernet',
        Connectors: [
          {
            StreamName: '',
            SubId: [2, 3],
          }
        ]
      },
      Assets: {
        CameraId: 4
      }
    }
    */
  ]
}

export { Settings, CodecInfo, AudioMap };