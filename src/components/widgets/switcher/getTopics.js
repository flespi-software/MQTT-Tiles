import { DEFAULT_MODE, COMMAND_MODE } from './constants.js'
export default function getTopics (widget) {
  let publish
  if (widget.settings.mode === COMMAND_MODE) {
    publish = [widget.settings.falseActionTopic, widget.settings.trueActionTopic]
  } else if (widget.dataTopics.length === 1) {
    const topic = widget.dataTopics[0]
    publish = [(topic.topicTemplate || topic.topicFilter).replace(/<%.*%>/g, '+')]
  } else if (widget.settings.mode === DEFAULT_MODE) {
    publish = [widget.settings.actionTopic]
  }
  return {
    publish,
    subscribe: widget.dataTopics.map(topic => (topic.topicTemplate || topic.topicFilter).replace(/<%.*%>/g, '+'))
  }
}
