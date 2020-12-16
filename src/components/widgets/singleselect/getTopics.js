import { DEFAULT_MODE } from './constants.js'
export default function getTopics (widget) {
  let publish
  if (widget.settings.mode === DEFAULT_MODE) {
    const topic = widget.dataTopics[0]
    publish = [topic.topicTemplate || topic.topicFilter]
  } else {
    publish = widget.settings.items.map(item => item.actionTopic)
  }
  return {
    publish,
    subscribe: widget.dataTopics.map(topic => (topic.topicTemplate || topic.topicFilter).replace(/<%.*%>/g, '+'))
  }
}
