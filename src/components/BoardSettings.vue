<template>
  <q-modal v-model='value' @hide="closeHandler">
    <q-modal-layout>
      <q-toolbar slot="header" color='dark'>
        <q-toolbar-title>
          Board settings
        </q-toolbar-title>
      </q-toolbar>
      <div style="margin: 20px;" :style="{ height: $q.platform.is.mobile ? 'calc(100% - 100px)' : '50vh', width: $q.platform.is.mobile ? 'calc(100% - 40px)' : '50vw'}">
        <div class="row">
          <q-input
            class="col-12"
            autofocus
            v-model="currentSettings.name"
            color="dark"
            float-label="Name"
          />
          <q-input
            class="col-12"
            v-model="currentSettings.id"
            color="dark"
            :error="!currentSettings.id || !!currentSettings.id.match(/[/+#\s]/g) || (boards[currentSettings.id] && settings && settings.id !== currentSettings.id)"
            float-label="Sync alias"
          />
          <div class="board-settings__variables col-12 q-mt-lg relative-position">
            <q-list>
              <q-btn color="dark" style="top: -20px; right: 8px; position: absolute; z-index: 1130;" class="col-12" fab-mini @click="addVar" icon="mdi-plus"/>
              <q-list-header>Variables{{currentSettings.settings.variables.length ? '' : ' are empty'}}</q-list-header>
              <q-collapsible
                v-for="(variable, index) in currentSettings.settings.variables"
                :key="`${index}`"
                group="variables"
                :header-class="[`bg-${checkUniqueVariables(index) ? 'grey-4' : 'red-2'}`]"
                collapse-icon="mdi-settings"
                :opened="true"
              >
                <template slot="header">
                  <q-item-side right>
                    <q-btn :disabled="index === 0" round dense flat class="col-1" @click.stop="upItem(index)" icon="mdi-arrow-up"/>
                    <q-btn :disabled="index === (currentSettings.settings.variables.length - 1)" round dense flat class="col-1" @click.stop="downItem(index)" icon="mdi-arrow-down"/>
                  </q-item-side>
                  <q-item-main :label="variable.name" />
                  <q-item-side right>
                    <q-btn flat color="red-6" round dense @click="removeVar(index)" icon="mdi-delete"/>
                  </q-item-side>
                </template>
                <div class="row">
                  <q-input class="col-12" color="dark" v-model="variable.name" float-label="Name" :error="!variable.name"/>
                  <q-chips-input class="col-12" color="dark" v-model="variable.values" float-label="Values" :error="!variable.values.length || variable.values.includes('#')"/>
                  <div class="col-12 text-red" v-if="!variable.values.length || variable.values.includes('#')" style="font-size: .8rem;">
                    {{!variable.values.length ? 'Can`t be empty' : variable.values.includes('#') ? 'Value cannot be a #' : ''}}
                  </div>
                </div>
              </q-collapsible>
            </q-list>
          </div>
        </div>
      </div>
      <q-toolbar slot="footer" color='dark'>
        <q-toolbar-title>
        </q-toolbar-title>
        <q-btn flat dense class="q-mr-sm" @click="closeHandler">Close</q-btn>
        <q-btn flat dense :disable="!validateCurrentSettings" @click="saveBoardSettingsHandler">{{settings ? 'Update' : 'Save'}}</q-btn>
      </q-toolbar>
    </q-modal-layout>
  </q-modal>
</template>

<script>
import merge from 'lodash/merge'
import { uid } from 'quasar'
export default {
  props: ['settings', 'value', 'boards'],
  data () {
    let defaultSettings = Object.freeze(
      {
        name: 'New board',
        id: '',
        settings: {
          blocked: false,
          variables: []
        },
        activeVariables: {},
        shortcutsIndexes: [],
        widgetsIndexes: [],
        layouts: { lg: [], md: [], sm: [], xs: [], xxs: [] }
      }
    )
    let currentSettings = {}
    if (this.settings) {
      currentSettings = merge({}, defaultSettings, this.settings)
    } else {
      currentSettings = merge({}, defaultSettings)
      currentSettings.id = uid()
    }
    return {
      currentSettings,
      defaultVariable: {
        name: 'name',
        values: []
      }
    }
  },
  computed: {
    validateCurrentSettings () {
      let vars = this.currentSettings.settings.variables
      return this.currentSettings.id &&
      (
        !vars.length ||
        (
          vars.length && vars.reduce((res, variable, index) => {
            return res && this.checkUniqueVariables(index) && variable.values.length
          }, true)
        )
      )
    }
  },
  methods: {
    saveBoardSettingsHandler () {
      let event = this.settings ? 'edit' : 'add'
      if (event === 'add') {
        this.$set(this.currentSettings, 'activeVariables', this.currentSettings.settings.variables.reduce((vars, variable) => {
          vars[variable.name] = undefined
          return vars
        }, {}))
      }
      this.$emit(event, this.currentSettings)
      this.closeHandler()
    },
    closeHandler () {
      this.$emit('input', false)
      this.$emit('hide')
    },
    addVar () {
      this.currentSettings.settings.variables.push(Object.assign({}, this.defaultVariable))
    },
    removeVar (index) {
      this.$delete(this.currentSettings.settings.variables, index)
    },
    checkUniqueVariables (index) {
      let variable = this.currentSettings.settings.variables[index],
        sameVarIndexes = this.currentSettings.settings.variables.reduce((res, currVar, index) => {
          if (currVar.name === variable.name) {
            res.push(index)
          }
          return res
        }, [])
      return variable.name &&
        sameVarIndexes.indexOf(index) === 0
    },
    upItem (itemIndex) {
      let movedItem = this.currentSettings.settings.variables.splice(itemIndex, 1)[0]
      this.currentSettings.settings.variables.splice(itemIndex - 1, 0, movedItem)
    },
    downItem (itemIndex) {
      let movedItem = this.currentSettings.settings.variables.splice(itemIndex, 1)[0]
      this.currentSettings.settings.variables.splice(itemIndex + 1, 0, movedItem)
    }
  }
}
</script>
