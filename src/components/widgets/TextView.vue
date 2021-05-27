<template>
  <div>
    <template v-if="settings.valueFormat === WIDGET_VALUE_FORMAT_PRE">
      <span v-if="prefix" style="font-weight: bold;">{{`${prefix}`}}</span>
      <pre style="margin: 0;">{{text}}</pre>
      <span v-if="postfix" style="font-weight: bold;">{{`${postfix}`}}</span>
      <q-tooltip v-if="showTooltip">
        <span v-if="prefix" style="font-weight: bold;">{{`${prefix}`}}</span>
        <pre style="margin: 0;">{{title}}</pre>
        <span v-if="postfix" style="font-weight: bold;">{{`${postfix}`}}</span>
      </q-tooltip>
    </template>
    <template v-else-if="settings.valueFormat === WIDGET_VALUE_FORMAT_MARKDOWN">
      <span v-if="prefix" style="font-weight: bold;">{{`${prefix}`}}</span>
      <markdown :source="text" />
      <span v-if="postfix" style="font-weight: bold;">{{`${postfix}`}}</span>
      <q-tooltip v-if="showTooltip">
        <span v-if="prefix" style="font-weight: bold;">{{`${prefix}`}}</span>
        {{title}}
        <span v-if="postfix" style="font-weight: bold;">{{`${postfix}`}}</span>
      </q-tooltip>
    </template>
    <template v-else-if="settings.valueFormat === WIDGET_VALUE_FORMAT_JSON">
      <span v-if="prefix" style="font-weight: bold;">{{`${prefix}`}}</span>
      <json-tree :data="getJsonValue()" />
      <span v-if="postfix" style="font-weight: bold;">{{`${postfix}`}}</span>
    </template>
    <template v-else-if="settings.valueFormat === WIDGET_VALUE_FORMAT_STRING || settings.valueFormat === WIDGET_VALUE_FORMAT_HUMAN_READABLE_SIZE || settings.valueFormat === WIDGET_VALUE_FORMAT_DATE" class="text-center">
      <span v-if="prefix" style="font-weight: bold;">{{`${prefix}`}}</span>
      {{text}}
      <span v-if="postfix" style="font-weight: bold;">{{`${postfix}`}}</span>
      <q-tooltip v-if="showTooltip">
        <span v-if="prefix" style="font-weight: bold;">{{`${prefix}`}}</span>
        {{title}}
        <span v-if="postfix" style="font-weight: bold;">{{`${postfix}`}}</span>
      </q-tooltip>
    </template>
    <template v-else>
      <span v-if="prefix" style="font-weight: bold;">{{`${prefix}`}}</span>
      {{text}}
      <span v-if="postfix" style="font-weight: bold;">{{`${postfix}`}}</span>
      <q-tooltip v-if="showTooltip">
        <span v-if="prefix" style="font-weight: bold;">{{`${prefix}`}}</span>
        {{title}}
        <span v-if="postfix" style="font-weight: bold;">{{`${postfix}`}}</span>
      </q-tooltip>
    </template>
  </div>
</template>

<script>
import {
  WIDGET_VALUE_FORMAT_STRING,
  WIDGET_VALUE_FORMAT_HUMAN_READABLE_SIZE,
  WIDGET_VALUE_FORMAT_DATE,
  WIDGET_VALUE_FORMAT_DURATION,
  WIDGET_VALUE_FORMAT_PRE,
  WIDGET_VALUE_FORMAT_MARKDOWN,
  WIDGET_VALUE_FORMAT_JSON
} from '../../constants'
import Markdown from './Markdown'
import JsonTree from './JsonTree'
export default {
  props: ['prefix', 'postfix', 'text', 'title', 'settings', 'showTooltip'],
  data () {
    return {
      WIDGET_VALUE_FORMAT_STRING,
      WIDGET_VALUE_FORMAT_HUMAN_READABLE_SIZE,
      WIDGET_VALUE_FORMAT_DATE,
      WIDGET_VALUE_FORMAT_DURATION,
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
