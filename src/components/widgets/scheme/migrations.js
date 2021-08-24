export default {
  '1.16.2': (widget) => {
    const settings = widget.settings
    settings.items.forEach(item => {
      item.settings.style = ''
      item.settings.autoresize = true
    })
    return widget
  }
}
