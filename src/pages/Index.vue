<template>
  <q-page class="flex flex-center">
    <dash :clientSettings="client" @change:status="(status) => { $emit('change:status', status) }"/>
  </q-page>
</template>

<style>
</style>

<script>
import Dash from '../components/Dash'
export default {
  name: 'PageIndex',
  props: [ 'client' ],
  components: { Dash }
}
</script>
