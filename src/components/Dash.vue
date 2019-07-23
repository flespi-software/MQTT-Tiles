<template>
  <div class="dash__wrapper">
    <board
      v-if="activeBoardId"
      :board="boards[activeBoardId]"
      :widgets="widgets"
      :values="values"
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
      :style="{height: `${clientSettings ? 'calc(100vh - 50px)' : 'calc(100vh - 110px)'}`}"
    />
    <boards
      v-else
      :boards="boards"
      :widgets="widgets"
      :values="values"
      :remoteBoards="boardsFromConnection"
      :canShare="canShare"
      :isFrized="!fullView"
      :hasConnection="!!clientSettings"
      @add="addBoard"
      @edit="editBoardHandler"
      @delete="deleteBoardDialogHandler"
      @select="setActiveBoard"
      @action="actionHandler"
      @share="shareHandler"
      @share:uploaded="shareUploadedHandler"
      @delete:uploaded="deleteUploadedBoard"
      @export="exportPrepareBoardHandler"
      @import="importBoardHandler"
      :style="{height: `${clientSettings ? 'calc(100vh - 50px)' : 'calc(100vh - 110px)'}`}"
    />
    <div v-if="!clientSettings" class="bg-red-2 text-red-8 text-center absolute connections--empty">
      <div class="text-bold q-mt-md">No active connections</div>
    </div>
    <copy-replace-dialog
      ref="copyReplaceDialog"
      :initName="exportBoardId"
      @change:name="(name) => exportBoardId = name"
    />
  </div>
</template>

<style lang="stylus">
  .dash__wrapper
    height calc(100vh - 50px)
    width 100%
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
import { uid, LocalStorage } from 'quasar'
import bl from 'bl'
import debounce from 'lodash/debounce'
import cloneDeep from 'lodash/cloneDeep'
import remove from 'lodash/remove'
import difference from 'lodash/difference'
import uniq from 'lodash/uniq'
import get from 'lodash/get'
import Vue from 'vue'
import Board from './Board'
import Boards from './Boards'
import { BOARDS_LOCALSTORAGE_NAME, WIDGET_STATUS_DISABLED, WIDGET_STATUS_ENABLED } from '../constants'
import getActionTopics from './widgets/getActionTopics.js'
import messagesProcessing from './widgets/messagesProcessing.js'
import CopyReplaceDialog from './CopyReplaceDialog'
import {version} from '../../package.json'

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
  getBoardToSave = function getBoardsToSave (board, widgets) {
    board = cloneDeep(board)
    widgets = cloneDeep(widgets)
    clearWidgets(widgets)
    board.widgetsIndexes = board.widgetsIndexes.map(widgetIndex => widgets[widgetIndex])
    board.appVersion = version
    return board
  },
  saveBoardsToLocalStorage = debounce((boards, widgets) => {
    LocalStorage.set(BOARDS_LOCALSTORAGE_NAME, getBoardsToSave(boards, widgets))
  }, 500, { trailing: true }),
  removeFromArrayByValue = (array, value) => remove(array, (el) => { return el === value })

export default {
  name: 'Dash',
  props: ['clientSettings'],
  data () {
    return {
      fullView: !(this.clientSettings && this.clientSettings.flespiBoard),
      client: undefined,
      connack: undefined,
      clientStatus: false,
      clientErrors: [],
      defaultBoard: Object.freeze(
        {
          name: 'New board',
          id: '',
          settings: { edited: true, blocked: false },
          shortcutsIndexes: [],
          widgetsIndexes: [],
          layouts: { lg: [], md: [], sm: [], xs: [], xxs: [] }
        }
      ),
      boards: {},
      widgets: {},
      subscriptions: {},
      widgetsBySubscription: {},
      activeBoardId: undefined,
      colsByBreakpoint: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
      boardsFromConnection: {},
      exportBoardId: '',
      bufferValues: {},
      expireMessagesProcess: 0,
      expireMessagesStore: {}
    }
  },
  computed: {
    values () {
      let values = Object.keys(this.widgets).reduce((values, widgetId) => {
        let value = values[widgetId] = {},
          widget = this.widgets[widgetId]
        widget.topics.forEach(topic => {
          value[topic] = messagesProcessing(widget.type)(this.subscriptions[topic], get(this.bufferValues, `${widgetId}.${topic}`, undefined), topic, widget)
        })
        return values
      }, {})
      this.setBufferValues(values)
      return values
    },
    subscriptionsTopics () { return Object.keys(this.subscriptions) },
    canShare () {
      return !!this.clientSettings && this.clientSettings.host.indexOf('flespi') !== -1 &&
        !this.clientSettings.flespiBoard &&
        /* check for not master token used for flespi connection */
        (
          this.connack && this.connack.properties &&
          this.connack.properties.userProperties &&
          this.connack.properties.userProperties.token &&
          JSON.parse(this.connack.properties.userProperties.token).access.type !== 1
        )
    }
  },
  methods: {
    uid,
    setBufferValues (values) {
      this.bufferValues = values
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
        Vue.set(this.subscriptions, topic, value)
        return true
      }
      /* write value */
      this.subscriptionsTopics.forEach((subTopic) => {
        if (this.checkTopic(topic, subTopic)) {
          Vue.set(this.subscriptions, subTopic, value)
        }
      })
    },
    expireMessagesHandler (packet) {
      if (packet.properties && packet.properties.messageExpiryInterval) {
        if (!this.expireMessagesProcess) {
          this.expireMessagesProcessing()
        }
        this.expireMessagesStore[packet.topic] = Date.now() + Math.floor(packet.properties.messageExpiryInterval * 1000)
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
                Vue.set(this.subscriptions[subTopic], 'payload', bl().slice(0, -1))
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
        return this.client.subscribe(...arguments)
          .catch(err => { this.errorHandler(err) })
      }
    },
    async unsubscribe (topic) {
      if (this.client) {
        return this.client.unsubscribe(...arguments)
          .catch(err => { this.errorHandler(err) })
      }
    },
    async publish () {
      if (this.client) {
        return this.client.publish(...arguments)
          .catch(err => { this.errorHandler(err) })
      } else { this.showError(new Error('You have no active clients')) }
    },
    async destroyClient () {
      await this.client.end(true)
    },
    setActiveBoard (boardId) {
      this.activeBoardId = boardId
    },
    clearActiveBoard () {
      this.activeBoardId = undefined
    },
    actionHandler ({topic, payload, settings}) {
      this.publish(topic, payload, settings)
    },
    addBoard () {
      let settings = cloneDeep(this.defaultBoard),
        id = this.uid()
      settings.id = id
      Vue.set(this.boards, id, settings)
    },
    deleteBoardHandler (boardId) {
      let widgetsIndexes = this.boards[boardId].widgetsIndexes
      widgetsIndexes.forEach((widgetIndex) => {
        let topics = this.widgets[widgetIndex].topics
        topics.forEach((topic) => {
          let widgetsIndexesBySubscription = this.widgetsBySubscription[topic]
          removeFromArrayByValue(widgetsIndexesBySubscription, widgetIndex)
          if (!widgetsIndexesBySubscription.length) {
            this.unsubscribe(topic)
            Vue.delete(this.widgetsBySubscription, topic)
            Vue.delete(this.subscriptions, topic)
          }
        })
        Vue.delete(this.widgets, widgetIndex)
      })

      Vue.delete(this.boards, boardId)
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
    editBoardHandler (boardId) {
      let board = this.boards[boardId]
      if (board.id !== boardId) {
        this.replaceBoardHandler(boardId)
      }
      Vue.set(board.settings, 'edited', !board.settings.edited)
    },
    replaceBoardHandler (boardId) {
      let board = this.boards[boardId]
      Vue.set(this.boards, board.id, board)
      if (this.activeBoardId === boardId) {
        this.clearActiveBoard()
        this.$nextTick(() => { this.setActiveBoard(board.id) })
      }
      Vue.delete(this.boards, boardId)
      /* update widgets ids */
      board.widgetsIndexes.forEach((widgetId, index) => {
        let newId = uid()
        Vue.set(this.widgets, newId, this.widgets[widgetId])
        Vue.set(board.widgetsIndexes, index, newId)
        Vue.set(this.widgets[newId], 'id', newId)
        Vue.delete(this.widgets, widgetId)
        let shortcutIndex = board.shortcutsIndexes.indexOf(widgetId)
        if (shortcutIndex !== -1) {
          Vue.set(board.shortcutsIndexes, shortcutIndex, newId)
        }
        this.widgets[newId].topics.forEach((topic, index) => {
          let widgetsBySubscription = this.widgetsBySubscription[topic]
          Vue.set(widgetsBySubscription, widgetsBySubscription.indexOf(widgetId), newId)
        })
        Object.keys(board.layouts).forEach(layoutName => {
          board.layouts[layoutName][index].i = newId
        })
      })
    },
    blockBoardHandler () {
      let board = this.boards[this.activeBoardId]
      Vue.set(board.settings, 'blocked', !board.settings.blocked)
    },
    initBoard (board) {
      board = cloneDeep(board)
      let widgets = {}
      let indexes = []
      board.widgetsIndexes.forEach((widget) => {
        indexes.push(widget.id)
        widgets[widget.id] = widget
        return widgets
      })
      board.widgetsIndexes = indexes
      Vue.set(this.boards, board.id, board)
      Object.keys(widgets).forEach(widgetId => {
        this.addWidget(widgets[widgetId])
      })
    },
    initSavedBoards (savedBoards) {
      if (savedBoards) {
        let widgets = {}
        Object.keys(savedBoards).forEach(boardId => {
          let board = savedBoards[boardId]
          if (board.settings.edited) { board.settings.edited = false }
          let indexes = []
          board.widgetsIndexes.forEach((widget) => {
            indexes.push(widget.id)
            widgets[widget.id] = widget
            return widgets
          })
          board.widgetsIndexes = indexes
        })
        this.boards = savedBoards
        if (widgets) {
          this.widgets = widgets
          this.runtimeInitWidgets()
        }
      }
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
        Vue.set(this.widgets[widgetIndex], 'status', WIDGET_STATUS_ENABLED)
      })
      let topics = Object.keys(this.subscriptions)
      if (topics.length) {
        let settings = { qos: 1 }
        let userProperties = this.clientSettings && this.clientSettings.userProperties
        if (userProperties) {
          settings.properties = {}
          settings.properties.userProperties = userProperties
        }
        this.subscribe(topics, settings)
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
      Vue.set(this.boards[this.activeBoardId].layouts, breakpoint, layout)
    },
    deleteWidgetFromLayout (widgetIndex) {
      let board = this.boards[this.activeBoardId],
        layouts = board.layouts
      Object.keys(this.colsByBreakpoint).forEach(breakpoint => {
        Vue.delete(layouts[breakpoint], widgetIndex)
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
        if (!hasSubscription) {
          this.widgetsBySubscription[topic] = []
          this.setValueByTopic(topic, null)
          let settings = { qos: 1 }
          let userProperties = this.clientSettings && this.clientSettings.userProperties
          if (userProperties) {
            settings.properties = {}
            settings.properties.userProperties = userProperties
          }
          this.subscribe(topic, settings)
        }
        this.widgetsBySubscription[topic].push(widget.id)
      })
      if (this.clientStatus) {
        widget.status = WIDGET_STATUS_ENABLED
      }
      Vue.set(this.widgets, widget.id, widget)
    },
    editWidget ({widgetId, settings, topics}) {
      if (difference(settings.topics, topics).length || difference(topics, settings.topics).length) {
        topics.forEach(oldTopic => {
          if (settings.topics.includes(oldTopic)) { return false }
          removeFromArrayByValue(this.widgetsBySubscription[oldTopic], widgetId)
          if (!this.widgetsBySubscription[oldTopic].length) {
            this.unsubscribe(oldTopic)
            Vue.delete(this.subscriptions, oldTopic)
            Vue.delete(this.widgetsBySubscription, oldTopic)
          }
        })
        settings.topics.forEach(topic => {
          if (topics.includes(topic)) { return false }
          let hasSubscription = !!this.subscriptions[topic]
          if (!hasSubscription) {
            this.widgetsBySubscription[topic] = []
            this.setValueByTopic(topic, null)
            let settings = { qos: 1 }
            let userProperties = this.clientSettings && this.clientSettings.userProperties
            if (userProperties) {
              settings.properties = {}
              settings.properties.userProperties = userProperties
            }
            this.subscribe(topic, settings)
          }
          this.widgetsBySubscription[topic].push(widgetId)
        })
      }
      Vue.set(this.widgets, widgetId, settings)
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
        Vue.delete(widgetsIndexes, widgetIndex)
        this.deleteWidgetFromLayout(widgetIndex)

        settings.topics.forEach(topic => {
          let widgetsBySubscription = this.widgetsBySubscription[topic]
          removeFromArrayByValue(widgetsBySubscription, widgetId)
          if (!widgetsBySubscription.length) {
            this.unsubscribe(topic)
            Vue.delete(this.subscriptions, topic)
            Vue.delete(this.widgetsBySubscription, topic)
          }
        })
        Vue.delete(this.widgets, widgetId)
      })
        .catch(() => {})
    },
    fastBindWidgetHandler (widgetId) {
      let shortcutsIndexes = this.boards[this.activeBoardId].shortcutsIndexes,
        index = shortcutsIndexes.indexOf(widgetId)
      if (index !== -1) {
        Vue.delete(shortcutsIndexes, index)
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
          Vue.delete(shortcutsIndexes, index)
        }
      })
    },
    resizeHandler ({index, height, width}) {
      let widget = this.widgets[index]
      Vue.set(widget.settings, 'height', height)
      Vue.set(widget.settings, 'width', width)
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
        Vue.delete(this.boardsFromConnection, id)
        return false
      }
      board = JSON.parse(board)
      if (typeof board === 'object') {
        Vue.set(this.boardsFromConnection, id, board)
        if (id === this.activeBoardId && this.clientSettings.flespiBoard) {
          this.activeBoardId = null
          this.deleteBoardHandler(id)
          this.initBoard(this.boardsFromConnection[id])
          this.setActiveBoard(id)
        }
      }
    },
    importBoardHandler (id) {
      let board = cloneDeep(this.boardsFromConnection[id])
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
                  Vue.set(board.shortcutsIndexes, shortcutIndex, newId)
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
    exportPrepareBoardHandler (id) {
      this.exportBoardId = id
      if (this.boardsFromConnection[id]) {
        return this.$refs.copyReplaceDialog.open()
          .then((id) => this.exportBoardHandler(id))
          .catch(() => {})
      } else {
        return Promise.resolve(this.exportBoardHandler(id))
      }
    },
    exportBoardHandler (id) {
      let board, currentId
      if (id === this.exportBoardId) {
        board = this.boards[id]
        currentId = id
      } else {
        board = this.boards[id]
        board.id = this.exportBoardId
        this.replaceBoardHandler(id)
        currentId = this.exportBoardId
      }
      let topic = `${this.clientSettings.syncNamespace}/${currentId}`
      this.publish(topic, JSON.stringify(getBoardToSave(board, this.widgets)), { qos: 1, retain: true })
      this.closeExportHandler()
      return currentId
    },
    closeExportHandler () {
      this.exportBoardId = ''
    },
    shareHandler (boardId) {
      let board = this.boards[boardId],
        widgets = board.widgetsIndexes.map(widgetId => this.widgets[widgetId]),
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
      if (!this.canShare) { return false }
      this.exportPrepareBoardHandler(boardId)
        .then((id) => {
          if (id) {
            this.$emit('share', { boardId: id, share: shareModel })
          }
        })
        .catch(() => {})
    },
    shareUploadedHandler (boardId) {
      let board = this.boardsFromConnection[boardId],
        widgets = board.widgetsIndexes,
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
      this.$emit('share', { boardId, share: shareModel })
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
    }
  },
  created () {
    if (this.clientSettings) {
      if (this.clientSettings.flespiBoard) {
        this.shareSync()
      }
      return true
    }
    let savedBoards = LocalStorage.get.item(BOARDS_LOCALSTORAGE_NAME)
    this.initSavedBoards(savedBoards)
    if (window) {
      window.addEventListener('beforeunload', () => {
        if (this.client) {
          this.client.end(true)
        }
      })
    }
  },
  destroyed () {
    if (this.client) {
      this.client.end()
    }
  },
  watch: {
    clientSettings: {
      handler (client, oldClient) {
        if (isEqual(client, oldClient)) { return false }
        if (this.client) { this.destroyClient() }
        clearWidgets(this.widgets)
        this.boardsFromConnection = {}
        Object.keys(this.subscriptions).forEach(topic => {
          this.setValueByTopic(topic, null)
        })
        if (!client) {
          this.client = undefined
          return false
        }
        this.createClient()
      },
      immediate: true
    },
    boards: {
      deep: true,
      handler (boards) {
        this.fullView && saveBoardsToLocalStorage(boards, this.widgets)
      }
    },
    widgets: {
      deep: true,
      handler (widgets) {
        this.fullView && saveBoardsToLocalStorage(this.boards, widgets)
      }
    }
  },
  components: { Board, Boards, CopyReplaceDialog }
}
</script>
