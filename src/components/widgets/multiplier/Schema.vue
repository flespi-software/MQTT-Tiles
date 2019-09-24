<template>
  <div>
    <div class="row">
      <div class="q-mt-sm col-12" v-if="widget.topics.length && widget.topics[0].split('/')">
        <div class="q-mb-sm text-dark">Group layer</div>
        <div
          v-for="(path, index) in widget.topics[0].split('/')"
          :key="`${index}${path}`"
          :class="{'bg-dark text-white': currentSettings.groupLayout >= index, 'text-dark bg-grey-3': currentSettings.groupLayout < index}"
          class="q-mr-xs q-pa-xs round-borders cursor-pointer inline-block"
          @click="setGroupLayer(index)"
        >
          {{path}}
        </div>
      </div>
      <q-input v-model="currentSettings.nameField" v-if="widget.dataTopics[0] && widget.dataTopics[0].payloadType === 1" float-label="Widget`s name field" class="col-12" color="dark"/>
      <div class="q-mt-sm col-12">
        <q-select color="dark" v-model="currentSettings.type" :options="typeOptions" @input="currentSettings.widgetSettings = {}" float-label="Widget multiplier type" />
      </div>
      <div class="color-palette col-12">
        <div class="text-grey-6 q-pb-sm color-palette__label">Color</div>
        <div class="row color-palette__wrapper">
          <span
            v-for="color in colors"
            :key="color"
            :class="[`bg-${color}`]"
            class="q-mr-sm cursor-pointer color-palette__item"
            @click="setColor(color)"
          >
            <q-icon class="item__icon" size="1.4rem" v-if="color === currentSettings.color" name="mdi-check" color="white"/>
          </span>
        </div>
      </div>
      <div class="q-mt-sm col-12">
        <component
          :is="currentSettings.type"
          :widget="schemaWidget"
          :board="board"
          :integration="true"
          @update="updateSettingsHandler"
          @validate="validateSchemas"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import validateTopic from '../../../mixins/validateTopic.js'
import Switcher from '../switcher/Schema'
import Informer from '../informer/Schema'
import Radial from '../radial/Schema'
import Linear from '../linear/Schema'
import Singleselect from '../singleselect/Schema'
import Complex from '../complex/Schema'
import MapLocation from '../mapLocation/Schema'
import MapRoute from '../mapRoute/Schema'
import { WIDGET_STATUS_DISABLED } from '../../../constants'
export default {
  name: 'MultiplierSchema',
  props: ['widget', 'board'],
  data () {
    let defaultSettings = {
      type: '',
      groupLayout: 0,
      widgetSettings: {},
      topics: [],
      nameField: '',
      height: 8,
      width: 5,
      maxTopicsLength: 1,
      minWidth: 1,
      minHeight: 2,
      color: 'grey'
    }
    return {
      defaultSettings,
      currentSettings: Object.assign({}, defaultSettings, this.widget.settings),
      typeOptions: [
        {label: 'Toggle', value: 'switcher'},
        {label: 'Text', value: 'informer'},
        {label: 'Radial gauge', value: 'radial'},
        {label: 'Linear gauge', value: 'linear'},
        {label: 'Radio button', value: 'singleselect'},
        {label: 'Complex', value: 'complex'},
        {label: 'Location', value: 'map-location'},
        {label: 'Route', value: 'map-route'}
      ],
      colors: ['grey', 'red', 'green', 'orange', 'blue', 'light-blue']
    }
  },
  computed: {
    schemaWidget () {
      this.updateTopics()
      return {
        name: 'Multiplier',
        parentType: this.widget.type,
        color: this.currentSettings.color,
        type: this.currentSettings.type,
        topics: [],
        dataTopics: this.widget.dataTopics, // topics for datasource
        settings: this.currentSettings.widgetSettings,
        status: WIDGET_STATUS_DISABLED
      }
    }
  },
  created () {
    this.$emit('update', this.currentSettings)
  },
  methods: {
    updateTopics () {
      this.$set(this.currentSettings, 'topics', this.currentSettings.widgetSettings.topics)
    },
    updateSettingsHandler (settings) {
      Vue.set(this.currentSettings, 'widgetSettings', {})
      Vue.set(this.currentSettings, 'widgetSettings', settings)
    },
    setColor (color) {
      Vue.set(this.currentSettings, 'color', color)
    },
    validateSchemas (status) {
      this.$emit('validate', status)
    },
    setGroupLayer (index) {
      this.$set(this.currentSettings, 'groupLayout', index)
    }
  },
  watch: {
    currentSettings: {
      deep: true,
      handler (val) { this.$emit('update', val) }
    }
  },
  mixins: [validateTopic],
  components: {
    Switcher, Informer, Radial, Linear, Singleselect, Complex, MapLocation, MapRoute
  }
}
</script>
