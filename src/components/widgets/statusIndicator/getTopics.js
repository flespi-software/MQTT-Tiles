export default function getTopics (widget) {
  return {
    subscribe: widget.dataTopics.map(topic => (topic.topicTemplate || topic.topicFilter).replace(/<%.*%>/g, '+'))
  }
}
