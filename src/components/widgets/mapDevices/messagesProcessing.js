import setWith from 'lodash/setWith'
import get from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'
import Vue from 'vue'

function getMapDevicesValueByPacket (packet, initValue, subscriptionTopic, widget) {
  const path = subscriptionTopic.split('/')
  const currentPath = packet.topic.split('/')
  let value = initValue
  const setPath = []
  // path.forEach((pathItem, index) => {
  //   setPath.push(currentPath[index])
  // })
  setPath.push(currentPath[4])
  setPath.push(currentPath[6])
  if (packet.payload.length) {
    let payload = packet
    // try {
    //   payload = JSON.parse(packet.payload.toString())
    // } catch (e) {
    //   payload = packet.payload.toString()
    // }
    // const timestamp = get(packet, 'properties.userProperties.timestamp')
    // payload = { timestamp, payload }
    if (setPath.length) {
      setWith(value, setPath, payload, Object)
    } else {
      value = payload
    }
  } else {
    if (setPath.length) {
      const path = setPath.slice(0, -1).join('.')
      const name = setPath.slice(-1)[0]
      const obj = path ? get(value, path, null) : value
      obj && Vue.delete(obj, name)
    } else {
      value = null
    }
  }
  return value
}


export default function getMapDevicesValue (packets, initValue, subscriptionTopic, widget) {
  if (!packets || subscriptionTopic !== widget.topics[0]) {
    let res = null
    if (packets && packets.length) {
      res = packets.slice(-1)[0]
    }
    return res
  }
  let value = initValue ? cloneDeep(initValue) : {}
  packets.forEach((packet) => {
    value = getMapDevicesValueByPacket(packet, value, subscriptionTopic, widget)
  })
  return value
}
