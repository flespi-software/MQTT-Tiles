import { WIDGET_PAYLOAD_TYPE_STRING, WIDGET_PAYLOAD_TYPE_JSON } from '../constants'
import get from 'lodash/get'
export default {
  methods: {
    getValueByTopic (value, topic) {
      if (value === null) {
        value = 'N/A'
      } else {
        switch (topic.payloadType) {
          case WIDGET_PAYLOAD_TYPE_STRING: {
            value = value.toString()
            break
          }
          case WIDGET_PAYLOAD_TYPE_JSON: {
            try {
              if (topic.payloadField) {
                value = get(JSON.parse(value.toString()), topic.payloadField, 'N/A').toString()
              } else {
                value = JSON.parse(value.toString())
              }
            } catch (e) { value = 'N/A' }
            break
          }
          default: { value = value.toString() }
        }
      }
      return value
    }
  }
}
