<template>
  <q-page class="flex flex-center" :class="[`bg-${$theme}-1`]">
    <dash
      ref="dash"
      :client-settings="client"
      :init-boards="initBoards"
      @change-status="(status) => { $emit('change-status', status) }"
      @ping="(ping) => { $emit('ping', ping) }"
      @share="model => $emit('share', model)"
      @share:prepare="sharePrepareHandler"
      @change:title="t => title = t"
      @update:boards="updateBoards"
      @change:attach="changeAttachedBoards"
      @update-client-settings="$emit('update-client-settings')"
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
import diff from 'lodash/difference'
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
      initBoards: this.$integrationMode ? undefined : this.$q.localStorage.getItem(BOARDS_LOCALSTORAGE_NAME),
      shareWizardOpened: false,
      shareWizardConfig: undefined
    }
  },
  methods: {
    updateBoards (boards) {
      const newBoardsKeys = boards ? Object.keys(boards) : [],
        oldBoardsKeys = this.initBoards ? Object.keys(this.initBoards) : [],
        boardsToRemove = diff(oldBoardsKeys, newBoardsKeys),
        boardsToAdd = diff(newBoardsKeys, oldBoardsKeys)
      if (boardsToRemove.length) { this.$emit('delete:boards', boardsToRemove) }
      if (boardsToAdd.length) { this.$emit('add:boards', boardsToAdd) }
      if (!this.$integrationMode) {
        this.$q.localStorage.set(BOARDS_LOCALSTORAGE_NAME, boards)
        this.initBoards = boards
      } else {
        this.$integrationBus.send('saveBoards', boards)
      }
    },
    sharePrepareHandler (shareWizardConfig) {
      this.shareWizardConfig = shareWizardConfig
      this.shareWizardOpened = true
    },
    shareBoard (config) {},
    changeAttachedBoards (attachedBoards) {
      this.$emit('change:attach', attachedBoards)
    }
  },
  props: ['client'],
  components: { Dash, ShareWizard }
}
</script>
