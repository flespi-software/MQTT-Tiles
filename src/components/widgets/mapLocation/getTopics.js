export default function getTopics (widget) {
  return {
    subscribe: widget.settings.topics.map(topic => (topic.topicTemplate || topic.topicFilter).replace(/<%.*%>/g, '+'))
  }
}
