<template>
  <q-dialog v-model='opened' @hide="close" :maximized="$q.platform.is.mobile">
    <div :style="{ width: $q.platform.is.mobile ? '100%' : '50vw'}">
      <q-toolbar class="bg-grey-9 text-white">
        <q-toolbar-title>
          {{mode ? 'Export' : 'Import'}}
        </q-toolbar-title>
      </q-toolbar>
      <div class="scrol bg-white q-pa-md" :style="{ height: $q.platform.is.mobile ? 'calc(100% - 100px)' : '50vh'}">
        <template v-if="mode === 1">
          <div class="export-modal-view">
            <div class="export-modal-view__string" style="height: 45%;">
              <q-input outlined dense hide-bottom-space :rows="7" input-style="resize: none;" type="textarea" :readonly="true" :value="data" label="Config" color="grey-9">
                <q-btn slot="append" dense flat icon='mdi-content-copy' @click="copyString" />
              </q-input>
            </div>
            <div class="text-center text-italic q-mt-lg" style="height: 10%; font-size: 2rem;">or</div>
            <div class="export-modal-view__file flex flex-center q-mt-lg" style="height: 45%;">
              <q-btn @click="downloadFile" label="Download file" size="1.6rem" color="grey-9" flat icon="mdi-download"/>
            </div>
          </div>
        </template>
        <template v-else-if="mode === 0">
          <div class="import-modal-view full-height">
            <div class="export-modal-view__string" style="height: 45%;">
              <q-input outlined dense hide-bottom-space :row="7" class="full-height" input-style="resize: none;" type="textarea" v-model="importData" label="Config" color="grey-9" placeholder="Put exported config here"/>
            </div>
            <div class="text-center text-italic" style="height: 10%; font-size: 2rem;">or</div>
            <div class="export-modal-view__file flex flex-center relative-position rounded-borders" style="height: 45%; border: dashed 1px black; ">
              <q-btn v-if="canAddFiles" icon="mdi-plus" color="grey-9" fab-mini class="absolute-top-right" @click="pickFiles" style="top: -20px; right: 8px; z-index: 1">
                <q-tooltip>Pick Files</q-tooltip>
              </q-btn>
              <q-uploader
                ref="uploader"
                url=""
                class="full-width full-height"
                color="grey-9"
                accept=".txt"
                hide-upload-btn
                @added="preview"
                @removed="canAddFiles = true"
              >
                 <template v-slot:header="scope">
                  <div class="row no-wrap items-center q-pa-sm q-gutter-xs" v-show="false">
                    <q-spinner v-if="scope.isUploading" class="q-uploader__spinner" />
                    <div class="col">
                      <div class="q-uploader__title">Upload your files</div>
                    </div>
                    <q-btn v-if="scope.canAddFiles" type="a" icon="add_box" round dense flat>
                      <q-uploader-add-trigger />
                      <q-tooltip>Pick Files</q-tooltip>
                    </q-btn>
                  </div>
                </template>
                <template v-slot:list="scope">
                  <div v-if="!scope.files.length" class="text-center">
                    <q-icon name="mdi-file-import-outline" size="6rem" color="grey-9" />
                    <div style="font-size: 18px;">Select an importing file.</div>
                  </div>
                  <q-list separator>
                    <q-item v-for="file in scope.files" :key="file.name">
                      <q-item-section>
                        <q-item-label class="full-width ellipsis">
                          {{ file.name }}
                        </q-item-label>
                        <q-item-label caption>
                          {{ file.__sizeLabel }}
                        </q-item-label>
                      </q-item-section>
                      <q-item-section
                        v-if="file.__img"
                        thumbnail
                        class="gt-xs"
                      >
                        <img :src="file.__img.src">
                      </q-item-section>
                      <q-item-section side>
                        <q-btn
                          color="red"
                          size="12px"
                          flat
                          dense
                          round
                          icon="mdi-delete"
                          @click="scope.removeFile(file)"
                        />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </template>
              </q-uploader>
            </div>
          </div>
        </template>
      </div>
      <q-toolbar class="bg-grey-9">
        <q-toolbar-title>
        </q-toolbar-title>
        <q-btn flat color="white" dense class="q-mr-sm" @click="close">Close</q-btn>
        <q-btn flat dense color="white" class="q-mr-sm" v-if="mode === 0" @click="importHandler">Import</q-btn>
      </q-toolbar>
    </div>
  </q-dialog>
</template>

<script>
import { copyToClipboard } from 'quasar'
export default {
  props: ['mode', 'data'],
  data () {
    return {
      opened: false,
      canAddFiles: true,
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
      this.canAddFiles = true
      this.$emit('close')
    },
    preview (file) {
      this.canAddFiles = false
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
      copyToClipboard(this.data)
        .then((e) => {
          this.$q.notify({
            color: 'positive',
            icon: 'content_copy',
            message: 'Copied',
            timeout: 1000,
            position: 'bottom-left'
          })
        }, (e) => {
          this.$q.notify({
            color: 'negative',
            icon: 'content_copy',
            message: 'Error coping',
            timeout: 1000,
            position: 'bottom-left'
          })
        })
    },
    downloadFile () {
      const a = document.createElement('a')
      a.style.display = 'none'
      const file = new Blob([this.data], { type: 'text/plain' })
      const url = a.href = URL.createObjectURL(file)
      a.download = 'data.txt'
      document.body.appendChild(a)
      a.click()
      setTimeout(function () {
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }, 0)
    },
    pickFiles () {
      this.$refs.uploader.pickFiles()
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
