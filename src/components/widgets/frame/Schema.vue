<template>
  <div>
    <div class="text-grey-6 text-center q-mt-md" style="font-size: 1.3rem;">Link as payload expected!</div>
  </div>
</template>

<script>
export default {
  name: 'FrameSchema',
  props: ['widget'],
  data () {
    let defaultSettings = {
      height: 6,
      width: 3,
      maxTopicsLength: 1,
      minWidth: 3,
      minHeight: 3
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
  }
}
</script>
