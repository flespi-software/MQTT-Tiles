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
          }
        } catch (e) {}
      }
      return value
    }
  }
}
