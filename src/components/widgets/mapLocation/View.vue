<template>
  <q-card flat inline class="widget__map-location" style="width: 100%; height: 100%;" :class="[`bg-${item.color}-1`, `${blocked ? 'scroll' : ''}`, `${integration ? '' : 'absolute'}`]">
    <q-item class="q-px-sm q-pt-sm q-pb-none" style="min-height: 0;">
      <q-item-main class="ellipsis" :class="[`text-${item.color}-7`]" style="font-size: .9rem">
        {{item.name}}
        <q-tooltip>{{item.name}}</q-tooltip>
      </q-item-main>
      <transition name="block">
        <q-item-side v-if="!blocked" style="min-width: 20px;">
          <q-btn size="0.9rem" class="q-pa-none" style="min-height: 1rem;" dense flat icon="mdi-dots-vertical" :color="`${item.color}-7`">
            <q-popover anchor="top right" self="top right" :offset="[8, 8]" style="box-shadow: none;">
              <div class="q-pa-sm" :class="[`bg-${item.color}-1`]">
                <q-btn v-close-overlay size="0.9rem" class="q-pa-none q-mr-xs" style="min-height: 1rem;" icon="mdi-content-duplicate" @click="$emit('duplicate')" dense flat :color="`${item.color}-7`">
                  <q-tooltip>Duplicate</q-tooltip>
                </q-btn>
                <q-btn v-close-overlay size="0.9rem" class="q-pa-none q-mr-xs" style="min-height: 1rem;" icon="mdi-settings" @click="$emit('update')" dense flat :color="`${item.color}-7`">
                  <q-tooltip>Edit</q-tooltip>
                </q-btn>
                <q-btn v-close-overlay size="0.9rem" class="q-pa-none q-mr-xs" style="min-height: 1rem;" icon="mdi-delete-outline" @click="$emit('delete')" dense flat color="red">
                  <q-tooltip>Remove</q-tooltip>
                </q-btn>
                <q-btn v-close-overlay size="0.9rem" class="q-pa-none" style="min-height: 1rem;" icon="mdi-close" dense flat :color="`${item.color}-7`"/>
              </div>
            </q-popover>
          </q-btn>
        </q-item-side>
      </transition>
    </q-item>
    <q-card-media class="widget__content scroll" :class="[`bg-${item.color}-1`]" :style="{height: integration ? '' : 'calc(100% - 29px)'}">
      <div style="width: 100%; height: 100%;">
        <iframe style="width: 100%;height: calc(100% - 18px);" src="https://flespi.io/mapview" frameborder="0" ref="map" allowfullscreen></iframe>
      </div>
      <div class="absolute-top-left q-pa-xs" :class="[`text-${item.color}-7`, `bg-${item.color}-1`]" style="font-size: .8rem; border-bottom-left-radius: 4px;">{{position}}</div>
      <div v-if="item.settings.isNeedTime" class="absolute-bottom-left q-px-xs q-pt-xs" style="font-size: 12px; border-top-right-radius: 5px;" :class="[`text-${item.color}-7`, `bg-${item.color}-1`]">
        {{timestamp}}
      </div>
    </q-card-media>
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
import {
  WIDGET_STATUS_DISABLED
} from '../../../constants'
import getValueByTopic from '../../../mixins/getValueByTopic.js'
import timestamp from '../../../mixins/timestamp.js'
export default {
  name: 'MapLocation',
  props: ['item', 'index', 'mini', 'in-shortcuts', 'value', 'blocked', 'integration'],
  data () {
    return {
      WIDGET_STATUS_DISABLED,
      prevPosition: []
    }
  },
  computed: {
    position () {
      let values = []
      if (this.integration) {
        let dataTopic = this.item.dataTopics[0],
          topicFilter = dataTopic.topicFilter,
          latDataTopic = {...dataTopic, payloadField: this.item.settings.latField},
          lonDataTopic = {...dataTopic, payloadField: this.item.settings.lonField}
        values = [
          parseFloat(this.getValueByTopic(this.value[topicFilter] && this.value[topicFilter].payload, latDataTopic)),
          parseFloat(this.getValueByTopic(this.value[topicFilter] && this.value[topicFilter].payload, lonDataTopic))
        ]
      } else {
        let latTopic = this.item.settings.topics[0],
          lonTopic = this.item.settings.topics[1],
          lat = parseFloat(this.getValueByTopic(this.value[latTopic.topicFilter] && this.value[latTopic.topicFilter].payload, latTopic)),
          lon = parseFloat(this.getValueByTopic(this.value[lonTopic.topicFilter] && this.value[lonTopic.topicFilter].payload, lonTopic))
        values = [lat, lon]
      }
      let isValueSame = values[0] === this.prevPosition[0] && values[1] === this.prevPosition[1]
      !isValueSame && this.setPosition(values)
      return values
    }
  },
  methods: {
    setPosition (position) {
      if (position[0] && position[1]) {
        this.$refs.map && this.$refs.map.contentWindow.postMessage(`MapView|cmd:{"addmarkers": ${JSON.stringify([position])}, "clear": "all", "fullscreencontrol": true}`, '*')
      }
      this.prevPosition = position
    }
  },
  created () {
    window.addEventListener('message', (e) => {
      if (e.data === 'MapView|state:{"ready": true}') {
        this.setPosition(this.position)
      }
    })
  },
  mixins: [getValueByTopic, timestamp]
}
</script>
