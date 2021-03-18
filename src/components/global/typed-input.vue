<template>
  <q-input :value="viewedValue" @input="setTypedValue" outlined dense hide-bottom-space color="grey-9" v-bind="settings">
    <q-icon slot="append" name="mdi-information-outline">
      <q-tooltip>
        <div class="text-bold">Typed input</div>
        <div style="max-width: 150px;">All values in this input will be interpreted by the auto type check. Example: 10 => number, true => boolean, null => null. If you want to set a string type, just wrap the value in quotes. Example: '10', 'true', 'null'.</div>
      </q-tooltip>
    </q-icon>
  </q-input>
</template>

<script>
export default {
  props: ['value', 'settings'],
  data () {
    return {
      typedValue: this.value
    }
  },
  computed: {
    viewedValue () {
      let value = this.typedValue
      try { value = JSON.parse(value) } catch (e) {}
      const needWrap = typeof this.typedValue !== typeof value
      value = needWrap ? `'${value}'` : value !== null ? value : JSON.stringify(value)
      return value
    }
  },
  methods: {
    getTypedValue (value) {
      const initValue = value
      const needStringType = !!(typeof value === 'string' && value.length && value[0].match(/'|"/) && value.slice(-1).match(/'|"/))
      if (needStringType) { value = value.slice(1, -1) }
      try { value = JSON.parse(value) } catch (e) {}
      if (typeof value === 'string') { value = initValue }
      if (needStringType) { value = value ? value.toString() : JSON.stringify(value) }
      return value
    },
    setTypedValue (value) {
      value = this.getTypedValue(value)
      this.typedValue = value
      this.$emit('input', value)
    }
  }
}
</script>
