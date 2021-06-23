<template>
  <q-card class="complex__items-editor row col-12" :class="[`bg-${item.color}-1`]">
    <div class="items__top col-12 flex q-px-md q-py-xs" style="background-color: rgba(255,255,255,0.5)">
      <component
        v-for="(item, layoutIndex) in settings.items.filter(item => item.position === 'top')"
        :key="`top${layoutIndex}${item.index}`"
        class="complex__element cursor-pointer"
        :is="`my-${settings.items[item.index].type}`"
        @click.native="selectHandler('top', layoutIndex)"
        :item="settings.items[item.index]"
        :color="item.color"
        :selected="(!!edited && edited.position === 'top' && edited.indexByPosition === layoutIndex)"
      />
      <add-menu class="q-ml-sm" anchor="bottom left" self="top left" @add="(type) => addItem(type, 'top')"/>
    </div>
    <div class="items__left col-6 flex q-pa-sm">
      <component
        v-for="(item, layoutIndex) in settings.items.filter(item => item.position === 'left')"
        :key="`left${layoutIndex}${item.index}`"
        class="complex__element cursor-pointer"
        :is="`my-${settings.items[item.index].type}`"
        @click.native="selectHandler('left', layoutIndex)"
        :item="settings.items[item.index]"
        :color="item.color"
        :selected="(!!edited && edited.position === 'left' && edited.indexByPosition === layoutIndex)"
      />
      <add-menu style="width: 100%; min-height: 30px;" anchor="top middle" self="bottom middle" @add="(type) => addItem(type, 'left')"/>
    </div>
    <div class="items__right col-6 q-pa-sm">
      <component
        v-for="(item, layoutIndex) in settings.items.filter(item => item.position === 'right')"
        :key="`right${layoutIndex}${item.index}`"
        class="complex__element text-center cursor-pointer"
        :is="`my-${settings.items[item.index].type}`"
        @click.native="selectHandler('right', layoutIndex)"
        :item="settings.items[item.index]"
        :color="item.color"
        :selected="(!!edited && edited.position === 'right' && edited.indexByPosition === layoutIndex)"
      />
      <add-menu style="width: 100%; min-height: 30px;" anchor="top middle" self="bottom middle" @add="(type) => addItem(type, 'right')" />
    </div>
    <div class="items__bottom col-12 flex q-px-md q-py-xs" style="background-color: rgba(255,255,255,0.5)">
      <component
        v-for="(item, layoutIndex) in settings.items.filter(item => item.position === 'bottom')"
        :key="`bottom${layoutIndex}${item.index}`"
        class="complex__element cursor-pointer"
        :is="`my-${settings.items[item.index].type}`"
        @click.native="selectHandler('bottom', layoutIndex)"
        :item="settings.items[item.index]"
        :color="item.color"
        :selected="(!!edited && edited.position === 'bottom' && edited.indexByPosition === layoutIndex)"
      />
      <add-menu class="q-ml-sm" anchor="top right" self="bottom middle" @add="(type) => addItem(type, 'bottom')" />
    </div>
  </q-card>
</template>

<script>
import AddMenu from './AddMenu'
import Text from './Text'
import Knob from './Knob'
import Progress from './Progress'
export default {
  props: ['item', 'index', 'value'],
  data () {
    return {
      edited: null
    }
  },
  computed: {
    settings () { return this.item.settings }
  },
  methods: {
    addItem (type, position) {
      this.$widgetBus.$emit('add', { type, position })
      this.$nextTick(() => {
        const index = this.settings.items.filter(item => item.position === position).length - 1
        this.selectHandler(position, index)
      })
    },
    selectHandler (position, indexByPosition) {
      let index = -1
      this.settings.items.reduce((currentIndex, item, indexInStore) => {
        if (item.position === position) {
          currentIndex++
          if (currentIndex === indexByPosition) {
            index = indexInStore
          }
        }
        return currentIndex
      }, -1)
      this.edited = { position, indexByPosition, index }
      this.$widgetBus.$emit('edit', this.edited)
    }
  },
  components: {
    AddMenu,
    MyText: Text,
    MyKnob: Knob,
    MyProgress: Progress
  }
}
</script>
