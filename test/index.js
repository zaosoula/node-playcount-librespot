const { PlayCountLibrespot } = require("node-playcount-librespot");


(async () => {

  const spotify = new PlayCountLibrespot({
    username: '',
    password: '',
    // onMessage: ({type, data}) => console.log(type, data.toString())
  })

  await spotify.connect();


  const results = await spotify.getArtistInfo('2YZyLoL8N0Wb9xBt1NhZWg')

  console.log(JSON.stringify(results))
})().catch(console.error);
