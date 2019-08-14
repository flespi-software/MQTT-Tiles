<template>
  <div>
    <div class="row">
      <q-collapsible
        class="col-12 q-mt-sm"
        :opened="true"
        label="Route settings"
        :header-class="[`bg-${isValidRouteValue ? 'grey-4' : 'red-2'}`]"
        style="border: solid #e0e0e0 1px"
      >
        <div class="row">
          <div class="col-12">
            <topic v-model="routeValue" label="Latitude value" :board="board"/>
          </div>
        </div>
      </q-collapsible>
      <div class="q-mt-sm col-12">
        <q-toggle color="dark" v-model="currentSettings.isNeedTime" label="Show last update time"/>
      </div>
    </div>
  </div>
</template>

<script>
import isEqual from 'lodash/isEqual'
import Topic from '../Topic'
import validateTopic from '../../../mixins/validateTopic.js'
export default {
  name: 'MapRouteSchema',
  props: ['widget', 'board'],
  data () {
    let defaultSettings = {
      topics: [
        {
          topicFilter: 'topic/to/route',
          payloadType: 0,
          payloadField: ''
        }
      ],
      height: 6,
      width: 3,
      maxTopicsLength: 0,
      minWidth: 3,
      minHeight: 6,
      isNeedTime: true
    }
    return {
      defaultSettings,
      currentSettings: Object.assign({}, defaultSettings, this.widget.settings),
      defaultTopic: {
        topicFilter: '',
        payloadType: 0,
        payloadField: ''
      }
    }
  },
  computed: {
    routeValue: {
      get () {
        return this.currentSettings.topics[0]
      },
      set (val) {
        this.$set(this.currentSettings.topics, 0, val)
      }
    },
    isValidRouteValue () {
      return !this.widget.dataTopics.map(topic => topic.topicFilter).includes(this.routeValue.topicFilter) &&
        this.validateTopic(this.routeValue.topicFilter)
    }
  },
  methods: {
    validate () {
      return this.isValidRouteValue
    }
  },
  created () {
    this.$emit('update', this.currentSettings)
  },
  mixins: [validateTopic],
  components: {Topic},
  watch: {
    widget: {
      deep: true,
      handler (val, old) {
        this.$emit('validate', this.validate())
        if (isEqual(val, old)) { return false }
        this.$emit('update', this.currentSettings)
      }
    }
  }
}
</script>
