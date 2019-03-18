import { WIDGET_PAYLOAD_TYPE_STRING, WIDGET_PAYLOAD_TYPE_JSON } from '../constants'
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
                value = JSON.parse(value.toString())[topic.payloadField] || 'N/A'
              } else {
                value = JSON.parse(value.toString())
              }
            } catch (e) { value = value.toString() }
            break
          }
          default: { value = value.toString() }
        }
      }
      return value
    }
  }
}
