<template>
  <q-dialog :value='value' @hide="closeHandler" @escape-key="closeHandler" :maximized="$q.platform.is.mobile" no-backdrop-dismiss>
    <div :style="{width: $q.platform.is.mobile ? '100%' : '50vw'}">
      <q-toolbar class="text-white" :class="[`bg-${$theme}-9`]">
        <q-toolbar-title>
          Board settings
        </q-toolbar-title>
      </q-toolbar>
      <div :style="{ height: $q.platform.is.mobile ? 'calc(100% - 100px)' : '50vh' }" class="q-pa-md scroll"  :class="[`bg-${$theme}-1`]">
        <div class="row">
          <q-input
            outlined hide-bottom-space dense
            class="col-12 q-mb-sm"
            autofocus
            v-model="currentSettings.name"
            color="grey-9"
            label="Name"
          />
          <q-input
            class="col-12 q-mb-sm"
            outlined hide-bottom-space dense
            v-model="currentSettings.id"
            color="grey-9"
            :error="!currentSettings.id || !!currentSettings.id.match(/[/+#\s]/g) || (boards[currentSettings.id] && settings && settings.id !== currentSettings.id)"
            label="Sync alias"
          />
          <div class="board-settings__variables col-12 q-mt-lg relative-position">
            <q-list bordered :class="[`bg-${$theme}-1`]">
              <q-item-label class="q-py-md q-px-sm list__header" :class="[`bg-${$theme}-${currentSettings.settings.variables.length ? 3 : 2}`]">
                <div>Variables{{currentSettings.settings.variables.length ? '' : ' are empty'}}</div>
                <q-btn color="grey-9" class="absolute-right" flat label="ADD" @click="addVar" icon="mdi-plus"/>
              </q-item-label>
              <q-expansion-item
                v-for="(variable, index) in currentSettings.settings.variables"
                :class="[`bg-${$theme}-1`]"
                :key="`${index}`"
                group="variables"
                :header-class="[`bg-${checkUniqueVariables(index) ? `${$theme}-2` : 'red-2'}`]"
                expand-icon="mdi-cog"
                :value="index === currentSettings.settings.variables.length - 1"
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
                  <q-input outlined hide-bottom-space dense class="col-12 q-my-sm" color="grey-9" v-model="variable.name" label="Name" :error="!variable.name"/>
                  <q-select
                    v-if="$flespiMode"
                    v-model="variable.preset"
                    emit-value map-options outlined dense hide-bottom-space
                    color="grey-9" class="col-12 q-my-sm"
                    :options="variablesPresets"
                    label="Presets"
                    @input="(value) => { setPresetByIndex(index, value) }"
                  ></q-select>
                  <template name="customSettingsVars" v-if="variable.preset === 'custom' || variable.preset === undefined || !$flespiMode">
                    <q-select outlined dense hide-bottom-space class="col-12 q-mb-sm" :value="variable.type" emit-value map-options :options="variableTypeOptions" color="grey-9" :popup-content-class="`bg-${$theme}-1`" @input="(value) => changeTypeVariableHandler(index, value)" label="Type"/>
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
                      <div class="variable__items-wrapper col-12 relative-position q-mt-md">
                        <q-list bordered>
                          <q-item-label class="q-py-md q-px-sm list__header" :class="{'text-red-6': !variable.values.length, [`bg-${$theme}-${variable.values.length ? 3 : 2}`]: true}" >
                            Items{{variable.values.length ? '' : ' are empty'}}
                            <q-btn color="grey-9" class="absolute-right" flat label="ADD" @click="addVarItem(variable)" icon="mdi-plus"/>
                          </q-item-label>
                          <q-expansion-item
                            v-for="(item, index) in variable.values"
                            :key="`${index}`"
                            group="singleselect-items"
                            :header-class="[`bg-${item[1].indexOf('#') === -1 ? `${$theme}-2` : 'red-2'}`]"
                            expand-icon="mdi-cog"
                            :value="index === variable.values.length - 1"
                          >
                            <template slot="header">
                              <q-item-section avatar>
                                <div>
                                  <q-btn :disabled="index === 0" round dense flat class="col-1" @click.stop="upVarItem(variable, index)" icon="mdi-arrow-up"/>
                                  <q-btn :disabled="index === (variable.values.length - 1)" round dense flat class="col-1" @click.stop="downVarItem(variable, index)" icon="mdi-arrow-down"/>
                                </div>
                              </q-item-section>
                              <q-item-section>{{item[0] ? `${item[0]} [${item[1]}]` : item[1] || 'new item'}}</q-item-section>
                              <q-item-section side>
                                <q-btn flat color="red-6" round dense @click="removeVarItem(variable, index)" icon="mdi-delete"/>
                              </q-item-section>
                            </template>
                            <div class="row q-pa-sm">
                              <div class="col-6">
                                <q-input autofocus dense outlined hide-bottom-space class="q-mr-xs" color="grey-9" v-model="item[0]" label="Label"/>
                              </div>
                              <div class="col-6">
                                <q-input outlined dense hide-bottom-space class="q-ml-xs" color="grey-9" v-model="item[1]" label="Value" :error="item[1].indexOf('#') !== -1"/>
                              </div>
                            </div>
                          </q-expansion-item>
                        </q-list>
                      </div>
                    </template>
                  </template>
                </div>
              </q-expansion-item>
            </q-list>
          </div>
          <div class="board-settings__topics col-12 q-mt-lg relative-position">
            <q-list bordered class="relative-position" >
              <q-item-label class="q-py-md q-px-sm list__header">
                Init messages {{currentSettings.topics.length ? `(${ currentSettings.topics.length } / 5)` : ' are empty'}}
                <q-btn color="grey-9" :disabled="currentSettings.topics && currentSettings.topics.length >= 5" class="absolute-right" flat label="ADD" @click="addTopic" icon="mdi-plus"/>
              </q-item-label>
              <q-expansion-item
                v-for="(item, index) in currentSettings.topics"
                :key="index"
                group="frame-items"
                :header-class="[`bg-${checkUniqueTopic(index) ? 'grey-4' : 'red-2'}`]"
                expand-icon="mdi-cog"
                :value="index === currentSettings.topics.length - 1"
              >
                <template slot="header">
                  <q-item-section><span class="ellipsis full-width">{{item.topicTemplate || 'New topic'}}</span></q-item-section>
                  <q-item-section side>
                    <q-btn flat color="red-6" round dense @click="removeTopic(index)" icon="mdi-delete"/>
                  </q-item-section>
                </template>
                <div class="row q-pa-sm">
                  <q-input outlined dense autofocus hide-bottom-space class="col-12 q-mb-sm" color="grey-9" v-model="item.topicTemplate" @input="val => item.topicFilter = val" label="Topic"/>
                  <!-- <variables-helper v-if="board.settings.variables && board.settings.variables.length" :variables="board.settings.variables" @add="(variable) => item.topicTemplate += variable"/> -->
                  <q-input type="textarea" outlined hide-bottom-space dense color="grey-9" class="q-mt-sm full-width" v-model="item.payload" label="Payload" input-style="resize: none;"/>
                </div>
              </q-expansion-item>
            </q-list>
          </div>
        </div>
      </div>
      <q-toolbar class="text-white"  :class="[`bg-${$theme}-9`]">
        <q-toolbar-title>
        </q-toolbar-title>
        <q-btn flat dense class="q-mr-sm" @click="closeHandler">Close</q-btn>
        <q-btn flat dense :disable="!validateCurrentSettings" @click="saveBoardSettingsHandler">{{settings ? 'Update' : 'Save'}}</q-btn>
        <q-btn flat dense :disable="!validateCurrentSettings" @click="saveAndOpenBoardSettingsHandler">{{settings ? 'Update & open' : 'Save & open'}}</q-btn>
      </q-toolbar>
    </div>
  </q-dialog>
</template>

<script>
import merge from 'lodash/merge'
import cloneDeep from 'lodash/cloneDeep'
import { uid } from 'quasar'
import Topic from './widgets/Topic'
import { getTopicModel } from '../constants/defaultes'
import variblesShemasByPresets from '../constants/variablesPresets'
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
        topics: [],
        activeVariables: {},
        shortcutsIndexes: [],
        widgetsIndexes: [],
        layouts: { lg: [], md: [], sm: [], xs: [], xxs: [] }
      }
    )
    const defaultTopic = getTopicModel()
    let currentSettings = {}
    if (this.settings) {
      currentSettings = cloneDeep(merge({}, defaultSettings, this.settings))
      /* remove after some time 16.08.19 it`s a mutation for edited boards */
      currentSettings.settings.variables && currentSettings.settings.variables.forEach((variable) => {
        if (variable.type === undefined) {
          variable.type = 0
          variable.topic = cloneDeep(defaultTopic)
        }
        /* 04.12.19 */
        if (variable.sortVarsBy === undefined) {
          variable.sortVarsBy = 0
        }
        /* 16.06.20 */
        if (!variable.preset) { variable.preset = 'custom' }
      })
      /* end */
    } else {
      currentSettings = cloneDeep(defaultSettings)
      currentSettings.id = uid()
    }
    return {
      currentSettings,
      defaultTopic,
      defaultVariable: {
        name: 'name',
        preset: 'custom',
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
      ],
      variablesPresets: [
        { label: 'Devices', value: 'devices' },
        { label: 'Channels', value: 'channels' },
        { label: 'Calcs', value: 'calcs' },
        { label: 'Custom', value: 'custom' }
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
    addTopic () {
      this.currentSettings.topics.push(getTopicModel())
    },
    removeTopic (index) { this.$delete(this.currentSettings.topics, index) },
    checkUniqueTopic (itemIndex) {
      const item = this.currentSettings.topics[itemIndex],
        sameTopicsIndexes = this.currentSettings.topics.reduce((res, currItem, index) => {
          if (currItem.topicTemplate === item.topicTemplate) {
            res.push(index)
          }
          return res
        }, [])
      return item.topicTemplate &&
        sameTopicsIndexes.indexOf(itemIndex) === 0
    },

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
    saveAndOpenBoardSettingsHandler () {
      this.saveBoardSettingsHandler()
      this.$emit('open', this.currentSettings.id)
    },
    closeHandler () {
      this.$emit('input', false)
      this.$emit('hide')
    },
    addVar () {
      this.currentSettings.settings.variables.push(cloneDeep(this.$flespiMode ? variblesShemasByPresets.devices : this.defaultVariable))
    },
    removeVar (index) {
      this.$delete(this.currentSettings.settings.variables, index)
    },
    changeTypeVariableHandler (index, type) {
      const variable = this.currentSettings.settings.variables[index]
      if (type === VARIABLE_TYPE_CUSTOM) {
        variable.topic = cloneDeep(this.defaultTopic)
      } else {
        variable.values = []
      }
      this.$set(variable, 'type', type)
    },
    setPresetByIndex (index, preset) {
      const schema = variblesShemasByPresets[preset]
      this.$set(this.currentSettings.settings.variables, index, schema)
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

<style lang="stylus">
  .list__header
    position sticky
    top -15px
    background-color white
    z-index 99
</style>
