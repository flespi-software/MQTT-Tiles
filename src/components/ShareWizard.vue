<template>
  <q-dialog v-model="status" @hide="closeHandler" :maximized="$q.platform.is.mobile">
    <div :style="{width: $q.platform.is.mobile ? '100%' : '50vw'}">
      <q-toolbar class="bg-grey-9 text-white">
        <q-toolbar-title>Share wizard</q-toolbar-title>
      </q-toolbar>
      <div :style="{ height: $q.platform.is.mobile ? 'calc(100% - 100px)' : '50vh'}" class="scroll bg-white">
        <q-stepper flat ref="stepper" v-model="currentStep" animated class="share-stepper" done-color="green-6" active-color="amber-9" :header-class="stepsEnum.length === 1 ? 'hidden' : ''" contracted>
          <q-step name="tokens" title="Tokens" v-if="config.tokens.length > 1" icon="mdi-fingerprint" :done="currentStep === 'replace' || currentStep === 'link'">
            <q-list separator bordered>
              <q-item
                v-for="(token, index) in config.tokens" :key="token.credentions.username"
                @click="setToken(token), currentSelectedToken = index" :active="token.label === shareBoardModel.token.label"
                clickable active-class="bg-amber-2"
              >
                <q-item-section>
                  <q-item-label class="text-grey-9 text-weight-bold">{{token.label}}</q-item-label>
                  <q-item-label style="font-size: .8rem" class="text-grey-8 ellipsis">{{token.credentions.username}}</q-item-label>
                </q-item-section>
                <q-item-section side v-if="token.accessable !== undefined">
                  <div v-if="token.accessable">
                    <span class="text-white bg-green-8 rounded-borders text-weight-bold q-px-sm" style="font-size:.8rem;">valid</span>
                    <q-tooltip>Validation pass</q-tooltip>
                  </div>
                  <div v-else>
                    <span class="text-white bg-red-8 rounded-borders text-weight-bold q-px-xs" style="font-size: .8rem;">invalid</span>
                    <q-tooltip>You can`t share by this token</q-tooltip>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-step>
          <q-step name="replace" title="Upload" v-if="config.hasRemote" icon="mdi-file-replace-outline" :done="currentStep === 'link'">
            <div class="q-mx-sm q-my-md text-grey-8 text-center" style="font-size: 1.2rem;">Such board exists. Continue?</div>
            <q-checkbox v-model="isNeedCopy" color="grey-9" label="Rename to save a copy"/>
            <q-input
              color="grey-9"
              outlined hide-bottom-space dense
              v-model="shareBoardModel.boardId"
              :disable="!isNeedCopy"
              label="Name"
              :error="isNeedCopy && (shareBoardModel.boardId === config.boardId || ((config.currentRemoteBoards && config.currentRemoteBoards.includes(shareBoardModel.boardId) || !config.currentRemoteBoards)))"
            />
          </q-step>
          <q-step name="link" title="Link" :active-icon="isLinkCopied && currentStep === 'link' ? 'mdi-check' : undefined" :active-color="isLinkCopied && currentStep === 'link' ? 'green' : undefined" icon="mdi-link" :done="isLinkCopied && currentStep === 'link'">
            <template v-if="updatedBoardFlag">
              <q-input type="textarea" v-model="link" readonly outlined dense hide-bottom-space input-style="resize: none;"/>
              <div class="text-center q-mt-md">
                <q-btn @click="copyLink" flat icon="mdi-content-copy" size="1.2rem">Copy</q-btn>
              </div>
            </template>
            <template v-else-if="updatedBoardFlag === false">
              <div class="rounded-borders bg-red-1 q-pa-md">
                <div class="text-h6 text-red-8 q-mb-sm">
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
      <q-toolbar class="bg-grey-9 text-white">
        <q-btn flat dense class="q-mr-sm absolute" @click="closeHandler">Close</q-btn>
        <q-toolbar-title></q-toolbar-title>
        <q-btn flat v-if="canBack" @click="prevStepHandler">Back</q-btn>
        <q-btn flat class="q-ml-sm" v-if="!updateBoardError" @click="nextStepHandler" :disable="!isValidStep">{{ currentStep === 'link' ? 'Done' : 'Next' }}</q-btn>
      </q-toolbar>
    </div>
  </q-dialog>
</template>

<script>
import { Base64 } from 'js-base64'
import get from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'
import { copyToClipboard } from 'quasar'

export default {
  name: 'ShareWizard',
  props: ['value', 'config'],
  /*
    config = { tokens: Array, hasRemote: Boolean, boardId: String, syncNamespace: String, host: String, isRemote: Boolean, currentRemoteBoards: Array }
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
      updateBoardError: undefined,
      region: null
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
    },
    stepsEnum () { return Object.values(this.steps) },
    canBack () {
      return !!this.stepsEnum.length && this.currentStep !== this.steps[0].value && !this.updateBoardError
    }
  },
  created () {
    const steps = {}
    let stepIndex = 0
    this.getRegionByHost(this.config.host)
      .then(() => {
        if (this.config.tokens.length > 1) {
          steps[stepIndex] = { label: 'Token', value: this.stepsConst.STEP_TOKEN }
          this.currentStep = this.stepsConst.STEP_TOKEN
          stepIndex++
        } else {
          this.setToken(this.config.tokens[0])
        }
        if (this.config.hasRemote) {
          steps[stepIndex] = { label: 'Replace', value: this.stepsConst.STEP_REPLACE }
          if (!this.currentStep) { this.currentStep = this.stepsConst.STEP_REPLACE }
          stepIndex++
        } else {
          this.setboardId(this.config.boardId, this.config.boardId)
        }
        steps[stepIndex] = { label: 'Link', value: this.stepsConst.STEP_LINK }
        if (!this.currentStep) { this.currentStep = this.stepsConst.STEP_LINK }
        this.steps = steps
      })
  },
  methods: {
    getRegionByHost (host) {
      return fetch('https://flespi.io/auth/regions', {
        mode: 'cors'
      }).then(response => response.json())
        .then((data) => {
          this.region = data.result.reduce((region, cregion) => {
            if (`wss://${cregion['mqtt-ws']}`.indexOf(host) === 0) {
              region = cregion
            }
            return region
          }, null)
        })
    },
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
      if (this.isLinkCopied) { this.isLinkCopied = false }
      this.$refs.stepper.previous()
    },
    validateCurrentStep () {
      switch (this.currentStep) {
        case 'tokens': {
          const isTokenValid = this.validateToken(this.shareBoardModel.token)
          if (isTokenValid && this.shareBoardModel.boardId) {
            this.generateLink()
          }
          return isTokenValid
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
      const flespiToken = token.credentions.username.indexOf('FlespiToken ') === 0
        ? token.credentions.username
        : `FlespiToken ${token.credentions.username}`
      return fetch(`${this.region.rest}/auth/info`, {
        mode: 'cors',
        headers: {
          Authorization: flespiToken
        }
      }).then(response => response.json())
        .then((accessData) => {
          const access = get(accessData, 'result[0].access.type', 1)
          const errors = !!accessData.errors
          const accessGranted = access !== 1
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
      const token = get(this.shareBoardModel, 'token.credentions.username', '')
      if (!token) { return }
      const topic = this.config.syncNamespace,
        host = this.config.host,
        shareObj = { token, topic, boardId: this.shareBoardModel.boardId }
      if (host.indexOf('wss://mqtt.flespi.io') !== 0) {
        shareObj.host = host
      }
      const link = `${window.location.href}${Base64.encode(JSON.stringify(shareObj))}`
      this.link = link
    },
    copyLink () {
      copyToClipboard(this.link)
        .then((e) => {
          this.$q.notify({
            color: 'positive',
            icon: 'content_copy',
            message: 'Link copied',
            timeout: 1000,
            position: 'bottom-left'
          })
          this.isLinkCopied = true
        }, (e) => {
          this.$q.notify({
            color: 'negative',
            icon: 'content_copy',
            message: 'Error coping link',
            timeout: 1000,
            position: 'bottom-left'
          })
        })
    }
  }
}
</script>

<style lang="stylus">
  .share-stepper
    overflow hidden
    height 100%
    .q-stepper__content
      height calc(100% - 72px)
</style>
