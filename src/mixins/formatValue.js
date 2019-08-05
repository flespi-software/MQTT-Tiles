import {
  WIDGET_VALUE_FORMAT_STRING,
  WIDGET_VALUE_FORMAT_HUMAN_READABLE_SIZE,
  WIDGET_VALUE_FORMAT_DATE
} from '../constants'
import { format, date } from 'quasar'
const { humanStorageSize } = format
import math from 'mathjs'
export default {
  methods: {
    formatValue (value, settings) {
      if (settings.math && value !== 'N/A') {
        try {
          let mathExp = settings.math.replace(/%value%/g, value)
          value = math.eval(mathExp)
        } catch (e) {}
      }
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
          }
        } catch (e) {}
      }
      return value
    }
  }
}
