export default function makeDisruptionService({ httpClient }) {
  return async function getDisruptions({ token, lastUpdated }) {
    let disruptions = []
    let go = true
    let next = undefined


    while (go) {
      const res = await get(next)

      disruptions = disruptions.concat(res.disruptions)
      next = res.next
      go = next && true
    }

    return disruptions


    function get(next) {
      if (next)
        process.stdout.write('.')
      else
        process.stdout.write('Get disruptions')

      return httpClient({
        method: 'GET',
        url: 'api/v2/disruptions',
        params: {
          limit: 200,
          lastUpdated,
          next,
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }).then(r => r.data)
    }
  }

}
