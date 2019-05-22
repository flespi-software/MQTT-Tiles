<template>
  <markdown
    class="markdown-block"
    table-class="markdown-table"
    :source="source"
    :postrender="(str) => { return str.replace(/\*\*\s\*\s\*\*/g, '*') }"
  >
    <slot/>
  </markdown>
</template>

<script>
import Markdown from 'vue-markdown'
export default {
  name: 'flespi-markdown',
  props: ['source'],
  data () {
    return {}
  },
  mounted () { this.$prism.highlightAll() },
  updated () { this.$prism.highlightAll() },
  components: { Markdown }
}
</script>

<style lang="stylus">
  .markdown-block
    a
      color: red
    .markdown-table
      border solid 1px #DDDDDD
      background #FFFFFF
      table-layout auto
      width 100%
      margin-bottom 16px
      border-collapse collapse
      border-spacing 0
      thead
        background #F5F5F5
        tr
          th
            padding 5px
            font-size 0.9em
            color #666666
            border-bottom 1px solid #999999
      tbody
        tr
          &:nth-of-type(even)
            background #F9F9F9
          td
            padding 6px
            font-size 0.9em
            border-bottom 1px solid #cccccc
            vertical-align top
            line-height 1.3em
</style>
