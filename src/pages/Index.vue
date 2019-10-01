<template>
  <q-page class="flex flex-center">
    <dash
      :client-settings="client"
      :init-boards="initBoards"
      @change:status="(status) => { $emit('change:status', status) }"
      @share="model => $emit('share', model)"
      @change:title="t => title = t"
      @update:boards="saveBoardsToLocalStorage"
    />
  </q-page>
</template>

<style>
</style>

<script>
import Dash from '../components/Dash'
import { BOARDS_LOCALSTORAGE_NAME } from '../constants'
export default {
  name: 'PageIndex',
  meta () {
    return {
      title: this.title
    }
  },
  data () {
    return {
      title: '',
      initBoards: this.$q.localStorage.get.item(BOARDS_LOCALSTORAGE_NAME)
    }
  },
  methods: {
    saveBoardsToLocalStorage (boards) {
      this.$q.localStorage.set(BOARDS_LOCALSTORAGE_NAME, boards)
    }
  },
  props: [ 'client' ],
  components: { Dash }
}
</script>
