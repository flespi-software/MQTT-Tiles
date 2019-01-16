<template>
  <div v-if="mini" style="text-align: center;" @click.stop="showTooltip">
    <div style="height: 60px; width: 60px; line-height: 60px; margin: 0 auto; border-radius: 5px;" :class="[`bg-${firstValue !== null ? `${item.color}-1` : 'grey-3'}`]">
      <div class='ellipsis' :style="{fontSize: `${stringLength > 5 ? 16 : 18}px`}">
        <span style="font-weight: bold;">{{`${item.settings.prefix}`}}</span>{{`${firstValue}`}}<span style="font-weight: bold;">{{`${item.settings.postfix}`}}</span>
      </div>
      <q-tooltip ref="tooltip">
        <span style="font-weight: bold;">{{`${item.settings.prefix}`}}</span>
        {{`${firstValue}`}}
        <span style="font-weight: bold;">{{`${item.settings.postfix}`}}</span>
      </q-tooltip>
    </div>
    <div class="ellipsis q-mt-sm">{{item.name}}</div>
  </div>
  <q-card v-else inline class="widget__informer" style="width: 100%; height: 100%;">
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
      <div style="width: 100%; height: 100%;">
        <div class="informer__payload">
          <div v-for="topic in Object.keys(value)" :key="topic" :class="[`text-${value[topic] !== null ? 'dark' : 'grey-5'}`]">
            <span style="font-weight: bold;">{{`${item.settings.prefix}`}}</span>
            {{`${value[topic] !== null ? value[topic] : 'N/A'}`}}
            <span style="font-weight: bold;">{{`${item.settings.postfix}`}}</span>
            <q-tooltip>
              <span style="font-weight: bold;">{{`${item.settings.prefix}`}}</span>
              {{`${value[topic] !== null ? value[topic] : 'N/A'}`}}
              <span style="font-weight: bold;">{{`${item.settings.postfix}`}}</span>
            </q-tooltip>
          </div>
        </div>
      </div>
    </q-card-media>
  </q-card>
</template>

<style lang="stylus">
  .informer__payload
    font-size 1.2rem
    word-break break-all
    overflow auto
    height calc(100% - 15px)
    width 100%
    display block
    padding 2px 4px
    text-align center
</style>

<script>
import { WIDGET_STATUS_DISABLED } from '../../../constants'
export default {
  name: 'Informer',
  props: ['item', 'index', 'mini', 'in-shortcuts', 'value'],
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
    firstValue () {
      let value = this.value[Object.keys(this.value)[0]]
      value = value !== null ? value.toString() : 'N/A'
      return value
    },
    stringLength () {
      return this.item.settings.prefix.length + this.firstValue.length + this.item.settings.postfix.length
    }
  }
}
</script>
