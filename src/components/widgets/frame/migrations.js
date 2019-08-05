import { IFRAME_MODE_INTEGRATION, IFRAME_MODE_SHOW } from './constants'
import cloneDeep from 'lodash/cloneDeep'
export default {
  '1.5.4': (widget) => {
    let settings = widget.settings
    if (settings.mode === undefined) { settings.mode = IFRAME_MODE_SHOW }
    if (settings.mode === IFRAME_MODE_SHOW) {
      settings.items = []
      settings.topics = []
    }
    if (settings.mode === IFRAME_MODE_INTEGRATION) {
      let topic = cloneDeep(widget.dataTopics[0])
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
  }
}
