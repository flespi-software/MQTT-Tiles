import compareVersions from 'compare-versions'

let migrateHandlers = {
  '1.6.5': (board) => {
    let variables = board.settings.variables || []
    variables.forEach((variable, index) => {
      if (variable.type) {
        variable.topic.payloadNameField = ''
      } else {
        variable.values = variable.values.map(value => ([value, value]))
      }
    })
    return board
  }
}

function migrateBoards (boards, fromVersion, toVersion) {
  return boards.map((board) => {
    return migrateBoard(board, fromVersion, toVersion)
  })
}

function migrateBoard (board, fromVersion, toVersion) {
  let migrations = migrateHandlers
  let versions = Object.keys(migrations)
  versions.forEach((version) => {
    if (compareVersions.compare(version, fromVersion, '>') && compareVersions.compare(version, toVersion, '<=')) {
      try {
        migrations[version](board)
      } catch (e) {
        console.log(e)
      }
    }
  })
  board.appVersion = toVersion
  return board
}

export default {
  methods: {
    migrateBoard,
    migrateBoards
  }
}
