<template>
  <div class="dash__boards">
    <q-btn fab color="dark" @click="openSettingsHandler" icon="mdi-plus" class="absolute button--add" v-if="!isFrized">
      <q-tooltip>Add new board</q-tooltip>
    </q-btn>
    <div v-if="Object.keys(remoteBoards).length" class="remote-control text-center">
      <span @click="isPanelShowed = !isPanelShowed" class="remote-control__button text-dark bg-orange q-px-sm text-bold uppercase cursor-pointer shadow-3">{{isPanelShowed ? 'hide' : 'saved boards'}}</span>
    </div>
    <transition
      appear
      enter-active-class="animated slideInDown"
      leave-active-class="animated slideOutUp"
    >
      <div class="boards__remote scroll bg-grey-3 q-pb-md q-pt-lg flex no-wrap" v-if="Object.keys(remoteBoards).length && isPanelShowed">
        <div class="q-my-xs q-px-sm q-my-sm remote__board" v-for="(board, id) in remoteBoards" :key="`remote-${id}`">
          <q-card>
            <q-item class="q-py-none q-pl-sm q-pr-none bg-grey-4">
              <q-item-main class="ellipsis">
                <div class="ellipsis" style="height: 24px; line-height: 24px;">
                  {{board.name || '*No name*'}}
                  <q-tooltip v-if="board.name">{{board.name}}</q-tooltip>
                </div>
                <div class="ellipsis text-grey-9" style="height: 14px; line-height: 14px; font-size: 14px;">
                  {{board.id}}
                </div>
              </q-item-main>
              <q-item-side>
                <q-btn round dense flat icon="mdi-dots-vertical" color="dark">
                  <q-popover anchor="bottom right" self="top right">
                    <q-list dense>
                      <q-item class="cursor-pointer" v-close-overlay highlight @click.native.stop="$emit('share:uploaded', id)" v-if="canShare">
                        <q-item-side icon="mdi-link" />
                        <q-item-main label="Get link"/>
                      </q-item>
                      <q-item-separator v-if="canShare"/>
                      <q-item class="cursor-pointer" v-close-overlay highlight @click.native.stop="$emit('delete:uploaded', id)">
                        <q-item-side color="red" icon="mdi-delete-outline" />
                        <q-item-main label="Remove"/>
                      </q-item>
                    </q-list>
                  </q-popover>
                </q-btn>
              </q-item-side>
            </q-item>
            <q-card-separator />
            <q-card-main class="text-center relative-position">
              <div v-if="board.settings.lastModify" class="absolute-top-right text-grey-5 q-pr-xs" style="font-size: .7rem;">{{date(board.settings.lastModify, 'DD-MM-YYYY HH:mm:ss')}}</div>
              <q-icon name="mdi-download" size="20px" color="dark" class="cursor-pointer" @click.native="$emit('import', id)" />
              <span class="text-grey-5 absolute" style="font-size: 10px; bottom: 4px; left: 4px; cursor: default;" v-if='board.appVersion' title="MQTT Tiles version">v.{{board.appVersion}}</span>
              <span class="text-bold text-white absolute bg-purple-6 round-borders q-px-xs" style="font-size: 10px; bottom: 4px; right: 4px; cursor: default;" title="Widgets count">{{board.widgetsIndexes.length}}</span>
            </q-card-main>
          </q-card>
        </div>
      </div>
    </transition>
    <q-toolbar color="white">
      <q-toolbar-title class="text-dark">Boards</q-toolbar-title>
      <template v-if="connectionSettings">
        <q-btn v-if="!attachMode" @click="attachMode = true" icon="mdi-link-variant" flat color="dark">
          <q-tooltip>Attach boards to connection</q-tooltip>
        </q-btn>
        <q-btn v-else @click="attachHandler" flat color="green">
          <div class="flex flex-center">
            <q-icon name="mdi-check"/>
            Attach
          </div>
        </q-btn>
      </template>
      <slot name="actions"/>
    </q-toolbar>
    <div class="q-px-sm scroll boards__wrapper" :style="{height: isPanelShowed ? 'calc(100% - 199px)' : 'calc(100% - 50px)'}">
      <div v-if="boardsKeys.length || Object.keys(boardsConfigs).length" class="row">
        <div class="q-pt-md q-px-sm col-xl-4 col-md-6 col-sm-6 col-xs-12 relative-position" v-for="(board, id) in boards" :key="id">
          <div class="absolute-top-left absolute-bottom-right q-mt-md q-mx-sm flex flex-center" v-if="attachMode" style="background-color: rgba(255, 255, 255, .4); z-index: 1;">
            <q-btn @click="changeAttachedBoards(id)" icon="mdi-check" :color="currentAttachedBoard.includes(id) ? 'green' : 'grey'" size="4rem" flat class="absolute-top-left absolute-bottom-right" style="width: 100%;"/>
          </div>
          <q-card>
            <q-item class="q-py-none q-px-sm bg-grey-4">
              <q-item-main class="ellipsis">
                <div class="ellipsis" style="height: 24px; line-height: 24px;">
                  {{board.name || '*No name*'}}
                  <q-tooltip v-if="board.name">{{board.name}}</q-tooltip>
                </div>
                <div class="ellipsis text-grey-9" style="height: 14px; line-height: 14px; font-size: 14px;">
                  {{board.id}}
                </div>
              </q-item-main>
              <q-item-side>
                <q-btn round dense flat icon="mdi-link" color="dark" @click.native="$emit('share', id)" v-if="canShare">
                  <q-tooltip>Get link</q-tooltip>
                </q-btn>
                <q-btn round dense flat icon="mdi-fullscreen" color="dark" @click.native="$emit('select', id)">
                  <q-tooltip>Show full board</q-tooltip>
                </q-btn>
                <q-btn round dense flat icon="mdi-dots-vertical" color="dark">
                  <q-popover anchor="bottom right" self="top right">
                    <q-list dense>
                      <!-- <q-item style="padding: 0 0;">
                        <q-item-main/>
                        <q-item-side>
                          <q-btn size="0.8rem" icon="mdi-settings" v-close-overlay @click="openEditSettingsHandler(id)" flat round>
                            <q-tooltip>Settings</q-tooltip>
                          </q-btn>
                          <q-btn size="0.8rem" color="red" icon="mdi-delete-outline" v-close-overlay @click="$emit('delete', id)" flat round>
                            <q-tooltip>Remove</q-tooltip>
                          </q-btn>
                        </q-item-side>
                      </q-item> -->
                      <q-item class="cursor-pointer" v-close-overlay highlight @click.native.stop="$emit('export', id)" v-if="!!connectionSettings">
                        <q-item-side icon="mdi-cloud-upload-outline" />
                        <q-item-main label="Save to broker"/>
                      </q-item>
                      <q-item class="cursor-pointer" v-close-overlay highlight @click.native.stop="$emit('export:string', id)">
                        <q-item-side icon="mdi-export-variant" />
                        <q-item-main label="Export as string"/>
                      </q-item>
                      <q-item class="cursor-pointer" v-close-overlay highlight @click.native.stop="$emit('export:file', id)">
                        <q-item-side icon="mdi-file-export" />
                        <q-item-main label="Export as file"/>
                      </q-item>
                      <q-item class="cursor-pointer" v-close-overlay highlight @click.native.stop="openEditSettingsHandler(id)">
                        <q-item-side icon="mdi-settings" />
                        <q-item-main label="Settings"/>
                      </q-item>
                      <q-item-separator/>
                      <q-item class="cursor-pointer" v-close-overlay highlight @click.native.stop="$emit('delete', id)">
                        <q-item-side color="red" icon="mdi-delete-outline" />
                        <q-item-main label="Remove"/>
                      </q-item>
                    </q-list>
                  </q-popover>
                </q-btn>
              </q-item-side>
            </q-item>
            <q-card-separator />
            <q-card-main class="row relative-position" :class="{ 'bg-grey-2': !board.shortcutsIndexes.length }">
              <div class="text-grey-8 col-12 q-mb-sm" style="font-size: 15px;">Shortcuts</div>
              <template v-if="board.shortcutsIndexes.length">
                <div class="col-3 q-px-xs" v-for="(item, index) in [0, 1, 2, 3]" :key="index" style="margin-bottom: 2px;">
                  <component
                    v-if="widgets[board.shortcutsIndexes[index]] && values[board.shortcutsIndexes[index]] !== undefined"
                    :is="widgets[board.shortcutsIndexes[index]].type"
                    :item="widgets[board.shortcutsIndexes[index]]"
                    :value="values[board.shortcutsIndexes[index]]"
                    @action="(data) => { actionHandler(board.id, data) }"
                    :index="board.shortcutsIndexes[index]"
                    :mini="true"
                  />
                </div>
              </template>
              <div v-else class='shortcuts--empty col-12' style="min-height: 84px; margin-bottom: 2px;">
                <div class="text-center text-grey-8 q-mb-sm q-mt-sm" style="font-size: 1.2rem;">You have no shortcuts</div>
                <div class="text-center text-grey-8">You can add one on <q-btn icon="mdi-fullscreen" color="grey-8" size="sm" dense label="full board view" @click="$emit('select', id)" /></div>
              </div>
              <div v-if="board.settings.lastModify" class="absolute-top-right text-grey-5 q-pr-xs" style="font-size: .7rem;">{{date(board.settings.lastModify, 'DD-MM-YYYY HH:mm:ss')}}</div>
              <span class="text-bold text-white absolute bg-purple-6 round-borders q-px-xs" style="font-size: 10px; bottom: 4px; right: 4px; cursor: default;" title="Widgets count">{{board.widgetsIndexes.length}}</span>
            </q-card-main>
          </q-card>
        </div>
        <template v-if="attachMode">
          <div class="q-pt-md q-px-sm col-xl-4 col-md-6 col-sm-6 col-xs-12 relative-position" v-for="(board, id) in boardsConfigs" :key="id">
            <div class="absolute-top-left absolute-bottom-right q-mt-md q-mx-sm flex flex-center" style="background-color: rgba(255, 255, 255, .4); z-index: 1;">
              <q-btn @click="changeAttachedBoards(id)" icon="mdi-check" :color="currentAttachedBoard.includes(id) ? 'green' : 'grey'" size="4rem" flat class="absolute-top-left absolute-bottom-right" style="width: 100%;"/>
            </div>
            <q-card>
              <q-item class="q-py-none q-px-sm bg-grey-4">
                <q-item-main class="ellipsis">
                  <div class="ellipsis" style="height: 24px; line-height: 24px;">
                    {{board.name || '*No name*'}}
                    <q-tooltip v-if="board.name">{{board.name}}</q-tooltip>
                  </div>
                  <div class="ellipsis text-grey-9" style="height: 14px; line-height: 14px; font-size: 14px;">
                    {{board.id}}
                  </div>
                </q-item-main>
              </q-item>
              <q-card-separator />
              <q-card-main class="row relative-position" :class="{ 'bg-grey-2': !board.shortcutsIndexes.length }">
                <div class="text-grey-8 col-12 q-mb-sm" style="font-size: 15px;">Shortcuts</div>
                <template v-if="board.shortcutsIndexes.length">
                  <div class="col-3 q-px-xs" v-for="(widget, index) in board.shortcutsIndexes.map(index => board.widgetsIndexes.filter(widget => widget.id === index)[0])" :key="index" style="margin-bottom: 2px;">
                    <div style="text-align: center;">
                      <div style="height: 60px; width: 60px; line-height: 60px; margin: 0 auto; border-radius: 5px;" :class="[`bg-${widget.color}-1`]">
                        <div class='ellipsis'>
                          N/A
                        </div>
                      </div>
                      <div class="ellipsis q-mt-sm">{{widget.name}}</div>
                    </div>
                  </div>
                </template>
                <div v-else class='shortcuts--empty col-12' style="min-height: 84px; margin-bottom: 2px;">
                  <div class="text-center text-grey-8 q-mb-sm q-mt-sm" style="font-size: 1.2rem;">You have no shortcuts</div>
                  <div class="text-center text-grey-8">You can add one on <q-btn icon="mdi-fullscreen" color="grey-8" size="sm" dense label="full board view" @click="$emit('select', id)" /></div>
                </div>
                <div v-if="board.settings.lastModify" class="absolute-top-right text-grey-5 q-pr-xs" style="font-size: .7rem;">{{date(board.settings.lastModify, 'DD-MM-YYYY HH:mm:ss')}}</div>
                <span class="text-bold text-white absolute bg-purple-6 round-borders q-px-xs" style="font-size: 10px; bottom: 4px; right: 4px; cursor: default;" title="Widgets count">{{board.widgetsIndexes.length}}</span>
              </q-card-main>
            </q-card>
          </div>
        </template>
      </div>
      <div v-else class="text-dark text-bold wrapper--empty">
        <div class="q-mb-sm">No boards</div>
        <div v-if="!isFrized"><q-btn color="dark" icon="mdi-plus-circle-outline" label="New board" @click="openSettingsHandler" /></div>
      </div>
    </div>
    <board-settings
      v-if="settingsModalModel"
      v-model="settingsModalModel"
      :settings="editedBoardModel"
      :boards="boards"
      @add="addBoardHandler"
      @edit="editBoardHandler"
      @hide="hideModalHandler"
    />
  </div>
</template>

<style lang="stylus">
  .button--add
    bottom 16px
    right 16px
    z-index 1
  .remote-control
    position absolute
    right 0
    left 0
    font-size 13px
    height 15px
    z-index 1
    .remote-control__button
      border-radius 0px 0px 5px 5px
      line-height 15px
  .dash__boards
    position relative
    .boards__remote
      max-height 149px
      box-shadow rgba(0, 0, 0, 0.7) 0px -9px 9px -9px inset
      .remote__board
        width 200px
        min-width 200px
    .boards__wrapper
      padding-bottom 82px
      .wrapper--empty
        text-align center
        margin-top 30px
        font-size 2rem
</style>

<script>
import { date } from 'quasar'
import cloneDeep from 'lodash/cloneDeep'
import uniq from 'lodash/uniq'
import BoardSettings from './BoardSettings'
import Switcher from './widgets/switcher/View'
import Clicker from './widgets/clicker/View'
import Informer from './widgets/informer/View'
import Linear from './widgets/linear/View'
import Radial from './widgets/radial/View'
import Singleselect from './widgets/singleselect/View'
import Slider from './widgets/slider/View'
import Color from './widgets/color/View'
import StatusIndicator from './widgets/statusIndicator/View'
export default {
  name: 'Boards',
  props: ['boards', 'boardsConfigs', 'widgets', 'values', 'remoteBoards', 'canShare', 'isFrized', 'connectionSettings'],
  data () {
    return {
      isPanelShowed: false,
      settingsModalModel: false,
      editedBoardModel: null,
      attachMode: false,
      currentAttachedBoard: this.attachedBoards ? [...this.attachedBoards] : []
    }
  },
  computed: {
    attachedBoards () {
      return this.connectionSettings && this.connectionSettings.attachedBoards
    },
    boardsKeys () {
      return Object.keys(this.boards)
    }
  },
  methods: {
    date: date.formatDate,
    openSettingsHandler () {
      this.settingsModalModel = true
    },
    openEditSettingsHandler (id) {
      this.editedBoardModel = cloneDeep(this.boards[id])
      this.openSettingsHandler()
    },
    editBoardHandler (boardModel) {
      boardModel.widgetsIndexes.forEach(widgetIndex => {
        let widget = cloneDeep(this.widgets[widgetIndex])
        boardModel.settings.variables.forEach((variable) => {
          if (!variable.values.includes(boardModel.activeVariables[variable.name])) {
            boardModel.activeVariables[variable.name] = undefined
          }
        })
        widget = this.modifyWidgetByVariables(widget, boardModel)
        this.$emit('edit:widget', {settings: widget, widgetId: widget.id, topics: [...this.widgets[widgetIndex].topics]})
      })
      this.$emit('edit', {id: this.editedBoardModel.id, board: boardModel})
      this.editedBoardModel = null
    },
    addBoardHandler (boardModel) {
      this.$emit('add', boardModel)
    },
    hideModalHandler () {
      this.editedBoardModel = null
    },
    modifyWidgetByVariables (widget, board) {
      let modifyTopics = (topic) => {
        if (!topic.topicTemplate) {
          topic.topicTemplate = topic.topicFilter
        }
        let variables = board.activeVariables
        topic.topicFilter = topic.topicTemplate.replace(/<%([a-zA-Z0-9-+&@#/%?=~_|!:,.;\s]*)%>/gim, (match, name) => {
          return variables[name] || match
        })
      }
      let allTopics = []
      if (widget.dataTopics.length) {
        widget.dataTopics.forEach(modifyTopics)
        allTopics = [...allTopics, ...widget.dataTopics]
      }
      if (widget.settings.topics && widget.settings.topics.length) {
        widget.settings.topics.forEach(modifyTopics)
        allTopics = [...allTopics, ...widget.settings.topics]
      }
      widget.topics = uniq(allTopics.map(topic => topic.topicFilter))
      return widget
    },
    actionHandler (boardId, data) {
      let variables = this.boards[boardId].activeVariables
      data.topic = data.topic.replace(/<%([a-zA-Z0-9-+&@#/%?=~_|!:,.;\s]*)%>/gim, (match, name) => {
        return variables[name] || match
      })
      this.$emit('action', data)
    },
    attachHandler () {
      this.$emit('change:attach', this.currentAttachedBoard)
      this.attachMode = false
    },
    changeAttachedBoards (id) {
      let attachedBoardIndex = this.currentAttachedBoard.indexOf(id),
        hasBoardsInAttach = attachedBoardIndex !== -1
      if (hasBoardsInAttach) {
        this.$delete(this.currentAttachedBoard, attachedBoardIndex)
      } else {
        this.currentAttachedBoard.push(id)
      }
    }
  },
  watch: {
    boardsConfigs: {
      handler (configs) {
        this.currentAttachedBoard = this.attachedBoards && this.attachedBoards.length
          ? [...this.attachedBoards]
          : []
      },
      immediate: true,
      deep: true
    },
    connectionSettings () {
      if (!this.boardsKeys.length && this.attachedBoards.length) {
        this.$emit('change:attach', [])
      } else {
        this.attachMode = false
      }
      this.currentAttachedBoard = this.attachedBoards && this.attachedBoards.length
        ? [...this.attachedBoards]
        : []
    }
  },
  components: {
    BoardSettings, Switcher, Clicker, Informer, Linear, Radial, Singleselect, Slider, Color, StatusIndicator
  }
}
</script>
