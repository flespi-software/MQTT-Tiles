import {
  WIDGET_VALUE_FORMAT_STRING,
  WIDGET_VALUE_FORMAT_HUMAN_READABLE_SIZE,
  WIDGET_VALUE_FORMAT_DATE,
  WIDGET_VALUE_FORMAT_TIME
} from '../constants'
import { format, date } from 'quasar'
const { humanStorageSize } = format
import math from 'mathjs'
let timeFormat = (value) => {
  let days = Math.floor(value / 86400000)
  value = value % 86400000
  let hours = Math.floor(value / 3600000)
  value = value % 3600000
  let minutes = Math.floor(value / 60000)
  value = value % 60000
  let seconds = Math.floor(value / 1000)
  return (days ? days + ' days ' : '') + (hours ? hours + ' hours ' : '') + (minutes ? minutes + ' minutes ' : '') + (seconds ? seconds + ' seconds ' : '')
}
export default {
  methods: {
    mathProcessing (value, mathTemplate) {
      if (mathTemplate && value !== 'N/A') {
        try {
          let mathExp = mathTemplate.replace(/%value%/g, value)
          value = math.eval(mathExp)
        } catch (e) {}
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
              value = value !== 'N/A' ? date.formatDate(value, 'DD/MM/YYYY HH:mm:ss.SSS') : value
              break
            }
            case WIDGET_VALUE_FORMAT_TIME: {
              value = value !== 'N/A' ? timeFormat(value) : value
            }
          }
        } catch (e) {}
      }
      return value
    }
  }
}
