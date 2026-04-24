<template>
  <div>
    <div class="row">
      <div class="col-12 q-mt-sm">
        <q-list bordered>
          <q-item-label class="q-py-md q-px-sm list__header" :class="{'text-red-6': !isDataTopicValid}">
            Data topic{{isDataTopicValid ? '' : ' is empty'}}
            <div class="text-grey-6" style="font-size: .75rem; font-weight: normal">Contains the values that pre-fill the form. Form submissions are published back here.</div>
          </q-item-label>
          <div class="q-pa-sm">
            <topic v-model="currentSettings.topics[0]" :board="board" :config="{ needSelectors: true, needDefault: false }"/>
          </div>
        </q-list>
      </div>

      <div class="col-12 q-mt-md">
        <q-btn-toggle class="col-12" rounded toggle-text-color="grey-9" text-color="grey-6" flat v-model="currentSettings.schemaMode" :options="schemaModeOptions"/>
      </div>

      <div class="col-12 q-mt-sm" v-if="currentSettings.schemaMode === SCHEMA_MODE_MANUAL">
        <q-input
          outlined
          dense
          hide-bottom-space
          type="textarea"
          color="grey-9"
          v-model="schemaText"
          label="JSON Schema"
          input-style="font-family: monospace; resize: vertical; min-height: 200px;"
          :error="!!schemaError"
          :error-message="schemaError"
          @input="parseSchema"
        />
        <div class="text-grey-6 q-mt-xs" style="font-size: .8rem">
          <span class="text-grey-9 cursor-pointer" @click="exampleSettingsApply">Example schema</span>
          <span> — <a href="https://flespi.com/kb/formbox" target="_blank" class="text-grey-9">FormBox documentation</a></span>
        </div>
      </div>

      <div class="col-12 q-mt-sm" v-if="currentSettings.schemaMode === SCHEMA_MODE_TOPIC">
        <q-list bordered>
          <q-item-label class="q-py-md q-px-sm list__header" :class="{'text-red-6': !isSchemaTopicValid}">
            Schema topic{{isSchemaTopicValid ? '' : ' is empty'}}
            <div class="text-grey-6" style="font-size: .75rem; font-weight: normal">Payload must be JSON schema. Use Payload path if the schema is nested in the message.</div>
          </q-item-label>
          <div class="q-pa-sm">
            <topic v-model="currentSettings.topics[1]" :board="board" :config="{ needSelectors: true, needDefault: false }"/>
          </div>
        </q-list>
      </div>

      <div class="col-12 q-mt-md">
        <q-input outlined dense hide-bottom-space color="grey-9" v-model="currentSettings.iframeUrl" label="FormBox URL"/>
      </div>

      <div class="col-12 q-mt-md">
        <q-toggle color="grey-9" v-model="currentSettings.readonly" label="Read-only mode (show filled form without apply button)"/>
      </div>

      <div class="col-12 q-mt-md" v-if="!currentSettings.readonly">
        <q-input outlined dense hide-bottom-space type="textarea" color="grey-9" v-model="currentSettings.publishTemplate" label="Publish template (optional)" input-style="resize: none;" autogrow/>
        <div class="text-grey-6 q-mt-xs" style="font-size: .8rem">
          Leave empty to publish form data as JSON. When <b>Payload path</b> is set on the data topic and template is empty, the form data is written back into the original payload at that path.
          Placeholders:
          <span class="text-grey-10 cursor-pointer" @click="appendTemplate('<{form}>')">&lt;{form}&gt;</span> — stringified form data,
          <span class="text-grey-10 cursor-pointer" @click="appendTemplate('<{topic}>')">&lt;{topic}&gt;</span> — data topic,
          <span class="text-grey-10 cursor-pointer" @click="appendTemplate('<{topic[0]}>')">&lt;{topic[0]}&gt;</span> — topic part (0-based index),
          <span class="text-grey-10 cursor-pointer" @click="appendTemplate('<{payload}>')">&lt;{payload}&gt;</span> — current topic payload,
          <span class="text-grey-8">&lt;%form.field%&gt;</span> — JSON path to form data field.
        </div>
      </div>

      <div class="col-12 q-mt-sm" v-if="!currentSettings.readonly">
        <q-toggle color="grey-9" v-model="currentSettings.save" label="Save last status on server (retained message)"/>
      </div>
      <div class="col-12 q-mt-sm">
        <q-toggle color="grey-9" v-model="currentSettings.isNeedTime" label="Show last update time"/>
      </div>
    </div>
  </div>
</template>

<script>
import Topic from '../Topic'
import { getTopicModel } from '../../../constants/defaultes'
import { WIDGET_PAYLOAD_TYPE_JSON } from '../../../constants'
import { SCHEMA_MODE_MANUAL, SCHEMA_MODE_TOPIC } from './constants'
import validateTopic from '../../../mixins/validateTopic.js'
export default {
  name: 'FormboxSchema',
  props: ['widget', 'board'],
  data () {
    const defaultSettings = {
      height: 8,
      width: 4,
      minWidth: 2,
      minHeight: 4,
      maxTopicsLength: 0,
      topics: [
        getTopicModel({
          topicFilter: 'topic/to/form/data',
          topicTemplate: 'topic/to/form/data',
          payloadType: WIDGET_PAYLOAD_TYPE_JSON
        })
      ],
      schemaMode: SCHEMA_MODE_MANUAL,
      schema: {},
      iframeUrl: 'https://flespi.io/formbox',
      publishTemplate: '',
      readonly: false,
      save: true,
      isNeedTime: true
    }
    const currentSettings = Object.assign({}, defaultSettings, this.widget.settings)
    return {
      defaultSettings,
      currentSettings,
      SCHEMA_MODE_MANUAL,
      SCHEMA_MODE_TOPIC,
      schemaModeOptions: [
        { label: 'Manual schema', value: SCHEMA_MODE_MANUAL },
        { label: 'Schema from topic', value: SCHEMA_MODE_TOPIC }
      ],
      schemaText: currentSettings.schema && Object.keys(currentSettings.schema).length
        ? JSON.stringify(currentSettings.schema, null, 2)
        : '',
      schemaError: ''
    }
  },
  computed: {
    isDataTopicValid () {
      const t = this.currentSettings.topics[0]
      return t && this.validateTopic(t.topicFilter)
    },
    isSchemaTopicValid () {
      const t = this.currentSettings.topics[1]
      return t && this.validateTopic(t.topicFilter)
    }
  },
  methods: {
    parseSchema () {
      if (this.currentSettings.schemaMode === SCHEMA_MODE_TOPIC) {
        this.schemaError = ''
        this.$emit('validate', true)
        return
      }
      const text = (this.schemaText || '').trim()
      if (!text) {
        this.schemaError = 'JSON schema is required'
        this.$emit('validate', false)
        return
      }
      try {
        const parsed = JSON.parse(text)
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error('Schema must be an object')
        }
        this.schemaError = ''
        this.$set(this.currentSettings, 'schema', parsed)
        this.$emit('validate', true)
      } catch (e) {
        this.schemaError = e.message || 'Invalid JSON'
        this.$emit('validate', false)
      }
    },
    exampleSettingsApply () {
      const sample = {
        type: 'object',
        properties: {
          name: { type: 'string', title: 'Name' },
          enabled: { type: 'boolean', title: 'Enabled' },
          level: { type: 'number', title: 'Level', minimum: 0, maximum: 100 }
        }
      }
      this.schemaText = JSON.stringify(sample, null, 2)
      this.parseSchema()
    },
    appendTemplate (placeholder) {
      this.currentSettings.publishTemplate = (this.currentSettings.publishTemplate || '') + placeholder
    }
  },
  created () {
    this.parseSchema()
    this.$emit('update', this.currentSettings)
  },
  watch: {
    currentSettings: {
      deep: true,
      handler (val) {
        this.$emit('update', val)
      }
    },
    'currentSettings.schemaMode' (mode) {
      if (mode === SCHEMA_MODE_TOPIC) {
        if (!this.currentSettings.topics[1]) {
          this.$set(this.currentSettings.topics, 1, getTopicModel({ payloadType: WIDGET_PAYLOAD_TYPE_JSON }))
        }
      } else if (this.currentSettings.topics.length > 1) {
        this.currentSettings.topics.splice(1)
      }
      this.parseSchema()
    }
  },
  mixins: [validateTopic],
  components: { Topic }
}
</script>

<style lang="stylus">
  .list__header
    background-color white
    z-index 1
</style>
