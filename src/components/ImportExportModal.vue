<template>
  <q-modal v-model='opened' @hide="close">
    <q-modal-layout>
      <q-toolbar slot="header" color='dark'>
        <q-toolbar-title>
          {{mode ? 'Export' : 'Import'}}
        </q-toolbar-title>
      </q-toolbar>
      <div style="margin: 20px;" :style="{ height: $q.platform.is.mobile ? 'calc(100% - 100px)' : '50vh', width: $q.platform.is.mobile ? 'calc(100% - 40px)' : '50vw'}">
        <template v-if="mode === 1">
          <div class="export-modal-view">
            <div class="export-modal-view__string" style="height: 45%;">
              <q-input :rows="7" :max-height="200" type="textarea" :readonly="true" v-model="data" float-label="Board config" color="dark" :after="[{icon: 'mdi-content-copy', handler: copyString}]"/>
            </div>
            <div class="text-center text-italic q-mt-lg" style="height: 10%; font-size: 2rem;">or</div>
            <div class="export-modal-view__file flex flex-center q-mt-lg" style="height: 45%;">
              <q-btn @click="downloadFile" label="Download file" size="1.6rem" color="dark" flat icon="mdi-download"/>
            </div>
          </div>
        </template>
        <template v-else-if="mode === 0">
          <div class="import-modal-view">
            <div class="export-modal-view__string" style="height: 45%;">
              <q-input :rows="7" :max-height="200" type="textarea" v-model="importData" float-label="Board config" color="dark" placeholder="Put exported board config here"/>
            </div>
            <div class="text-center text-italic q-mt-lg" style="height: 10%; font-size: 2rem;">or</div>
            <div class="export-modal-view__file flex flex-center q-mt-lg" style="height: 45%;">
              <q-uploader
                ref="uploader"
                url=""
                color="dark"
                extensions=".txt"
                hide-upload-button
                auto-expand
                hide-upload-progress
                clearable
                @add="preview"
                class="q-pa-lg"
                style="width: 70%; border: 1px dashed black; border-radius: 5px;"
              />
            </div>
          </div>
        </template>
      </div>
      <q-toolbar slot="footer" color='dark'>
        <q-toolbar-title>
        </q-toolbar-title>
        <q-btn flat dense class="q-mr-sm" @click="close">Close</q-btn>
        <q-btn flat dense class="q-mr-sm" v-if="mode === 0" @click="importHandler">Import</q-btn>
      </q-toolbar>
    </q-modal-layout>
  </q-modal>
</template>

<script>
export default {
  props: [ 'mode', 'data' ],
  data () {
    return {
      opened: false,
      reader: new FileReader(),
      importData: ''
    }
  },
  methods: {
    open () {
      this.opened = true
    },
    close () {
      this.opened = false
      this.$emit('close')
    },
    preview (file) {
      this.reader.readAsText(file[0])
    },
    importHandler () {
      this.close()
      this.$nextTick(() => {
        this.$emit('import', this.importData)
        this.importData = ''
      })
    },
    copyString () {
      this.$copyText(this.data)
        .then((e) => {
          this.$q.notify({
            type: 'positive',
            icon: 'content_copy',
            message: `Board copied`,
            timeout: 1000,
            position: 'bottom-left'
          })
        }, (e) => {
          this.$q.notify({
            type: 'negative',
            icon: 'content_copy',
            message: `Error coping board`,
            timeout: 1000,
            position: 'bottom-left'
          })
        })
    },
    downloadFile () {
      let a = document.createElement('a')
      a.style.display = 'none'
      let file = new Blob([this.data], {type: 'text/plain'})
      let url = a.href = URL.createObjectURL(file)
      a.download = 'board.txt'
      document.body.appendChild(a)
      a.click()
      setTimeout(function () {
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }, 0)
    }
  },
  created () {
    this.reader.onload = (event) => {
      this.importData = event.target.result
      this.$nextTick(() => {
        this.importHandler()
      })
    }
  }
}
</script>
