<template>
  <div>
    <div class="row">
      <div class="col-6">
        <q-input class="q-mr-sm" color="dark" v-model="currentSettings.prefix" float-label="Prefix"/>
      </div>
      <div class="col-6">
        <q-input class="q-ml-sm" color="dark" v-model="currentSettings.postfix" float-label="Postfix"/>
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
      height: 1,
      width: 2
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
