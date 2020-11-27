import Vue from 'vue'
/*
  => SetFlespiLogin({token, region}) Message format: `MQTTTiles|${postkey}|${commandName}=>${payload}`
  => SetBoards({...board})
  => SetActiveBoard({boardId, [params]})
  => AddWidget({boardId, widgetConfig})
  => CreateBoard()
  <= @ready() - mounted on Tiles
  <= @connected() - connection established
  <= @saveBoards({...boards})
  <= @activeBoard(id)
  <= @boardCreated(boardId)
  <= @widgetCreated(widgetId)
*/
class IntegrationBus {
  constructor () {
    this.bus = new Vue()
    this.postkey = window.name
    window.addEventListener('message', (event) => {
      let cmd = '',
        payload = null
      if (typeof event.data === 'string' && event.data.indexOf('MQTTTiles|') === 0) {
        let data = event.data.split('|')
        data = data[this.postkey ? 2 : 1].split('=>')
        cmd = data[0]
        try {
          payload = JSON.parse(data[1])
        } catch (e) {
          payload = data[1]
        }
      }
      if (cmd) {
        this.bus.$emit(cmd, payload)
      }
    })
  }

  on () {
    this.bus.$on(...arguments)
  }

  send (cmd, payload) {
    cmd = `MQTTTiles${this.postkey ? `|${this.postkey}` : ''}|${cmd}${payload ? `=>${JSON.stringify(payload)}` : ''}`
    window.parent && window.parent !== window && window.parent.postMessage(cmd, '*')
    window.opener && window.opener.postMessage(cmd, '*')
  }
}
export default ({ Vue }) => {
  const bus = new IntegrationBus()
  Vue.prototype.$integrationBus = bus
}
