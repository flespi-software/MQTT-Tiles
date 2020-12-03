<template>
  <div>
    <div class="row">
      <div class="q-mb-sm col-12" v-if="widget.topics.length && widget.topics[0] && widget.topics[0].split('/').length">
        <div class="q-mb-sm text-grey-9">Group layer</div>
        <div
          v-for="(path, index) in widget.topics[0].split('/')"
          :key="`${index}${path}`"
          :class="{'bg-grey-9 text-white': currentSettings.groupLayout >= index, 'text-grey-9 bg-grey-3': currentSettings.groupLayout < index}"
          class="q-mr-xs q-pa-xs rounded-borders cursor-pointer inline-block"
          @click="setGroupLayer(index)"
        >
          {{path}}
        </div>
      </div>
      <q-input outlined dense hide-bottom-space v-model="currentSettings.nameField" v-if="widget.dataTopics[0] && widget.dataTopics[0].payloadType === 1" label="Widget`s name field" class="col-12 q-mb-sm" color="grey-9"/>
      <q-input outlined dense hide-bottom-space v-model="currentSettings.math" label="Multiplied widget render logic" class="col-12 q-mb-sm" color="grey-9" hint="You can use math logic to define what values to show in the widget. Example: `%value% > 1000` or `<%jsons-some-field%> != nill`, where %value% is a payload and <%jsons-some-field%> is a JSON field from your subscription."/>
      <div class="q-mb-sm col-12">
        <q-select outlined dense hide-bottom-space color="grey-9" v-model="currentSettings.type" :options="typeOptions" @input="currentSettings.widgetSettings = {}" emit-value map-options label="Widget multiplier type" />
      </div>
      <div class="color-palette q-pa-sm rounded-borders q-mb-lg col-12">
        <div class="text-grey-9 q-pb-sm color-palette__label">Widgets color</div>
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
    const defaultSettings = {
      type: '',
      groupLayout: 0,
      widgetSettings: {},
      topics: [],
      nameField: '',
      math: '',
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
        { label: 'Toggle', value: 'switcher' },
        { label: 'Text', value: 'informer' },
        { label: 'Radial gauge', value: 'radial' },
        { label: 'Linear gauge', value: 'linear' },
        { label: 'Radio button', value: 'singleselect' },
        { label: 'Complex', value: 'complex' },
        { label: 'Location', value: 'map-location' },
        { label: 'Route', value: 'map-route' }
      ],
      colors: ['grey', 'red', 'green', 'orange', 'blue', 'light-blue', 'purple', 'deep-orange', 'cyan', 'brown', 'blue-grey']
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
