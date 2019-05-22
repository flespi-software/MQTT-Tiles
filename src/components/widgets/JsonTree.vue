<template>
  <div v-if="Array.isArray(data) || typeof data === 'object'">
    <span :class="{'text-white': inverted !== undefined}">{{Array.isArray(data) ? '[' : '{'}}</span>
    <div class="margin-left" v-for="(value, key, index) in data" :key="`${key}-${index}`">
      <div v-if="value && typeof value === 'object'">
        <div @click="toggle(Array.isArray(data) ? key : index)" class="cursor-pointer">
          <q-icon :color="inverted !== undefined ? 'white' : 'dark'" v-if="showObj[Array.isArray(data) ? key : index]" name="mdi-menu-down" style="vertical-align: baseline" />
          <q-icon :color="inverted !== undefined ? 'white' : 'dark'" v-else name="mdi-menu-right" style="vertical-align: baseline" />
          <span :class="[theme.label]">{{key}}</span><span :class="{'text-white': inverted !== undefined}"> : {{Array.isArray(value) ? `Array [${value.length}]` : 'Object'}}</span>
        </div>
        <json-tree class="margin-left" v-if="showObj[Array.isArray(data) ? key : index]" :data='value' :inverted="inverted"/>
      </div>
      <div v-else>
        <span :class="[theme.label]">{{key}}</span><span :class="{'text-white': inverted !== undefined}"> : </span>
        <span :class="{[theme.typeNumberOrBool]: typeof value === 'number' || typeof value === 'boolean', [theme.typeString]: typeof value === 'string', [theme.typeEmpty]: typeof value === 'undefined' || value === null }">{{JSON.stringify(value)}}</span>
      </div>
    </div>
    <span :class="{'text-white': inverted !== undefined}">{{Array.isArray(data) ? ']' : '}'}}</span>
  </div>
  <div v-else>
    <span style="font-size: 1rem;" :class="{[theme.typeNumberOrBool]: typeof data === 'number' || typeof data === 'boolean', [theme.typeString]: typeof data === 'string', [theme.typeEmpty]: typeof data === 'undefined' || data === null }">{{data}}</span>
  </div>
</template>

<script>
import Vue from 'vue'
export default {
  name: 'JsonTree',
  props: {
    data: { requered: true },
    inverted: true
  },
  data () {
    const showObj = []
    const len = Object.keys(this.data).length
    for (let i = 0, l = len; i < l; i++) {
      showObj.push(true)
    }
    return {
      showObj: showObj
    }
  },
  computed: {
    theme () {
      return this.inverted !== undefined
        ? {
          label: 'text-pink-4',
          typeString: 'text-red-3',
          typeNumberOrBool: 'text-blue-3',
          typeEmpty: 'text-grey-5'
        }
        : {
          label: 'text-pink-8',
          typeString: 'text-red-6',
          typeNumberOrBool: 'text-blue-6',
          typeEmpty: 'text-grey-6'
        }
    }
  },
  methods: {
    toggle (index) {
      Vue.set(this.showObj, index, !this.showObj[index])
    }
  }
}
</script>

<style>
  .margin-left {
    margin-left: 16px;
  }
</style>
