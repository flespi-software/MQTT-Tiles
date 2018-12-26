<template>
  <div v-if="mini" style="text-align: center;" @click.stop="showTooltip">
    <div style="height: 60px; width: 60px; line-height: 60px; margin: 0 auto; border-radius: 5px;" :class="[`bg-${item.value !== null ? `${item.color}-1` : 'grey-3'}`]">
      <div class='ellipsis' :style="{fontSize: `${stringLength > 5 ? 16 : 18}px`}">
        <span style="font-weight: bold;">{{`${item.settings.prefix}`}}</span>{{`${value}`}}<span style="font-weight: bold;">{{`${item.settings.postfix}`}}</span>
      </div>
      <q-tooltip ref="tooltip">
        <span style="font-weight: bold;">{{`${item.settings.prefix}`}}</span>
        {{`${value}`}}
        <span style="font-weight: bold;">{{`${item.settings.postfix}`}}</span>
      </q-tooltip>
    </div>
    <div class="ellipsis q-mt-sm">{{item.name}}</div>
  </div>
  <q-card v-else inline class="q-ma-sm widget__informer">
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
      <div style="display: inline-flex; align-items: center; justify-content: center; vertical-align: middle; min-width: 200px; width: 100%; min-height: 60px;" :class="[`text-${item.value !== null ? 'dark' : 'grey-5'}`]">
        <span class="informer__payload">
          <span style="font-weight: bold;">{{`${item.settings.prefix}`}}</span>
          {{`${value}`}}
          <span style="font-weight: bold;">{{`${item.settings.postfix}`}}</span>
          <q-tooltip>
            <span style="font-weight: bold;">{{`${item.settings.prefix}`}}</span>
            {{`${value}`}}
            <span style="font-weight: bold;">{{`${item.settings.postfix}`}}</span>
          </q-tooltip>
        </span>
      </div>
    </q-card-media>
  </q-card>
</template>

<style lang="stylus">
  .informer__payload
    font-size 1.2rem
    margin 0px 8px
    max-width 250px
    white-space nowrap
    text-overflow ellipsis
    overflow hidden
</style>

<script>
import { WIDGET_STATUS_DISABLED } from '../../../constants'
export default {
  name: 'Informer',
  props: ['item', 'index', 'mini', 'in-shortcuts'],
  data () {
    return {
      WIDGET_STATUS_DISABLED
    }
  },
  methods: {
    showTooltip () {
      if (this.$q.platform.is.mobile) {
        this.$refs.tooltip.toogle()
      }
    }
  },
  computed: {
    value () {
      let value = this.item.value !== null ? this.item.value.toString() : '*Empty*'
      return value
    },
    stringLength () {
      return this.item.settings.prefix.length + this.value.length + this.item.settings.postfix.length
    }
  }
}
</script>
