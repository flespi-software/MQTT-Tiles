<template>
  <div>
    <div class="row">
      <q-toggle class="q-mt-sm" color="dark" v-model="currentSettings.save" label="Save last status on server (retained message)"/>
      <div class="col-12">
        <q-input class="q-mr-sm" color="dark" v-model="currentSettings.topics[0].topicFilter" float-label="Topic"/>
        <variables-helper v-if="board.settings.variables && board.settings.variables.length" :variables="board.settings.variables" @add="(variable) => currentSettings.topics[0].topicFilter += variable"/>
      </div>
      <div class="q-mt-sm col-12">
        <q-toggle color="dark" v-model="currentSettings.isNeedTime" label="Show last update time"/>
      </div>
    </div>
  </div>
</template>

<script>
import VariablesHelper from '../VariablesHelper'
export default {
  name: 'TextSenderSchema',
  props: ['widget', 'board'],
  data () {
    let defaultSettings = {
      height: 2,
      topics: [
        {
          topicFilter: 'topic/to/data',
          payloadType: 0,
          payloadField: ''
        }
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
