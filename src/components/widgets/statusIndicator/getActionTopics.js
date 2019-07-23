import { DEFAULT_MODE } from './constants.js'
export default function getActionTopics (widget) {
  if (widget.settings.mode === DEFAULT_MODE) {
    return [widget.dataTopics[0].topicFilter]
  } else {
    return widget.settings.items.map(item => item.actionTopic)
  }
}
