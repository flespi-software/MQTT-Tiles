<template>
  <q-page class="flex flex-center">
    <dash :clientSettings="client" @change:status="(status) => { $emit('change:status', status) }" @share="model => $emit('share', model)" @change:title="t => title = t"/>
  </q-page>
</template>

<style>
</style>

<script>
import Dash from '../components/Dash'
export default {
  name: 'PageIndex',
  meta () {
    return {
      title: this.title
    }
  },
  data () {
    return {
      title: ''
    }
  },
  props: [ 'client' ],
  components: { Dash }
}
</script>
