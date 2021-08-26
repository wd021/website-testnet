const {
  length,
  equals,
  ifElse,
  reject,
  fork,
  head,
  identity: I,
  lines,
  map,
  pipe,
  prepend,
  readStdin,
  smooth,
  split,
  uniqBy,
  unlines,
  curry,
  any,
  includes,
  __: $,
} = require('snang/script')

const SUCCESS = `No errors!`
const FILES_TO_IGNORE = ['flume', 'package-scripts']

const anyMatch = curry((b, a) => any(includes($, a))(b))
module.exports = pipe(
  readStdin,
  map(
    pipe(
      lines,
      map(pipe(split(':'), head)),
      smooth,
      uniqBy(I),
      reject(anyMatch(FILES_TO_IGNORE)),
      ifElse(
        pipe(length, equals(0)),
        () => SUCCESS,
        pipe(
          map(y => '- ' + y),
          prepend('These files still have console.logs in them: '),
          unlines
        )
      )
    )
  ),
  fork(
    // eslint-disable-next-line no-console
    console.error,
    ifElse(
      equals(SUCCESS),
      x => {
        // eslint-disable-next-line no-console
        console.log(x)
        process.exit(0)
      },
      x => {
        // eslint-disable-next-line no-console
        console.error(x)
        process.exit(1)
      }
    )
  )
)(process.argv.slice(2)[0])
