<template>
  <q-page class="flex flex-center">
    <dash
      ref="dash"
      :client-settings="client"
      :init-boards="initBoards"
      @change:status="(status) => { $emit('change:status', status) }"
      @share="model => $emit('share', model)"
      @share:prepare="sharePrepareHandler"
      @change:title="t => title = t"
      @update:boards="saveBoardsToLocalStorage"
    />
    <share-wizard
      v-if="shareWizardConfig"
      v-model="shareWizardOpened"
      :config="shareWizardConfig"
      @hide="shareWizardConfig = undefined, shareWizardOpened = false"
      @share="shareBoard"
    />
  </q-page>
</template>

<style>
</style>

<script>
import Dash from '../components/Dash'
import ShareWizard from '../components/ShareWizard'
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
      initBoards: this.$q.localStorage.get.item(BOARDS_LOCALSTORAGE_NAME),
      shareWizardOpened: false,
      shareWizardConfig: undefined
    }
  },
  methods: {
    saveBoardsToLocalStorage (boards) {
      this.$q.localStorage.set(BOARDS_LOCALSTORAGE_NAME, boards)
    },
    sharePrepareHandler (shareWizardConfig) {
      this.shareWizardConfig = shareWizardConfig
      this.shareWizardOpened = true
    },
    shareBoard (config) {
      this.$refs.dash.shareBoard(config)
    }
  },
  props: [ 'client' ],
  components: { Dash, ShareWizard }
}
</script>
