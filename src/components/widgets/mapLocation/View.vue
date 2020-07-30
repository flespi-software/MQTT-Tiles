<template>
  <q-card flat inline class="widget__map-location" style="width: 100%; height: 100%;" :class="[`bg-${item.color}-1`, `${blocked ? 'scroll' : ''}`, `${integration ? '' : 'absolute'}`]">
    <q-item class="q-px-sm q-pt-sm q-pb-none" style="min-height: 0;">
      <q-item-section class="ellipsis" :class="[`text-${item.color}-7`]" style="font-size: .9rem">
        <q-item-label class="ellipsis">{{item.name}}</q-item-label>
        <q-tooltip>{{item.name}}</q-tooltip>
      </q-item-section>
      <transition name="block">
        <q-item-section side v-if="!blocked" style="min-width: 20px;">
          <q-btn size="0.7rem" class="q-pa-none" style="min-height: 1rem;" dense flat icon="mdi-dots-vertical" :color="`${item.color}-7`">
            <q-menu anchor="top right" self="top right" :offset="[8, 8]" style="box-shadow: none;">
              <div class="q-pa-sm" :class="[`bg-${item.color}-1`]">
                <q-btn v-close-popup size="0.7rem" class="q-pa-none q-mr-xs" style="min-height: 1rem;" icon="mdi-content-duplicate" @click="$emit('duplicate')" dense flat :color="`${item.color}-7`">
                  <q-tooltip>Duplicate</q-tooltip>
                </q-btn>
                <q-btn v-close-popup size="0.7rem" class="q-pa-none q-mr-xs" style="min-height: 1rem;" icon="mdi-settings" @click="$emit('update')" dense flat :color="`${item.color}-7`">
                  <q-tooltip>Edit</q-tooltip>
                </q-btn>
                <q-btn v-close-popup size="0.7rem" class="q-pa-none q-mr-xs" style="min-height: 1rem;" icon="mdi-delete-outline" @click="$emit('delete')" dense flat color="red">
                  <q-tooltip>Remove</q-tooltip>
                </q-btn>
                <q-btn v-close-popup size="0.7rem" class="q-pa-none" style="min-height: 1rem;" icon="mdi-close" dense flat :color="`${item.color}-7`"/>
              </div>
            </q-menu>
          </q-btn>
        </q-item-section>
      </transition>
    </q-item>
    <q-card-section class="widget__content scroll q-pa-none" :class="[`bg-${item.color}-1`]" :style="{height: integration ? '' : contentHeight}">
      <div style="width: 100%; height: 100%;">
        <iframe style="width: 100%;height: calc(100% - 18px);" :src="route" frameborder="0" ref="map" allowfullscreen></iframe>
      </div>
      <div class="absolute-top-left q-pa-xs" :class="[`text-${item.color}-7`, `bg-${item.color}-1`]" style="font-size: .8rem; border-bottom-left-radius: 4px;">{{position}}</div>
      <div v-if="item.settings.isNeedTime" class="absolute-bottom-left q-px-xs q-pt-xs" style="font-size: 12px; border-top-right-radius: 5px;" :class="[`text-${item.color}-7`, `bg-${item.color}-1`]">
        {{timestamp}}
      </div>
    </q-card-section>
  </q-card>
</template>

<style lang="stylus">
  .block-leave-to
    transition all .2s ease-in-out
    opacity 0
  .block-leave
    transition all .2s ease-in-out
    opacity 1
  .block-enter
    transition all .2s ease-in-out
    opacity 0
  .block-enter-to
    transition all .2s ease-in-out
    opacity 1
</style>

<script>
import { uid } from 'quasar'
import {
  WIDGET_STATUS_DISABLED
} from '../../../constants'
import getValueByTopic from '../../../mixins/getValueByTopic.js'
import timestamp from '../../../mixins/timestamp.js'
export default {
  name: 'MapLocation',
  props: ['item', 'index', 'mini', 'in-shortcuts', 'value', 'blocked', 'integration'],
  data () {
    const salt = uid()
    return {
      route: `https://flespi.io/mapview/#/salt/${salt}`,
      salt,
      WIDGET_STATUS_DISABLED,
      prevPosition: []
    }
  },
  computed: {
    position () {
      let values = []
      if (this.integration) {
        const dataTopic = this.item.dataTopics[0],
          topicFilter = dataTopic.topicFilter,
          latDataTopic = { ...dataTopic, payloadField: this.item.settings.latField },
          lonDataTopic = { ...dataTopic, payloadField: this.item.settings.lonField }
        values = [
          parseFloat(this.getValueByTopic(this.value[topicFilter] && this.value[topicFilter].payload, latDataTopic)),
          parseFloat(this.getValueByTopic(this.value[topicFilter] && this.value[topicFilter].payload, lonDataTopic))
        ]
      } else {
        const latTopic = this.item.settings.topics[0],
          lonTopic = this.item.settings.topics[1],
          lat = parseFloat(this.getValueByTopic(this.value[latTopic.topicFilter] && this.value[latTopic.topicFilter].payload, latTopic)),
          lon = parseFloat(this.getValueByTopic(this.value[lonTopic.topicFilter] && this.value[lonTopic.topicFilter].payload, lonTopic))
        values = [lat, lon]
      }
      const isValueSame = values[0] === this.prevPosition[0] && values[1] === this.prevPosition[1]
      !isValueSame && this.setPosition(values)
      return values
    },
    contentHeight () {
      let height = 'calc(100% - 44px)'
      if (!this.item.name && this.blocked) {
        height = 'calc(100% - 11px)'
      }
      return height
    }
  },
  methods: {
    setPosition (position) {
      if (position[0] && position[1]) {
        this.$refs.map && this.$refs.map.contentWindow.postMessage(`MapView-${this.salt}|cmd:{"addmarkers": ${JSON.stringify([position])}, "clear": "all", "fullscreencontrol": true}`, '*')
      }
      this.prevPosition = position
    }
  },
  created () {
    window.addEventListener('message', (e) => {
      if (e.data === `MapView-${this.salt}|state:{"ready": true}`) {
        this.setPosition(this.position)
      }
    })
  },
  mixins: [getValueByTopic, timestamp]
}
</script>
