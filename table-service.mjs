import Table from 'cli-table3'
import chalk from 'chalk'
import moment from 'moment'

export default function makeBuildTable() {
  return function buildTable(disruptions) {
    const table = new Table({
      head: ['#', 'Id', 'Netbeheerder', 'Titel', 'Sinds', 'Bijgewerkt', 'Opgelost'],
      colWidths: [4,10, 15, 80, 20, 20, 20]
    })

    disruptions.sort(disruptionComparator)

    for (let i = 0,max = Math.min(disruptions.length, 20); i < max; i += 1) {
      const dis = disruptions[i]

      table.push([
        i + 1,
        dis.source.id,
        org(dis.source.organisation),
        dis.titel,
        date(dis.period.begin || dis.period.plannedBegin),
        date(dis.lastUpdated),
        date(dis.period.end || dis.period.plannedEnd),
      ])
    }

    return table.toString()
  }

  function date(str) {
    return str ? moment(str).format('YYYY-MM-DD HH:mm') : ''
  }

  function org(nb) {
    return {
      'Stedin': chalk.yellow('Stedin'),
      'Liander': chalk.cyan('Liander'),
      'Enexis': chalk.magenta('Enexis'),
    }[nb]
  }

  function disruptionComparator(x,y) {
    const xd = x.lastUpdated
    const yd = y.lastUpdated

    return xd < yd ? 1 : -1
  }

}
