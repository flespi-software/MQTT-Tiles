<template>
  <q-modal v-model="status" @hide="closeHandler">
    <q-modal-layout>
      <q-toolbar slot="header" color="dark">
        <q-toolbar-title>Share wizard</q-toolbar-title>
      </q-toolbar>
      <div
        style="margin: 0px;"
        :style="{ height: $q.platform.is.mobile ? 'calc(100% - 100px)' : '50vh', width: $q.platform.is.mobile ? 'calc(100% - 40px)' : '50vw'}"
      >
        <q-stepper flat ref="stepper" v-model="currentStep" class="no-wrap" style="height: 100%" color="amber-8">
          <q-step name="tokens" title="Tokens" v-if="config.tokens.length > 1" style="" :style="currentStep === 'tokens' ? {height: 'calc(100% - 72px)', position: 'relative'} : {}">
            <q-list class="absolute q-py-none" style="max-height: calc(100% - 48px); width: calc(100% - 48px); overflow: auto;" highlight separator>
              <q-item v-for="(token, index) in config.tokens" :key="token.credentions.username" @click.native="setToken(token), currentSelectedToken = index" :class="{active: token.label === shareBoardModel.token.label}" class="cursor-pointer">
                <q-item-main>
                  <q-item-tile class="text-dark text-weight-bold">{{token.label}}</q-item-tile>
                  <q-item-tile style="font-size: .8rem" class="text-grey-8 ellipsis">{{token.credentions.username}}</q-item-tile>
                </q-item-main>
                <q-item-side v-if="token.accessable !== undefined">
                  <div v-if="token.accessable">
                    <span class="text-white bg-green-8 round-borders text-weight-bold q-px-sm" style="font-size:.8rem;">valid</span>
                    <q-tooltip>Validation pass</q-tooltip>
                  </div>
                  <div v-else>
                    <span class="text-white bg-red-8 round-borders text-weight-bold q-px-xs" style="font-size: .8rem;">invalid</span>
                    <q-tooltip>You can`t share by this token</q-tooltip>
                  </div>
                </q-item-side>
              </q-item>
            </q-list>
          </q-step>
          <q-step name="replace" title="Upload" v-if="config.hasRemote">
            <div class="q-mx-sm q-my-md text-grey-8 text-center" style="font-size: 1.2rem;">Such board exists. Continue?</div>
            <q-checkbox v-model="isNeedCopy" color="dark" label="Rename to save a copy"/>
            <q-input
              color="dark"
              v-model="shareBoardModel.boardId"
              :disable="!isNeedCopy"
              float-label="Name"
              :error="isNeedCopy && (shareBoardModel.boardId === config.boardId || ((config.currentRemoteBoards && config.currentRemoteBoards.includes(shareBoardModel.boardId) || !config.currentRemoteBoards)))"
            />
          </q-step>
          <q-step name="link" title="Link" :active-icon="isLinkCopied ? 'mdi-check' : undefined">
            <template v-if="updatedBoardFlag">
              <q-input type="textarea" v-model="link" readonly/>
              <div class="text-center q-mt-md">
                <q-btn @click="copyLink" flat icon="mdi-content-copy" size="1.2rem">Copy</q-btn>
              </div>
            </template>
            <template v-else-if="updatedBoardFlag === false">
              <div class="rounded-borders bg-red-1 q-pa-md">
                <div class="q-title text-red-8 q-mb-sm">
                  <q-icon name="mdi-alert-outline"/>
                  Share error
                </div>
                <div class="text-grey-8">Link can`t be generated without updating the board in connection. (<span class="text-grey-7">{{updateBoardError.message}}</span>)</div>
              </div>
            </template>
            <template v-else-if="updatedBoardFlag === undefined">
              <div>
                Generating...
              </div>
            </template>
          </q-step>
        </q-stepper>
      </div>
      <q-toolbar slot="footer" color="dark">
        <q-btn flat dense class="q-mr-sm absolute" @click="closeHandler">Close</q-btn>
        <q-toolbar-title></q-toolbar-title>
        <q-btn flat v-if="currentStep !== steps[0].value && !updateBoardError" @click="prevStepHandler">Back</q-btn>
        <q-btn flat class="q-ml-sm" v-if="!updateBoardError" @click="nextStepHandler" :disable="!isValidStep">{{ currentStep === 'link' ? 'Done' : 'Next' }}</q-btn>
      </q-toolbar>
    </q-modal-layout>
  </q-modal>
</template>

<script>
import { Base64 } from 'js-base64'
import get from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'ShareWizard',
  props: ['value', 'config'],
  /*
    config = { tokens: Array, hasRemote: Boolean, boardId: String, syncNamespace: String, isRemote: Boolean, currentRemoteBoards: Array }
  */
  data () {
    return {
      stepsConst: {
        STEP_TOKEN: 'tokens',
        STEP_REPLACE: 'replace',
        STEP_LINK: 'link'
      },
      currentStep: 0,
      shareBoardModel: {
        token: '',
        boardId: this.config.boardId,
        isRemote: this.config.isRemote
      },
      link: '',
      isNeedCopy: false,
      isLinkCopied: false,
      currentConfig: cloneDeep(this.config),
      steps: [],
      updatedBoardFlag: undefined,
      updateBoardError: undefined
    }
  },
  computed: {
    status: {
      get () { return this.value },
      set (val) { this.$emit('input', val) }
    },
    isValidStep () {
      switch (this.currentStep) {
        case 'tokens': {
          return this.shareBoardModel.token
        }
        case 'replace': {
          return !this.isNeedCopy ||
            (
              this.isNeedCopy &&
              this.shareBoardModel.boardId !== this.config.boardId &&
              this.config.currentRemoteBoards &&
              !this.config.currentRemoteBoards.includes(this.shareBoardModel.boardId)
            )
        }
        default: { return true }
      }
    }
  },
  created () {
    let steps = {},
      stepIndex = 0
    if (this.config.tokens.length > 1) {
      steps[stepIndex] = { label: 'Token', value: this.stepsConst.STEP_TOKEN }
      stepIndex++
    } else {
      this.setToken(this.config.tokens[0])
    }
    if (this.config.hasRemote) {
      steps[stepIndex] = { label: 'Replace', value: this.stepsConst.STEP_REPLACE }
      stepIndex++
    } else {
      this.setboardId(this.config.boardId, this.config.boardId)
    }
    steps[stepIndex] = { label: 'Link', value: this.stepsConst.STEP_LINK }
    this.steps = steps
  },
  methods: {
    closeHandler () {
      this.link = ''
      this.shareBoardModel = {}
      this.currentStep = this.stepsConst.STEP_TOKEN
      this.steps = []
      this.updatedBoardFlag = undefined
      this.updateBoardError = undefined
      this.$emit('input', false)
      this.$emit('hide')
    },
    nextStepHandler () {
      this.validateCurrentStep()
        .then((result) => {
          if (result) {
            this.$refs.stepper.next()
          }
        })
    },
    prevStepHandler () {
      this.$refs.stepper.previous()
    },
    validateCurrentStep () {
      switch (this.currentStep) {
        case 'tokens': {
          return this.validateToken(this.shareBoardModel.token)
        }
        case 'replace': {
          return this.setboardId(this.shareBoardModel.boardId, this.config.boardId)
        }
        case 'link': {
          return Promise.resolve(this.closeHandler())
        }
      }
    },
    validateToken (token) {
      /*
        getAuthInfo then setToken
      */
      let flespiToken = token.credentions.username.indexOf('FlespiToken ') === 0
        ? token.credentions.username
        : `FlespiToken ${token.credentions.username}`
      return fetch('https://flespi.io/auth/info', {
        mode: 'cors',
        headers: {
          'Authorization': flespiToken
        }
      }).then(response => response.json())
        .then((accessData) => {
          let access = get(accessData, 'result[0].access.type', 1)
          let errors = !!accessData.errors
          let accessGranted = access !== 1
          if (accessGranted) {
            this.setToken(token)
            this.$set(token, 'accessable', true)
          } else if (errors || !accessGranted) {
            this.$set(token, 'accessable', false)
          }
          return accessGranted
        })
    },
    setToken (token) {
      this.$set(this.shareBoardModel, 'token', token)
    },
    setboardId (boardId, oldBoardId) {
      this.$set(this.shareBoardModel, 'boardId', boardId)
      let resp = Promise.resolve(true)
      if (!this.config.isRemote) {
        resp = this.config.updateBoardMethod(oldBoardId, boardId)
          .then((resp) => {
            if (resp instanceof Error) {
              this.updatedBoardFlag = false
              this.updateBoardError = resp
              return true
            }
            this.updatedBoardFlag = true
            this.$emit('share', this.shareBoardModel)
            this.generateLink()
            return true
          })
      } else {
        this.updatedBoardFlag = true
        this.$emit('share', this.shareBoardModel)
        this.generateLink()
      }
      return resp
    },
    generateLink () {
      let token = get(this.shareBoardModel, 'token.credentions.username', ''),
        topic = this.config.syncNamespace,
        shareObj = { token, topic, boardId: this.shareBoardModel.boardId },
        link = `${window.location.href}${Base64.encode(JSON.stringify(shareObj))}`
      this.link = link
    },
    copyLink () {
      this.$copyText(this.link)
        .then((e) => {
          this.$q.notify({
            type: 'positive',
            icon: 'content_copy',
            message: `Link copied`,
            timeout: 1000,
            position: 'bottom-left'
          })
          this.isLinkCopied = true
        }, (e) => {
          this.$q.notify({
            type: 'negative',
            icon: 'content_copy',
            message: `Error coping link`,
            timeout: 1000,
            position: 'bottom-left'
          })
        })
    }
  }
}
</script>
