<template>
  <q-card flat inline class="widget__map-location absolute" style="width: 100%; height: 100%;" :class="[`bg-${item.color}-1`, `${blocked ? 'scroll' : ''}`]">
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
    <q-card-section class="widget__content scroll q-pa-none" :class="[`bg-${item.color}-1`]" :style="{height: contentHeight}">
      <div style="width: 100%; height: 100%;">
        <iframe style="width: 100%;height: calc(100% - 18px);" :src="route" frameborder="0" ref="map" allowfullscreen></iframe>
      </div>
      <div class="absolute-top-left q-pa-xs hidden" :class="[`text-${item.color}-7`, `bg-${item.color}-1`]" style="font-size: .8rem; border-bottom-left-radius: 4px;">{{positions}}</div>
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
  props: ['item', 'index', 'mini', 'in-shortcuts', 'value', 'blocked'],
  data () {
    const salt = uid()
    return {
      route: `https://flespi.io/mapview/#/salt/${salt}`,
      salt,
      WIDGET_STATUS_DISABLED,
      prevPositions: {}
    }
  },
  computed: {
    positions () {
      const values = this.item.settings.items.reduce((result, item) => {
        const latTopic = item.lat,
          lonTopic = item.lon
        let lat = parseFloat(this.getValueByTopic(this.value[latTopic.topicFilter] && this.value[latTopic.topicFilter].payload, latTopic)),
          lon = parseFloat(this.getValueByTopic(this.value[lonTopic.topicFilter] && this.value[lonTopic.topicFilter].payload, lonTopic))
        if (lat && lon) {
          result[item.name] = { latlng: [lat, lon], title: [lat, lon], label: item.name }
        } else if (this.prevPositions[item.name] && this.prevPositions[item.name].lat && this.prevPositions[item.name].lon) {
          lat = this.prevPositions[item.name].lat
          lon = this.prevPositions[item.name].lon
          result[item.name] = { latlng: [lat, lon], title: [lat, lon], label: item.name }
        }
        return result
      }, {})
      this.setPosition(values)
      return values
    },
    contentHeight () {
      let height = 'calc(100% - 34px)'
      if (!this.item.name && this.blocked) {
        height = 'calc(100% - 11px)'
      }
      return height
    }
  },
  methods: {
    setPosition (positions) {
      this.$refs.map && this.$refs.map.contentWindow.postMessage(`MapView-${this.salt}|cmd:{"namedmarkers": ${JSON.stringify(positions)}, "clear": "all", "fullscreencontrol": true}`, '*')
      this.prevPositions = positions
    }
  },
  watch: {
    'item.settings.items' () {
      this.setPosition(this.positions)
    }
  },
  created () {
    window.addEventListener('message', (e) => {
      if (e.data === `MapView-${this.salt}|state:{"ready": true}`) {
        this.setPosition(this.positions)
      }
    })
  },
  mixins: [getValueByTopic, timestamp]
}
</script>
