<template>
  <q-dialog :value="!!board" :position="position" @before-hide="$emit('close')" @escape-key="$emit('close')">
    <div class="bg-white" :style="{minWidth: $q.screen.width > 500 ? '500px' : '100%'}">
      <div class="bg-grey-9 q-py-xs flex row reverse">
        <q-btn v-close-popup flat color="white" round icon="mdi-close" @click="$emit('close')" />
      </div>
      <q-separator />
      <div class="q-pa-md" style="min-height: 91px;">
        <div class="row no-wrap items-center">
          <div class="col">
            <div class="text-h6 ellipsis" style="line-height: 1.25rem">{{name}}</div>
            <div class="text-grey-9" style="line-height: 1.25rem;font-size: .9rem;">{{get(board, 'settings.id', '&lt;no_alias&gt;')}}</div>
          </div>
          <div class="col-auto text-grey text-caption row no-wrap items-center">
            <q-icon :name="blocked ? 'mdi-lock' : 'mdi-lock-open'" size="1.2rem">
              <q-tooltip>{{blocked ? 'Board locked' : 'Board unlocked'}}</q-tooltip>
            </q-icon>
          </div>
        </div>
        <div v-if="boardVars.length">
          <q-icon class="q-mr-xs" v-for="variable in boardVars" size="1.2rem" :key="variable.name" :name="getIcon(variable)" color="grey-9">
            <q-tooltip>Variable: {{variable.name}}</q-tooltip>
          </q-icon>
        </div>
      </div>
      <div class="bg-grey-4 scroll q-pa-md" style="font-size: 0.9rem;max-height: calc(100% - 142px);" v-if="(topics.subscribe && topics.subscribe.length) || (topics.publish && topics.publish.length)">
        <div v-if="topics.subscribe && topics.subscribe.length" class="text-white q-pa-sm row">
          <div class="col text-grey-9 text-weight-medium">Topics</div>
          <div class="col-auto text-grey-9 text-caption row no-wrap items-center">
            <q-icon class="cursor-pointer" name="mdi-content-copy" size="0.9rem" @click="copy(
              'Subscribe\n\r' + topics.subscribe.join('\n') + '\rPublish\n\r' + topics.publish.join('\n')
            )"/>
          </div>
        </div>
        <div>
          <div v-if="topics.subscribe && topics.subscribe.length" class="bg-orange text-white q-pa-sm row" style="border-radius: 5px 5px 0 0">
            <div class="col">Subscribe</div>
            <div class="col-auto text-white text-caption row no-wrap items-center">
              <q-icon class="cursor-pointer" name="mdi-content-copy" size="0.9rem" @click="copy(topics.subscribe.join('\n'))"/>
            </div>
          </div>
          <div v-if="topics.subscribe && topics.subscribe.length" class="bg-orange-2 q-pa-xs text-grey-10 q-mb-sm topics--bordered topics--orange">
            <div v-for="(topic, index) in topics.subscribe" :key="topic" class="row">
              <div class="col">{{topic}}</div>
              <div class="col-auto text-grey text-caption row no-wrap items-center">
                <q-icon class="cursor-pointer" name="mdi-content-copy" size="0.9rem" @click="copy(topic)"/>
              </div>
              <q-separator v-if="index < topics.subscribe.length - 1"/>
            </div>
          </div>
          <div v-if="topics.publish && topics.publish.length" class="bg-indigo text-white q-pa-sm row" style="border-radius: 5px 5px 0 0">
            <div class="col">Publish</div>
            <div class="col-auto text-white text-caption row no-wrap items-center">
              <q-icon class="cursor-pointer" name="mdi-content-copy" size="0.9rem" @click="copy(topics.publish.join('\n'))"/>
            </div>
          </div>
          <div v-if="topics.publish && topics.publish.length" class="bg-indigo-2 q-pa-xs text-grey-10 topics--bordered topics--indigo">
            <div v-for="(topic, index) in topics.publish" :key="topic" class="row">
              <div class="col">{{topic}}</div>
              <div class="col-auto text-grey text-caption row no-wrap items-center">
                <q-icon class="cursor-pointer" name="mdi-content-copy" size="0.9rem" @click="copy(topic)"/>
              </div>
              <q-separator v-if="index < topics.publish.length - 1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-dialog>
</template>
<script>
import getTopics from './widgets/getTopics.js'
import get from 'lodash/get'
import { copyToClipboard } from 'quasar'
export default {
  props: {
    board: {
      type: Object
    }
  },
  data () {
    return {
      position: 'top'
    }
  },
  computed: {
    topics () {
      return this.board ? getTopics(this.board.settings, this.board.widgets) : {}
    },
    boardVars () {
      return get(this.board, 'settings.settings.variables', [])
    },
    name () { return get(this.board, 'settings.name') || '*No name*' },
    blocked () { return get(this.board, 'settings.settings.blocked', false) }
  },
  methods: {
    close () {
      this.$emit('close')
    },
    get,
    getIcon (variable) {
      let icon = ''
      if (variable.preset) {
        if (variable.preset === 'devices') {
          icon = 'mdi-developer-board'
        } else if (variable.preset === 'channels') {
          icon = 'mdi-call-merge'
        } else if (variable.preset === 'calcs') {
          icon = 'mdi-calculator-variant'
        } else if (variable.preset === 'custom') {
          if (variable.type === 1) {
            icon = 'mdi-alpha-v-box'
          } else {
            icon = 'mdi-variable'
          }
        }
      } else {
        if (variable.type === 1) {
          icon = 'mdi-alpha-v-box'
        } else {
          icon = 'mdi-variable'
        }
      }
      return icon
    },
    copy (text) {
      copyToClipboard(text)
    }
  }
}
</script>

<style lang="stylus">
  .topics--bordered
    border 2px solid
    border-radius 0 0 5px 5px
    border-top none
  .topics--orange
    border-color $orange
  .topics--indigo
    border-color $indigo
</style>
