<template>
  <div>
    <q-toggle class="q-mt-sm" color="grey-9" v-model="currentSettings.save" label="Save last status on server (retained message)"/>
    <q-input color="grey-9" class="q-mb-sm" outlined hide-bottom-space dense v-model="currentSettings.label" :label="currentSettings.label.length <= 25 ? 'Button label' : 'Button label (25 symbols max)'" :error="currentSettings.label.length > 25"/>
    <q-input outlined hide-bottom-space dense class="q-mb-sm" color="grey-9" v-model="currentSettings.icon" label="Icon">
      <q-icon slot="append" :name="`mdi-${currentSettings.icon || 'send'}`" size="1.5rem"/>
    </q-input>
    <q-list bordered class="relative-position q-mt-lg" >
      <q-btn color="grey-9" style="top: -20px; right: 8px; position: absolute; z-index: 1130;" class="col-12" fab-mini @click="addTopic" icon="mdi-plus"/>
      <q-item-label class="q-py-md q-px-sm" :class="{'text-red-6': !currentSettings.topics.length}">Topics{{currentSettings.topics.length ? '' : ' are empty'}}</q-item-label>
      <q-expansion-item
        v-for="(item, index) in currentSettings.topics"
        :key="index"
        group="frame-items"
        :header-class="[`bg-${checkUniqueTopic(index) ? 'grey-4' : 'red-2'}`]"
        expand-icon="mdi-settings"
        :default-opened="index === 0"
      >
        <template slot="header">
          <q-item-section>{{item.topicTemplate || 'New topic'}}</q-item-section>
          <q-item-section side>
            <q-btn flat color="red-6" round dense @click="removeTopic(index)" icon="mdi-delete"/>
          </q-item-section>
        </template>
        <div class="row q-pa-sm">
          <q-input outlined dense hide-bottom-space class="col-12 q-mb-sm" color="grey-9" v-model="item.topicTemplate" @input="val => item.topicFilter = val" label="Topic"/>
          <variables-helper v-if="board.settings.variables && board.settings.variables.length" :variables="board.settings.variables" @add="(variable) => item.value += variable"/>
          <q-input type="textarea" outlined hide-bottom-space dense color="grey-9" class="q-mt-sm full-width" v-model="item.payload" label="Payload" input-style="resize: none;"/>
        </div>
      </q-expansion-item>
    </q-list>
  </div>
</template>

<script>
import VariablesHelper from '../VariablesHelper'
export default {
  name: 'ClickerSchema',
  props: ['widget', 'board'],
  data () {
    const defaultSettings = {
      label: '',
      icon: '',
      topics: [],
      save: false,
      height: 2,
      width: 3,
      minWidth: 1,
      minHeight: 2,
      maxTopicsLength: 0
    }
    return {
      defaultSettings,
      currentSettings: Object.assign({}, defaultSettings, this.widget.settings)
    }
  },
  created () {
    this.$emit('update', this.currentSettings)
  },
  methods: {
    validate () {
      return this.currentSettings.label.length <= 25 && this.currentSettings.topics.length > 0
    },
    addTopic () {
      this.currentSettings.topics.unshift({
        topicTemplate: '',
        topicFilter: '',
        payloadType: 0,
        payloadField: '',
        payloadNameField: '',
        payload: ''
      })
    },
    removeTopic (index) { this.$delete(this.currentSettings.topics, index) },
    checkUniqueTopic (itemIndex) {
      const item = this.currentSettings.topics[itemIndex],
        sameTopicsIndexes = this.currentSettings.topics.reduce((res, currItem, index) => {
          if (currItem.topicTemplate === item.topicTemplate) {
            res.push(index)
          }
          return res
        }, [])
      return item.topicTemplate &&
        sameTopicsIndexes.indexOf(itemIndex) === 0
    }
  },
  watch: {
    currentSettings: {
      deep: true,
      handler (val) {
        this.$emit('validate', this.validate())
        this.$emit('update', val)
      }
    }
  },
  components: { VariablesHelper }
}
</script>
