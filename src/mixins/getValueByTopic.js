import { WIDGET_PAYLOAD_TYPE_STRING, WIDGET_PAYLOAD_TYPE_JSON } from '../constants'
import JSONPath from 'jsonpath'
function jsonpath (source, path, defaultValue) {
  let value = JSONPath.query(source, path)
  if (value === null || value === undefined || !value.length) { value = defaultValue }
  if (value.length === 1) { value = value[0] }
  return value
}
export default {
  methods: {
    getCleanValue (value, topic = {}) {
      const isPacket = value instanceof Uint8Array
      if (value === null) {
        value = topic.default || 'N/A'
      } else {
        switch (topic.payloadType) {
          case WIDGET_PAYLOAD_TYPE_STRING: {
            value = isPacket ? value.toString() : JSON.stringify(value)
            break
          }
          case WIDGET_PAYLOAD_TYPE_JSON: {
            try {
              value = JSON.parse(isPacket ? value.toString() : JSON.stringify(value))
            } catch (e) { value = 'N/A' }
            break
          }
          default: { value = isPacket ? value.toString() : JSON.stringify(value) }
        }
      }
      return value
    },
    getValueByTopic (value, topic = {}) {
      const isPacket = value instanceof Uint8Array
      if (value === null) {
        value = topic.default || 'N/A'
      } else {
        switch (topic.payloadType) {
          case WIDGET_PAYLOAD_TYPE_STRING: {
            value = isPacket ? value.toString() : JSON.stringify(value)
            break
          }
          case WIDGET_PAYLOAD_TYPE_JSON: {
            try {
              if (topic.payloadField) {
                const source = isPacket ? JSON.parse(value.toString()) : value
                const val = jsonpath(source, topic.payloadField, 'N/A')
                if (topic.payloadNameField) {
                  const name = jsonpath(source, topic.payloadNameField, 'N/A')
                  value = [name, val]
                } else {
                  value = val
                }
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
