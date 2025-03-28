import Prism from 'prismjs'
import 'prismjs/themes/prism.css'
import throttle from 'lodash/throttle'
const throttleHighlightAll = throttle(() => {
  Prism.highlightAll()
}, 1000, { trailing: true, leading: true })

export default ({ Vue }) => {
  Vue.prototype.$prism = Prism
  Vue.prototype.$prism.throttleHighlightAll = throttleHighlightAll
}
