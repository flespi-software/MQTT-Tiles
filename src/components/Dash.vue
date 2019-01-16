<template>
  <div class="dash__wrapper">
    <board
      v-if="activeBoardId"
      :board="boards[activeBoardId]"
      :widgets="widgets"
      :values="values"
      @close="clearActiveBoard"
      @add:widget="addWidget"
      @edit:widget="editWidget"
      @delete:widget="deleteWidget"
      @action="actionHandler"
      @fast-bind="fastBindWidgetHandler"
      @resized="resizeHandler"
      :style="{height: `${clientSettings ? 'calc(100vh - 50px)' : 'calc(100vh - 110px)'}`}"
    />
    <boards
      v-else
      :boards="boards"
      :widgets="widgets"
      :values="values"
      @add="addBoard"
      @edit="editBoardHandler"
      @delete="deleteBoardHandler"
      @select="setActiveBoard"
      @action="actionHandler"
      :style="{height: `${clientSettings ? 'calc(100vh - 50px)' : 'calc(100vh - 110px)'}`}"
    />
    <div v-if="!clientSettings" class="bg-red-2 text-red-8 text-center absolute connections--empty">
      <div class="text-bold q-mt-md">No active connections</div>
    </div>
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
import debounce from 'lodash/debounce'
import cloneDeep from 'lodash/cloneDeep'
import remove from 'lodash/remove'
import Vue from 'vue'
import Board from './Board'
import Boards from './Boards'
import { BOARDS_LOCALSTORAGE_NAME, WIDGETS_LOCALSTORAGE_NAME, WIDGET_STATUS_DISABLED, WIDGET_STATUS_ENABLED } from '../constants'

let clearWidgets = function clearWidgets (widgets) {
    Object.keys(widgets).forEach((widgetId) => {
      widgets[widgetId].status = WIDGET_STATUS_DISABLED
    })
  },
  saveWidgetsToLocalStorage = debounce((widgets) => {
    widgets = cloneDeep(widgets)
    clearWidgets(widgets)
    LocalStorage.set(WIDGETS_LOCALSTORAGE_NAME, widgets)
  }, 500, { trailing: true }),
  saveBoardsToLocalStorage = debounce((boards) => {
    boards = cloneDeep(boards)
    LocalStorage.set(BOARDS_LOCALSTORAGE_NAME, boards)
  }, 500, { trailing: true }),
  removeFromArrayByValue = (array, value) => remove(array, (el) => { return el === value })

export default {
  name: 'Dash',
  props: ['clientSettings'],
  data () {
    return {
      client: undefined,
      clientStatus: false,
      clientErrors: [],
      defaultBoard: Object.freeze({ name: 'New board', settings: { edited: true }, shortcutsIndexes: [], widgetsIndexes: [], layout: [] }),
      boards: {},
      widgets: {},
      subscriptions: {},
      widgetsBySubscription: {},
      activeBoardId: undefined
    }
  },
  computed: {
    values () {
      return Object.keys(this.widgets).reduce((values, widgetId) => {
        let value = values[widgetId] = {},
          widget = this.widgets[widgetId]
        widget.topics.forEach(topic => {
          value[topic] = this.subscriptions[topic]
        })
        return values
      }, {})
    }
  },
  methods: {
    uid,
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
        this.setValueByTopic(topic, message)
      })

      client.on('connect', () => {
        this.clientStatus = true
        this.$emit('change:status', true)
        this.initWidgets()
      })
      client.on('error', (error) => {
        this.errorHandler(error, false)
      })
      client.on('close', endHandler)
      client.on('offline', endHandler)
      client.on('end', endHandler)
      this.client = client
    },
    createClient () {
      this.initClient()
    },
    setValueByTopic (topic, value) {
      Vue.set(this.subscriptions, topic, value)
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
      this.$q.dialog({
        title: 'Warning',
        message: `Do you really want to delete ${this.boards[boardId].name} board?`,
        color: 'dark',
        ok: true,
        cancel: true
      }).then(() => {
        let widgetsIndexes = this.boards[boardId].widgetsIndexes
        widgetsIndexes.forEach((widgetIndex) => {
          let topics = this.widgets[widgetIndex].topics
          topics.forEach((topic) => {
            let widgetsIndexesBySubscription = this.widgetsBySubscription[topic]
            removeFromArrayByValue(widgetsIndexesBySubscription, widgetIndex)
            if (!widgetsIndexesBySubscription.length) {
              this.unsubscribe(topic)
              Vue.delete(this.widgetsBySubscription, topic)
              Vue.delete(this.subscription, topic)
            }
          })
          Vue.delete(this.widgets, widgetIndex)
        })

        Vue.delete(this.boards, boardId)
      })
    },
    editBoardHandler (boardId) {
      let board = this.boards[boardId]
      Vue.set(board.settings, 'edited', !board.settings.edited)
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
        this.subscribe(topics, { qos: 1 })
      }
    },
    widgetLayoutSetup (width, height) {
      let board = this.boards[this.activeBoardId],
        layout = board.layout,
        {x, y} = freeSpace()
      function freeSpace () {
        let max = layout.reduce((max, widget) => {
          if ((max.y === widget.y && max.x <= widget.x) || max.y < widget.y) {
            max = widget
          }
          return max
        }, {y: 0, x: 0, h: 0, w: 0})
        if (max.x + max.w + width <= 12) {
          return { x: max.x + max.w, y: max.y }
        } else {
          return { x: 0, y: max.y + 1 }
        }
      }
      layout.push({
        h: height,
        w: width,
        i: board.widgetsIndexes.length,
        x,
        y
      })
    },
    addWidget (widget) {
      if (!widget.id) {
        widget.id = uid()
        this.widgetLayoutSetup(widget.settings.width, widget.settings.height)
        this.boards[this.activeBoardId].widgetsIndexes.push(widget.id)
      }
      widget.topics.forEach(topic => {
        let hasSubscription = !!this.subscriptions[topic]
        if (!hasSubscription) {
          this.widgetsBySubscription[topic] = []
          this.setValueByTopic(topic, null)
          this.subscribe(topic, {qos: 1})
        }
        this.widgetsBySubscription[topic].push(widget.id)
      })
      if (this.clientStatus) {
        widget.status = WIDGET_STATUS_ENABLED
      }
      Vue.set(this.widgets, widget.id, widget)
    },
    editWidget ({widgetId, settings, topics}) {
      if (!topics.every(topic => settings.topics.includes(topic))) {
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
            this.subscribe(topic, {qos: 1})
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
        Vue.delete(this.boards[this.activeBoardId].layout, widgetIndex)

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
    },
    fastBindWidgetHandler (widgetId) {
      let shortcutsIndexes = this.boards[this.activeBoardId].shortcutsIndexes,
        index = shortcutsIndexes.indexOf(widgetId)
      if (shortcutsIndexes.length === 4) {
        this.$q.notify({
          message: 'Shortcuts can contain four widgets maximum',
          detail: 'Delete something to add a new widget.',
          type: 'warning',
          delay: 1000
        })
        return false
      }
      if (index !== -1) {
        Vue.delete(shortcutsIndexes, index)
      } else {
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
      let widget = this.widgets[this.boards[this.activeBoardId].widgetsIndexes[index]]
      Vue.set(widget.settings, 'height', height)
      Vue.set(widget.settings, 'width', width)
    }
    /* widgets logic end */
  },
  created () {
    let savedBoards = LocalStorage.get.item(BOARDS_LOCALSTORAGE_NAME),
      savedWidgets = LocalStorage.get.item(WIDGETS_LOCALSTORAGE_NAME)
    if (savedBoards) {
      this.boards = savedBoards
      this.widgets = savedWidgets
      this.runtimeInitWidgets()
    }
    if (this.clientSettings) { this.createClient() }
  },
  watch: {
    clientSettings (client, oldClient) {
      if (isEqual(client, oldClient)) { return false }
      if (this.client) { this.destroyClient() }
      if (!client) {
        this.client = undefined
        return false
      }
      clearWidgets(this.widgets)
      Object.keys(this.subscriptions).forEach(topic => {
        this.setValueByTopic(topic, null)
      })
      this.createClient()
    },
    boards: {
      deep: true,
      handler (boards) {
        saveBoardsToLocalStorage(boards)
      }
    },
    widgets: {
      deep: true,
      handler (widgets) {
        saveWidgetsToLocalStorage(widgets)
      }
    }
  },
  components: { Board, Boards }
}
</script>
