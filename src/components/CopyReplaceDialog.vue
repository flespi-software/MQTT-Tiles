<template>
  <q-dialog
    v-model="dialogModel"
    prevent-close
  >
    <div class="bg-white" style="min-width: 300px">
      <div class="q-pa-md">
        <div class="text-h5 text-bold q-mb-sm">{{title}}</div>
        <div class="text-grey-6">{{message}}</div>
        <div class="text-grey-6">
          <q-checkbox v-model="isNeedCopy" color="grey-9" label="Rename to save a copy"/>
          <q-input outlined hide-bottom-space color="grey-9" v-model="nameModel" :disable="!isNeedCopy" label="Name" :error="isNeedCopy && oldName === name"/>
        </div>
      </div>
      <div class="flex justify-end q-mt-md q-pa-sm">
        <q-btn color="grey-9" flat label="Close" @click="mode = 'cancel'" />
        <q-btn color="grey-9" flat :label="!isNeedCopy ? replaceLabel : loadLabel" @click="mode = 'ok'" :disabled="isNeedCopy && oldName === name"/>
      </div>
    </div>
  </q-dialog>
</template>

<script>
export default {
  props: {
    initName: String
  },
  data () {
    return {
      dialogModel: false,
      isNeedCopy: false,
      name: '',
      oldName: '',
      mode: '',
      replaceLabel: 'Replace',
      loadLabel: 'Save'
    }
  },
  computed: {
    title () {
      return !this.isNeedCopy ? `Replace board` : `Save board`
    },
    message () {
      return !this.isNeedCopy ? `Such board exists. Replace?` : `Save the new board?`
    },
    nameModel: {
      get () { return this.name },
      set (name) {
        this.$emit('change:name', name)
        this.name = name
      }
    }
  },
  methods: {
    open (settings) {
      this.replaceLabel = (settings && settings.replaceLabel) || 'Replace'
      this.loadLabel = (settings && settings.loadLabel) || 'Save'
      this.$nextTick(() => {
        this.name = this.initName
        this.oldName = this.initName
      })
      this.dialogModel = true
      return new Promise((resolve, reject) => {
        let indetvalId = setInterval(() => {
          if (this.mode) {
            if (this.mode === 'ok') {
              resolve(this.oldName)
            } else {
              reject(new Error('canceled'))
            }
            this.mode = ''
            this.isNeedCopy = false
            this.dialogModel = false
            clearInterval(indetvalId)
          }
        }, 50)
      })
    }
  }
}
</script>
