const VARIABLE_TYPE_CUSTOM = 0,
  VARIABLE_TYPE_SOURCE = 1,
  SORT_VARS_BY_VALUE = 0,
  SORT_VARS_BY_LABEL = 1
export default {
  devices: {
    name: 'devices',
    preset: 'devices',
    type: VARIABLE_TYPE_SOURCE,
    topic: {
      topicTemplate: 'flespi/state/gw/devices/+',
      topicFilter: 'flespi/state/gw/devices/+',
      payloadType: 1,
      payloadField: 'id',
      payloadNameField: 'name'
    },
    sortVarsBy: SORT_VARS_BY_LABEL,
    values: []
  },
  calcs: {
    name: 'calcs',
    preset: 'calcs',
    type: VARIABLE_TYPE_SOURCE,
    topic: {
      topicTemplate: 'flespi/state/gw/calcs/+',
      topicFilter: 'flespi/state/gw/calcs/+',
      payloadType: 1,
      payloadField: 'id',
      payloadNameField: 'name'
    },
    sortVarsBy: SORT_VARS_BY_LABEL,
    values: []
  },
  channels: {
    name: 'channels',
    preset: 'channels',
    type: VARIABLE_TYPE_SOURCE,
    topic: {
      topicTemplate: 'flespi/state/gw/channels/+',
      topicFilter: 'flespi/state/gw/channels/+',
      payloadType: 1,
      payloadField: 'id',
      payloadNameField: 'name'
    },
    sortVarsBy: SORT_VARS_BY_LABEL,
    values: []
  },
  custom: {
    name: 'name',
    preset: 'custom',
    type: VARIABLE_TYPE_CUSTOM,
    topic: {
      topicTemplate: '',
      topicFilter: '',
      payloadType: 0,
      payloadField: ''
    },
    sortVarsBy: SORT_VARS_BY_VALUE,
    values: []
  }
}
