<template>
  <q-page class="flex flex-center">
    <integration
      style="width: 100%; height: calc(100vh - 50px);"
      ref="randomName"
      host="http://localhost:8080/#/integration"
      name="randomName"
      @ready="readyHandler"
      @connected="connectedHandler"
      @saveBoards="saveBoardsHandler"
      @activeBoard="activeBoardHandler"
    />
  </q-page>
</template>

<script>
import Integration from '../components/Integration'
export default {
  name: 'PageIndex',
  data () {
    return {
      flespiLogin: {
        token: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        region: {
          cdn: 'https://cdn.flespi.io',
          default: true,
          gw: 'gw.flespi.io',
          'gw-ip': '193.193.165.37',
          mqtt: 'mqtt.flespi.io:8883',
          'mqtt-ws': 'mqtt.flespi.io:443',
          name: 'eu',
          'registration-allowed': true,
          rest: 'https://flespi.io'
        }
      },
      // boards: {
      //   '681e65ae-94df-47b5-b143-4146b7ea55ba': {
      //     name: 'New board',
      //     id: '681e65ae-94df-47b5-b143-4146b7ea55ba',
      //     settings: {
      //       blocked: false,
      //       variables: [],
      //       lastModify: 1593592177533
      //     },
      //     activeVariables: {},
      //     shortcutsIndexes: [],
      //     widgetsIndexes: [],
      //     layouts: {
      //       lg: [], md: [], sm: [], xs: [], xxs: []
      //     },
      //     appVersion: '1.10.0'
      //   }
      // },
      // activeBoardId: '681e65ae-94df-47b5-b143-4146b7ea55ba'
      boards: null,
      activeBoardId: ''
    }
  },
  components: { Integration },
  methods: {
    readyHandler () {
      this.$refs.randomName.setFlespiLogin(this.flespiLogin)
    },
    connectedHandler () {
      if (this.boards) {
        this.$refs.randomName.setBoards(this.boards)
        this.$refs.randomName.setActiveBoard(this.activeBoardId)
      } else {
        this.$refs.randomName.$on('boardCreated', (id) => {
          this.$refs.randomName.setActiveBoard(id)
        })
        this.$refs.randomName.createBoard()
      }
    },
    saveBoardsHandler (boards) {
      this.boards = boards
    },
    activeBoardHandler (boardId) {
      this.activeBoardId = boardId
    }
  }
}
</script>
