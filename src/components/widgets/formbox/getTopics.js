import { SCHEMA_MODE_TOPIC } from './constants'
export default function getTopics (widget) {
  const settings = widget.settings
  const topics = settings.topics || []
  const subscribe = []
  const publish = []
  const dataTopic = topics[0]
  if (dataTopic && (dataTopic.topicTemplate || dataTopic.topicFilter)) {
    const normalized = (dataTopic.topicTemplate || dataTopic.topicFilter).replace(/<%.*%>/g, '+')
    subscribe.push(normalized)
    if (!settings.readonly) {
      publish.push(normalized)
    }
  }
  if (settings.schemaMode === SCHEMA_MODE_TOPIC) {
    const schemaTopic = topics[1]
    if (schemaTopic && (schemaTopic.topicTemplate || schemaTopic.topicFilter)) {
      const normalized = (schemaTopic.topicTemplate || schemaTopic.topicFilter).replace(/<%.*%>/g, '+')
      subscribe.push(normalized)
    }
  }
  return { subscribe, publish }
}
