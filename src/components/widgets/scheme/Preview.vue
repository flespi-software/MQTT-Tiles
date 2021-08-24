<template>
  <div v-if="currentSettings.image" class="full-height">
    <div class="scheme__add-pannel" :class="[`bg-${item.color}-2`]">
      <q-btn
        v-for="item in itemTypes" :key="item.value"
        flat dense :icon="item.icon" color="grey-7"
        @click="addTypedItem(item.value)"
      >
        <q-tooltip>Add {{item.label}}</q-tooltip>
      </q-btn>
      <q-btn class="float-right" dense flat icon="mdi-close" color="red" @click="clearImage">
        <q-tooltip>Remove image</q-tooltip>
      </q-btn>
    </div>
    <div draggable="false" ref="imageWrapper" class="scheme__image-wrapper q-pa-xs relative-position" :class="[`bg-${item.color}-1`]">
      <img :src='currentSettings.image' width="100%" :style="{maxHeight: `${maxHeight}px`}" draggable="false" @click="setActive(undefined)"/>
      <div
        v-for="(item, index) in currentSettings.items" :key="index"
        ref="dragItems"
        v-touch-pan.prevent.mouse="e => { if (activeItemIndex === index) { onMove(e, index) } }"
        @click="setActive(index)"
        class="scheme__item-view-wrapper absolute cursor-pointer"
        :class="{
          'scheme__item-view-wrapper--active': activeItemIndex === index,
          'scheme__item-view-wrapper--error': errorsByItems[index]
        }"
        :style="{
          left: `${item.position.left}%`,
          top: `${item.position.top}%`,
          width: `${item.width}%`,
          height: `${item.height}%`
        }"
      >
        <component :is="`${item.type}-view`" :item="item" class="full-height overflow-hidden"/>
        <template v-if="activeItemIndex === index">
          <div v-touch-pan.prevent.mouse="e => onResize(e, index)" class="item-view-wrapper__size-handler"></div>
          <q-btn
            color="red" icon="mdi-close" dense round unelevated size="5px"
            @click="removeItem(index)" class="absolute-top-right" style="top: -4px; right: -4px;"
          >
            <q-tooltip>Remove widget</q-tooltip>
          </q-btn>
        </template>
      </div>
    </div>
  </div>
  <q-file ref="file" v-else class="scheme__image-picker q-mb-md" borderless
    v-model="image" @input="getBase64"
    accept="image/*"
    max-file-size="1048576"
  >
    <div class="absolute-full text-center">
      <q-icon name="mdi-image" :color="item.color" size="4rem" style="margin-top: 40px"/>
      <div class="text-h5 text-grey-9">Upload image</div>
      <div class="text-grey-9" style="font-size: .8rem">Max size: 2MB</div>
    </div>
  </q-file>
</template>

<script>
import StaticTextView from './StaticTextView'
import TextView from './TextView'
import ToggleView from './ToggleView'
import StatusView from './StatusView'
import {
  WIDGET_ITEM_TYPE_TEXT,
  WIDGET_ITEM_TYPE_TOGGLE,
  WIDGET_ITEM_TYPE_STATUS,
  WIDGET_ITEM_TYPE_STATIC_TEXT
} from './constants'
import ActiveMixin from './activeMixin'

export default {
  name: 'SchemePreview',
  props: ['item', 'index', 'value'],
  data () {
    return {
      image: null,
      itemTypes: [
        { label: 'text', value: WIDGET_ITEM_TYPE_TEXT, icon: 'mdi-format-text-variant' },
        { label: 'static text', value: WIDGET_ITEM_TYPE_STATIC_TEXT, icon: 'mdi-format-text' },
        { label: 'toggle', value: WIDGET_ITEM_TYPE_TOGGLE, icon: 'mdi-toggle-switch-outline' },
        { label: 'status', value: WIDGET_ITEM_TYPE_STATUS, icon: 'mdi-lightbulb-outline' }
      ],
      maxHeight: 0
    }
  },
  computed: {
    currentSettings () { return this.item.settings }
  },
  methods: {
    addTypedItem (type) {
      this.$widgetBus.$emit('add', type)
    },
    removeItem (index) {
      this.$widgetBus.$emit('remove', index)
    },
    setActive (index) {
      this.activeItemIndex = index
      this.$widgetBus.$emit('select', index)
    },
    clearImage () {
      this.$widgetBus.$emit('update:image', null)
      this.$nextTick(() => {
        this.$refs.file.removeAtIndex(0)
        this.image = null
      })
    },
    getBase64 (file) {
      if (!file) { return }
      var reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        this.$widgetBus.$emit('update:image', reader.result)
      }
    },
    onMove (e, index) {
      const { position, height: itemHeight, width: itemWidth } = this.currentSettings.items[index],
        parent = this.$refs.imageWrapper.getBoundingClientRect(),
        el = this.$refs.dragItems[index].getBoundingClientRect(),
        width = parent.width,
        height = parent.height,
        deltaHeight = (e.delta.y / height) * 100,
        deltaWidth = (e.delta.x / width) * 100,
        resultPosition = { top: position.top + deltaHeight, left: position.left + deltaWidth }
      if (el.top < parent.top) {
        resultPosition.top = 0
      } else if (el.bottom > parent.bottom) {
        resultPosition.top = 100 - itemHeight
      }
      if (el.left < parent.left) {
        resultPosition.left = 0
      } else if (el.right > parent.right) {
        resultPosition.left = 100 - itemWidth
      }
      this.$set(this.currentSettings.items[index], 'position', resultPosition)
    },
    onResize (e, index) {
      const parent = this.$refs.imageWrapper.getBoundingClientRect(),
        width = parent.width,
        height = parent.height,
        item = this.currentSettings.items[index]
      let deltaHeight = (e.delta.y / height) * 100,
        deltaWidth = (e.delta.x / width) * 100
      if (e.position.top > parent.bottom) {
        deltaHeight = 0
      }
      if (e.position.left > parent.right) {
        deltaWidth = 0
      }
      let setWidth = item.width + deltaWidth,
        setHeight = item.height + deltaHeight
      let minWidth = (100 * 20) / width
      let minHeight = (100 * 20) / height
      if (setWidth < minWidth) {
        setWidth = minWidth
      }
      if (setHeight < minHeight) {
        setHeight = minHeight
      }
      this.$set(this.currentSettings.items[index], 'width', setWidth)
      this.$set(this.currentSettings.items[index], 'height', setHeight)
    },
    onResizeWrapper (height) {
      this.maxHeight = height - 182
    }
  },
  watch: {
    '$q.screen.height': {
      immediate: true,
      handler (height) {
        this.onResizeWrapper(height)
      }
    }
  },
  components: {
    StaticTextView,
    TextView,
    ToggleView,
    StatusView
  },
  mixins: [ActiveMixin]
}
</script>

<style lang="sass" scoped>
  .scheme__image-wrapper
    position: relative
    border: solid $grey-6 1px
    border-radius: 5px
    border-top-right-radius: 0
    border-top-left-radius: 0
    max-height: calc(100% - 40px)
  .scheme__image-picker
    border: dashed $grey-9 1px
    border-radius: 5px
    min-width: 400px
    min-height: 350px
    .q-field__native
      min-height: 200px
      z-index: 1
      input
        color: transparent
        text-shadow: 0 0 0 #000
        outline: (none !important)
        border: none
        &:focus, &:hover, &:active
          outline: (none !important)
  .scheme__item-view-wrapper
    &--active
      box-shadow: 0 1px 5px rgba(0,0,0,20%), 0 2px 2px rgba(0,0,0,14%), 0 3px 1px -2px rgba(0,0,0,12%) !important
      background-color: rgba(255, 255, 255, .3)
      z-index: 1
    &--error
      border: 2px solid $red-4
    border: 2px solid transparent
    border-radius: 3px
    .item-view-wrapper__size-handler
      cursor: nwse-resize
      background: transparent
      border: 2px $yellow-10 solid
      border-top: none
      border-left: none
      height: 6px
      width: 6px
      position: absolute
      bottom: 0px
      right: 0px
  .scheme__add-pannel
    border-radius: 3px
    border: 1px solid $grey-6
    position: relative
    padding: 3px
    border-bottom: none
    border-bottom-left-radius: 0
    border-bottom-right-radius: 0
</style>
