import { IFRAME_MODE_INTEGRATION, IFRAME_MODE_SHOW } from './constants'
import cloneDeep from 'lodash/cloneDeep'
export default {
  '1.5.4': (widget) => {
    const settings = widget.settings
    if (settings.mode === undefined) { settings.mode = IFRAME_MODE_SHOW }
    if (settings.mode === IFRAME_MODE_SHOW) {
      settings.items = []
      settings.topics = []
    }
    if (settings.mode === IFRAME_MODE_INTEGRATION) {
      const topic = cloneDeep(widget.dataTopics[0])
      settings.maxTopicsLength = 0
      settings.items = [
        {
          label: 'New item',
          template: settings.template,
          topic
        }
      ]
      settings.topics = [topic]
      widget.dataTopics = []
      delete settings.template
    }
    return widget
  },
  '1.10.1': (widget) => {
    const settings = widget.settings
    settings.readyMessage = ''
    return widget
  },
  '1.10.3': (widget) => {
    const settings = widget.settings
    settings.initMessage = ''
    return widget
  },
  '1.12.13': (widget) => {
    const settings = widget.settings
    if (!settings.aclTopics) {
      settings.aclTopics = []
    }
    return widget
  }
}
