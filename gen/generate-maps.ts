import { Dungeon } from "../app/types/Config"
import Design from "../app/core/design"
import fs from "fs"
import { logger } from "../app/utils/logger"
;(Object.keys(Dungeon) as Dungeon[]).forEach((m) => {
  const d = new Design(m, 1, 0.1, 9, 9, [3, 3], [6, 6], false)
  d.create().then(() => {
    const file = fs.createWriteStream(`tests/samples/${d.id}.json`)
    file.on("error", function (err) {
      logger.error(err)
    })
    file.write(JSON.stringify(d.exportToTiled()))
    file.end()
  })
})
