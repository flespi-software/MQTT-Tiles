import { getTopicModel } from '../../../constants/defaultes'
export default {
  '1.5.3': (widget) => {
    widget.settings.minWidth = 1
    return widget
  },
  '1.5.4': (widget) => {
    widget.settings.icon = ''
    return widget
  },
  '1.10.6': (widget) => {
    const settings = widget.settings
    if (typeof settings.topic === 'string') {
      settings.topics = [
        getTopicModel(
          {
            topicTemplate: settings.topic,
            topicFilter: settings.topic
          }
        )
      ]
    }
    return widget
  },
  '1.10.7': (widget) => {
    const settings = widget.settings
    if (typeof settings.payload === 'string') {
      settings.topics.forEach(topic => { topic.payload = settings.payload })
    }
    return widget
  }
}
