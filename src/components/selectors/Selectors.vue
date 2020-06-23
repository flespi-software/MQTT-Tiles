<template>
  <div>
    <q-btn-toggle v-model="entity" :options="options" class="q-mb-md" spread unelevated toggle-color="grey-9" v-if="$q.platform.is.desktop" />
    <q-select
      class="q-mb-md"
      v-else
      v-model="entity"
      :options="options"
      emit-value
      map-options
      outlined dense color="grey-9"
    />
    <div>
      <template v-if="config[entity].selectors">
        <div v-for="selector in config[entity].selectors" :key="`${entity}-${selector.name}`">
          <q-select
            class="q-mb-md"
            v-if="!useVars[selector.name]"
            :value="model[selector.name]"
            @input="value => update(selector.name, value)"
            :options="renderLists[selector.name]"
            emit-value
            map-options
            multiple
            clearable
            use-input
            use-chips
            outlined dense color="grey-9"
            :label="model[selector.name] ? selector.name : `All ${selector.name}`"
            @filter="(filter, update) => filterItems(selector, filter, update)"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section>
                  <div class="text-italic text-grey-9 text-h6 text-center text-bold">{{`No ${selector.name}`}}</div>
                  <div class="text-grey text-center">Maybe you need to clean another related selectors</div>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:after v-if="variables.length">
              <q-btn round dense flat icon="mdi-variable" @click="useVars[selector.name] = !useVars[selector.name]">
                <q-tooltip>Select variables</q-tooltip>
              </q-btn>
            </template>
            <template v-slot:option="scope">
              <q-item
                v-bind="scope.itemProps"
                v-on="scope.itemEvents"
              >
                <q-item-section>
                  <q-item-label v-html="scope.opt.label || '*Empty*'" />
                  <q-item-label caption>{{ scope.opt.value }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          <q-select
            class="q-mb-md"
            v-else
            v-model="vars[selector.name]"
            @input="() => update(selector.name, null)"
            :options="variables"
            emit-value
            map-options
            outlined dense color="grey-9"
            label="Variables"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section>
                  <div class="text-italic text-grey-9 text-h6 text-center text-bold">{{`No ${selector.name}`}}</div>
                  <div class="text-grey text-center">Maybe you need to clean another related selectors</div>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:after>
              <q-btn round dense flat icon="mdi-format-list-bulleted-square" @click="useVars[selector.name] = !useVars[selector.name]">
                <q-tooltip>{{`Select ${selector.name}`}}</q-tooltip>
              </q-btn>
            </template>
          </q-select>
        </div>
      </template>
      <template v-if="config[entity].children">
        <flespi-selectors :config="config[entity].children" :variables="variables" :connector="connector" @input="updateModel" :entities="model" :key="entity" />
      </template>
    </div>
  </div>
</template>

<script>
import config from './config.json'
export default {
  name: 'FlespiSelectors',
  props: {
    config: {
      type: Object,
      default () {
        return config
      }
    },
    connector: Object,
    entities: {
      type: Object,
      default () {
        return {}
      }
    },
    variables: {
      type: Array,
      default () { return [] }
    }
  },
  data () {
    const entity = Object.keys(this.config)[0]
    const state = this.initByEntity(entity)
    const model = { ...this.entities, ...state.model }
    const lists = state.lists
    const vars = state.vars
    const useVars = state.useVars
    const topic = this.config[entity].topic
    return {
      entity,
      lists,
      renderLists: { ...lists },
      model,
      topic,
      vars,
      useVars
    }
  },
  computed: {
    options () {
      return Object.keys(this.config).map(name => ({ label: name, value: name }))
    }
  },
  methods: {
    initByEntity (entity) {
      const selectors = this.config[entity].selectors
      const lists = {},
        model = {},
        vars = {},
        useVars = {}
      if (selectors) {
        selectors.forEach(selector => {
          if (selector.value) { model[selector.name] = null }
          if (selector.list) {
            lists[selector.name] = selector.list
            lists[selector.name].inited = true
          } else {
            lists[selector.name] = []
            lists[selector.name].inited = false
          }
          vars[selector.name] = null
          useVars[selector.name] = false
        })
      }
      return { lists, model, vars, useVars }
    },
    filterItems (selector, filter, update) {
      if (this.lists[selector.name].inited) {
        this.$set(this.renderLists, selector.name, filter
          ? this.lists[selector.name].filter(item => item.label.toLowerCase().indexOf(filter.toLowerCase()) > -1)
          : this.lists[selector.name])
        update()
        return
      }
      this.connector[selector.getter.name](...selector.getter.params.map(param => this.model[param] || 'all'))
        .then(list => {
          this.$set(this.lists, selector.name, list)
          this.$set(this.renderLists, selector.name, filter
            ? this.lists[selector.name].filter(item => item.label.toLowerCase().indexOf(filter.toLowerCase()) > -1)
            : this.lists[selector.name])
          this.lists[selector.name].inited = true
          update()
        })
    },
    update (selectorName, value) {
      this.$set(this.model, selectorName, value && value.length ? value : null)
      if (this.config[this.entity].selectors) {
        this.config[this.entity].selectors.forEach((selector) => {
          if (selector.getter && selector.getter.params && selector.getter.params.includes(selectorName)) {
            this.$set(this.lists, selector.name, [])
            this.$set(this.renderLists, selector.name, [])
          }
        })
      }
      this.$emit('input', { topic: this.getCurrentTopic(this.topic, this.model) })
    },
    updateModel ({ topic }) {
      this.topic = topic
      this.$emit('input', { topic: this.getCurrentTopic(this.topic, this.model) })
    },
    getCurrentTopic (topic, model) {
      let currentTopic = topic && topic.topicPattern
      if (topic && this.config[this.entity].selectors) {
        const vars = this.config[this.entity].selectors.map(selector => selector.name)
        // const varsFromPattern = topicPattern.match(/\$\{\w+\}/g).map(variable => variable.slice(2, -1))
        currentTopic = vars.reduce((topic, variable) => {
          const name = variable
          const value = model[name]
          const variableName = this.useVars[name] && this.vars[name]
          if (variableName) {
            topic = topic.replace(`$\{${name}}`, `<%${variableName}%>`)
          } else if (value !== undefined) {
            if (value && value.length) {
              topic = topic.replace(`$\{${name}}`, value)
            } else {
              topic = topic.replace(`$\{${name}}`, '+')
            }
          }
          return topic
        }, currentTopic)
      }
      return { ...topic, topicPattern: currentTopic }
    }
  },
  created () {
    const topicPattern = this.getCurrentTopic(this.topic, this.model)
    if (topicPattern) {
      this.$emit('input', { topic: topicPattern })
    }
  },
  watch: {
    entity (entity) {
      const { lists, model, vars, useVars } = this.initByEntity(entity)
      this.lists = lists
      this.vars = vars
      this.useVars = useVars
      this.model = { ...model, ...this.entities }
      this.topic = this.config[entity].topic
      this.topic && this.$emit('input', { topic: this.getCurrentTopic(this.topic, this.model) })
    },
    entities: {
      deep: true,
      handler (entities) {
        this.model = { ...this.model, ...entities }
        const { lists } = this.initByEntity(this.entity)
        this.lists = lists
      }
    }
  }
}
</script>
