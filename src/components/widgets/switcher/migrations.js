export default {
  '1.5.4': (widget) => {
    widget.settings.trueIcon = ''
    widget.settings.falseIcon = ''
    return widget
  },
  '1.14.1': (widget) => {
    const colors = {
      grey: '#757575',
      red: '#e53935',
      green: '#43a047',
      orange: '#fb8c00',
      blue: '#1e88e5',
      'light-blue': '#039be5',
      purple: '#8e24aa',
      'deep-orange': '#f4511e',
      cyan: '#00acc1',
      brown: '#6d4c41',
      'blue-grey': '#546e7a'
    }
    widget.settings.trueColor = colors[widget.color]
    widget.settings.falseColor = '#333'
    return widget
  }
}
