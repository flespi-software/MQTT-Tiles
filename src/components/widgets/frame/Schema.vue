<template>
  <div>
    <div class="text-grey-6 text-center q-mt-md" style="font-size: 1.3rem;">{{descriptions[currentSettings.mode]}}</div>
    <div class="row">
      <q-btn-toggle class='q-mt-md col-12' rounded toggle-text-color="dark" text-color="grey-6" flat v-model="currentSettings.mode" :options="modeOptions"/>
      <q-input class="col-12" v-if="currentSettings.mode === IFRAME_MODE_INTEGRATION" color="dark" v-model="currentSettings.link" float-label="Iframe link"/>
      <q-input class="col-12" type="textarea" v-if="currentSettings.mode === IFRAME_MODE_INTEGRATION" color="dark" v-model="currentSettings.template" float-label="Payload template"/>
      <div v-if="currentSettings.mode === IFRAME_MODE_INTEGRATION" class="col-12 text-grey-6 q-mt-xs" style="font-size: .8rem">
        You can use variables in template: <span class="text-grey-8">&lt;{topic}&gt;</span> is a topic from payload packet, <span class="text-grey-8">&lt;%payload.name%&gt;</span> is a JSON path to value in payload, if payload is object.
        <span class="text-dark cursor-pointer" @click="exampleSettingsApply">Example</span>
      </div>
      <div class="q-mt-sm col-12">
        <q-toggle color="dark" v-model="currentSettings.isNeedTime" label="Show last update time"/>
      </div>
    </div>
  </div>
</template>

<script>
import { IFRAME_MODE_INTEGRATION, IFRAME_MODE_SHOW } from './constants'
export default {
  name: 'FrameSchema',
  props: ['widget'],
  data () {
    let defaultSettings = {
      height: 6,
      width: 3,
      maxTopicsLength: 1,
      minWidth: 3,
      minHeight: 3,
      mode: 0,
      template: '',
      link: 'https://flespi.io/mapview',
      isNeedTime: true
    }
    return {
      defaultSettings,
      currentSettings: Object.assign({}, defaultSettings, this.widget.settings),
      IFRAME_MODE_INTEGRATION,
      IFRAME_MODE_SHOW,
      modeOptions: [
        {label: 'Integration mode', value: IFRAME_MODE_INTEGRATION},
        {label: 'Show mode', value: IFRAME_MODE_SHOW}
      ],
      descriptions: [
        'Payload will be posted to your iframe',
        'Link as payload expected!'
      ]
    }
  },
  methods: {
    exampleSettingsApply () {
      this.$set(this.currentSettings, 'link', 'https://flespi.io/mapview')
      this.$set(this.currentSettings, 'template', `MapView|cmd:{"addmarkers": [[<%position.latitude%>, <%position.longitude%>]], "clear": "all"}`)
      this.widget.dataTopics.push({
        topicFilter: 'flespi/message/gw/devices/+',
        payloadType: 1,
        payloadField: ''
      })
    }
  },
  created () {
    this.$emit('update', this.currentSettings)
  },
  watch: {
    currentSettings: {
      deep: true,
      handler (val) {
        this.$emit('update', val)
      }
    }
  }
}
</script>
