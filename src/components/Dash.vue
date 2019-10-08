<template>
  <div class="dash__wrapper" :class="{'dash__wrapper--full': !fullView}">
    <board
      v-if="activeBoardId"
      :board="boards[activeBoardId]"
      :widgets="widgets"
      :values="values"
      :variables-values="boardsVariablesValues[activeBoardId]"
      :canShare="canShare"
      :isFrized="!fullView"
      :hasConnection="!!clientSettings"
      @close="clearActiveBoard"
      @add:widget="addWidget"
      @edit:widget="editWidget"
      @delete:widget="deleteWidget"
      @action="actionHandler"
      @fast-bind="fastBindWidgetHandler"
      @resized="resizeHandler"
      @block="blockBoardHandler"
      @update:layout="layoutUpdateHandler"
      @share="shareHandler(activeBoardId)"
      @upload="exportPrepareBoardHandler(activeBoardId)"
      @modify="setModifyTimeBoardHandler(activeBoardId)"
      :style="{height: `${clientSettings ? fullView ? 'calc(100vh - 50px)' : '100vh' : 'calc(100vh - 110px)'}`}"
    />
    <boards
      v-else
      :boards="boards"
      :widgets="widgets"
      :values="values"
      :variables-values="boardsVariablesValues"
      :remoteBoards="boardsFromConnection"
      :canShare="canShare"
      :isFrized="!fullView"
      :hasConnection="!!clientSettings"
      @add="addBoard"
      @edit="editBoardHandler"
      @edit:widget="editWidget"
      @delete="deleteBoardDialogHandler"
      @select="setActiveBoard"
      @action="actionHandler"
      @share="shareHandler"
      @share:uploaded="shareUploadedHandler"
      @delete:uploaded="deleteUploadedBoard"
      @export="exportPrepareBoardHandler"
      @export:string="exportBoardAsStringHandler"
      @export:file="exportBoardAsFileHandler"
      @import="importBoardFromConnectionHandler"
      :style="{height: `${clientSettings ? 'calc(100vh - 50px)' : 'calc(100vh - 110px)'}`}"
    >
      <div slot="actions">
        <q-btn label="import" @click="importClickHandler" flat color="dark"/>
      </div>
    </boards>
    <div v-if="!clientSettings" class="bg-red-2 text-red-8 text-center absolute connections--empty">
      <div class="text-bold q-mt-md">No active connections</div>
    </div>
    <copy-replace-dialog
      ref="copyReplaceDialog"
      :initName="exportBoardId"
      @change:name="(name) => exportBoardId = name"
    />
    <import-export-modal
      ref="importExportModal"
      :mode="importExportMode"
      :data="importExportData"
      @close="importExportClose"
      @import="importBoardFromUserHandler"
    />
  </div>
</template>

<style lang="stylus">
  .dash__wrapper
    height calc(100vh - 50px)
    width 100%
  .dash__wrapper--full
    height 100vh
  .connections--empty
    font-size 1.5rem
    bottom 0
    right 0
    left 0
    height 60px
</style>

<script>
import isEqual from 'lodash/isEqual'
import mqtt from '../plugins/async-mqtt.js'
import { uid } from 'quasar'
import bl from 'bl'
import debounce from 'lodash/debounce'
import cloneDeep from 'lodash/cloneDeep'
import remove from 'lodash/remove'
import difference from 'lodash/difference'
import uniq from 'lodash/uniq'
import get from 'lodash/get'
import { Base64 } from 'js-base64'
import Board from './Board'
import Boards from './Boards'
import { WIDGET_STATUS_DISABLED, WIDGET_STATUS_ENABLED } from '../constants'
import getActionTopics from './widgets/getActionTopics.js'
import messagesProcessing from './widgets/messagesProcessing.js'
import migrateWidgets from './widgets/migrations'
import CopyReplaceDialog from './CopyReplaceDialog'
import ImportExportModal from './ImportExportModal'
import {version} from '../../package.json'
import getValueByTopic from '../mixins/getValueByTopic'
import boardsMigrations from '../mixins/boardsMigrations'

let clearWidgets = function clearWidgets (widgets) {
    Object.keys(widgets).forEach((widgetId) => {
      widgets[widgetId].status = WIDGET_STATUS_DISABLED
    })
  },
  getBoardsToSave = function getBoardsToSave (boards, widgets) {
    boards = cloneDeep(boards)
    widgets = cloneDeep(widgets)
    clearWidgets(widgets)
    Object.keys(boards).forEach(boardId => {
      boards[boardId].widgetsIndexes = boards[boardId].widgetsIndexes.map(widgetIndex => widgets[widgetIndex])
      boards[boardId].appVersion = version
    })
    return boards
  },
  getBoardToSave = function getBoardToSave (board, widgets) {
    board = cloneDeep(board)
    widgets = cloneDeep(widgets)
    clearWidgets(widgets)
    board.widgetsIndexes = board.widgetsIndexes.map(widgetIndex => widgets[widgetIndex])
    board.appVersion = version
    return board
  },
  removeFromArrayByValue = (array, value) => remove(array, (el) => { return el === value })

export default {
  name: 'Dash',
  props: ['clientSettings', 'initBoards'],
  data () {
    return {
      fullView: !(this.clientSettings && this.clientSettings.flespiBoard),
      client: undefined,
      connack: undefined,
      clientStatus: false,
      clientErrors: [],
      boards: {},
      widgets: {},
      subscriptions: {},
      subscriptionsStatuses: {},
      subscriptionsIndetifiers: {},
      currentSubscriptionIndetifier: 0,
      widgetsBySubscription: {},
      activeBoardId: undefined,
      colsByBreakpoint: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
      boardsFromConnection: {},
      exportBoardId: '',
      expireMessagesProcess: 0,
      expireMessagesStore: {},
      importExportMode: undefined,
      importExportData: undefined,
      values: {},
      boardsVariablesValues: {}
    }
  },
  computed: {
    title () {
      let title = `${this.activeBoardId ? `${this.boards[this.activeBoardId].name} - ` : ''}MQTT Tiles`
      this.$emit('change:title', `${this.activeBoardId ? `${this.boards[this.activeBoardId].name} - ` : ''}MQTT Tiles`)
      return title
    },
    boardsIds () { return Object.keys(this.boards) },
    subscriptionsTopics () { return Object.keys(this.subscriptions) },
    canShareByClientToken () {
      return this.connack && this.connack.properties &&
          this.connack.properties.userProperties &&
          this.connack.properties.userProperties.token &&
          JSON.parse(this.connack.properties.userProperties.token).access.type !== 1
    },
    canShare () {
      let hasCreds = (this.clientSettings && this.clientSettings.syncCreds && this.clientSettings.syncCreds.length)
      return this.clientStatus && !!this.clientSettings && this.clientSettings.host.indexOf('flespi') !== -1 &&
        !this.clientSettings.flespiBoard &&
        /* check for not master token used for flespi connection */
        (hasCreds || this.canShareByClientToken)
    }
  },
  methods: {
    uid,
    valuesProcessing () {
      let values = this.values
      Object.keys(this.widgets).forEach((widgetId) => {
        if (!this.values[widgetId]) { this.$set(this.values, widgetId, {}) }
        let value = values[widgetId],
          widget = this.widgets[widgetId],
          isWidgetValueChanged = false
        let widgetValue = widget.topics.reduce((widgetValue, topic) => {
          let messages = this.subscriptionsStatuses[topic] && this.subscriptions[topic]
          let hasValue = !!value[topic]
          if (!hasValue) {
            widgetValue[topic] = {}
          }
          if (hasValue && messages && messages.length === 1) { messages = [] } // not processing last state
          let messagesValue = messagesProcessing(widget.type)(messages, get(this.values, `${widgetId}['${topic}']`, undefined), topic, widget)
          if (value[topic] !== messagesValue) { isWidgetValueChanged = true }
          widgetValue[topic] = messagesValue
          return widgetValue
        }, {})
        isWidgetValueChanged && this.$set(this.values, widgetId, widgetValue)
      })
    },
    boardsVariablesValuesProcessing () {
      this.boardsVariablesValues = this.boardsIds.reduce((values, boardId) => {
        let board = this.boards[boardId],
          sourceVariables = (board.settings.variables && board.settings.variables.filter(variable => variable.type === 1)) || []
        if (!values[boardId]) { values[boardId] = {} }
        let boardValue = sourceVariables.reduce((boardVarValues, variable, varIndex) => {
          let topic = variable.topic.topicFilter
          let packets = this.subscriptionsStatuses[topic] && this.subscriptions[topic] ? this.subscriptions[topic] : []
          if (!boardVarValues[variable.name]) { boardVarValues[variable.name] = {} }
          packets.forEach(packet => {
            let topic = variable.topic.topicFilter
            if (!this.subscriptions[topic]) { return false }
            let parsedValue = this.getValueByTopic(packet.payload, variable.topic)
            let subTopic = packet.topic
            if (!parsedValue || parsedValue === 'N/A') {
              boardVarValues[variable.name][subTopic] && delete boardVarValues[variable.name][subTopic]
            } else {
              boardVarValues[variable.name][subTopic] = parsedValue
            }
          })
          return boardVarValues
        }, Object.assign({}, values[boardId]))
        this.$set(values, boardId, boardValue)
        return values
      }, Object.assign({}, this.boardsVariablesValues))
    },
    busMessagesProcessing () {
      this.valuesProcessing()
      this.boardsVariablesValuesProcessing()
      this.clearMessages()
    },
    clearMessages () {
      this.subscriptionsTopics.forEach(topic => {
        if (Array.isArray(this.subscriptions[topic])) {
          this.subscriptions[topic].splice(0, this.subscriptions[topic].length - 1) // last message stay in array for storing last state
        }
      })
    },
    getVariableValue (boardId, variable, packet) {
      let varValue = {}
      let topic = variable.topic.topicFilter
      if (!this.subscriptions[topic]) { return varValue }
      let parsedValue = this.getValueByTopic(packet.payload, variable.topic)
      let subTopic = packet.topic
      if (!parsedValue || parsedValue === 'N/A') {
        varValue[subTopic] && this.$delete(varValue, subTopic)
      } else {
        this.$set(varValue, subTopic, parsedValue)
      }
      return varValue
    },
    boardsVariablesValuesClear () {
      this.boardsIds.forEach((boardId) => {
        let board = this.boards[boardId],
          sourceVariables = (board.settings.variables && board.settings.variables.filter(variable => variable.type === 1)) || []
        this.boardsVariablesValues[boardId] = {}
        sourceVariables.forEach((variable, varIndex) => {
          this.boardsVariablesValues[boardId][variable.name] = {}
        })
      })
    },
    checkTopic (topic, mask) {
      if (topic === mask) { return true }
      let topicPath = topic.split('/')
      let currentTopicPath = mask.split('/')
      /* process $share subscriptions */
      if (currentTopicPath[0] === '$share') {
        currentTopicPath.splice(0, 2)
      }
      /* if the lengths are the same or the last element of the path is '#'. '#' can just be in the end of the path of the subscribed topic */
      if (currentTopicPath.length === topicPath.length || currentTopicPath[currentTopicPath.length - 1] === '#') {
        return currentTopicPath.reduce((result, currentPath, index) => {
          /*
          '+' in the path of the topic means any part of the path of the topic.
          '#' in the path of the topic means any part or later length of the path of the topic.
          */
          if (currentPath === '#' || currentPath === '+') {
            return result && true
          }
          return result && currentPath === topicPath[index]
        }, true)
      } else {
        return false
      }
    },
    clearObject (obj) {
      return Object.keys(obj).reduce((result, key) => {
        let value = obj[key]
        if (value instanceof Object) {
          value = this.clearObject(value)
          if (!Object.keys(value).length) {
            value = undefined
          }
        }
        if (value !== undefined && value !== null) {
          result[key] = value
        }
        return result
      }, {})
    },
    getSharedTopicFilter (topic) {
      return topic.replace(/^\$share\/[^/]+\//, '')
    },
    resolveTopics (topic, subTopic) {
      if (subTopic.indexOf('$share') === 0) {
        subTopic = this.getSharedTopicFilter(subTopic)
      }
      let subTopicPath = subTopic.split('/'),
        topicPath = topic.split('/')

      if (topicPath.length === subTopicPath.length || subTopicPath[subTopicPath.length - 1] === '#') {
        return subTopicPath.reduce((result, currentPath, index) => {
          if (currentPath === '#' || currentPath === '+') {
            return result && true
          }
          return result && currentPath === topicPath[index]
        }, true)
      } else {
        return false
      }
    },
    errorHandler (e, needShow) {
      e.timestamp = Date.now()
      this.clientErrors.push(e)
      if (needShow) {
        this.showError(e)
      }
    },
    showError (e) {
      this.$q.notify({
        message: e.message,
        color: 'negative',
        icon: 'mdi-alert-outline',
        timeout: 2000
      })
    },
    initClient () {
      let endHandler = () => {
          this.clientStatus = false
          this.$emit('change:status', false)
        },
        config = this.clearObject(this.clientSettings)

      let client = mqtt.connect(config.host, config)
      client.on('message', (topic, message, packet) => {
        /* synced board processing */
        if (topic.indexOf(config.syncNamespace) !== -1) {
          this.savedBoardProcess(topic.split('/').slice(-1)[0], message)
          return false
        }
        this.setValueByTopic(topic, {...packet, timestamp: Date.now()})
        this.expireMessagesHandler(packet)
        this.debouncedBusMessagesProcessing()
      })

      client.on('connect', (connack) => {
        this.connack = connack
        this.clientStatus = true
        this.$emit('change:status', true)
        this.initWidgets()
        if (!this.clientSettings.flespiBoard) {
          this.getSyncedBoards()
        }
      })
      client.on('error', (error) => {
        this.errorHandler(error, false)
      })
      client.on('close', endHandler)
      client.on('offline', () => {
        endHandler()
        this.expireMessagesProcessingStop()
      })
      client.on('end', endHandler)
      this.client = client
    },
    createClient () {
      this.initClient()
    },
    setValueByTopic (topic, value) {
      /* init value in store */
      if (value === null) {
        this.$set(this.subscriptions, topic, value)
        return true
      }
      /* write value */
      let subIdentifier = value && value.properties && value.properties.subscriptionIdentifier
      if (subIdentifier) {
        if (!Array.isArray(subIdentifier)) { subIdentifier = [subIdentifier] }
        subIdentifier.forEach(subId => {
          let subTopic = this.subscriptionsIndetifiers[subId]
          this.writeValueByTopic(subTopic, value)
        })
      } else {
        this.subscriptionsTopics.forEach((subTopic) => {
          if (this.checkTopic(topic, subTopic)) {
            this.writeValueByTopic(subTopic, value)
          }
        })
      }
    },
    writeValueByTopic (topic, value) {
      if (!Array.isArray(this.subscriptions[topic])) {
        this.$set(this.subscriptions, topic, [value])
      } else {
        this.subscriptions[topic].push(value)
      }
    },
    expireMessagesHandler (packet) {
      if (packet.properties && packet.properties.messageExpiryInterval) {
        if (!this.expireMessagesProcess) {
          this.expireMessagesProcessing()
        }
        this.expireMessagesStore[packet.topic] = Date.now() + Math.floor(packet.properties.messageExpiryInterval * 1000)
      } else if (this.expireMessagesStore[packet.topic]) {
        this.$delete(this.expireMessagesStore, packet.topic)
      }
    },
    expireMessagesProcessing () {
      this.expireMessagesProcess = setInterval(() => {
        let currentTimestamp = Date.now()
        Object.keys(this.expireMessagesStore).forEach(topic => {
          let timestamp = this.expireMessagesStore[topic]
          if (timestamp < currentTimestamp) {
            this.subscriptionsTopics.forEach((subTopic) => {
              if (this.checkTopic(topic, subTopic)) {
                this.subscriptions[subTopic] && this.subscriptions[subTopic].push({ topic, payload: bl().slice(0, -1) })
              }
            })
            this.$delete(this.expireMessagesStore, timestamp)
          }
        })
      }, 30000)
    },
    expireMessagesProcessingStop () {
      this.expireMessagesProcess && clearInterval(this.expireMessagesProcess)
      this.expireMessagesStore = {}
      this.expireMessagesProcess = 0
    },
    async subscribe () {
      if (this.client) {
        let [topic, options] = arguments
        if (this.clientSettings.protocolVersion === 5) {
          if (!options) { options = {} }
          if (!options.properties) { options.properties = {} }
          let subIdentifier = Number(Object.keys(this.subscriptionsIndetifiers).find(k => this.subscriptionsIndetifiers[k] === topic)) || ++this.currentSubscriptionIndetifier
          options.properties.subscriptionIdentifier = subIdentifier
          this.subscriptionsIndetifiers[subIdentifier] = topic
        }
        return this.client.subscribe(topic, options)
          .then(() => {
            let topics = arguments[0]
            this.subscriptionsStatuses[topics] = true
            return arguments
          })
          .catch(err => { this.errorHandler(err) })
      }
    },
    async unsubscribe (topic) {
      if (this.client) {
        let [topic, options] = arguments
        if (this.clientSettings.protocolVersion === 5) {
          let subIdentifier = Object.keys(this.subscriptionsIndetifiers).find(key => this.subscriptionsIndetifiers[key] === topic)
          if (subIdentifier !== -1) {
            delete this.subscriptionsIndetifiers[subIdentifier]
          }
        }
        return this.client.unsubscribe(topic, options)
          .then(() => {
            let topics = arguments[0]
            delete this.subscriptionsStatuses[topics]
          })
          .catch(err => { this.errorHandler(err) })
      }
    },
    async publish () {
      if (this.client) {
        return this.client.publish(...arguments)
          .catch(err => {
            this.errorHandler(err, true)
            return err
          })
      } else { this.showError(new Error('You have no active clients'), true) }
    },
    async destroyClient () {
      await this.client.end(true)
      this.subscriptionsStatuses = {}
    },
    setActiveBoard (boardId) {
      this.activeBoardId = boardId
      this.$emit('change:title', `${this.boards[this.activeBoardId].name} - MQTT Tiles`)
    },
    clearActiveBoard () {
      this.activeBoardId = undefined
      this.$emit('change:title', `MQTT Tiles`)
    },
    actionHandler ({topic, payload, settings}) {
      if (!settings.qos) {
        settings.qos = 1
      }
      this.publish(topic, payload, settings)
    },
    addBoard (board) {
      this.$set(this.boards, board.id, board)
      this.resolveBoardVariables(board)
      this.setModifyTimeBoardHandler(board.id)
    },
    deleteBoardHandler (boardId) {
      this.resolveBoardVariables(undefined, this.boards[boardId])
      let widgetsIndexes = this.boards[boardId].widgetsIndexes
      widgetsIndexes.forEach((widgetIndex) => {
        let topics = this.widgets[widgetIndex].topics
        topics.forEach((topic) => {
          let widgetsIndexesBySubscription = this.widgetsBySubscription[topic]
          removeFromArrayByValue(widgetsIndexesBySubscription, widgetIndex)
          if (!widgetsIndexesBySubscription.length) {
            if (!this.hasBoardsVariableWithSameSubscription(boardId, topic)) {
              this.unsubscribe(topic)
              this.$delete(this.subscriptions, topic)
            }
            this.$delete(this.widgetsBySubscription, topic)
          }
        })
        this.$delete(this.widgets, widgetIndex)
      })

      this.$delete(this.boards, boardId)
    },
    deleteBoardDialogHandler (boardId) {
      this.$q.dialog({
        title: 'Warning',
        message: `Do you really want to delete ${this.boards[boardId].name} board?`,
        color: 'dark',
        ok: true,
        cancel: true
      }).then(() => { this.deleteBoardHandler(boardId) })
        .catch(() => {})
    },
    deleteUploadedBoard (boardId) {
      this.$q.dialog({
        title: 'Warning',
        message: `Do you really want to delete remote board?`,
        color: 'dark',
        ok: true,
        cancel: true
      })
        .then(() => {
          this.publish(`${this.clientSettings.syncNamespace}/${boardId}`, '', { qos: 1, retain: true })
        })
        .catch(() => {})
    },
    editBoardHandler ({id: boardId, board: newBoard}) {
      this.resolveBoardVariables(newBoard, this.boards[boardId])
      this.$set(this.boards, boardId, newBoard)
      if (boardId !== newBoard.id) {
        this.replaceBoardHandler(boardId)
      }
      this.setModifyTimeBoardHandler(newBoard.id)
    },
    setModifyTimeBoardHandler (activeBoardId) {
      this.$set(this.boards[activeBoardId].settings, 'lastModify', Date.now())
    },
    replaceBoardHandler (boardId) {
      let board = this.boards[boardId]
      this.$set(this.boards, board.id, board)
      if (this.activeBoardId === boardId) {
        this.clearActiveBoard()
        this.$nextTick(() => { this.setActiveBoard(board.id) })
      }
      this.$delete(this.boards, boardId)
      /* update widgets ids */
      board.widgetsIndexes.forEach((widgetId, index) => {
        let newId = uid()
        this.$set(this.widgets, newId, this.widgets[widgetId])
        this.$set(board.widgetsIndexes, index, newId)
        this.$set(this.widgets[newId], 'id', newId)
        this.$delete(this.widgets, widgetId)
        let shortcutIndex = board.shortcutsIndexes.indexOf(widgetId)
        if (shortcutIndex !== -1) {
          this.$set(board.shortcutsIndexes, shortcutIndex, newId)
        }
        this.widgets[newId].topics.forEach((topic, index) => {
          let widgetsBySubscription = this.widgetsBySubscription[topic]
          this.$set(widgetsBySubscription, widgetsBySubscription.indexOf(widgetId), newId)
        })
        Object.keys(board.layouts).forEach(layoutName => {
          board.layouts[layoutName][index].i = newId
        })
      })
    },
    blockBoardHandler () {
      let board = this.boards[this.activeBoardId]
      this.$set(board.settings, 'blocked', !board.settings.blocked)
    },
    initBoard (board) {
      board = this.migrateBoard(cloneDeep(board), board.appVersion, version)
      let widgets = {}
      let indexes = []
      board.widgetsIndexes = migrateWidgets(board.widgetsIndexes, board.appVersion, version)
      board.widgetsIndexes.forEach((widget) => {
        indexes.push(widget.id)
        widgets[widget.id] = widget
        return widgets
      })
      board.widgetsIndexes = indexes
      this.$set(this.boards, board.id, board)
      this.resolveBoardVariables(board)
      Object.keys(widgets).forEach(widgetId => {
        this.addWidget(widgets[widgetId])
      })
    },
    initSavedBoards (savedBoards) {
      if (savedBoards) {
        let widgets = {}
        Object.keys(savedBoards).forEach(boardId => {
          let board = savedBoards[boardId]
          let indexes = []
          board.widgetsIndexes = migrateWidgets(board.widgetsIndexes, board.appVersion, version)
          board.widgetsIndexes.forEach((widget) => {
            indexes.push(widget.id)
            widgets[widget.id] = widget
            return widgets
          })
          board.widgetsIndexes = indexes
          this.resolveBoardVariables(board)
          savedBoards[boardId] = this.migrateBoard(board, board.appVersion, version)
        })
        this.boards = savedBoards
        if (widgets) {
          this.widgets = widgets
          this.runtimeInitWidgets()
        }
      }
    },
    resolveBoardVariables (newBoard, oldBoard) {
      if (!oldBoard) { oldBoard = { settings: {} } }
      if (!newBoard) { newBoard = { settings: {} } }
      let oldVariables = (oldBoard.settings.variables && oldBoard.settings.variables.filter(variable => variable.type === 1)) || []
      let newVariables = (newBoard.settings.variables && newBoard.settings.variables.filter(variable => variable.type === 1)) || []
      let oldTopics = oldVariables.map(variable => variable.topic.topicFilter)
      let newTopics = newVariables.map(variable => variable.topic.topicFilter)
      if (oldBoard.id) { this.boardsVariablesValues[oldBoard.id] = undefined }
      if (newBoard.id) { this.boardsVariablesValues[newBoard.id] = {} }
      oldTopics.forEach((oldTopic, oldIndex) => {
        if (newTopics.includes(oldTopic)) { return false }
        if (!(this.widgetsBySubscription[oldTopic] && this.widgetsBySubscription[oldTopic].length) && !this.hasBoardsVariableWithSameSubscription(oldBoard.id, oldTopic)) {
          this.unsubscribe(oldTopic)
        }
      })
      newTopics.forEach(topic => {
        let hasSubscription = !!this.subscriptions[topic]
        let subSettings = { qos: 1 }
        let userProperties = this.clientSettings && this.clientSettings.userProperties
        if (userProperties) {
          subSettings.properties = {}
          subSettings.properties.userProperties = userProperties
        }
        if (!hasSubscription) {
          this.setValueByTopic(topic, null)
          this.subscribe(topic, subSettings)
        } else {
          this.unsubscribe(topic)
            .then(() => {
              this.subscribe(topic, subSettings)
            })
        }
      })
    },
    hasBoardsVariableWithSameSubscription (boardId, topic) {
      return !!this.boardsIds.filter((filteredBoardId) => {
        if (filteredBoardId === boardId) { return false }
        return !!(this.boards[filteredBoardId].settings.variables && this.boards[filteredBoardId].settings.variables.filter(variable => variable.type === 1 && variable.topic.topicFilter === topic).length)
      }).length
    },
    /* widgets logic start */
    runtimeInitWidgets () {
      let widgetsIndexes = Object.keys(this.widgets)
      widgetsIndexes.forEach(widgetIndex => {
        let topics = this.widgets[widgetIndex].topics
        topics.forEach(topic => {
          if (!this.subscriptions[topic]) { this.setValueByTopic(topic, null) }
          if (!this.widgetsBySubscription[topic]) { this.widgetsBySubscription[topic] = [] }
          this.widgetsBySubscription[topic].push(widgetIndex)
        })
      })
    },
    initWidgets () {
      let widgetsIndexes = Object.keys(this.widgets)
      widgetsIndexes.forEach(widgetIndex => {
        this.$set(this.widgets[widgetIndex], 'status', WIDGET_STATUS_ENABLED)
      })
      let topics = Object.keys(this.subscriptions)
      if (topics.length) {
        let getSettings = () => {
          let settings = { qos: 1 }
          let userProperties = this.clientSettings && this.clientSettings.userProperties
          if (userProperties) {
            settings.properties = {}
            settings.properties.userProperties = userProperties
          }
          return settings
        }
        Promise.all(topics.map(topic => this.subscribe(topic, getSettings())))
          .then((topics) => { this.clientInited = true })
      }
    },
    widgetLayoutSetup (width, height, id, breakpoint) {
      let board = this.boards[this.activeBoardId],
        colNum = this.colsByBreakpoint[breakpoint],
        layout = board.layouts[breakpoint],
        {x, y} = freeSpace()
      function freeSpace () {
        let max = layout.reduce((max, widget) => {
          if ((max.y === widget.y && max.x <= widget.x) || max.y < widget.y) {
            max = widget
          }
          return max
        }, {y: 0, x: 0, h: 0, w: 0})
        if (max.x + max.w + width <= colNum) {
          // todo check if w > colNum => w = col.num
          return { x: max.x + max.w, y: max.y }
        } else {
          return { x: 0, y: max.y + 1 }
        }
      }
      layout.push({
        h: height,
        w: width,
        i: id,
        x,
        y
      })
    },
    widgetLayoutsSetup (width, height, id) {
      Object.keys(this.colsByBreakpoint).forEach(breakpoint => {
        this.widgetLayoutSetup(width, height, id, breakpoint)
      })
    },
    layoutUpdateHandler ({layout, breakpoint}) {
      this.$set(this.boards[this.activeBoardId].layouts, breakpoint, layout)
    },
    deleteWidgetFromLayout (widgetIndex) {
      let board = this.boards[this.activeBoardId],
        layouts = board.layouts
      Object.keys(this.colsByBreakpoint).forEach(breakpoint => {
        this.$delete(layouts[breakpoint], widgetIndex)
      })
    },
    addWidget (widget) {
      if (!widget.id) {
        widget.id = uid()
        this.widgetLayoutsSetup(widget.settings.width, widget.settings.height, widget.id)
        this.boards[this.activeBoardId].widgetsIndexes.push(widget.id)
      }
      widget.topics.forEach(topic => {
        let hasSubscription = this.subscriptions[topic] !== undefined
        let needResubscribe = widget.type === 'multiplier'
        let subSettings = { qos: 1 }
        let userProperties = this.clientSettings && this.clientSettings.userProperties
        if (userProperties) {
          subSettings.properties = {}
          subSettings.properties.userProperties = userProperties
        }
        if (!this.widgetsBySubscription[topic]) { this.widgetsBySubscription[topic] = [] }
        if (!hasSubscription) {
          this.setValueByTopic(topic, null)
          this.subscribe(topic, subSettings)
        } else if (needResubscribe) {
          this.unsubscribe(topic)
            .then(() => {
              this.subscribe(topic, subSettings)
            })
        }
        this.widgetsBySubscription[topic].push(widget.id)
      })
      if (this.clientStatus) {
        widget.status = WIDGET_STATUS_ENABLED
      }
      this.$set(this.widgets, widget.id, widget)
    },
    editWidget ({widgetId, settings, topics}) {
      if (difference(settings.topics, topics).length || difference(topics, settings.topics).length) {
        topics.forEach(oldTopic => {
          if (settings.topics.includes(oldTopic)) { return false }
          removeFromArrayByValue(this.widgetsBySubscription[oldTopic], widgetId)
          if (!this.widgetsBySubscription[oldTopic].length) {
            if (!this.hasBoardsVariableWithSameSubscription(undefined, oldTopic)) {
              this.unsubscribe(oldTopic)
              this.$delete(this.subscriptions, oldTopic)
            }
            this.$delete(this.widgetsBySubscription, oldTopic)
          }
        })
        settings.topics.forEach(topic => {
          if (topics.includes(topic)) { return false }
          let hasSubscription = !!this.subscriptions[topic]
          let needResubscribe = settings.type === 'multiplier'
          let subSettings = { qos: 1 }
          let userProperties = this.clientSettings && this.clientSettings.userProperties
          if (userProperties) {
            subSettings.properties = {}
            subSettings.properties.userProperties = userProperties
          }
          if (!this.widgetsBySubscription[topic]) { this.widgetsBySubscription[topic] = [] }
          if (!hasSubscription) {
            this.setValueByTopic(topic, null)
            this.subscribe(topic, subSettings)
          } else if (needResubscribe) {
            this.unsubscribe(topic)
              .then(() => {
                this.subscribe(topic, subSettings)
              })
          }
          this.widgetsBySubscription[topic].push(widgetId)
        })
      }
      this.$set(this.widgets, widgetId, settings)
      this.valuesProcessing()
    },
    deleteWidget ({widgetId, settings}) {
      this.$q.dialog({
        title: 'Warning',
        message: `Do you really want to delete ${settings.name} widget?`,
        color: 'dark',
        ok: true,
        cancel: true
      }).then(() => {
        this.removeFromShortcuts(widgetId)
        /* remove from board link index */
        let widgetsIndexes = this.boards[this.activeBoardId].widgetsIndexes,
          widgetIndex = widgetsIndexes.indexOf(widgetId)
        this.$delete(widgetsIndexes, widgetIndex)
        this.deleteWidgetFromLayout(widgetIndex)

        settings.topics.forEach(topic => {
          let widgetsBySubscription = this.widgetsBySubscription[topic]
          removeFromArrayByValue(widgetsBySubscription, widgetId)
          if (!widgetsBySubscription.length) {
            if (!this.hasBoardsVariableWithSameSubscription(undefined, topic)) {
              this.unsubscribe(topic)
              this.$delete(this.subscriptions, topic)
            }
            this.$delete(this.widgetsBySubscription, topic)
          }
        })
        this.$delete(this.widgets, widgetId)
      })
        .catch(() => {})
    },
    fastBindWidgetHandler (widgetId) {
      let shortcutsIndexes = this.boards[this.activeBoardId].shortcutsIndexes,
        index = shortcutsIndexes.indexOf(widgetId)
      if (index !== -1) {
        this.$delete(shortcutsIndexes, index)
      } else {
        if (shortcutsIndexes.length === 4) {
          this.$q.notify({
            message: 'Shortcuts can contain four widgets maximum',
            detail: 'Delete something to add a new widget.',
            type: 'warning',
            delay: 1000
          })
          return false
        }
        shortcutsIndexes.push(widgetId)
      }
    },
    removeFromShortcuts (widgetId) {
      Object.keys(this.boards).forEach(boardId => {
        let shortcutsIndexes = this.boards[boardId].shortcutsIndexes,
          index = shortcutsIndexes.indexOf(widgetId)

        if (index !== -1) {
          this.$delete(shortcutsIndexes, index)
        }
      })
    },
    resizeHandler ({index, height, width}) {
      let widget = this.widgets[index]
      this.$set(widget.settings, 'height', height)
      this.$set(widget.settings, 'width', width)
      /* modify all layouts */
      let board = this.boards[this.activeBoardId]
      let layouts = board.layouts
      Object.keys(layouts).forEach(layoutName => {
        let layoutWidgetItem = layouts[layoutName].filter(item => item.i === index)[0]
        layoutWidgetItem.h = height
        layoutWidgetItem.w = width
      })
    },
    /* widgets logic end */
    getSyncedBoards () {
      if (Object.keys(this.boardsFromConnection).length) { this.boardsFromConnection = {} }
      this.subscribe(`${this.clientSettings.syncNamespace}/+`)
    },
    savedBoardProcess (id, board) {
      if (!board.length) {
        this.$delete(this.boardsFromConnection, id)
        return false
      }
      board = JSON.parse(board)
      if (typeof board === 'object') {
        this.$set(this.boardsFromConnection, id, board)
        if (id === this.activeBoardId && this.clientSettings.flespiBoard) {
          this.activeBoardId = null
          this.deleteBoardHandler(id)
          this.initBoard(this.boardsFromConnection[id])
          this.setActiveBoard(id)
        }
      }
    },
    importBoardHandler (board) {
      let id = board.id
      this.exportBoardId = id
      if (this.boards[id]) {
        this.$refs.copyReplaceDialog.open({
          loadLabel: 'Restore'
        })
          .then((id) => {
            if (id !== this.exportBoardId) {
              board.id = this.exportBoardId
              board.widgetsIndexes.forEach((widget, index) => {
                let newId = uid()
                let shortcutIndex = board.shortcutsIndexes.indexOf(board.widgetsIndexes[index].id)
                if (shortcutIndex !== -1) {
                  this.$set(board.shortcutsIndexes, shortcutIndex, newId)
                }
                board.widgetsIndexes[index].id = newId
                Object.keys(board.layouts).forEach(layoutName => {
                  board.layouts[layoutName][index].i = newId
                })
              })
            }
            this.initBoard(board)
            this.exportBoardId = ''
          })
          .catch(() => {})
      } else {
        this.initBoard(board)
      }
    },
    importBoardFromConnectionHandler (id) {
      let board = cloneDeep(this.boardsFromConnection[id])
      this.importBoardHandler(board)
    },
    exportPrepareBoardHandler (id) {
      this.exportBoardId = id
      if (this.boardsFromConnection[id]) {
        return this.$refs.copyReplaceDialog.open()
          .then((id) => this.exportBoardHandler(id, this.exportBoardId))
          .catch(() => {})
      } else {
        return Promise.resolve(this.exportBoardHandler(id, this.exportBoardId))
      }
    },
    exportBoardHandler (id, newId) {
      let board, currentId
      if (id === newId) {
        board = this.boards[id]
        currentId = id
      } else {
        board = this.boards[id]
        board.id = newId
        this.replaceBoardHandler(id)
        currentId = newId
      }
      let topic = `${this.clientSettings.syncNamespace}/${currentId}`
      return this.publish(topic, JSON.stringify(getBoardToSave(board, this.widgets)), { qos: 1, retain: true })
        .then((resp) => {
          if (resp instanceof Error) {
            return resp
          }
          this.closeExportHandler()
          return currentId
        })
    },
    uploadBoardToConnection (id, newId) {
      this.exportBoardHandler(id, newId)
    },
    closeExportHandler () {
      this.exportBoardId = ''
    },
    getShareModel (board, isRemoteBoard) {
      let widgets = isRemoteBoard ? board.widgetsIndexes : board.widgetsIndexes.map(widgetId => this.widgets[widgetId]),
        subscribeTopics = uniq(widgets.reduce((topics, widget) => { return [...topics, ...widget.topics] }, [])),
        publishTopics = uniq(getActionTopics(widgets))
      let topics = {}
      subscribeTopics.forEach((subTopic) => {
        if (!topics[subTopic]) {
          topics[subTopic] = ['subscribe']
        }
      })
      publishTopics.forEach((pubTopic) => {
        if (!topics[pubTopic]) {
          topics[pubTopic] = ['publish']
        } else {
          topics[pubTopic].push('publish')
        }
      })
      let shareModel = Object.keys(topics).reduce((model, topic) => {
        let shareObj = { uri: 'mqtt' }
        shareObj.topic = topic
        shareObj.actions = topics[topic]
        model.push(shareObj)
        return model
      }, [])
      return shareModel
    },
    shareHandler (boardId) {
      let shareWizardConfig = {
        boardId,
        tokens: [{label: '<Connection token>', credentions: { username: this.clientSettings.username }, accessable: this.canShareByClientToken}],
        hasRemote: !!this.boardsFromConnection[boardId],
        currentRemoteBoards: Object.keys(this.boardsFromConnection),
        syncNamespace: this.clientSettings.syncNamespace,
        updateBoardMethod: this.exportBoardHandler
      }
      if (this.clientSettings.syncCreds) {
        let creds = cloneDeep(this.clientSettings.syncCreds)
        shareWizardConfig.tokens = [...shareWizardConfig.tokens, ...creds]
      }
      this.$emit('share:prepare', shareWizardConfig)
    },
    shareUploadedHandler (boardId) {
      let shareWizardConfig = {
        boardId,
        tokens: [{label: '<Connection token>', credentions: { username: this.clientSettings.username }, accessable: this.canShareByClientToken}],
        hasRemote: false,
        isRemote: true,
        syncNamespace: this.clientSettings.syncNamespace,
        updateBoardMethod: this.exportBoardHandler
      }
      if (this.clientSettings.syncCreds) {
        let creds = cloneDeep(this.clientSettings.syncCreds)
        shareWizardConfig.tokens = [...shareWizardConfig.tokens, ...creds]
      }
      this.$emit('share:prepare', shareWizardConfig)
    },
    shareBoard (config) {
      let {boardId, isRemote} = config
      this.$emit('share', { boardId, share: this.getShareModel(isRemote ? this.boardsFromConnection[boardId] : this.boards[boardId], isRemote) })
    },
    shareSync () {
      let boardId = this.clientSettings.flespiBoard,
        topic = `${this.clientSettings.syncNamespace}/${boardId}`,
        savedBoard
      this.$q.loading.show()
      this.subscribe(topic)
        .then(() => {
          savedBoard = this.boardsFromConnection[boardId]
          if (savedBoard) {
            this.initBoard(savedBoard)
            this.setActiveBoard(boardId)
          } else {
            this.$q.notify({
              type: 'negative',
              message: `Board ${boardId} not found`,
              timeout: 1000,
              position: 'bottom-left'
            })
          }
        })
        .catch(() => {})
        .finally(() => {
          this.$q.loading.hide()
        })
    },
    exportBoardAsStringHandler (id) {
      let board = this.boards[id],
        boardModelForSave = getBoardToSave(board, this.widgets)
      this.importExportMode = 1
      this.importExportData = Base64.encode(JSON.stringify(boardModelForSave))
      this.$refs.importExportModal.open()
    },
    exportBoardAsFileHandler (id) {
      let board = this.boards[id],
        boardModelForSave = getBoardToSave(board, this.widgets)
      this.importExportMode = 1
      this.importExportData = Base64.encode(JSON.stringify(boardModelForSave))
      this.$refs.importExportModal.open()
    },
    importExportClose () {
      this.importExportMode = undefined
      this.importExportData = undefined
    },
    importClickHandler () {
      this.importExportMode = 0
      this.$refs.importExportModal.open()
    },
    importBoardFromUserHandler (data) {
      let boardModel
      try {
        boardModel = JSON.parse(data)
      } catch (e) {
        boardModel = JSON.parse(Base64.decode(data))
      }
      this.importBoardHandler(boardModel)
    },
    /* events */
    updateBoards (boards, widgets) {
      this.$emit('update:boards', getBoardsToSave(boards, widgets))
    }
  },
  created () {
    this.debouncedBusMessagesProcessing = debounce(this.busMessagesProcessing, 500, { trailing: true })
    this.debouncedUpdateBoards = debounce(this.updateBoards, 500, { trailing: true })
    this.valuesProcessing()
    if (this.clientSettings) {
      if (this.clientSettings.flespiBoard) {
        this.shareSync()
      }
      return true
    }
    this.initBoards && this.initSavedBoards(this.initBoards)
    if (window) {
      window.addEventListener('beforeunload', () => {
        if (this.client) {
          this.client.end(true)
        }
      })
    }
    this.$emit('change:title', `MQTT Tiles`)
  },
  destroyed () {
    if (this.client) {
      this.client.end()
    }
  },
  watch: {
    clientSettings: {
      handler (client, oldClient) {
        let firstInit = !!client && !oldClient
        if (isEqual(client, oldClient)) { return false }
        if (this.client) { this.destroyClient() }
        clearWidgets(this.widgets)
        this.boardsFromConnection = {}
        Object.keys(this.subscriptions).forEach(topic => {
          this.setValueByTopic(topic, null)
        })
        oldClient && this.debouncedBusMessagesProcessing()
        this.boardsVariablesValuesClear()
        if (!client) {
          this.client = undefined
          return false
        }
        firstInit
          ? this.createClient()
          : setTimeout(() => { this.createClient() }, 500)
      },
      immediate: true
    },
    boards: [
      {
        deep: true,
        handler (boards) {
          this.fullView && this.debouncedUpdateBoards(boards, this.widgets)
        }
      },
      {
        handler: 'boardsVariablesValuesProcessing'
      }
    ],
    widgets: [
      {
        deep: true,
        handler (widgets) {
          this.fullView && this.debouncedUpdateBoards(this.boards, widgets)
        }
      },
      {
        handler: 'valuesProcessing'
      }
    ]
  },
  components: { Board, Boards, CopyReplaceDialog, ImportExportModal },
  mixins: [ getValueByTopic, boardsMigrations ]
}
</script>
