<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  methods: {
    swKill () {
      navigator.serviceWorker.getRegistrations().then(function (registrations) {
        for (let registration of registrations) {
          registration.unregister()
        }
      })
    }
  },
  beforeCreate () {
    this.swKill()
  }
}
</script>

<style>
</style>
