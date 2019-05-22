<template>
  <div v-if="settings.valueFormat === WIDGET_VALUE_FORMAT_STRING || settings.valueFormat === WIDGET_VALUE_FORMAT_HUMAN_READABLE_SIZE || settings.valueFormat === WIDGET_VALUE_FORMAT_DATE" class="text-center">
    <span v-if="prefix" style="font-weight: bold;">{{`${prefix}`}}</span>
    {{text}}
    <span v-if="postfix" style="font-weight: bold;">{{`${postfix}`}}</span>
    <q-tooltip>
      <span v-if="prefix" style="font-weight: bold;">{{`${prefix}`}}</span>
      {{title}}
      <span v-if="postfix" style="font-weight: bold;">{{`${postfix}`}}</span>
    </q-tooltip>
  </div>
  <div v-else-if="settings.valueFormat === WIDGET_VALUE_FORMAT_PRE">
    <span v-if="prefix" style="font-weight: bold;">{{`${prefix}`}}</span>
    <pre>{{text}}</pre>
    <span v-if="postfix" style="font-weight: bold;">{{`${postfix}`}}</span>
    <q-tooltip>
      <span v-if="prefix" style="font-weight: bold;">{{`${prefix}`}}</span>
      <pre>{{title}}</pre>
      <span v-if="postfix" style="font-weight: bold;">{{`${postfix}`}}</span>
    </q-tooltip>
  </div>
  <div v-else-if="settings.valueFormat === WIDGET_VALUE_FORMAT_MARKDOWN">
    <span v-if="prefix" style="font-weight: bold;">{{`${prefix}`}}</span>
    <markdown :source="text" />
    <span v-if="postfix" style="font-weight: bold;">{{`${postfix}`}}</span>
    <q-tooltip>
      <span v-if="prefix" style="font-weight: bold;">{{`${prefix}`}}</span>
      {{title}}
      <span v-if="postfix" style="font-weight: bold;">{{`${postfix}`}}</span>
    </q-tooltip>
  </div>
  <div v-else-if="settings.valueFormat === WIDGET_VALUE_FORMAT_JSON">
    <span v-if="prefix" style="font-weight: bold;">{{`${prefix}`}}</span>
    <json-tree :data="getJsonValue()" />
    <span v-if="postfix" style="font-weight: bold;">{{`${postfix}`}}</span>
  </div>
</template>

<script>
import {
  WIDGET_VALUE_FORMAT_STRING,
  WIDGET_VALUE_FORMAT_HUMAN_READABLE_SIZE,
  WIDGET_VALUE_FORMAT_DATE,
  WIDGET_VALUE_FORMAT_PRE,
  WIDGET_VALUE_FORMAT_MARKDOWN,
  WIDGET_VALUE_FORMAT_JSON
} from '../../constants'
import Markdown from './Markdown'
import JsonTree from './JsonTree'
export default {
  props: ['prefix', 'postfix', 'text', 'title', 'settings'],
  data () {
    return {
      WIDGET_VALUE_FORMAT_STRING,
      WIDGET_VALUE_FORMAT_HUMAN_READABLE_SIZE,
      WIDGET_VALUE_FORMAT_DATE,
      WIDGET_VALUE_FORMAT_PRE,
      WIDGET_VALUE_FORMAT_MARKDOWN,
      WIDGET_VALUE_FORMAT_JSON
    }
  },
  methods: {
    getJsonValue () {
      let value = this.text
      try {
        value = JSON.parse(value)
      } catch (e) {}
      return value
    }
  },
  components: { Markdown, JsonTree }
}
</script>
