export default function makeDisruptionService({ httpClient }) {
  return async function getDisruptions({ token }) {
    return httpClient({
      method: 'GET',
      url: 'api/v2/disruptions',
      params: {
        limit: 200,
        lastUpdated: '2020-03-21T00:00:00',
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }).then(({ data }) => data.disruptions)
      .then(disruptions => disruptions.sort(disruptionComparator))
  }

  function disruptionComparator(x,y) {
    const xd = x.lastUpdated
    const yd = y.lastUpdated

    return xd < yd ? 1 : -1
  }
}
