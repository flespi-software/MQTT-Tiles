<template>
  <div>
    <div class="row">
      <q-toggle class="q-mt-sm" color="grey-9" v-model="currentSettings.save" label="Save last status on server (retained message)"/>
      <div class="col-12 q-mt-sm">
        <q-input dense outlined hide-bottom-space class="q-mr-sm" color="grey-9" label="Topic" v-model="currentSettings.topics[0].topicTemplate" @input="currentSettings.topics[0].topicFilter = currentSettings.topics[0].topicTemplate"/>
        <variables-helper v-if="board.settings.variables && board.settings.variables.length" :variables="board.settings.variables" @add="(variable) => currentSettings.topics[0].topicTemplate += variable"/>
      </div>
      <div class="q-mt-sm col-12">
        <q-toggle color="grey-9" v-model="currentSettings.isNeedTime" label="Show last update time"/>
      </div>
    </div>
  </div>
</template>

<script>
import VariablesHelper from '../VariablesHelper'
import { getTopicModel } from '../../../constants/defaultes'
export default {
  name: 'TextSenderSchema',
  props: ['widget', 'board'],
  data () {
    const defaultSettings = {
      height: 2,
      topics: [
        getTopicModel({
          topicFilter: 'topic/to/data',
          topicTemplate: 'topic/to/data'
        })
      ],
      width: 2,
      minWidth: 1,
      minHeight: 2,
      maxTopicsLength: 0,
      isNeedTime: true,
      save: true
    }
    return {
      defaultSettings,
      currentSettings: Object.assign({}, defaultSettings, this.widget.settings)
    }
  },
  created () {
    this.$emit('update', this.currentSettings)
  },
  watch: {
    currentSettings: {
      deep: true,
      handler (val) {
        this.$emit('update', val)
      }
    }
  },
  components: { VariablesHelper }
}
</script>
