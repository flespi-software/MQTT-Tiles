<template>
  <q-btn dense flat icon-right="mdi-plus" label="add">
    <q-menu :anchor="anchor" :self="self">
      <q-list dense>
        <q-item v-close-popup clickable @click.native="$emit('add', 'text')">
          <q-item-section avatar>
            <q-icon name="mdi-text-short" />
          </q-item-section>
          <q-item-section>Text</q-item-section>
        </q-item>
        <q-item v-close-popup clickable @click="$emit('add', 'knob')">
          <q-item-section avatar>
            <q-icon name="mdi-circle-slice-5" />
          </q-item-section>
          <q-item-section>Knob</q-item-section>
        </q-item>
        <q-item v-close-popup clickable @click="$emit('add', 'progress')">
          <q-item-section avatar>
            <q-icon name="mdi-percent" />
          </q-item-section>
          <q-item-section>Progress</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>
<script>
export default {
  name: 'AddMenu',
  props: ['anchor', 'self']
}
</script>
