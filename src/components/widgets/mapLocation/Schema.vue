<template>
  <div>
    <div class="row">
      <q-input outlined hide-bottom-space v-if="integration" v-model="currentSettings.latField" label="Latitude`s field" class="col-12" color="grey-9"/>
      <q-expansion-item
        v-else
        class="col-12 q-mt-sm"
        default-opened
        label="Latitude settings"
        :header-class="[`bg-${isValidLatValue ? 'grey-4' : 'red-2'}`]"
        style="border: solid #e0e0e0 1px"
      >
        <div class="row">
          <div class="col-12">
            <topic v-model="latValue" label="Latitude value" :board="board"/>
          </div>
        </div>
      </q-expansion-item>
      <q-input outlined hide-bottom-space v-if="integration" v-model="currentSettings.lonField" label="Longetude`s field" class="col-12" color="grey-9"/>
      <q-expansion-item
        v-else
        class="col-12 q-mt-sm"
        default-opened
        label="Longitude settings"
        :header-class="[`bg-${isValidLonValue ? 'grey-4' : 'red-2'}`]"
        style="border: solid #e0e0e0 1px"
      >
        <div class="row">
          <div class="col-12">
            <topic v-model="lonValue" label="Longitude value" :board="board"/>
          </div>
        </div>
      </q-expansion-item>
      <div class="q-mt-sm col-12">
        <q-toggle color="grey-9" v-model="currentSettings.isNeedTime" label="Show last update time"/>
      </div>
    </div>
  </div>
</template>

<script>
import isEqual from 'lodash/isEqual'
import Topic from '../Topic'
import validateTopic from '../../../mixins/validateTopic.js'
export default {
  name: 'MapLocationSchema',
  props: ['widget', 'board', 'integration'],
  data () {
    const defaultSettings = {
      topics: [
        {
          topicFilter: 'topic/to/lat',
          payloadType: 0,
          payloadField: ''
        },
        {
          topicFilter: 'topic/to/lon',
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
    if (this.integration) {
      delete defaultSettings.topics
      defaultSettings.latField = 'position.latitude'
      defaultSettings.lonField = 'position.longitude'
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
    latValue: {
      get () {
        return this.currentSettings.topics[0]
      },
      set (val) {
        this.$set(this.currentSettings.topics, 0, val)
      }
    },
    lonValue: {
      get () {
        return this.currentSettings.topics[1]
      },
      set (val) {
        this.$set(this.currentSettings.topics, 1, val)
      }
    },
    isValidLatValue () {
      return this.integration || (
        !this.integration &&
        !this.widget.dataTopics.map(topic => topic.topicFilter).includes(this.latValue.topicFilter) &&
        this.validateTopic(this.latValue.topicFilter)
      )
    },
    isValidLonValue () {
      return this.integration || (
        !this.integration &&
        !this.widget.dataTopics.map(topic => topic.topicFilter).includes(this.lonValue.topicFilter) &&
        this.validateTopic(this.lonValue.topicFilter)
      )
    }
  },
  methods: {
    validate () {
      return this.isValidLatValue && this.isValidLonValue
    }
  },
  created () {
    this.$emit('update', this.currentSettings)
  },
  mixins: [validateTopic],
  components: { Topic },
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
