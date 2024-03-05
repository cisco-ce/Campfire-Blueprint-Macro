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
* Version: 1.9.8 LITE
*/

import xapi from 'xapi';

export const GMM = {
  Config: {
    MacroName: _main_macro_name()
  },
  DevConfig: {
    version: '1.9.8 LITE'
  },
  DevAssets: {
    filterAuthRegex: /[\\]*"Auth[\\]*"\s*:\s*[\\]*"([a-zA-Z0-9\/\+\=\_\-]*)\s*[\\]*"/gm,
    memoryConfig: {
      storageMacro: 'Memory_Storage',
      baseMacro: {
        './GMM_Lib_Info': {
          Warning: 'DO NOT MODIFY THIS FILE. It is accessed by multiple macros running on this Room Device',
          Description: {
            1: 'Memory_Functions is a Macro the acts like a simple database, allowing you to read and write data from you current project',
            2: 'Memory_Storage is accessed by either the original Memory_Functions Macro or the GMM_Lib Macro',
            3: 'Memory_Storage does not need to be activated, and should remain deactivated to limit the # of active macros on your Room Device',
            4: 'To learn how to use either macro, please reference the guides below',
            Guides: {
              'Global Macro Messaging': 'https://roomos.cisco.com/macros/Global%20Macro%20Messaging',
              'Memory Functions': 'https://github.com/Bobby-McGonigle/Cisco-RoomDevice-Macro-Projects-Examples/tree/master/Macro%20Memory%20Storage'
            }
          }
        }
      }
    },
    maxPayloadSize: 1024
  },
  memoryInit: async function () {
    try {
      await xapi.Command.Macros.Macro.Get({
        Name: GMM.DevAssets.memoryConfig.storageMacro
      })
    } catch (e) {
      console.warn({
        '⚠ GMM Warn ⚠': `Uh-Oh, GMM Memory Storage Macro not found, creating ${GMM.DevAssets.memoryConfig.storageMacro} macro.`
      })
      await xapi.Command.Macros.Macro.Save({
        Name: GMM.DevAssets.memoryConfig.storageMacro
      }, `var memory = ${JSON.stringify(GMM.DevAssets.memoryConfig.baseMacro, null, 2)}`)
      console.info({
        'GMM Info': `${GMM.DevAssets.memoryConfig.storageMacro} macro saved to system, restarting macro runtime...`
      })
      setTimeout(async function () {
        await xapi.Command.Macros.Runtime.Restart()
      }, 1000)
    }
    return
  },
  read: async function (key) {
    var macro = ''
    try {
      macro = await xapi.Command.Macros.Macro.Get({
        Name: GMM.DevAssets.memoryConfig.storageMacro,
        Content: 'True'
      })
    } catch (e) { }
    return new Promise((resolve, reject) => {
      const raw = macro.Macro[0].Content.replace(/var.*memory.*=\s*{/g, '{');
      let data = JSON.parse(raw);
      let temp;
      if (data[GMM.Config.MacroName] == undefined) {
        data[GMM.Config.MacroName] = {};
        temp = data[GMM.Config.MacroName];
      } else {
        temp = data[GMM.Config.MacroName];
      }
      if (temp[key] != undefined) {
        resolve(temp[key]);
      } else {
        reject({
          '⚠ GMM Error ⚠': `GMM.read Error. Object [${key}] not found in [${GMM.DevAssets.memoryConfig.storageMacro}] for Macro [${GMM.Config.MacroName}]`
        })
      }
    })
  },
  write: async function (key, value) {
    var macro = ''
    try {
      macro = await xapi.Command.Macros.Macro.Get({
        Name: GMM.DevAssets.memoryConfig.storageMacro,
        Content: 'True'
      })
    } catch (e) { };
    return new Promise((resolve) => {
      const raw = macro.Macro[0].Content.replace(/var.*memory.*=\s*{/g, '{');
      let data = JSON.parse(raw);
      let temp;
      if (data[GMM.Config.MacroName] == undefined) {
        data[GMM.Config.MacroName] = {};
        temp = data[GMM.Config.MacroName];
      } else {
        temp = data[GMM.Config.MacroName];
      }
      temp[key] = value;
      data[GMM.Config.MacroName] = temp;
      const newStore = JSON.stringify(data, null, 2);
      xapi.Command.Macros.Macro.Save({
        Name: GMM.DevAssets.memoryConfig.storageMacro
      }, `var memory = ${newStore}`).then(() => {
        console.debug({
          'GMM Debug': `Local Write Complete`,
          Location: GMM.Config.MacroName,
          Data: `{"${key}" : "${value}"}`
        });
        resolve(value);
      });
    })
  },
  Connect: {
    Local: class {
      constructor() {
        this.App = GMM.Config.MacroName
        this.Payload = {
          App: this.App,
          Source: {
            Type: 'Local',
            Id: 'localhost'
          },
          Type: '',
          Value: ''
        }
      }
      status(message) {
        if (message == undefined || message == '') {
          throw {
            '⚠ GMM Error ⚠': 'Message parameter not fulfilled in .status(message) method',
            Class: 'GMM.Connect.Local Class',
            Action: 'Provide an object as message parameter'
          }
        }

        this.Payload['Type'] = 'Status'
        this.Payload['Value'] = message
        return this
      }
      async post() {
        await xapi.Command.Message.Send({ Text: JSON.stringify(this.Payload) })
        console.debug({
          'GMM Debug': `Local [${this.Payload.Type}] sent`,
          SendingMacro: this.App,
          Payload: JSON.stringify(this.Payload)
        })
      }
    },
    IP: class {
      constructor(CommonUsername = '', CommonPassword = '', ...ipArray) {
        const b64_reg = /^(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{3}=|[A-Za-z\d+/]{2}==)?$/
        if (CommonUsername == '' && CommonPassword == '') {
          throw {
            '⚠ GMM Error ⚠': 'Common Authentication Parameters not found, unable to construct GMM.Connect.IP class'
          }
        } else if (CommonPassword == '' && b64_reg.test(CommonUsername)) {
          this.Params = {
            Url: ``,
            Header: ['Content-Type: text/xml', `Authorization: Basic ${CommonUsername}`],
            AllowInsecureHTTPS: 'True'
          }
        } else {
          this.Params = {
            Url: ``,
            Header: ['Content-Type: text/xml', `Authorization: Basic ${btoa(CommonUsername + ':' + CommonPassword)}`],
            AllowInsecureHTTPS: 'True'
          }
        }
        if (GMM.Config?.adjustHTTPClientTimeout > 0) {
          if (GMM.Config?.adjustHTTPClientTimeout > 30) {
            console.warn({ '⚠ GMM Warn ⚠': `GMM.Config.adjustHTTPClientTimeout max timeout is 30 seconds. Defaulting to 30 seconds` })
          } else { this.Params['Timeout'] = GMM.Config.adjustHTTPClientTimeout }
        }
        this.Payload = {
          App: GMM.Config.MacroName,
          Source: {
            Type: 'Remote_IP',
            Id: ''
          },
          Type: '',
          Value: ''
        }
        this.group = ipArray.toString().split(',')
        xapi.Config.HttpClient.Mode.set('On')
        xapi.Config.HttpClient.AllowInsecureHTTPS.set('True')
        console.warn({ '⚠ GMM Warn ⚠': `The HTTPClient has been enabled by instantiating an object with the GMM.Connect.IP class found in the ${GMM.Config.MacroName} macro` })
        console.warn({ '⚠ GMM Warn ⚠': `Be sure to securely store your device credentials.` })
      }
      status(message) {
        if (message == undefined || message == '') {
          throw {
            '⚠ GMM Error ⚠': 'Message parameter not fulfilled in .status(message) method',
            Class: 'GMM.Connect.IP Class',
            Action: 'Provide an object as message parameter'
          }
        }
        this.Payload['Type'] = 'Status'
        this.Payload['Value'] = message
        return this
      }
      passIP(stack = 'v4') {
        if (stack != 'v4' && stack != 'v6') {
          throw { '⚠ GMM Error ⚠': `[${stack}] is an invalid IPstack. Accepted Values for the method .passIP(stack) are "v4" or "v6"` }
        }
        this.Payload.Source[`IP`] = stack
        return this
      }
      passAuth(username = '', password = '') {
        if (username == '') {
          throw {
            '⚠ GMM Error ⚠': 'Username parameter was missing from method: .passAuth(username, password)',
            Class: 'GMM.Connect.IP',
            Action: 'Provide authentication to class constructor'
          }
        }
        if (password == '') {
          throw {
            '⚠ GMM Error ⚠': 'Password parameter was missing from method: .passAuth(username, password)',
            Class: 'GMM.Connect.IP',
            Action: 'Provide authentication to class constructor'
          }
        }
        this.Payload.Source['Auth'] = btoa(`${username}:${password}`)
        console.warn({
          '⚠ GMM Warn ⚠': `The passAuth() method has been applied to this payload`,
          Value: this.Payload.Value
        })
        return this
      }
      async post(...GMM_filter_DeviceIP) {
        this.Payload.Source.Id = await xapi.Status.SystemUnit.Hardware.Module.SerialNumber.get()
        if (typeof this.Payload.Source.IP != 'undefined') {
          var temp = JSON.stringify(this.Payload.Source.IP).replace(/"/g, '')
          this.Payload.Source[`IP${this.Payload.Source.IP}`] = await xapi.Status.Network[1][`IP${this.Payload.Source.IP}`].Address.get()
          delete this.Payload.Source.IP
        }
        if (JSON.stringify(this.Payload).length > GMM.DevAssets.maxPayloadSize) {
          throw ({
            '⚠ GMM Error ⚠': `GMM Connect IP payload exceed maximum character limit`,
            MaxLimit: GMM.DevAssets.maxPayloadSize,
            Payload: {
              Size: JSON.stringify(this.Payload).length,
              Content: JSON.stringify(this.Payload)
            }
          })
        }
        var GMM_groupError = []
        var GMM_groupResponse = []
        if (GMM_filter_DeviceIP == '') {
          for (let i = 0; i < this.group.length; i++) {
            this.Params.Url = `https://${this.group[i]}/putxml`
            const body = `<Command><Message><Send><Text>${JSON.stringify(this.Payload)}</Text></Send></Message></Command>`
            try {
              const request = await xapi.Command.HttpClient.Post(this.Params, body)
              delete request.Headers
              request['Destination'] = this.group[i]
              GMM_groupResponse.push(request)

              if (GMM.Config?.allowLegacyErrorSystem) {
                console.debug({
                  'GMM Debug': `Remote_IP message sent to [${this.group[i]}]`,
                  Filter: 'False',
                  Payload: JSON.stringify(this.Payload).replace(GMM.DevAssets.filterAuthRegex, `"Auth":"***[HIDDEN]***"`),
                  Response: `${request.StatusCode}:${request.status}`
                })
              }
            } catch (e) {
              e['GMM_Context'] = {
                Destination: this.group[i],
                Filter: 'False',
                Message: {
                  Type: this.Payload.Type,
                  Value: this.Payload.Value,
                  Payload: JSON.stringify(body).replace(GMM.DevAssets.filterAuthRegex, `"Auth":"***[HIDDEN]***"`)
                }
              }
              GMM_groupError.push(e)
            }
          }
        } else {
          const subGroup = GMM_filter_DeviceIP.toString().split(',')
          for (let i = 0; i < subGroup.length; i++) {
            if (this.group.includes(subGroup[i])) {
              this.Params.Url = `https://${subGroup[i]}/putxml`
              const body = `<Command><Message><Send><Text>${JSON.stringify(this.Payload)}</Text></Send></Message></Command>`
              try {
                const request = await xapi.Command.HttpClient.Post(this.Params, body)

                delete request.Headers
                request['Destination'] = this.group[i]
                GMM_groupResponse.push(request)

                if (GMM.Config?.allowLegacyErrorSystem) {
                  console.debug({
                    'GMM Debug': `Remote_IP message sent to [${subGroup[i]}]`,
                    Filter: 'True',
                    Payload: JSON.stringify(this.Payload).replace(GMM.DevAssets.filterAuthRegex, `"Auth":"***[HIDDEN]***"`),
                    Response: `${request.StatusCode}:${request.status}`
                  })
                }

              } catch (e) {
                e['GMM_Context'] = {
                  Destination: subGroup[i],
                  Filter: 'True',
                  Message: {
                    Type: this.Payload.Type,
                    Value: this.Payload.Value,
                    Payload: JSON.stringify(body).replace(GMM.DevAssets.filterAuthRegex, `"Auth":"***[HIDDEN]***"`)
                  }
                }
                GMM_groupError.push(e);
              }
            } else {
              const filterError = {
                '⚠ GMM Error ⚠': `Device [${subGroup[i]}] not found in device group`,
                Resolution: `Remove Device [${subGroup[i]}] from your post filter or include Device [${subGroup[i]}] when this class is instantiated`
              }
              console.error(filterError)
            }
          }
        }
        delete this.Payload.Source[`IP${temp}`];
        delete this.Payload.Source.Auth;

        if (GMM.Config?.allowLegacyErrorSystem) {
          if (GMM_groupError.length > 0) { throw GMM_groupError };
        } else {
          return { Responses: GMM_groupResponse, Errors: GMM_groupError };
        }
      }
    }
  },
  Event: {
    Receiver: {
      on: function (callback) {
        xapi.Event.Message.Send.on(event => {
          let response = {};
          try {
            response = JSON.parse(event.Text);
            callback(response);
          } catch (error) {
            console.debug(`GMM_Lib: Received unformatted message: ${event.Text} ... converting to local status message. `);
            callback({ RawMessage: event.Text })
          }
        })
      }
    }
  }
}