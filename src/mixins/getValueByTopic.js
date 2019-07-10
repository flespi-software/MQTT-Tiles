import { WIDGET_PAYLOAD_TYPE_STRING, WIDGET_PAYLOAD_TYPE_JSON } from '../constants'
import get from 'lodash/get'
export default {
  methods: {
    getValueByTopic (value, topic) {
      let isPacket = value instanceof Uint8Array
      if (value === null) {
        value = 'N/A'
      } else {
        switch (topic.payloadType) {
          case WIDGET_PAYLOAD_TYPE_STRING: {
            value = isPacket ? value.toString() : JSON.stringify(value)
            break
          }
          case WIDGET_PAYLOAD_TYPE_JSON: {
            try {
              if (topic.payloadField) {
                value = get(isPacket ? JSON.parse(value.toString()) : value, topic.payloadField, 'N/A')
              } else {
                value = JSON.parse(isPacket ? value.toString() : JSON.stringify(value))
              }
            } catch (e) { value = 'N/A' }
            break
          }
          default: { value = isPacket ? value.toString() : JSON.stringify(value) }
        }
      }
      return value
    }
  }
}
