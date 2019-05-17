<template>
  <q-btn dense flat icon-right="mdi-plus" label="add">
    <q-popover :anchor="anchor" :self="self">
      <q-list dense>
        <q-item class="cursor-pointer" v-close-overlay highlight @click.native="$emit('add', 'text')">
          <q-item-side icon="mdi-text-short" />
          <q-item-main label="Text"/>
        </q-item>
        <q-item class="cursor-pointer" v-close-overlay highlight @click.native="$emit('add', 'knob')">
          <q-item-side icon="mdi-circle-slice-5" />
          <q-item-main label="Knob"/>
        </q-item>
        <q-item class="cursor-pointer" v-close-overlay highlight @click.native="$emit('add', 'progress')">
          <q-item-side icon="mdi-percent" />
          <q-item-main label="Progress"/>
        </q-item>
      </q-list>
    </q-popover>
  </q-btn>
</template>
<script>
export default {
  name: 'AddMenu',
  props: ['anchor', 'self']
}
</script>
