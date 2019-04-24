<template>
  <div>
    <div class="row">
      <div class="q-mt-sm col-12">
        <q-select color="dark" v-model="currentSettings.type" :options="typeOptions" float-label="Widget multiplie type" />
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
import { WIDGET_STATUS_DISABLED } from '../../../constants'
export default {
  name: 'MultiplierSchema',
  props: ['widget'],
  data () {
    let defaultSettings = {
      type: '',
      widgetSettings: {},
      height: 4,
      width: 2,
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
        {label: 'Radio button', value: 'singleselect'}
      ],
      colors: ['grey', 'red', 'green', 'orange', 'blue', 'light-blue']
    }
  },
  computed: {
    schemaWidget () {
      return {
        name: 'Multiplier',
        color: this.currentSettings.color,
        type: this.currentSettings.type,
        topics: [],
        dataTopics: [], // topics for datasource
        settings: this.currentSettings.widgetSettings,
        status: WIDGET_STATUS_DISABLED
      }
    }
  },
  created () {
    this.$emit('update', this.currentSettings)
  },
  methods: {
    updateSettingsHandler (settings) {
      Vue.set(this.currentSettings, 'widgetSettings', {})
      Vue.set(this.currentSettings, 'widgetSettings', settings)
    },
    setColor (color) {
      Vue.set(this.currentSettings, 'color', color)
    },
    validateSchemas (status) {
      this.$emit('validate', status)
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
    Switcher, Informer, Radial, Linear, Singleselect
  }
}
</script>
