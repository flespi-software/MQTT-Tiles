<template>
  <div class="row">
    <topic class="col-12 q-mb-sm" v-model="current.topic" :board="board" :config="{ needSelectors: true, needDefault: true }"/>
    <div class="col-6 q-mb-sm">
      <q-input outlined dense hide-bottom-space class="q-mr-sm" color="grey-9" v-model="current.settings.prefix" label="Prefix"/>
    </div>
    <div class="col-6">
      <q-input outlined dense hide-bottom-space class="q-ml-sm" color="grey-9" v-model="current.settings.postfix" label="Postfix"/>
    </div>
    <q-select
      emit-value map-options outlined dense hide-bottom-space
      color="grey-9" class="col-12 q-mb-sm" use-chips
      v-model="current.settings.modificators"
      multiple
      :options="modificatorsOptions"
      label="Text style"
    >
      <q-btn flat slot="after" :style="{backgroundColor: current.settings.color}">
        <q-menu class="q-pa-sm" anchor="top right" self="bottom right">
          <q-color
            v-model="current.settings.color"
            format-model='hex'
          />
        </q-menu>
      </q-btn>
      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
          <q-item-section>
            <q-item-label :class="[`text-${scope.opt.value}`]">{{ scope.opt.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
    <q-input outlined dense hide-bottom-space class="col-8 q-pr-xs q-mb-sm" color="grey-9" v-model="current.settings.math" label="Math expression" placeholder="%value%"/>
    <q-select outlined dense hide-bottom-space class="col-4 q-mb-sm" color="grey-9" v-model="current.settings.valueFormat" :options="formatOptions" emit-value map-options label="Format value as"/>
    <q-input outlined dense hide-bottom-space class="col-12 q-mb-xs" color="grey-9" v-if="current.settings.valueFormat === constants.WIDGET_VALUE_FORMAT_DATE" v-model="current.settings.dateFormat" label="Datetime format" placeholder="DD/MM/YYYY HH:mm:ss.SSS"/>
    <div class="col-12 text-grey-7 q-px-sm q-mb-sm" style="font-size: 12px; line-height: 1;">You can use math expressions to calculate the final value. Example: (%value% * 1000) / 1024, where %value% is the payload from your subscription.</div>
  </div>
</template>

<script>
import Topic from '../Topic'
import {
  WIDGET_VALUE_FORMAT_STRING,
  WIDGET_VALUE_FORMAT_HUMAN_READABLE_SIZE,
  WIDGET_VALUE_FORMAT_DATE,
  WIDGET_VALUE_FORMAT_PRE,
  WIDGET_VALUE_FORMAT_MARKDOWN,
  WIDGET_VALUE_FORMAT_JSON,
  WIDGET_VALUE_FORMAT_DURATION
} from '../../../constants'
import cloneDeep from 'lodash/cloneDeep'
import merge from 'lodash/merge'
export default {
  props: ['settings', 'board'],
  data () {
    return {
      constants: {
        WIDGET_VALUE_FORMAT_STRING,
        WIDGET_VALUE_FORMAT_HUMAN_READABLE_SIZE,
        WIDGET_VALUE_FORMAT_DATE,
        WIDGET_VALUE_FORMAT_PRE,
        WIDGET_VALUE_FORMAT_MARKDOWN,
        WIDGET_VALUE_FORMAT_JSON,
        WIDGET_VALUE_FORMAT_DURATION
      },
      formatOptions: [
        { label: 'String', value: WIDGET_VALUE_FORMAT_STRING },
        { label: 'Human readable size, B', value: WIDGET_VALUE_FORMAT_HUMAN_READABLE_SIZE },
        { label: 'Datetime, s', value: WIDGET_VALUE_FORMAT_DATE },
        { label: 'Duration, s', value: WIDGET_VALUE_FORMAT_DURATION },
        { label: 'Preformated', value: WIDGET_VALUE_FORMAT_PRE },
        { label: 'Markdown', value: WIDGET_VALUE_FORMAT_MARKDOWN },
        { label: 'JSON', value: WIDGET_VALUE_FORMAT_JSON }
      ],
      current: cloneDeep(this.settings),
      modificatorsOptions: [
        { label: 'Bold', value: 'bold' },
        { label: 'Italic', value: 'italic' },
        { label: 'Strike', value: 'strike' },
        { label: 'Uppercase', value: 'uppercase' },
        { label: 'Lowercase', value: 'lowercase' },
        { label: 'Capitalize', value: 'capitalize' }
      ]
    }
  },
  watch: {
    current: {
      deep: true,
      handler () {
        this.$emit('update', this.current)
      }
    },
    settings: {
      deep: true,
      handler (settings) {
        this.current = merge(settings, this.current)
      }
    }
  },
  components: { Topic }
}
</script>
