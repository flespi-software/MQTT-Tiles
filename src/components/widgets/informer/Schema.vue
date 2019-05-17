<template>
  <div>
    <div class="row">
      <div class="col-xs-12 col-sm-10 q-pl-xs">
        <q-input v-if="currentSettings.payloadType === 1" color="dark"  v-model="currentSettings.payloadField" float-label="Payload field"/>
      </div>
      <div class="col-6">
        <q-input class="q-mr-sm" color="dark" v-model="currentSettings.prefix" float-label="Prefix"/>
      </div>
      <div class="col-6">
        <q-input class="q-ml-sm" color="dark" v-model="currentSettings.postfix" float-label="Postfix"/>
      </div>
      <div class="q-mt-sm col-12">
        <q-toggle color="dark" v-model="currentSettings.isNeedTime" label="Show last update time"/>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InformerSchema',
  props: ['widget'],
  data () {
    let defaultSettings = {
      prefix: '',
      postfix: '',
      height: 2,
      width: 2,
      minWidth: 2,
      minHeight: 2,
      maxTopicsLength: 1,
      isNeedTime: true
    }
    return {
      defaultSettings,
      currentSettings: Object.assign({}, defaultSettings, this.widget.settings)
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
