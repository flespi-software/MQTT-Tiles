export default function getTopics (widget) {
  const topics = widget.dataTopics.map(topic => (topic.topicTemplate || topic.topicFilter).replace(/<%.*%>/g, '+'))
  return {
    subscribe: [...topics],
    publish: [...topics]
  }
}
