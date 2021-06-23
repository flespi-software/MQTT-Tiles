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
  name: 'MapLocation',
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
      const values = this.item.settings.items.reduce((result, item, index) => {
        const latTopic = this.item.settings.topics[index * 2],
          lonTopic = this.item.settings.topics[index * 2 + 1],
          latValue = get(this.value, `[${latTopic.topicFilter}].payload`, null),
          lonValue = get(this.value, `[${lonTopic.topicFilter}].payload`, null)
        let lat = parseFloat(this.getValueByTopic(latValue, latTopic)),
          lon = parseFloat(this.getValueByTopic(lonValue, lonTopic))
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
  mixins: [getValueByTopic]
}
</script>
