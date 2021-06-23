<template>
  <div style="width: 100%; height: 100%;">
    <iframe style="width: 100%;height: 100%;" :src="route" frameborder="0" ref="map" allowfullscreen></iframe>
  </div>
</template>

<script>
import { uid } from 'quasar'
import {
  WIDGET_STATUS_DISABLED
} from '../../../constants'
import getValueByTopic from '../../../mixins/getValueByTopic.js'
export default {
  name: 'MapRoute',
  props: ['item', 'index', 'mini', 'value', 'blocked'],
  data () {
    const salt = uid()
    return {
      route: `https://flespi.io/mapview/#/salt/${salt}`,
      salt,
      WIDGET_STATUS_DISABLED,
      prevRoute: []
    }
  },
  methods: {
    setRoutes (routes) {
      this.$refs.map && this.$refs.map.contentWindow.postMessage(`MapView-${this.salt}|cmd:{"addgroutes": ${JSON.stringify(routes)}, "clear": "all", "fullscreencontrol": true}`, '*')
      this.prevRoute = routes
    },
    getRoutes () {
      const routes = this.item.settings.items.reduce((values, item, index) => {
        const routeTopic = this.item.settings.topics[index]
        let value = this.getValueByTopic(this.value[routeTopic.topicFilter] && this.value[routeTopic.topicFilter].payload, routeTopic)
        value = value === 'N/A' ? '' : value
        if (Array.isArray(value)) {
          values = [...values, ...value]
        } else {
          values.push(value)
        }
        return values
      }, [])
      return routes
    }
  },
  created () {
    window.addEventListener('message', (e) => {
      if (e.data === `MapView-${this.salt}|state:{"ready": true}`) {
        this.setRoutes(this.getRoutes())
      }
    })
  },
  mixins: [getValueByTopic],
  watch: {
    value: {
      deep: true,
      handler (value) {
        const route = this.getRoutes()
        if (route.length !== this.prevRoute.length || this.prevRoute.some((el, index) => el !== route[index])) {
          this.setRoutes(this.getRoutes())
        }
      }
    },
    'item.settings.topics' () {
      this.setRoutes(this.getRoutes())
    }
  }
}
</script>
