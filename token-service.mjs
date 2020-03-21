import jwt from 'jsonwebtoken'

export default function makeGetToken({ readToken, httpClient, saveToken, client_id, client_secret }) {

  return async function getToken() {
    const existingToken = await readToken()

    if (existingToken) {
      const { sub, exp } = jwt.decode(existingToken)

      if (sub === client_id && stillValid(exp)) {

        console.info('Reusing existing token ')

        return existingToken
      }
    }

    console.info('Fetching new token')
    const newToken = await getTokenFromService()

    await saveToken(newToken)

    return newToken
  }

  async function getTokenFromService() {
    return httpClient({
      method: 'POST',
      url: '/oauth/token',
      data: 'grant_type=client_credentials',
      auth: { username:client_id, password:client_secret },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(({ data }) => data.access_token)
  }

  function stillValid(time) {
    const now = new Date().getTime() / 1000

    return time - now - 60 > 0
  }
}

