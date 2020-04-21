import {
  WIDGET_VALUE_FORMAT_STRING,
  WIDGET_VALUE_FORMAT_HUMAN_READABLE_SIZE,
  WIDGET_VALUE_FORMAT_DATE,
  WIDGET_VALUE_FORMAT_DURATION
} from '../constants'
import { format, date } from 'quasar'
const { humanStorageSize } = format
import { create, all } from 'mathjs'
import get from 'lodash/get'
const timeFormat = (value) => {
  const days = Math.floor(value / 86400000)
  value = value % 86400000
  const hours = Math.floor(value / 3600000)
  value = value % 3600000
  const minutes = Math.floor(value / 60000)
  value = value % 60000
  const seconds = Math.floor(value / 1000)
  return (days ? days + ' days ' : '') + (hours ? hours + ' hours ' : '') + (minutes ? minutes + ' minutes ' : '') + (seconds || (!days && !hours && !minutes && !seconds) ? seconds + ' seconds ' : '')
}
const math = create(all)
math.import({
  equal: function (a, b) { return a === b },
  unequal: function (a, b) { return a !== b }
}, { override: true })
export default {
  methods: {
    mathProcessing (value, mathTemplate) {
      if (mathTemplate && value !== 'N/A') {
        try {
          let mathExp = mathTemplate.replace(/%value%/g, value)
          mathExp = mathExp.replace(/<%([a-zA-Z0-9-+&@#/%?=~_|!:,.;\s]*)%>/gim, (match, name) => {
            let val = get(value, name, undefined)
            val = val === undefined
              ? 'nill'
              : typeof value[name] === 'string' ? `"${value[name]}"` : value[name]
            return val
          })
          mathExp = mathExp.replace(/nill/gim, '"nill"')
          value = math.evaluate(mathExp)
        } catch (e) {
          value = false
        }
      }
      return value
    },
    formatValue (value, settings) {
      value = this.mathProcessing(value, settings.math)
      if (settings.valueFormat) {
        try {
          switch (settings.valueFormat) {
            case WIDGET_VALUE_FORMAT_STRING: {
              break
            }
            case WIDGET_VALUE_FORMAT_HUMAN_READABLE_SIZE: {
              value = humanStorageSize(value)
              break
            }
            case WIDGET_VALUE_FORMAT_DATE: {
              const format = settings.dateFormat || 'DD/MM/YYYY HH:mm:ss'
              value = value !== 'N/A' ? date.formatDate(value * 1000, format) : value
              break
            }
            case WIDGET_VALUE_FORMAT_DURATION: {
              value = value !== 'N/A' ? timeFormat(value * 1000) : value
            }
          }
        } catch (e) {}
      }
      return value
    }
  }
}
