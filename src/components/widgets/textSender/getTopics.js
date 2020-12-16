export default function getTopics (widget) {
  const topic = widget.settings.topics[0]
  return {
    publish: [(topic.topicTemplate || topic.topicFilter).replace(/<%.*%>/g, '+')]
  }
}
