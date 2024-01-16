const defaultClient = () => ({
  clientName: 'New client',
  clientId: `mqtt-tiles-${Math.random().toString(16).substr(2, 8)}`,
  host: 'wss://mqtt.flespi.io',
  keepalive: 60,
  protocolVersion: 5,
  clean: true,
  username: 'FlespiToken XXXXXXXXXXXXXXXXXXX',
  password: '',
  properties: {
    sessionExpiryInterval: undefined
  },
  subscribeWithTokenCid: true,
  syncNamespace: 'xflespifront/mqtttiles/boards'
})

const getTopicModel = (topic = {}) => ({
  topicTemplate: '',
  topicFilter: '',
  payloadType: 0,
  payloadField: '',
  payloadNameField: '',
  default: '',
  ...topic
})

export { defaultClient, getTopicModel }
