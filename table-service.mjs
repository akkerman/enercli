import Table from 'cli-table3'
import colors from 'colors'
import moment from 'moment'

export default function makeBuildTable () {
  return function buildTable (disruptions) {
    const table = new Table({
      style: { head: ['brightWhite'] },
      head: ['#', 'Id', '', '', '', 'Plaats', 'Straat', 'Oorzaak', 'Sinds', 'Bijgewerkt', 'Opgelost'],
      colWidths: [5, 10, 9, 4, 4, 15, 25, 50]
    })

    disruptions.sort(disruptionComparator)

    const length = disruptions.length

    for (let i = 0, max = Math.min(length, 20); i < max; i += 1) {
      const dis = disruptions[i]

      table.push([
        length - i,
        dis.source.id,
        org(dis.source.organisation),
        dis.network.type === 'gas' ? ' '.blue : ' '.yellow,
        dis.planned ? ' '.brightGreen : ' '.brightYellow,
        semi(dis.location.features.properties.city),
        semi(dis.location.features.properties.street),
        dis.cause,
        date(dis.period.begin || dis.period.plannedBegin),
        date(dis.lastUpdated),
        date(dis.period.end || dis.period.plannedEnd)
      ])
    }

    return table.toString()
  }

  function date (str) {
    return str ? moment(str).format('YYYY-MM-DD HH:mm') : ''
  }

  function org (nb) {
    return {
      Stedin: colors.yellow('Stedin'),
      Liander: colors.cyan('Liander'),
      Enexis: colors.magenta('Enexis')
    }[nb]
  }

  function disruptionComparator (x, y) {
    const xd = x.lastUpdated
    const yd = y.lastUpdated

    return xd < yd ? 1 : -1
  }

  function semi (t) {
    return t.split(';')[0]
  }
}
