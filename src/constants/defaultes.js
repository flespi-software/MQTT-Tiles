let defaultClient = () => ({
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
  syncToRetain: false,
  syncNamespace: 'xflespifront/mqtttiles/boards'
})

export { defaultClient }
