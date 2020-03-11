<template>
  <q-dialog v-model='value' @hide="closeHandler" :maximized="$q.platform.is.mobile">
    <div :style="{width: $q.platform.is.mobile ? '100%' : '50vw'}">
      <q-toolbar class="bg-grey-9 text-white">
        <q-toolbar-title>
          Board settings
        </q-toolbar-title>
      </q-toolbar>
      <div :style="{ height: $q.platform.is.mobile ? 'calc(100% - 100px)' : '50vh' }" class="q-pa-md scroll bg-white">
        <div class="row">
          <q-input
            outlined hide-bottom-space
            class="col-12 q-mb-sm"
            autofocus
            v-model="currentSettings.name"
            color="grey-9"
            label="Name"
          />
          <q-input
            class="col-12 q-mb-sm"
            outlined hide-bottom-space
            v-model="currentSettings.id"
            color="grey-9"
            :error="!currentSettings.id || !!currentSettings.id.match(/[/+#\s]/g) || (boards[currentSettings.id] && settings && settings.id !== currentSettings.id)"
            label="Sync alias"
          />
          <div class="board-settings__variables col-12 q-mt-lg relative-position">
            <q-list bordered>
              <q-btn color="grey-9" style="top: -20px; right: 8px; position: absolute; z-index: 1130;" class="col-12" fab-mini @click="addVar" icon="mdi-plus"/>
              <q-item-label class="q-py-md q-px-sm">
                <div>Variables{{currentSettings.settings.variables.length ? '' : ' are empty'}}</div>
              </q-item-label>
              <q-expansion-item
                v-for="(variable, index) in currentSettings.settings.variables"
                :key="`${index}`"
                group="variables"
                :header-class="[`bg-${checkUniqueVariables(index) ? 'grey-4' : 'red-2'}`]"
                expand-icon="mdi-settings"
                default-opened
              >
                <template slot="header">
                  <q-item-section avatar>
                    <div>
                      <q-btn :disabled="index === 0" round dense flat class="col-1" @click.stop="upItem(index)" icon="mdi-arrow-up"/>
                      <q-btn :disabled="index === (currentSettings.settings.variables.length - 1)" round dense flat class="col-1" @click.stop="downItem(index)" icon="mdi-arrow-down"/>
                    </div>
                  </q-item-section>
                  <q-item-section>{{variable.name}}</q-item-section>
                  <q-item-section side>
                    <q-btn flat color="red-6" round dense @click="removeVar(index)" icon="mdi-delete"/>
                  </q-item-section>
                </template>
                <div class="row q-pa-sm">
                  <q-input outlined hide-bottom-space class="col-12 q-my-sm" color="grey-9" v-model="variable.name" label="Name" :error="!variable.name"/>
                  <q-select outlined hide-bottom-space class="col-12 q-mb-sm" :value="variable.type" emit-value map-options :options="variableTypeOptions" color="grey-9" @input="(value) => changeTypeVariableHandler(index, value)" label="Type"/>
                  <topic class="col-12 q-mb-sm" v-model="variable.topic" v-if="variable.type === VARIABLE_TYPE_SOURCE" :config="{ needLabel: true }"/>
                  <div v-if="variable.type === VARIABLE_TYPE_SOURCE">
                    Sort variables by:
                    <q-btn-toggle
                      v-model="variable.sortVarsBy"
                      :options="[{label: 'value', value: SORT_VARS_BY_VALUE}, {label: 'label', value: SORT_VARS_BY_LABEL}]"
                      rounded toggle-text-color="grey-9" text-color="grey-6" flat color="grey-9"
                    />
                  </div>
                  <template v-if="variable.type === VARIABLE_TYPE_CUSTOM">
                    <div class="variable__items-wrapper col-12 relative-position q-mt-sm">
                      <q-list bordered>
                        <q-btn color="grey-9" style="top: -20px; right: 8px; position: absolute; z-index: 1130;" class="col-12" fab-mini @click="addVarItem(variable)" icon="mdi-plus"/>
                        <q-item-label class="q-py-md q-px-sm" :class="{'text-red-6': !variable.values.length}">Items{{variable.values.length ? '' : ' are empty'}}</q-item-label>
                        <q-expansion-item
                          v-for="(item, index) in variable.values"
                          :key="`${index}`"
                          group="singleselect-items"
                          :header-class="[`bg-${item[1].indexOf('#') === -1 ? 'grey-4' : 'red-2'}`]"
                          expand-icon="mdi-settings"
                          default-opened
                        >
                          <template slot="header">
                            <q-item-section avatar>
                              <div>
                                <q-btn :disabled="index === 0" round dense flat class="col-1" @click.stop="upVarItem(variable, index)" icon="mdi-arrow-up"/>
                                <q-btn :disabled="index === (variable.values.length - 1)" round dense flat class="col-1" @click.stop="downVarItem(variable, index)" icon="mdi-arrow-down"/>
                              </div>
                            </q-item-section>
                            <q-item-section>{{item[0] ? `${item[0]} [${item[1]}]` : item[1] || `item ${index + 1}`}}</q-item-section>
                            <q-item-section side>
                              <q-btn flat color="red-6" round dense @click="removeVarItem(variable, index)" icon="mdi-delete"/>
                            </q-item-section>
                          </template>
                          <div class="row q-pa-sm">
                            <div class="col-6">
                              <q-input autofocus outlined hide-bottom-space class="q-mr-xs" color="grey-9" v-model="item[0]" label="Label"/>
                            </div>
                            <div class="col-6">
                              <q-input outlined hide-bottom-space class="q-ml-xs" color="grey-9" v-model="item[1]" label="Value" :error="item[1].indexOf('#') !== -1"/>
                            </div>
                          </div>
                        </q-expansion-item>
                      </q-list>
                    </div>
                  </template>
                </div>
              </q-expansion-item>
            </q-list>
          </div>
        </div>
      </div>
      <q-toolbar class="bg-grey-9 text-white">
        <q-toolbar-title>
        </q-toolbar-title>
        <q-btn flat dense class="q-mr-sm" @click="closeHandler">Close</q-btn>
        <q-btn flat dense :disable="!validateCurrentSettings" @click="saveBoardSettingsHandler">{{settings ? 'Update' : 'Save'}}</q-btn>
      </q-toolbar>
    </div>
  </q-dialog>
</template>

<script>
import merge from 'lodash/merge'
import { uid } from 'quasar'
import Topic from './widgets/Topic'
const VARIABLE_TYPE_CUSTOM = 0,
  VARIABLE_TYPE_SOURCE = 1,
  SORT_VARS_BY_VALUE = 0,
  SORT_VARS_BY_LABEL = 1
export default {
  props: ['settings', 'value', 'boards'],
  data () {
    const defaultSettings = Object.freeze(
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
    const defaultTopic = {
      topicTemplate: '',
      topicFilter: '',
      payloadType: 0,
      payloadField: ''
    }
    let currentSettings = {}
    if (this.settings) {
      currentSettings = merge({}, defaultSettings, this.settings)
      /* remove after some time 16.08.19 it`s a mutation for edited boards */
      currentSettings.settings.variables && currentSettings.settings.variables.forEach((variable) => {
        if (variable.type === undefined) {
          variable.type = 0
          variable.topic = Object.assign({}, defaultTopic)
        }
        /* 04.12.19 */
        if (variable.sortVarsBy === undefined) {
          variable.sortVarsBy = 0
        }
      })
      /* end */
    } else {
      currentSettings = merge({}, defaultSettings)
      currentSettings.id = uid()
    }
    return {
      currentSettings,
      defaultTopic,
      defaultVariable: {
        name: 'name',
        type: VARIABLE_TYPE_CUSTOM,
        topic: defaultTopic,
        sortVarsBy: SORT_VARS_BY_VALUE,
        values: []
      },
      VARIABLE_TYPE_CUSTOM,
      VARIABLE_TYPE_SOURCE,
      SORT_VARS_BY_VALUE,
      SORT_VARS_BY_LABEL,
      variableTypeOptions: [
        { label: 'Custom', value: VARIABLE_TYPE_CUSTOM },
        { label: 'Source', value: VARIABLE_TYPE_SOURCE }
      ]
    }
  },
  computed: {
    validateCurrentSettings () {
      const vars = this.currentSettings.settings.variables
      return this.currentSettings.id &&
      (
        !vars.length ||
        (
          vars.length && vars.reduce((res, variable, index) => {
            return res && ((!variable.type && this.checkUniqueVariables(index) && variable.values.length) || (variable.type && variable.topic.topicFilter))
          }, true)
        )
      )
    }
  },
  methods: {
    saveBoardSettingsHandler () {
      const event = this.settings ? 'edit' : 'add'
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
    changeTypeVariableHandler (index, type) {
      const variable = this.currentSettings.settings.variables[index]
      if (type === VARIABLE_TYPE_CUSTOM) {
        variable.topic = Object.assign({}, this.defaultTopic)
      } else {
        variable.values = []
      }
      this.$set(variable, 'type', type)
    },
    checkUniqueVariables (index) {
      const variable = this.currentSettings.settings.variables[index],
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
      const movedItem = this.currentSettings.settings.variables.splice(itemIndex, 1)[0]
      this.currentSettings.settings.variables.splice(itemIndex - 1, 0, movedItem)
    },
    downItem (itemIndex) {
      const movedItem = this.currentSettings.settings.variables.splice(itemIndex, 1)[0]
      this.currentSettings.settings.variables.splice(itemIndex + 1, 0, movedItem)
    },
    addVarItem (variable) {
      variable.values.push(['', ''])
    },
    removeVarItem (variable, itemIndex) {
      this.$delete(variable.values, itemIndex)
    },
    upVarItem (variable, itemIndex) {
      const movedItem = variable.values.splice(itemIndex, 1)[0]
      variable.values.splice(itemIndex - 1, 0, movedItem)
    },
    downVarItem (variable, itemIndex) {
      const movedItem = variable.values.splice(itemIndex, 1)[0]
      variable.values.splice(itemIndex + 1, 0, movedItem)
    }
  },
  components: { Topic }
}
</script>
