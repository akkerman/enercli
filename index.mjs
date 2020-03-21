import axios from 'axios'

import makeGetToken from './token-service.mjs'
import makeGetDisruptions from './disruption-service.mjs'
import makeBuildTable from './table-service.mjs'
import { default as fsWithCallbacks } from 'fs'
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

const sleep = sec => new Promise(resolve => setTimeout(resolve, sec * 1000))

async function main() {
  const {
    client_id,
    client_secret,
  } = process.env

  if (!client_id || !client_secret) {
    console.log('Please set both client_id and client_secret as environment variables')
    process.exit(1)
  }

  while (true) {
    const getToken = makeGetToken({ saveToken, readToken, httpClient, client_secret, client_id })
    const getDisruptions = makeGetDisruptions({ httpClient })
    const buildTable = makeBuildTable()

    try {
      const token = await getToken()

      const disruptions = await getDisruptions({ token })

      console.log(buildTable(disruptions))
    } catch (error) {
      console.log(error)
    }
    await sleep(500)
  }
}

main()
