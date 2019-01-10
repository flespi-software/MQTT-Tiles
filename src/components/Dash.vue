<template>
  <div class="dash__wrapper">
    <board
      v-if="activeBoardId"
      :board="boards[activeBoardId]"
      :widgets="widgetsList"
      @close="clearActiveBoard"
      @add:widget="addWidget"
      @edit:widget="editWidget"
      @delete:widget="deleteWidget"
      @action="actionHandler"
      @fast-bind="fastBindWidgetHandler"
      :style="{height: `${clientSettings ? 'calc(100vh - 50px)' : 'calc(100vh - 110px)'}`}"
    />
    <boards
      v-else
      :boards="boards"
      :widgets="widgetsList"
      @add="addBoard"
      @edit="editBoardHandler"
      @delete="deleteBoardHandler"
      @select="setActiveBoard"
      @action="actionHandler"
      :style="{height: `${clientSettings ? 'calc(100vh - 50px)' : 'calc(100vh - 110px)'}`}"
    />
    <div v-if="!clientSettings" class="bg-red-2 text-red-8 text-center absolute connections--empty">
      <div class="text-bold q-mt-sm">No active connections</div>
      <div class="text-red-9" style="font-size: 0.9rem">Select one in the left panel</div>
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
import Vue from 'vue'
import Board from './Board'
import Boards from './Boards'
import { BOARDS_LOCALSTORAGE_NAME, WIDGETS_LOCALSTORAGE_NAME, WIDGET_STATUS_DISABLED, WIDGET_STATUS_ENABLED } from '../constants'

let clearWidgets = function clearWidgets (widgets) {
    Object.keys(widgets).forEach((topic) => {
      Object.keys(widgets[topic]).forEach((widgetId) => {
        widgets[topic][widgetId].value = null
        widgets[topic][widgetId].status = WIDGET_STATUS_DISABLED
      })
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
  }, 500, { trailing: true })

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
      activeBoardId: undefined
    }
  },
  computed: {
    widgetsList () {
      let topics = this.widgets
      return Object.keys(topics).reduce((widgets, topic) => {
        let widgetsByTopic = topics[topic]
        Object.keys(widgetsByTopic).forEach(widgetId => {
          widgets[widgetId] = widgetsByTopic[widgetId]
        })
        return widgets
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
        let widgets = this.widgets
        Object.keys(widgets).forEach((widgetsTopic, index) => {
          let isResolved = this.resolveTopics(topic, widgetsTopic)
          if (isResolved) {
            let widgetsIds = Object.keys(this.widgets[widgetsTopic])
            widgetsIds.forEach(widgetId => {
              Vue.set(widgets[widgetsTopic][widgetId], 'value', message)
            })
          }
        })
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
        /* clear widgets by board */
        let topics = this.widgets
        Object.keys(this.widgets).forEach((topic) => {
          let widgetsByTopic = topics[topic],
            widgetsByTopicIds = Object.keys(widgetsByTopic)
          widgetsByTopicIds.forEach(widgetId => {
            if (this.boards[boardId].widgetsIndexes.includes(widgetId)) {
              Vue.delete(widgetsByTopic, widgetId)
            }
          })
          if (!Object.keys(widgetsByTopic).length) {
            this.unsubscribe(topic)
            Vue.delete(this.widgets, topic)
          }
        })

        Vue.delete(this.boards, boardId)
      })
    },
    editBoardHandler (boardId) {
      let board = this.boards[boardId]
      Vue.set(board.settings, 'edited', !board.settings.edited)
    },
    /* widgets logic start */
    initWidgets () {
      let topics = Object.keys(this.widgets)
      topics.forEach(topic => {
        Object.keys(this.widgets[topic]).forEach(widgetId => {
          let widget = this.widgets[topic][widgetId]
          Vue.set(widget, 'status', WIDGET_STATUS_ENABLED)
        })
      })
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
    checkExistingWidget (settings) {
      let widgets = this.widgets,
        existingWidgets = widgets[settings.topic] || {},
        existingWidgetsIds = Object.keys(existingWidgets),
        existingsValue = existingWidgetsIds.length ? existingWidgets[existingWidgetsIds[0]].value : false
      return existingsValue
    },
    addWidget (widget) {
      let widgets = this.widgets[widget.topic]
      if (!widgets) {
        Vue.set(this.widgets, widget.topic, {})
        widgets = this.widgets[widget.topic]
      }
      let currentValue = this.checkExistingWidget(widget)
      if (!widget.id) {
        widget.id = uid()
        this.widgetLayoutSetup(widget.settings.width, widget.settings.height)
        this.boards[this.activeBoardId].widgetsIndexes.push(widget.id)
      }
      if (currentValue) {
        widget.value = currentValue
      } else {
        this.subscribe(widget.topic, {qos: 1})
      }
      if (this.clientStatus) {
        widget.status = WIDGET_STATUS_ENABLED
      }
      Vue.set(widgets, widget.id, widget)
    },
    editWidget ({widgetId, settings, topic}) {
      let widgetsByTopic = this.widgets[topic],
        widgetsIdsByTopicIds = Object.keys(widgetsByTopic)

      this.addWidget(settings)
      if (settings.topic !== topic) {
        Vue.delete(widgetsByTopic, widgetId)
        if (widgetsIdsByTopicIds.length === 1) {
          this.unsubscribe(topic)
          Vue.delete(this.widgets, topic)
        }
      }
    },
    deleteWidget ({widgetId, settings}) {
      let widgetsByTopic = this.widgets[settings.topic],
        widgetsByTopicIds = Object.keys(widgetsByTopic)
      this.$q.dialog({
        title: 'Warning',
        message: `Do you really want to delete ${settings.name} widget?`,
        color: 'dark',
        ok: true,
        cancel: true
      }).then(() => {
        this.removeFromShortcuts(widgetId)
        Vue.delete(widgetsByTopic, widgetId)
        /* remove from board link index */
        let widgetsIndexes = this.boards[this.activeBoardId].widgetsIndexes,
          widgetIndex = widgetsIndexes.indexOf(widgetId)
        Vue.delete(widgetsIndexes, widgetIndex)
        Vue.delete(this.boards[this.activeBoardId].layout, widgetIndex)
        if (widgetsByTopicIds.length === 1) {
          this.unsubscribe(settings.topic)
          Vue.delete(this.widgets, settings.topic)
        }
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
    }
    /* widgets logic end */
  },
  created () {
    let savedBoards = LocalStorage.get.item(BOARDS_LOCALSTORAGE_NAME),
      savedWidgets = LocalStorage.get.item(WIDGETS_LOCALSTORAGE_NAME)
    if (savedBoards) {
      this.boards = savedBoards
      this.widgets = savedWidgets
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
