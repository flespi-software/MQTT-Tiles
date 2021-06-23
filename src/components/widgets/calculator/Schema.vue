<template>
  <div>
    <div class="row q-mt-lg">
      <div class="calculator__items-wrapper col-12 relative-position q-mb-sm">
        <q-list bordered>
          <q-item-label class="q-py-md q-px-sm list__header" :class="{'text-red-6': !currentSettings.variables.length}">
            Variables{{currentSettings.variables.length ? '' : ' are empty'}}
             <q-btn color="grey-9" class="absolute-right" @click="addItem" icon="mdi-plus" flat label="ADD"/>
          </q-item-label>
          <q-expansion-item
            v-for="(item, index) in currentSettings.variables"
            :key="`${index}`"
            group="variables"
            :header-class="[isitemValid(index) ? 'bg-purple-2' : 'bg-red-2']"
            expand-icon="mdi-cog"
            :value="index === currentSettings.variables.length - 1"
          >
            <template slot="header">
              <q-item-section side>
                <div>
                  <q-btn :disabled="index === 0" round dense flat class="col-1" @click.stop="upItem(index)" icon="mdi-arrow-up"/>
                  <q-btn :disabled="index === (currentSettings.variables.length - 1)" round dense flat class="col-1" @click.stop="downItem(index)" icon="mdi-arrow-down"/>
                </div>
              </q-item-section>
              <q-item-section><span class="ellipsis full-width">{{item.name || 'New item'}}</span></q-item-section>
              <q-item-section side>
                <q-btn flat color="red-6" round dense @click="removeItem(index)" icon="mdi-delete"/>
              </q-item-section>
            </template>
            <div class="row q-pa-sm">
              <q-input outlined dense hide-bottom-space class="col-12 q-mb-xs" color="grey-9" v-model="item.name" label="Name" autofocus/>
              <q-input outlined dense hide-bottom-space class="col-8 q-pr-xs q-mb-sm" color="grey-9" v-model="item.math" label="Math expression"/>
              <q-select outlined dense hide-bottom-space class="col-4 q-mb-sm" color="grey-9" v-model="item.valueFormat" :options="formatOptions" emit-value map-options label="Format value as"/>
              <q-input outlined dense hide-bottom-space class="col-12 q-mb-xs" color="grey-9" v-if="item.valueFormat === constants.WIDGET_VALUE_FORMAT_DATE" v-model="item.dateFormat" label="Datetime format" placeholder="DD/MM/YYYY HH:mm:ss.SSS"/>
              <div class="col-12 text-grey-7 q-px-sm q-mb-sm" style="font-size: 12px; line-height: 1.2;">
                You can use math expressions to calculate the final value. Example:
                (%topic[1]% - %variable[var1]% * 1000) / 1024, where %topic1% is the payload from your subscription by first topic (if need field from JSON %topic[1]($.somefield)%), %variable[var1]% is calculated value of variable with name var1.
              </div>
            </div>
          </q-expansion-item>
        </q-list>
      </div>
      <q-input type="textarea" outlined dense hide-bottom-space class="col-8 q-mb-sm full-width" color="grey-9" v-model="currentSettings.template" label="Template"/>
      <div class="col-12 text-grey-7 q-px-sm q-mb-sm" style="font-size: 12px; line-height: 1.2;">
        Create final message html template. Example:
        By topic with value %topic[1]% data is %variable[var1]%, where %topic1% is the payload from your subscription by first topic (if need field from JSON %topic[1]($.somefield)%),
        %variable[var1]% is calculated value of variable with name var1.
      </div>
      <div class="q-mt-sm col-12">
        <q-toggle color="grey-9" v-model="currentSettings.isNeedTime" label="Show last update time"/>
      </div>
    </div>
  </div>
</template>

<script>
import {
  WIDGET_VALUE_FORMAT_STRING,
  WIDGET_VALUE_FORMAT_HUMAN_READABLE_SIZE,
  WIDGET_VALUE_FORMAT_DATE,
  WIDGET_VALUE_FORMAT_PRE,
  WIDGET_VALUE_FORMAT_MARKDOWN,
  WIDGET_VALUE_FORMAT_JSON,
  WIDGET_VALUE_FORMAT_DURATION
} from '../../../constants'
import validateTopic from '../../../mixins/validateTopic.js'
import isEqual from 'lodash/isEqual'
import cloneDeep from 'lodash/cloneDeep'
export default {
  name: 'CalculatorSchema',
  props: ['widget', 'board'],
  data () {
    const defaultSettings = {
      variables: [],
      height: 2,
      width: 2,
      minWidth: 1,
      minHeight: 2,
      template: '',
      isNeedTime: true
    }
    const defaultVar = {
      name: '',
      math: '',
      valueFormat: 0
    }
    return {
      defaultSettings,
      defaultVar,
      constants: {
        WIDGET_VALUE_FORMAT_STRING,
        WIDGET_VALUE_FORMAT_HUMAN_READABLE_SIZE,
        WIDGET_VALUE_FORMAT_DATE,
        WIDGET_VALUE_FORMAT_PRE,
        WIDGET_VALUE_FORMAT_MARKDOWN,
        WIDGET_VALUE_FORMAT_JSON,
        WIDGET_VALUE_FORMAT_DURATION
      },
      currentSettings: Object.assign({}, defaultSettings, this.widget.settings),
      formatOptions: [
        { label: 'String', value: WIDGET_VALUE_FORMAT_STRING },
        { label: 'Human readable size, B', value: WIDGET_VALUE_FORMAT_HUMAN_READABLE_SIZE },
        { label: 'Datetime, s', value: WIDGET_VALUE_FORMAT_DATE },
        { label: 'Duration, s', value: WIDGET_VALUE_FORMAT_DURATION },
        { label: 'Preformated', value: WIDGET_VALUE_FORMAT_PRE },
        { label: 'Markdown', value: WIDGET_VALUE_FORMAT_MARKDOWN },
        { label: 'JSON', value: WIDGET_VALUE_FORMAT_JSON }
      ]
    }
  },
  methods: {
    addItem () {
      this.currentSettings.variables.push(cloneDeep(this.defaultVar))
    },
    removeItem (itemIndex) {
      this.$delete(this.currentSettings.variables, itemIndex)
    },
    upItem (itemIndex) {
      const movedItem = this.currentSettings.variables.splice(itemIndex, 1)[0]
      this.currentSettings.variables.splice(itemIndex - 1, 0, movedItem)
    },
    downItem (itemIndex) {
      const movedItem = this.currentSettings.variables.splice(itemIndex, 1)[0]
      this.currentSettings.variables.splice(itemIndex + 1, 0, movedItem)
    },
    isitemValid (index) {
      const item = this.currentSettings.variables[index]
      return !(this.currentSettings.variables.filter(i => i.name === item.name).length > 1)
    },
    validate () {
      return this.currentSettings.variables.reduce((result, item, index) => {
        result = result && this.isitemValid(index)
        return result
      }, true)
    }
  },
  created () {
    this.$emit('update', this.currentSettings)
  },
  mixins: [validateTopic],
  watch: {
    widget: {
      deep: true,
      handler (val, old) {
        this.$emit('validate', this.validate())
        if (isEqual(val, old)) { return false }
        this.$emit('update', val)
      }
    }
  }
}
</script>

<style lang="stylus">
  .list__header
    position sticky
    top -15px
    background-color white
    z-index 1
</style>
