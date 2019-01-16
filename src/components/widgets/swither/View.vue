<template>
  <div v-if="mini" style="text-align: center;" @click.stop="actionHandler">
    <div style="height: 60px; width: 60px; line-height: 60px; margin: 0 auto; border-radius: 5px;" :class="[`bg-${currentValue !== null ? `${item.color}-1` : 'grey-3'}`]">
      <q-icon
        size="3rem"
        :color="item.currentValue !== null ? `${item.color}-7` : 'grey-5'"
        :name="currentValue ? 'mdi-toggle-switch-outline' : 'mdi-toggle-switch-off-outline'"
        :class="[`${currentValue === null ? 'disabled' : !item.settings.actionTopic ? '' : 'cursor-pointer'}`]"
      />
    </div>
    <div class="ellipsis q-mt-sm">{{item.name}}</div>
  </div>
  <q-card v-else inline class="widget__switcher" style="width: 100%; height: 100%;">
    <q-item class="q-py-none q-px-sm" :class="[`bg-${item.color}-7`]">
      <q-item-main class="ellipsis text-white">
        {{item.name}}
        <q-tooltip>{{item.name}}</q-tooltip>
      </q-item-main>
      <q-item-side>
        <q-btn v-if="item.settings.width !== 1" :icon="inShortcuts ? 'mdi-star' : 'mdi-star-outline'" @click="$emit('fast-bind')" round dense flat :color="inShortcuts ? 'yellow' : 'white'">
          <q-tooltip>{{`${inShortcuts ? 'Remove from' : 'Add to'} shortcuts`}}</q-tooltip>
        </q-btn>
        <q-btn round dense flat icon="mdi-dots-vertical" color="white">
          <q-popover anchor="bottom right" self="top right">
            <q-list dense>
              <q-item v-if="item.settings.width === 1" class="cursor-pointer" v-close-overlay highlight @click.native="$emit('fast-bind')">
                <q-item-side :icon="inShortcuts ? 'mdi-star' : 'mdi-star-outline'" :color="inShortcuts ? 'yellow-9' : 'dark'"/>
                <q-item-main :label="`${inShortcuts ? 'Remove from' : 'Add to'} shortcuts`"/>
              </q-item>
              <q-item class="cursor-pointer" v-close-overlay highlight @click.native="$emit('update')">
                <q-item-side icon="mdi-settings" />
                <q-item-main label="Edit"/>
              </q-item>
              <q-item-separator/>
              <q-item class="cursor-pointer" v-close-overlay highlight @click.native="$emit('delete')">
                <q-item-side color="red" icon="mdi-delete-outline" />
                <q-item-main label="Remove"/>
              </q-item>
            </q-list>
          </q-popover>
        </q-btn>
      </q-item-side>
    </q-item>
    <q-card-media class="widget__content" :class="[`bg-${item.color}-1`]" style="height: calc(100% - 40px);">
      <q-icon
        @click.native.stop="actionHandler"
        size="3.8rem"
        :color="item.currentValue !== null ? `${item.color}-7` : 'grey-5'"
        :name="currentValue ? 'mdi-toggle-switch-outline' : 'mdi-toggle-switch-off-outline'"
        style="width: 100%; height: 100%;"
        :class="[`${currentValue === null ? 'disabled' : !item.settings.actionTopic ? '' : 'cursor-pointer'}`]"
      />
    </q-card-media>
  </q-card>
</template>

<script>
import { WIDGET_STATUS_DISABLED } from '../../../constants'
export default {
  name: 'Switcher',
  props: ['item', 'index', 'value', 'mini', 'in-shortcuts'],
  data () {
    return {
      WIDGET_STATUS_DISABLED
    }
  },
  computed: {
    currentValue () {
      return Object.keys(this.value).reduce((result, topic) => {
        if (result === null) { return result }
        let value = this.value[topic] !== null ? this.value[topic].toString() : this.value[topic]
        return value === this.item.settings.trueValue
          ? result && true : value === this.item.settings.falseValue
            ? result && false : null
      }, true)
    }
  },
  methods: {
    getValue () {
      return Object.keys(this.value).reduce((result, topic) => {
        let value = this.value[topic] !== null ? this.value[topic].toString() : this.value[topic]
        return (value === this.item.settings.trueValue) && (result === this.item.settings.trueValue)
          ? this.item.settings.falseValue : (value === this.item.settings.falseValue) && (result === this.item.settings.falseValue)
            ? this.item.settings.trueValue : value
              ? this.item.settings.falseValue : this.item.settings.trueValue
      }, this.item.settings.falseValue)
    },
    actionHandler () {
      if (this.currentValue !== null && !!this.item.settings.actionTopic) {
        let data = {topic: this.item.settings.actionTopic, payload: this.getValue(), settings: {retain: this.item.settings.save}}
        this.$emit('action', data)
      }
    }
  }
}
</script>
