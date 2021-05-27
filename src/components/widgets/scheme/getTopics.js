const DEFAULT_MODE = 0,
  COMMAND_MODE = 1
export default function getTopics (widget) {
  const subscribe = [],
    publish = []
  widget.settings.items.forEach(item => {
    if (item.topic) {
      const topic = (item.topic.topicTemplate || item.topic.topicFilter).replace(/<%.*%>/g, '+')
      subscribe.push(topic)
      if (item.type === 'toggle') {
        if (item.settings.mode === COMMAND_MODE) {
          publish.push(item.settings.falseActionTopic)
          publish.push(item.settings.trueActionTopic)
        } else if (widget.settings.mode === DEFAULT_MODE) {
          publish.push(topic)
        }
      }
    }
  })
  return {
    subscribe,
    publish
  }
}
