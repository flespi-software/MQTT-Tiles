<template>
  <div class="sattic-informer__payload-wrapper">
    <text-view class="static-informer__payload text-grey-9" :text="text" :title="text" :settings="item.settings" :show-tooltip="false" />
  </div>
</template>

<style lang="stylus">
  .static-informer__payload-wrapper
    align-items center
    vertical-align middle
    width 100%
  .static-informer__payload
    font-size 1.2rem
    word-break break-all
    display block
    padding 2px 4px
</style>

<script>
import { WIDGET_STATUS_DISABLED } from '../../../constants'
import TextView from '../TextView'
import getValueByTopic from '../../../mixins/getValueByTopic.js'
export default {
  name: 'StaticInformer',
  props: ['item', 'index', 'mini', 'value', 'blocked'],
  data () {
    return {
      WIDGET_STATUS_DISABLED
    }
  },
  computed: {
    text () {
      return this.item.settings.text
    }
  },
  components: { TextView },
  mixins: [getValueByTopic]
}
</script>
