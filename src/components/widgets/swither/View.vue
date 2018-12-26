<template>
  <div v-if="mini" style="text-align: center;" @click.stop="actionHandler">
    <div style="height: 60px; width: 60px; line-height: 60px; margin: 0 auto; border-radius: 5px;" :class="[`bg-${item.value !== null ? `${item.color}-1` : 'grey-3'}`]">
      <q-icon
        size="3rem"
        :color="item.value !== null ? `${item.color}-7` : 'grey-5'"
        :name="value ? 'mdi-toggle-switch-outline' : 'mdi-toggle-switch-off-outline'"
        :class="[`${value === null ? 'disabled' : 'cursor-pointer'}`]"
      />
    </div>
    <div class="ellipsis q-mt-sm">{{item.name}}</div>
  </div>
  <q-card v-else inline class="q-ma-sm widget__switcher" style="max-width: 200px;">
    <q-item class="q-py-none q-px-sm" :class="[`bg-${item.color}-7`]">
      <q-item-main class="ellipsis text-white">
        {{item.name}}
        <q-tooltip>{{item.name}}</q-tooltip>
      </q-item-main>
      <q-item-side>
        <q-btn :icon="inShortcuts ? 'mdi-star' : 'mdi-star-outline'" @click="$emit('fast-bind')" round dense flat :color="inShortcuts ? 'yellow' : 'white'">
          <q-tooltip>{{`${inShortcuts ? 'Remove from' : 'Add to'} shortcuts`}}</q-tooltip>
        </q-btn>
        <q-btn round dense flat icon="mdi-dots-vertical" color="white">
          <q-popover anchor="bottom right" self="top right">
            <q-list dense>
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
    <q-card-media :class="[`bg-${item.color}-1`]">
      <q-icon
        @click.native="actionHandler"
        size="3.8rem"
        :color="item.value !== null ? `${item.color}-7` : 'grey-5'"
        :name="value ? 'mdi-toggle-switch-outline' : 'mdi-toggle-switch-off-outline'"
        style="min-width: 200px; min-height: 60px;"
        :class="[`${value === null ? 'disabled' : 'cursor-pointer'}`]"
      />
    </q-card-media>
  </q-card>
</template>

<script>
import { WIDGET_STATUS_DISABLED } from '../../../constants'
export default {
  name: 'Switcher',
  props: ['item', 'index', 'mini', 'in-shortcuts'],
  data () {
    return {
      WIDGET_STATUS_DISABLED
    }
  },
  computed: {
    value () {
      let value = this.item.value !== null ? this.item.value.toString() : this.item.value
      return value === this.item.settings.trueValue
        ? true : value === this.item.settings.falseValue
          ? false : null
    }
  },
  methods: {
    getValue () {
      let value = this.item.value !== null ? this.item.value.toString() : this.item.value
      return value === this.item.settings.trueValue
        ? this.item.settings.falseValue : value === this.item.settings.falseValue
          ? this.item.settings.trueValue : value
            ? this.item.settings.falseValue : this.item.settings.trueValue
    },
    actionHandler () {
      if (this.value !== null) {
        let data = {topic: this.item.topic, payload: this.getValue(), settings: {retain: this.item.settings.save}}
        this.$emit('action', data)
      }
    }
  }
}
</script>
