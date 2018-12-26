<template>
  <div class="dash__board">
    <settings
      v-model="settingsModel"
      :settings="currentSettings"
      @save="saveSettingsHandler"
      @hide="hideSettingsHandler"
    />
    <q-btn fab color="dark" @click="openSettings" icon="mdi-plus" class="absolute button--add">
      <q-tooltip>Add new widget</q-tooltip>
    </q-btn>
    <q-toolbar color="white">
      <q-btn round flat color="dark" icon="mdi-arrow-left" @click="$emit('close')">
        <q-tooltip>Back to boards list</q-tooltip>
      </q-btn>
      <q-toolbar-title class="text-dark">{{board.name}}</q-toolbar-title>
    </q-toolbar>
    <div class="widgets__wrapper q-px-sm scroll">
      <div class="row" v-if="board.widgetsIndexes.length">
        <div class="widgets__item" v-for="index in board.widgetsIndexes" :key="index">
          <component
            :is="widgets[index].type"
            :item="widgets[index]"
            :index="index"
            :in-shortcuts="Boolean(board.shortcutsIndexes.includes(index))"
            @action="(data) => { $emit('action', data) }"
            @update="editWidgetSettings(index)"
            @delete="$emit('delete:widget', {widgetId: index, settings: widgets[index]})"
            @fast-bind="$emit('fast-bind', index)"
          />
        </div>
      </div>
      <div v-else class="text-center text-grey-8 q-mt-md" style="font-size: 2rem;">
        <div class="text-bold">The board is empty</div>
        <div><q-btn color="dark" icon="mdi-plus-circle-outline" label="Add widget" @click="openSettings" /></div>
      </div>
    </div>
  </div>
</template>

<style lang="stylus">
  .button--add
    bottom 16px
    right 16px
    z-index 1
  .dash__board
    position relative
    .widgets__wrapper
      height calc(100% - 50px)
      padding-bottom 82px
</style>

<script>
import Settings from './widgets/Settings'
import Switcher from './widgets/swither/View'
import Informer from './widgets/informer/View'
import Clicker from './widgets/clicker/View'
export default {
  name: 'Board',
  props: ['board', 'widgets'],
  data () {
    return {
      settingsModel: false,
      currentSettings: undefined,
      editedWidgetId: undefined,
      editedWidgetTopic: undefined
    }
  },
  methods: {
    openSettings () {
      this.settingsModel = true
    },
    hideSettingsHandler () {
      this.currentSettings = undefined
      this.editedWidgetId = undefined
      this.editedWidgetTopic = undefined
    },
    saveSettingsHandler (settings) {
      if (this.editedWidgetId !== undefined) {
        this.$emit('edit:widget', {settings, widgetId: this.editedWidgetId, topic: this.editedWidgetTopic})
      } else {
        this.$emit('add:widget', settings)
      }
    },
    editWidgetSettings (widgetId) {
      this.currentSettings = this.widgets[widgetId]
      this.editedWidgetId = widgetId
      this.editedWidgetTopic = this.currentSettings.topic
      this.openSettings()
    }
  },
  components: {
    Settings, Switcher, Informer, Clicker
  }
}
</script>
