import Prism from 'prismjs'
import 'prismjs/themes/prism.css'

export default ({ Vue }) => {
  Vue.prototype.$prism = Prism
}
