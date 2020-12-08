<template>
  <q-select
    outlined hide-bottom-space color="grey-9" emit-value map-options dense use-input hide-selected fill-input class="q-mr-sm" style="min-width: 120px;"
    :options="filterOptions"
    :value="value"
    @input="(value) => { $emit('input', value) }"
    @filter="filterFn"
    :label="variable.name"
  >
    <template v-slot:option="scope">
      <q-item
        v-bind="scope.itemProps"
        v-on="scope.itemEvents"
      >
        <q-item-section>
          <q-item-label :class="{'text-grey-7': !scope.opt.label}">{{scope.opt.label || '*Empty*'}}</q-item-label>
        </q-item-section>
        <q-item-section side v-if="scope.opt.label != scope.opt.value">
          <q-item-label>{{scope.opt.value}}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:no-option>
      <q-item>
        <q-item-section>
          <div class="text-italic text-grey-9 text-h6 text-center text-bold">{{`No ${variable.name}`}}</div>
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:selected-item="scope">
      <q-item
        v-bind="scope.itemProps"
        v-on="scope.itemEvents"
        class="q-pa-none" style="min-height: 14px;"
      >
        <q-item-section>
          <q-item-label>{{scope.opt.label && scope.opt.value ? scope.opt.label : scope.opt.value ? (scope.opt.label || '*Empty*') : ''}}</q-item-label>
        </q-item-section>
        <q-item-section side v-if="scope.opt.label != scope.opt.value">
          <q-item-label>{{scope.opt.value}}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script>
export default {
  props: ['value', 'options', 'variable'],
  data () {
    return {
      filterOptions: this.options
    }
  },
  methods: {
    filterFn (val, update) {
      update(() => {
        if (val === '') {
          this.filterOptions = this.options
        } else {
          const needle = val.toLowerCase()
          this.filterOptions = this.options.filter(
            variable => JSON.stringify(variable.label).indexOf(needle) !== -1 || JSON.stringify(variable.value).indexOf(needle) !== -1
          )
        }
      })
    }
  }
}
</script>
