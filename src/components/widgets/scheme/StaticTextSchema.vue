<template>
  <div class="row">
    <q-input outlined dense hide-bottom-space class="q-mb-sm col-12" color="grey-9" v-model="current.settings.label" label="Text"/>
    <q-select
      emit-value map-options outlined dense hide-bottom-space
      color="grey-9" class="col-12 q-mb-sm" use-chips
      v-model="current.settings.modificators"
      multiple
      :options="modificatorsOptions"
      label="Text style"
    >
      <q-btn flat slot="after" :style="{backgroundColor: current.settings.color}">
        <q-menu class="q-pa-sm" anchor="top right" self="bottom right">
          <q-color
            v-model="current.settings.color"
            format-model='hex'
          />
        </q-menu>
      </q-btn>
      <template v-slot:option="scope">
        <q-item
          v-bind="scope.itemProps"
          v-on="scope.itemEvents"
        >
          <q-item-section>
            <q-item-label :class="[`text-${scope.opt.value}`]">{{ scope.opt.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
    <q-checkbox v-model="current.settings.autoresize" label="Need autoresize text" color="grey-9" class="q-mb-sm"/>
    <q-input v-if="!current.settings.autoresize" outlined dense hide-bottom-space class="q-mb-sm col-12" color="grey-9" v-model="current.settings.style" label="Text styles"/>

  </div>
</template>

<script>
export default {
  props: ['settings'],
  data () {
    return {
      current: { ...this.settings },
      modificatorsOptions: [
        { label: 'Bold', value: 'bold' },
        { label: 'Italic', value: 'italic' },
        { label: 'Strike', value: 'strike' },
        { label: 'Uppercase', value: 'uppercase' },
        { label: 'Lowercase', value: 'lowercase' },
        { label: 'Capitalize', value: 'capitalize' }
      ]
    }
  },
  watch: {
    current: {
      deep: true,
      handler () {
        this.$emit('update', this.current)
      }
    }
  }
}
</script>
