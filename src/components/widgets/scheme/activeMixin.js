import get from 'lodash/get'
import validateTopic from '../../../mixins/validateTopic.js'
import TextSchema from './TextSchema'
import ToggleSchema from './ToggleSchema'
import StatusSchema from './StatusSchema'
import StaticTextSchema from './StaticTextSchema'
const componentsByType = {
  text: TextSchema,
  toggle: ToggleSchema,
  status: StatusSchema,
  'static-text': StaticTextSchema
}
export default {
  data () {
    return {
      activeItemIndex: undefined
    }
  },
  mixins: [validateTopic],
  computed: {
    activeItem () {
      let item
      if (typeof this.activeItemIndex !== 'undefined') {
        item = this.currentSettings.items[this.activeItemIndex]
      }
      return item
    },
    errorsByItems () {
      return this.currentSettings.items.reduce((errors, item, index, items) => {
        const hasTopic = item.topic === undefined || (!!item.topic && this.validateTopic(item.topic.topicFilter))
        const validator = get(componentsByType[item.type], 'methods.validate', () => true)
        const isValid = hasTopic && validator(item)
        if (!isValid) { errors[index] = true }
        return errors
      }, {})
    }
  }
}
