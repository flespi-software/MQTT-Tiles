<template>
  <div class="dash__boards">
    <q-btn fab color="dark" @click="$emit('add')" icon="mdi-plus" class="absolute button--add">
      <q-tooltip>Add new board</q-tooltip>
    </q-btn>
    <q-toolbar color="white">
      <q-toolbar-title class="text-dark">Boards</q-toolbar-title>
    </q-toolbar>
    <div class="q-px-sm scroll boards__wrapper">
      <div v-if="Object.keys(boards).length" class="row">
        <div class="q-pt-md q-px-sm col-xl-4 col-md-6 col-sm-6 col-xs-12" v-for="(board, id) in boards" :key="id">
          <q-card>
            <q-item class="q-py-none q-px-sm bg-grey-4">
              <q-item-main class="ellipsis">
                <div class="ellipsis" style="height: 38px; line-height: 38px;" v-if="!board.settings.edited">
                  {{board.name}}
                  <q-tooltip>{{board.name}}</q-tooltip>
                </div>
                <q-input
                  autofocus
                  @click.stop=""
                  v-model="board.name"
                  v-else
                  color="dark"
                  :after="[{icon: 'mdi-content-save', handler () { if (board.settings.edited) { $emit('edit', id) } }}]"
                  @blur="() => { if (board.settings.edited) { $emit('edit', id) } }"
                />
              </q-item-main>
              <q-item-side>
                <q-btn round dense flat icon="mdi-fullscreen" color="dark" @click.native="$emit('select', id)">
                  <q-tooltip>Show full board</q-tooltip>
                </q-btn>
                <q-btn round dense flat icon="mdi-dots-vertical" color="dark">
                  <q-popover anchor="bottom right" self="top right">
                    <q-list dense>
                      <q-item class="cursor-pointer" v-close-overlay highlight @click.native.stop="$emit('edit', id)">
                        <q-item-side icon="mdi-pencil" />
                        <q-item-main label="Edit name"/>
                      </q-item>
                      <q-item-separator/>
                      <q-item class="cursor-pointer" v-close-overlay highlight @click.native.stop="$emit('delete', id)">
                        <q-item-side color="red" icon="mdi-delete-outline" />
                        <q-item-main label="Remove"/>
                      </q-item>
                    </q-list>
                  </q-popover>
                </q-btn>
              </q-item-side>
            </q-item>
            <q-card-separator />
            <q-card-main class="row" :class="{ 'bg-grey-2': !board.shortcutsIndexes.length }">
              <div class="text-grey-8 col-12 q-mb-sm" style="font-size: 15px;">Shortcuts</div>
              <template v-if="board.shortcutsIndexes.length">
                <div class="col-3 q-px-xs" v-for="(item, index) in [0, 1, 2, 3]" :key="index">
                  <component
                    v-if="widgets[board.shortcutsIndexes[index]]"
                    :is="widgets[board.shortcutsIndexes[index]].type"
                    :item="widgets[board.shortcutsIndexes[index]]"
                    @action="(data) => { $emit('action', data) }"
                    :index="board.shortcutsIndexes[index]"
                    :mini="true"
                  />
                </div>
              </template>
              <div v-else class='shortcuts--empty col-12' style="min-height: 84px;">
                <div class="text-center text-grey-8 q-mb-sm q-mt-sm" style="font-size: 1.2rem;">You have no shortcuts</div>
                <div class="text-center text-grey-8">You can add one on <q-btn icon="mdi-fullscreen" color="grey-8" size="sm" dense label="full board view" @click="$emit('select', id)" /></div>
              </div>
            </q-card-main>
          </q-card>
        </div>
      </div>
      <div v-else class="text-dark text-bold wrapper--empty">
        <div class="q-mb-sm">No boards</div>
        <div><q-btn color="dark" icon="mdi-plus-circle-outline" label="New board" @click="$emit('add')" /></div>
      </div>
    </div>
  </div>
</template>

<style lang="stylus">
  .button--add
    bottom 16px
    right 16px
    z-index 1
  .dash__boards
    position relative
    .boards__wrapper
      height calc(100% - 50px)
      padding-bottom 82px
      .wrapper--empty
        text-align center
        margin-top 30px
        font-size 2rem
</style>

<script>
import DefaultMini from './widgets/DefaultMini'
import Switcher from './widgets/swither/View'
import Clicker from './widgets/clicker/View'
import Informer from './widgets/informer/View'
export default {
  name: 'Boards',
  props: ['boards', 'widgets'],
  components: {
    DefaultMini, Switcher, Clicker, Informer
  }
}
</script>
