<template>
  <div class="row">
    <topic class="col-12 q-mb-sm" v-model="current.topic" :board="board" :config="{ needSelectors: true, needDefault: true }"/>
    <div class="col-xs-12 q-mb-sm">
      <q-input outlined dense hide-bottom-space color="grey-9" v-model="current.settings.defaultIcon" label="Default icon" :error="!current.settings.defaultIcon">
        <q-icon slot="append" :name="`mdi-${current.settings.defaultIcon}`" size="1.5rem"/>
      </q-input>
    </div>
    <q-input outlined dense hide-bottom-space class="col-12 q-mb-sm" color="grey-9" v-model="current.settings.math" label="Math expression" placeholder="%value%"/>
    <q-input outlined dense hide-bottom-space class="col-12" color="grey-9" v-model.number="current.settings.resetTimeout" type="number" label="Reset timeout, s"/>
    <div class="status-indicator__items-wrapper col-12 relative-position q-mb-sm q-mt-sm">
      <q-list bordered>
        <q-item-label class="q-py-md q-px-sm list__header" :class="{'text-red-6': !current.settings.items.length}">
          Items{{current.settings.items.length ? '' : ' are empty'}}
          <q-btn color="grey-9" class="absolute-right" flat label="ADD" @click="addItem" icon="mdi-plus"/>
        </q-item-label>
        <q-expansion-item
          v-for="(item, index) in current.settings.items"
          :key="`${index}${item.value}`"
          group="status-indicator-items"
          :header-class="[`bg-${checkUniqueItem(item, index) ? 'grey-4' : 'red-2'}`]"
          expand-icon="mdi-cog"
          :value="index === current.settings.items.length - 1"
        >
          <template slot="header">
            <q-item-section><span class="ellipsis full-width">{{getItemLabel(item, index)}}</span></q-item-section>
            <q-item-section side v-if="!item.default">
              <q-btn flat color="red-6" round dense @click="removeItem(index)" icon="mdi-delete"/>
            </q-item-section>
          </template>
          <div class="row q-pa-sm">
            <div class="col-12 text-grey-8 q-mt-sm" style="font-size: .9rem;" v-if="item.default">
              Default item. Used if there is no data in the source or data doesn't match the specified items.
            </div>
            <div :class="[`col-${item.default ? '12' : '6'}`]" class="q-mb-sm">
              <q-input outlined dense hide-bottom-space class="q-mr-xs" color="grey-9" v-model="item.label" label="Label"/>
            </div>
            <div class="col-6" v-if="!item.default">
              <typed-input class="q-ml-xs" v-model="item.val" :settings="{label: 'Value', error: !checkUniqueItem(item, index)}"/>
            </div>
            <div class="col-12 q-mb-sm">
              <q-input outlined dense hide-bottom-space class="q-mr-xs" :style="{color: item.color}" color="grey-9" v-model="item.icon" label="Icon">
                <q-icon slot="append" :name="`mdi-${item.icon || current.settings.defaultIcon}`" size="1.5rem" :style="{color: item.color}"/>
                <q-btn flat slot="after" :style="{backgroundColor: item.color}">
                  <q-menu class="q-pa-sm" anchor="top right" self="bottom right">
                    <q-color
                      v-model="item.color"
                      format-model='hex'
                    />
                  </q-menu>
                </q-btn>
              </q-input>
            </div>
            <div class="col-12 text-grey-6 q-mt-sm" style="font-size: .8rem;" v-if="item.default">
              You can find more icons on <a href="https://materialdesignicons.com/" target="blank">MDI</a>
            </div>
            <q-input outlined dense hide-bottom-space class="col-12" color="grey-9" v-model="item.math" label="Math expression" placeholder="%value%" v-if="!item.default" :error="!checkUniqueItem(item, index)"/>
            <div class="text-grey-9" v-if="!item.default" style="font-size: .8rem;">You can use math expressions to calculate the final value. Example: (%value% * 1000) / 1024, where %value% is the payload from your subscription.</div>
          </div>
        </q-expansion-item>
      </q-list>
    </div>
  </div>
</template>

<script>
import Topic from '../Topic'
import cloneDeep from 'lodash/cloneDeep'
import merge from 'lodash/merge'
export default {
  props: ['settings', 'board'],
  data () {
    const defaultItem = {
      label: 'Item',
      icon: '',
      color: '#000',
      math: '',
      val: ''
    }
    return {
      defaultItem,
      currentItem: Object.assign({}, defaultItem),
      current: cloneDeep(this.settings)
    }
  },
  methods: {
    addItem () {
      this.current.settings.items.push(this.currentItem)
      this.currentItem = Object.assign({}, this.defaultItem)
    },
    removeItem (itemIndex) {
      this.$delete(this.current.settings.items, itemIndex)
    },
    checkUniqueItem (item, index) {
      let isUnique = true
      this.current.settings.items.some((currentItem, itemIndex) => {
        const sameValue = currentItem.val === item.val
        const sameMath = currentItem.math === item.math
        if (sameValue && sameMath) { isUnique = itemIndex === index }
        return sameValue
      })
      return isUnique
    },
    validate (item) {
      item = item || this.current
      return !!item.settings.defaultIcon &&
        !!item.settings.items.length &&
        item.settings.items.reduce((isUniq, item, index, items) => {
          const key = `${item.val} - ${item.math}`
          if (!isUniq[key]) { isUniq[key] = 0 }
          isUniq[key]++
          if (index === items.length - 1) {
            return Object.keys(isUniq).reduce((currentUniq, value) => {
              if (!currentUniq) { return currentUniq }
              return isUniq[value] === 1
            }, true)
          }
          return isUniq
        }, {})
    },
    getItemLabel (item, index) {
      let label = ''
      if (item.label) {
        label += `${item.label} `
        if (!item.default) {
          label += `[${item.val === undefined ? 'N/A' : item.val}]`
        }
      } else {
        label = `${item.val === undefined ? `item ${index + 1}` : item.val}`
      }
      return label
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
