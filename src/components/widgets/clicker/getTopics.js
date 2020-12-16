export default function getTopics (widget) {
  return {
    publish: widget.settings.topics.map(topic => (topic.topicTemplate || topic.topicFilter).replace(/<%.*%>/g, '+'))
  }
}
