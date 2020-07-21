<template>
  <iframe ref="iframe" :src="host" frameborder="0" :name="name"></iframe>
</template>

<script>
export default {
  props: {
    host: {
      type: String,
      default () {
        return 'https://mqtttiles.flespi.io/#/integration'
      }
    },
    name: String
  },
  data () {
    return {}
  },
  methods: {
    send (cmd, payload) {
      cmd = `MQTTTiles${this.name ? `|${this.name}` : ''}|${cmd}${payload ? `=>${JSON.stringify(payload)}` : ''}`
      this.$refs.iframe.contentWindow.postMessage(cmd, '*')
    },
    messageProcess (message) {
      let cmd = '',
        payload = null
      if (typeof message === 'string' && message.indexOf('MQTTTiles|') === 0) {
        let data = message.split('|')
        data = data[this.name ? 2 : 1].split('=>')
        cmd = data[0]
        try {
          payload = JSON.parse(data[1])
        } catch (e) {
          payload = data[1]
        }
      }
      return {
        cmd,
        payload,
        name: this.name
      }
    },
    setFlespiLogin (loginData) {
      this.send('SetFlespiLogin', loginData)
    },
    setBoards (boards) {
      this.send('SetBoards', boards)
    },
    setActiveBoard (boardId) {
      this.send('SetActiveBoard', boardId)
    },
    createBoard () {
      this.send('CreateBoard')
    }
  },
  created () {
    window.addEventListener('message', ({ data }) => {
      const { cmd, payload, name } = this.messageProcess(data)
      if (name === this.name && cmd) {
        this.$emit(cmd, payload)
      }
    })
  }
}
</script>
