<template>
  <div style="width: 100%; height: 100%;">
    <iframe style="width: 100%;height: 100%;" :src="route" frameborder="0" ref="map" allowfullscreen></iframe>
    <div class="absolute-top-left q-pa-xs hidden" :class="[`text-${item.color}-7`, `bg-${item.color}-1`]" style="font-size: .8rem; border-bottom-left-radius: 4px;">{{positions}}</div>
  </div>
</template>

<script>
import { uid } from 'quasar'
import get from 'lodash/get'
import {
  WIDGET_STATUS_DISABLED
} from '../../../constants'
import getValueByTopic from '../../../mixins/getValueByTopic.js'
export default {
  name: 'MapDevices',
  props: ['item', 'index', 'mini', 'value', 'blocked'],
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
      let values = {}
      if (this.item.settings.topics.length > 0) {
        Object.keys(this.value).forEach(k => {
          if (this.value[k]) {
            Object.keys(this.value[k]).forEach(id => {
              if (this.value[k][id].position && this.value[k][id].position.payload.length > 0) {
                let p = JSON.parse(this.value[k][id].position.payload)
                if (!this.prevPositions[id] || this.prevPositions[id][0] !== p.latitude || this.prevPositions[id][1] !== p.longitude) {
                  values[id] = {latlng: [p.latitude, p.longitude]}
                  if (p.direction) {
                    values[id].direction = p.direction
                  }
                  this.prevPositions[id] = values[id].latlng
                  if (this.value[k][id]['device.name'] && this.value[k][id]['device.name'].payload.length > 0) {
                    values[id].label = this.value[k][id]['device.name'].payload.toString()
                  }
                }
              }
            })
          }
        })
      }
      this.setPosition(values)
      return values
    }
  },
  methods: {
    init () {
      this.prevPositions = {}
      this.$refs.map && this.$refs.map.contentWindow.postMessage(`MapView-${this.salt}|cmd:{"clear": "all", "fullscreencontrol": true}`, '*')
    },
    setPosition (positions) {
      this.$refs.map && this.$refs.map.contentWindow.postMessage(`MapView-${this.salt}|cmd:{"namedmarkers": ${JSON.stringify(positions)}}`, '*')
    }
  },
  watch: {
    'item.settings.topics' () {
      this.init()
      this.setPosition(this.positions)
    }
  },
  created () {
    window.addEventListener('message', (e) => {
      if (e.data === `MapView-${this.salt}|state:{"ready": true}`) {
        this.init()
        this.setPosition(this.positions)
      }
    })
  },
  mixins: [getValueByTopic]
}
</script>
