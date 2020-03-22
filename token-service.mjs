import jwt from 'jsonwebtoken'

export default function makeGetToken ({ readToken, httpClient, saveToken, clientId, clientSecret }) {
  return async function getToken () {
    const existingToken = await readToken()

    if (existingToken) {
      const { sub, exp } = jwt.decode(existingToken)

      if (sub === clientId && stillValid(exp)) {
        console.info('Reusing existing token ')

        return existingToken
      }
    }

    console.info('Fetching new token')
    const newToken = await getTokenFromService()

    await saveToken(newToken)

    return newToken
  }

  async function getTokenFromService () {
    return httpClient({
      method: 'POST',
      url: '/oauth/token',
      data: 'grant_type=client_credentials',
      auth: { username: clientId, password: clientSecret },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(({ data }) => data.access_token)
  }

  function stillValid (time) {
    const now = new Date().getTime() / 1000

    return time - now - 60 > 0
  }
}
