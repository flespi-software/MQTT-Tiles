<template>
  <div>
    <div class="row">
      <div class="map__items-wrapper col-12 relative-position q-mb-sm">
        <q-list bordered>
          <q-item-label class="q-py-md q-px-sm list__header" :class="{'text-red-6': !currentSettings.items.length}">
            Items{{currentSettings.items.length ? '' : ' are empty'}}
            <q-btn color="grey-9" class="absolute-right" flat label="ADD" @click="addItem" icon="mdi-plus"/>
          </q-item-label>
          <q-expansion-item
            v-for="(item, index) in currentSettings.items"
            :key="`${index}`"
            group="map-items"
            :header-class="[`bg-${!!isitemValid(index) ? 'grey-4' : 'red-2'}`]"
            expand-icon="mdi-cog"
            :value="index === currentSettings.items.length - 1"
            >
            <template slot="header">
              <q-item-section side>
                <div>
                  <q-btn :disabled="index === 0" round dense flat class="col-1" @click.stop="upItem(index)" icon="mdi-arrow-up"/>
                  <q-btn :disabled="index === (currentSettings.items.length - 1)" round dense flat class="col-1" @click.stop="downItem(index)" icon="mdi-arrow-down"/>
                </div>
              </q-item-section>
              <q-item-section><span class="ellipsis full-width">{{item.name || 'New item'}}</span></q-item-section>
              <q-item-section side>
                <q-btn flat color="red-6" round dense @click="removeItem(index)" icon="mdi-delete"/>
              </q-item-section>
            </template>
            <div class="row q-pa-sm">
              <q-input outlined dense hide-bottom-space class="full-width" color="grey-9" v-model="item.name" label="Name" autofocus/>
              <q-expansion-item
                class="col-12 q-mt-sm"
                default-opened
                label="Latitude settings"
                :header-class="[`bg-${isValidLatValue(index) ? 'grey-4' : 'red-2'}`]"
                style="border: solid #e0e0e0 1px"
              >
                <div class="row">
                  <div class="col-12 q-pa-xs">
                    <topic v-model="item.lat" @input="updateTopics" label="Latitude value" :board="board" :config="{ needSelectors: true }"/>
                  </div>
                </div>
              </q-expansion-item>
              <q-expansion-item
                class="col-12 q-mt-sm"
                default-opened
                label="Longitude settings"
                :header-class="[`bg-${isValidLonValue(index) ? 'grey-4' : 'red-2'}`]"
                style="border: solid #e0e0e0 1px"
              >
                <div class="row">
                  <div class="col-12 q-pa-xs">
                    <topic v-model="item.lon" @input="updateTopics" label="Longitude value" :board="board" :config="{ needSelectors: true }"/>
                  </div>
                </div>
              </q-expansion-item>
            </div>
          </q-expansion-item>
        </q-list>
      </div>
      <div class="q-mt-sm col-12">
        <q-toggle color="grey-9" v-model="currentSettings.isNeedTime" label="Show last update time"/>
      </div>
    </div>
  </div>
</template>

<script>
import isEqual from 'lodash/isEqual'
import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'
import Topic from '../Topic'
import validateTopic from '../../../mixins/validateTopic.js'
import { getTopicModel } from '../../../constants/defaultes'
export default {
  name: 'MapLocationSchema',
  props: ['widget', 'board'],
  data () {
    const defaultSettings = {
        topics: [],
        items: [],
        height: 6,
        width: 3,
        maxTopicsLength: 0,
        minWidth: 3,
        minHeight: 6,
        isNeedTime: true
      },
      defaultTopic = getTopicModel()
    return {
      defaultSettings,
      currentSettings: Object.assign({}, defaultSettings, this.widget.settings),
      defaultTopic,
      defaultItem: {
        name: '',
        lat: getTopicModel({
          topicFilter: 'topic/to/lat',
          topicTemplate: 'topic/to/lat'
        }),
        lon: getTopicModel({
          topicFilter: 'topic/to/lon',
          topicTemplate: 'topic/to/lon'
        })
      }
    }
  },
  methods: {
    addItem () {
      this.currentSettings.items.push(cloneDeep(this.defaultItem))
      this.updateTopics()
    },
    removeItem (itemIndex) {
      this.$delete(this.currentSettings.items, itemIndex)
      this.updateTopics()
    },
    upItem (itemIndex) {
      const movedItem = this.currentSettings.items.splice(itemIndex, 1)[0]
      this.currentSettings.items.splice(itemIndex - 1, 0, movedItem)
    },
    downItem (itemIndex) {
      const movedItem = this.currentSettings.items.splice(itemIndex, 1)[0]
      this.currentSettings.items.splice(itemIndex + 1, 0, movedItem)
    },
    updateTopics () {
      this.$set(this.currentSettings, 'topics', this.currentSettings.items.reduce((res, item) => {
        res.push(item.lat)
        res.push(item.lon)
        return res
      }, []))
    },
    isitemValid (index) {
      const item = this.currentSettings.items[index]
      return !(this.currentSettings.items.filter(i => i.name === item.name).length > 1)
    },
    isValidLatValue (index) {
      const topic = get(this.currentSettings, `items[${index}].lat.topicFilter`, '#/')
      return !this.widget.dataTopics.map(topic => topic.topicFilter).includes(topic) &&
        this.validateTopic(topic)
    },
    isValidLonValue (index) {
      const topic = get(this.currentSettings, `items[${index}].lon.topicFilter`, '#/')
      return !this.widget.dataTopics.map(topic => topic.topicFilter).includes(topic) &&
        this.validateTopic(topic)
    },
    validate () {
      return this.currentSettings.items.reduce((result, item, index) => {
        result = result && this.isitemValid(index)
        result = result && this.isValidLatValue(index)
        result = result && this.isValidLonValue(index)
        return result
      }, true)
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

<style lang="stylus">
  .list__header
    position sticky
    top -15px
    background-color white
    z-index 99
</style>
