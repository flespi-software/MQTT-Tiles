export default function getTopics (widget) {
  const mainTopics = widget.dataTopics.map(topic => (topic.topicTemplate || topic.topicFilter).replace(/<%.*%>/g, '+'))
  return {
    subscribe: [
      ...mainTopics,
      ...widget.settings.topics.map(topic => (topic.topicTemplate || topic.topicFilter).replace(/<%.*%>/g, '+'))
    ],
    publish: [...mainTopics]
  }
}
