'use strict'
/* todo: remove after accepting PR in mqtt package */
let mqtt = require('mqtt')

let ASYNC_METHODS = ['publish',
  'subscribe',
  'unsubscribe',
  'unsubscribe',
  'end'
]

let SYNC_METHODS = [
  'emit',
  'addListener',
  'on',
  'once',
  'removeListener',
  'removeAllListeners',
  'setMaxListeners',
  'getMaxListeners',
  'listeners',
  'listenerCount'
]

export default {
  connect: connect,
  AsyncClient: AsyncClient
}

function connect (brokerURL, opts) {
  let client = mqtt.connect(brokerURL, opts)

  let asyncClient = new AsyncClient(client)

  return asyncClient
}

function AsyncClient (client) {
  this._client = client
}

AsyncClient.prototype = {
  set handleMessage (newHandler) {
    this._client.handleMessage = newHandler
  },
  get handleMessage () {
    return this._client.handleMessage
  }
}

ASYNC_METHODS.forEach(defineAsync)
SYNC_METHODS.forEach(definePassthrough)

function definePassthrough (name) {
  AsyncClient.prototype[name] = function () {
    let client = this._client
    return client[name].apply(client, arguments)
  }
}

function defineAsync (name) {
  AsyncClient.prototype[name] = function asyncMethod () {
    let client = this._client
    let args = []
    let length = arguments.length
    let i = 0
    for (i; i < length; i++) {
      args.push(arguments[i])
    }

    return new Promise(function (resolve, reject) {
      args.push(makeCallback(resolve, reject))
      client[name].apply(client, args)
    })
  }
}

function makeCallback (resolve, reject) {
  return function (err, data) {
    if (err) {
      reject(err)
    } else resolve(data)
  }
}
