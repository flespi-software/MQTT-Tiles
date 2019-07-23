<template>
  <div class="dash__boards">
    <q-btn fab color="dark" @click="$emit('add')" icon="mdi-plus" class="absolute button--add" v-if="!isFrized">
      <q-tooltip>Add new board</q-tooltip>
    </q-btn>
    <div v-if="Object.keys(remoteBoards).length" class="remote-control text-center">
      <span @click="isPanelShowed = !isPanelShowed" class="remote-control__button text-dark bg-orange q-px-sm text-bold uppercase cursor-pointer shadow-3">{{isPanelShowed ? 'hide' : 'saved boards'}}</span>
    </div>
    <div class="boards__remote scroll bg-grey-3 q-pb-md q-pt-lg flex no-wrap" v-if="Object.keys(remoteBoards).length && isPanelShowed">
      <div class="q-my-xs q-px-sm q-my-sm remote__board" v-for="(board, id) in remoteBoards" :key="`remote-${id}`">
        <q-card>
          <q-item class="q-py-none q-pl-sm q-pr-none bg-grey-4">
            <q-item-main class="ellipsis">
              <div class="ellipsis" style="height: 24px; line-height: 24px;">
                {{board.name}}
                <q-tooltip>{{board.name}}</q-tooltip>
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
                      <q-item-side icon="mdi-share" />
                      <q-item-main label="Share"/>
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
            <q-icon name="mdi-download" size="20px" color="dark" class="cursor-pointer" @click.native="$emit('import', id)" />
            <span class="text-grey-5 absolute" style="font-size: 10px; bottom: 4px; left: 4px; cursor: default;" v-if='board.appVersion' title="MQTT Tiles version">v.{{board.appVersion}}</span>
            <span class="text-bold text-white absolute bg-purple-6 round-borders q-px-xs" style="font-size: 10px; bottom: 4px; right: 4px; cursor: default;" title="Widgets count">{{board.widgetsIndexes.length}}</span>
          </q-card-main>
        </q-card>
      </div>
    </div>
    <q-toolbar color="white">
      <q-toolbar-title class="text-dark">Boards</q-toolbar-title>
      <slot name="actions"/>
    </q-toolbar>
    <div class="q-px-sm scroll boards__wrapper" :style="{height: isPanelShowed ? 'calc(100% - 199px)' : 'calc(100% - 50px)'}">
      <div v-if="Object.keys(boards).length" class="row">
        <div class="q-pt-md q-px-sm col-xl-4 col-md-6 col-sm-6 col-xs-12" v-for="(board, id) in boards" :key="id">
          <q-card v-click-outside="() => outsideClickHandler(id)">
            <q-item class="q-py-none q-px-sm bg-grey-4">
              <q-item-main class="ellipsis">
                <div class="ellipsis" style="height: 24px; line-height: 24px;">
                  {{board.name}}
                  <q-tooltip>{{board.name}}</q-tooltip>
                </div>
                <div class="ellipsis text-grey-9" style="height: 14px; line-height: 14px; font-size: 14px;">
                  {{board.id}}
                </div>
              </q-item-main>
              <q-item-side v-show="!board.settings.edited">
                <q-btn round dense flat icon="mdi-share" color="dark" @click.native="$emit('share', id)" v-if="canShare">
                  <q-tooltip>Share board</q-tooltip>
                </q-btn>
                <q-btn round dense flat icon="mdi-fullscreen" color="dark" @click.native="$emit('select', id)">
                  <q-tooltip>Show full board</q-tooltip>
                </q-btn>
                <q-btn round dense flat icon="mdi-dots-vertical" color="dark">
                  <q-popover anchor="bottom right" self="top right">
                    <q-list dense>
                      <q-item class="cursor-pointer" v-close-overlay highlight @click.native.stop="$emit('export', id)" v-if="hasConnection">
                        <q-item-side icon="mdi-cloud-upload-outline" />
                        <q-item-main label="Save to broker"/>
                      </q-item>
                      <q-item class="cursor-pointer" v-close-overlay highlight @click.native.stop="$emit('edit', id);">
                        <q-item-side icon="mdi-pencil" />
                        <q-item-main label="Name"/>
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
              <q-item-side v-show="board.settings.edited">
                <q-btn v-if="!!board.id && !board.id.match(/[/+#\s]/g) && (!boards[board.id] || id === board.id) && !!board.name" round dense flat icon="mdi-content-save" color="dark" @click.native="$emit('edit', id);">
                  <q-tooltip>Save board settings</q-tooltip>
                </q-btn>
              </q-item-side>
            </q-item>
            <q-card-separator />
            <q-card-main class="row" :class="{ 'bg-grey-2': !board.shortcutsIndexes.length }" v-if="!board.settings.edited">
              <div class="text-grey-8 col-12 q-mb-sm" style="font-size: 15px;">Shortcuts</div>
              <template v-if="board.shortcutsIndexes.length">
                <div class="col-3 q-px-xs" v-for="(item, index) in [0, 1, 2, 3]" :key="index" style="margin-bottom: 2px;">
                  <component
                    v-if="widgets[board.shortcutsIndexes[index]]"
                    :is="widgets[board.shortcutsIndexes[index]].type"
                    :item="widgets[board.shortcutsIndexes[index]]"
                    :value="values[board.shortcutsIndexes[index]]"
                    @action="(data) => { $emit('action', data) }"
                    :index="board.shortcutsIndexes[index]"
                    :mini="true"
                  />
                </div>
              </template>
              <div v-else class='shortcuts--empty col-12' style="min-height: 84px; margin-bottom: 2px;">
                <div class="text-center text-grey-8 q-mb-sm q-mt-sm" style="font-size: 1.2rem;">You have no shortcuts</div>
                <div class="text-center text-grey-8">You can add one on <q-btn icon="mdi-fullscreen" color="grey-8" size="sm" dense label="full board view" @click="$emit('select', id)" /></div>
              </div>
            </q-card-main>
            <q-card-main v-else>
              <q-input
                  autofocus
                  v-model="board.name"
                  color="dark"
                  :error="!board.name"
                  float-label="Name"
                />
                <q-input
                  v-model="board.id"
                  color="dark"
                  :error="!board.id || !!board.id.match(/[/+#\s]/g) || (boards[board.id] && id !== board.id)"
                  float-label="Sync alias"
                />
            </q-card-main>
          </q-card>
        </div>
      </div>
      <div v-else class="text-dark text-bold wrapper--empty">
        <div class="q-mb-sm">No boards</div>
        <div v-if="!isFrized"><q-btn color="dark" icon="mdi-plus-circle-outline" label="New board" @click="$emit('add')" /></div>
      </div>
    </div>
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
import vClickOutside from 'v-click-outside'
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
  props: ['boards', 'widgets', 'values', 'remoteBoards', 'canShare', 'isFrized', 'hasConnection'],
  data () {
    return {
      isPanelShowed: false
    }
  },
  methods: {
    outsideClickHandler (boardId) {
      if (this.boards[boardId] && this.boards[boardId].settings.edited) { this.$emit('edit', boardId) }
    }
  },
  components: {
    Switcher, Clicker, Informer, Linear, Radial, Singleselect, Slider, Color, StatusIndicator
  },
  directives: {
    clickOutside: vClickOutside.directive
  }
}
</script>
