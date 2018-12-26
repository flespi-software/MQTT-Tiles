export default {
  methods: {
    validateTopic (topic) {
      let parts = topic.split('/')

      for (let i = 0; i < parts.length; i++) {
        if (parts[i] === '+') {
          continue
        }

        if (parts[i] === '#') {
          // for Rule #2
          return i === parts.length - 1
        }

        if (parts[i].indexOf('+') !== -1 || parts[i].indexOf('#') !== -1) {
          return false
        }
      }

      return true
    }
  }
}
