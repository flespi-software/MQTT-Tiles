export default {
  '1.15.0': (widget) => {
    const settings = widget.settings
    if (settings.type === 'map-location' || settings.type === 'map-route') {
      settings.type = 'informer'
    }
    return widget
  }
}
