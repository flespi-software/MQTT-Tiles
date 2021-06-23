<template>
  <div class="calculator__payload-wrapper" style="padding-bottom: 15px;" v-html="text"></div>
</template>

<script>
import { WIDGET_STATUS_DISABLED } from '../../../constants'
import getValueByTopic from '../../../mixins/getValueByTopic.js'
import formatValue from '../../../mixins/formatValue.js'
import get from 'lodash/get'
import xss from 'xss'
const xssOptions = {
  whiteList: {
    a: ['href', 'title', 'target', 'style', 'class'],
    span: ['style', 'class'],
    div: ['style', 'class'],
    table: ['style', 'class'],
    tr: ['style', 'class'],
    td: ['style', 'class'],
    th: ['style', 'class'],
    b: ['style', 'class'],
    i: ['style', 'class'],
    em: ['style', 'class'],
    sub: ['style', 'class'],
    sup: ['style', 'class'],
    s: ['style', 'class'],
    hr: ['style', 'class'],
    small: ['style', 'class'],
    br: ['style', 'class']
  }
}
export default {
  name: 'Calculator',
  props: ['item', 'index', 'mini', 'value'],
  data () {
    return {
      WIDGET_STATUS_DISABLED
    }
  },
  methods: {
    resolveValues (string) {
      return string.replace(/%topic\[(\d*)\](\((.*)\))?%/g, (_, index, p, path) => {
        let res = ''
        if (path) {
          res = `<%${index}${path.slice(1)}%>`
        } else {
          res = `<%${index}%>`
        }
        return res
      })
    }
  },
  computed: {
    valuesByIndex () {
      return this.item.dataTopics.reduce((result, topic, index) => {
        const value = get(this.value, `[${topic.topicFilter}].payload`, null)
        result[index + 1] = this.getValueByTopic(value, topic)
        return result
      }, {})
    },
    variables () {
      return this.item.settings.variables.reduce((result, variable) => {
        let value = variable.math
        value = value.replace(/%variable\[([a-zA-Z0-9-+&@#/%?=~_|!:,.;\s]*)\]%/g, (_, name) => {
          return result[name] || 'nill'
        })
        result[variable.name] = this.formatValue(this.mathProcessing(this.valuesByIndex, this.resolveValues(value)), { ...variable, ...{ math: undefined } })
        return result
      }, {})
    },
    text () {
      let value = this.item.settings.template
      value = value.replace(/%variable\[([a-zA-Z0-9-+&@#/%?=~_|!:,.;\s]*)\]%/g, (_, name) => {
        return this.variables[name] || 'nill'
      })
      value = value.replace(/%topic\[(\d*)\](\((.*)\))?%/g, (_, index, p, path) => {
        let res = this.valuesByIndex[index]
        if (path) {
          res = get(res, `${index}${path.slice(1)}`, undefined)
        }
        return res || 'nill'
      })
      return xss(value, xssOptions)
    }
  },
  mixins: [getValueByTopic, formatValue]
}
</script>
