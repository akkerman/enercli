import axios from 'axios'

import makeGetToken from './token-service.mjs'
import makeGetDisruptions from './disruption-service.mjs'
import makeBuildTable from './table-service.mjs'
import { default as fsWithCallbacks } from 'fs'
import moment from 'moment'

const fs = fsWithCallbacks.promises

async function saveToken(token) {
  return fs.writeFile('energieonderbrekingen.token', token)
}
async function readToken() {
  return fs.readFile('energieonderbrekingen.token').catch(() => null)
}

const httpClient = axios.create({
  baseURL: 'https://test.energieonderbrekingen.nl',
  timeout: 5000
})

function init() {
  const {
    client_id,
    client_secret,
  } = process.env

  if (!client_id || !client_secret) {
    console.error('Please set both client_id and client_secret as environment variables')
    process.exit(1)
  }

  const getToken = makeGetToken({ saveToken, readToken, httpClient, client_secret, client_id })
  const getDisruptions = makeGetDisruptions({ httpClient })
  const buildTable = makeBuildTable()

  return async function main() {
    const now = moment().format('ddd HH:mm')
    const lastUpdated = moment().startOf('day').format('YYYY-MM-DDTHH:mm:ss')


    try {
      const token = await getToken()

      const disruptions = await getDisruptions({ token, lastUpdated })

      console.clear()
      console.info(`${now} ${disruptions.length} disruptions updated today`)
      console.info(buildTable(disruptions))
    } catch (error) {
      console.log(error)
    }
  }
}


const main = init()

main()
setInterval(main, 500_000)
