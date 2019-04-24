import { DEFAULT_MODE, COMMAND_MODE } from './constants.js'
export default function getActionTopics (widget) {
  if (widget.settings.mode === COMMAND_MODE) {
    return [widget.settings.falseActionTopic, widget.settings.trueActionTopic]
  } else if (widget.topics.length === 1) {
    return [widget.topics[0]]
  } else if (widget.settings.mode === DEFAULT_MODE) {
    return [widget.settings.actionTopic]
  }
}
