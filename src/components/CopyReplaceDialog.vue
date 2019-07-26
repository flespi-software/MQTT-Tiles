<template>
  <q-dialog
    v-model="dialogModel"
    prevent-close
  >
    <!-- This or use "title" prop on <q-dialog> -->
    <span slot="title">{{title}}</span>

    <!-- This or use "message" prop on <q-dialog> -->
    <span slot="message">{{message}}</span>

    <div slot="body" style="min-width: 300px; min-height: 80px;">
      <q-checkbox v-model="isNeedCopy" color="dark" label="Rename to save a copy"/>
      <q-input color="dark" v-model="nameModel" :disable="!isNeedCopy" float-label="Name" :error="isNeedCopy && oldName === name"/>
    </div>

    <template slot="buttons" slot-scope="props">
      <q-btn color="dark" flat label="Close" @click="props.cancel, mode = 'cancel'" />
      <q-btn color="dark" flat :label="!isNeedCopy ? replaceLabel : loadLabel" @click="mode = 'ok'" :disabled="isNeedCopy && oldName === name"/>
    </template>
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
