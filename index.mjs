import axios from 'axios'
import moment from 'moment'
import fsWithCallbacks from 'fs'

import makeGetToken from './token-service.mjs'
import makeGetDisruptions from './disruption-service.mjs'
import makeBuildTable from './table-service.mjs'

moment.locale('nl')
const fs = fsWithCallbacks.promises

async function saveToken (token) {
  return fs.writeFile('energieonderbrekingen.token', token)
}
async function readToken () {
  return fs.readFile('energieonderbrekingen.token').catch(() => null)
}

const httpClient = axios.create({
  baseURL: 'https://energieonderbrekingen.nl',
  timeout: 5000
})

function init () {
  const {
    client_id: clientId,
    client_secret: clientSecret
  } = process.env

  if (!clientId || !clientSecret) {
    console.error('Please set both client_id and client_secret as environment variables')
    process.exit(1)
  }

  const getToken = makeGetToken({ saveToken, readToken, httpClient, clientSecret, clientId })
  const getDisruptions = makeGetDisruptions({ httpClient })
  const buildTable = makeBuildTable()

  return async function main () {
    const now = moment().format('dddd HH:mm')
    const lastUpdated = moment().startOf('day').format('YYYY-MM-DDTHH:mm:ss')

    try {
      const token = await getToken()
      const disruptions = await getDisruptions({ token, lastUpdated })

      console.clear()
      console.info(`Vandaag zijn er ${disruptions.length} onderbrekingen bijgewerkt. Laatste update: ${now} `)
      console.info(buildTable(disruptions))
    } catch (error) {
      console.log(error)
    }
  }
}

const main = init()
let timer

function restart () {
  console.log('(re)starting dashboard')
  if (timer) {
    clearInterval(timer)
  }
  main()
  timer = setInterval(main, 500000)
}

function shutdown () {
  console.info('shutting down')
  clearInterval(timer)
  process.exit()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
process.on('SIGUSR1', restart)
process.on('SIGINFO', restart)

process.stdin.currentLine = ''
process.stdin.setRawMode(true)
process.stdin.on('data', buf => {
  const charAsAscii = buf.toString().charCodeAt(0)
  console.log(buf.toString())
  switch (charAsAscii) {
    case 0x03:
      shutdown()
      break
    case 0x0c:
      console.clear()
      restart()
      break
    default:
      // nothing
  }
})

restart()
