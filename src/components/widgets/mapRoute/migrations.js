export default {
  '1.11.4': (widget) => {
    const settings = widget.settings
    settings.items = [
      {
        name: 'Item 1',
        route: settings.topics[0]
      }
    ]
    return widget
  }
}
