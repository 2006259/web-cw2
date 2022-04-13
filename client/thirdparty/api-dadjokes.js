const joke = async (signal) => {
  console.log("getting a dad joke")
  try {
    let response = await fetch('/api/dadjoke', {
      method: 'GET',
      signal: signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
    return await response.json()
  } catch(err) {
    console.log("There was an error!!!")
    console.log(err)
  }
}

export {
	joke
}