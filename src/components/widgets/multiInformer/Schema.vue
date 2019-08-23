<template>
  <div>
    <div class="row">
      <div class="multi-informer__items-wrapper col-12 relative-position q-mb-sm">
        <q-list>
          <q-btn color="dark" style="top: -20px; right: 8px; position: absolute; z-index: 1130;" class="col-12" fab-mini @click="addItem" icon="mdi-plus"/>
          <q-list-header :class="{'text-red-6': !currentSettings.items.length}">Items{{currentSettings.items.length ? '' : ' are empty'}}</q-list-header>
          <q-collapsible
            v-for="(item, index) in currentSettings.items"
            :key="`${index}${item.topic}`"
            group="singleselect-items"
            :header-class="[`bg-${!!item.topic.topicFilter ? 'grey-4' : 'red-2'}`]"
            collapse-icon="mdi-settings"
            :opened="true"
          >
            <template slot="header">
              <q-item-side right>
                <q-btn :disabled="index === 0" round dense flat class="col-1" @click.stop="upItem(index)" icon="mdi-arrow-up"/>
                <q-btn :disabled="index === (currentSettings.items.length - 1)" round dense flat class="col-1" @click.stop="downItem(index)" icon="mdi-arrow-down"/>
              </q-item-side>
              <q-item-main :label="item.topic.topicFilter || `item ${index + 1}`" />
              <q-item-side right>
                <q-btn flat color="red-6" round dense @click="removeItem(index)" icon="mdi-delete"/>
              </q-item-side>
            </template>
            <div class="row">
              <topic class="col-12" v-model="item.topic" @input="updateTopics" :board="board"/>
              <div class="col-6">
                <q-input class="q-mr-sm" color="dark" v-model="item.prefix" float-label="Prefix"/>
              </div>
              <div class="col-6">
                <q-input class="q-ml-sm" color="dark" v-model="item.postfix" float-label="Postfix"/>
              </div>
              <div class="col-12">
                <q-field helper="You can use math expressions to calculate the final value. Example: (%value% * 1000) / 1024, where %value% is the payload from your subscription.">
                  <div class="row">
                    <q-input class="col-8" color="dark" v-model="item.math" float-label="Math expression" placeholder="%value%"/>
                    <q-select class="col-4" color="dark" v-model="item.valueFormat" :options="formatOptions" float-label="Format value as"/>
                  </div>
                </q-field>
              </div>
            </div>
          </q-collapsible>
        </q-list>
      </div>
      <div class="q-mt-sm col-12">
        <q-toggle color="dark" v-model="currentSettings.isNeedTime" label="Show last update time"/>
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
  WIDGET_VALUE_FORMAT_TIME
} from '../../../constants'
import validateTopic from '../../../mixins/validateTopic.js'
import Topic from '../Topic'
import isEqual from 'lodash/isEqual'
export default {
  name: 'MultiInformerSchema',
  props: ['widget', 'board'],
  data () {
    let defaultSettings = {
      items: [],
      topics: [],
      height: 2,
      width: 2,
      minWidth: 1,
      minHeight: 2,
      maxTopicsLength: 0,
      isNeedTime: true
    }
    let defaultItem = {
      topic: {
        topicFilter: '',
        payloadType: 0,
        payloadField: ''
      },
      math: '',
      valueFormat: 0,
      prefix: '',
      postfix: ''
    }
    return {
      defaultSettings,
      defaultItem,
      currentItem: Object.assign({}, defaultItem),
      currentSettings: Object.assign({}, defaultSettings, this.widget.settings),
      formatOptions: [
        {label: 'String', value: WIDGET_VALUE_FORMAT_STRING},
        {label: 'Human readable size', value: WIDGET_VALUE_FORMAT_HUMAN_READABLE_SIZE},
        {label: 'Date', value: WIDGET_VALUE_FORMAT_DATE},
        {label: 'Time', value: WIDGET_VALUE_FORMAT_TIME},
        {label: 'Preformated', value: WIDGET_VALUE_FORMAT_PRE},
        {label: 'Markdown', value: WIDGET_VALUE_FORMAT_MARKDOWN},
        {label: 'JSON', value: WIDGET_VALUE_FORMAT_JSON}
      ],
      defaultTopic: {
        topicFilter: '',
        payloadType: 0,
        payloadField: ''
      }
    }
  },
  methods: {
    addItem () {
      this.currentSettings.items.push(this.currentItem)
      this.currentItem = Object.assign({}, this.defaultItem)
    },
    removeItem (itemIndex) {
      this.$delete(this.currentSettings.items, itemIndex)
    },
    upItem (itemIndex) {
      let movedItem = this.currentSettings.items.splice(itemIndex, 1)[0]
      this.currentSettings.items.splice(itemIndex - 1, 0, movedItem)
    },
    downItem (itemIndex) {
      let movedItem = this.currentSettings.items.splice(itemIndex, 1)[0]
      this.currentSettings.items.splice(itemIndex + 1, 0, movedItem)
    },
    updateTopics () {
      this.$set(this.currentSettings, 'topics', this.currentSettings.items.map(item => item.topic))
    },
    validate () {
      return true
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
  },
  components: { Topic }
}
</script>
