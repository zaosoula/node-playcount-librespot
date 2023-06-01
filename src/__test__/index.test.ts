import {expect, jest, it, describe} from '@jest/globals';
import { beforeAll } from '@jest/globals'
import { PlayCountLibrespot } from "../index";
import { AlbumPlayCount } from '../interfaces/album-play-count';
import { expectToMatchZodSchema } from './utils';

describe("PlayCountLibrespot", () => {
  let spotify: PlayCountLibrespot;
  const onMessage = jest.fn(/*({type, data}) => type == 'stderr' ? console.debug(type, data.toString()) : undefined*/);
  const onClose = jest.fn();

  beforeAll(() => {
    spotify = new PlayCountLibrespot({
      username: process.env.SPOTIFY_USERNAME!,
      password: process.env.SPOTIFY_PASSWORD!,
      onMessage,
      onClose,
    });
  })

  it("connect", async () => {
    await spotify.connect();

    expect(spotify.isConnected).toBe(true)
  })

  it("connect (with bad credentials)", async () => {
    expect.assertions(1);

    const spotify2 = new PlayCountLibrespot({
      username: 'dummy',
      password: 'dummy',
      onMessage,
      onClose,
    });

    try {
      await spotify2.connect();
    } catch (e: any) {
      expect(e.message).toEqual('Bad credentials')
    }
  })

  it("getAlbumPlayCount", async () => {
    const results = await spotify.getAlbumPlayCount('59EUkMZdrliMqi01ocpG9a')

    expectToMatchZodSchema(AlbumPlayCount, results);
  })

  it("getArtistInfo", async () => {
    const results = await spotify.getArtistInfo('2YZyLoL8N0Wb9xBt1NhZWg')

    expect(results).toEqual(expect.objectContaining({
      uri: 'spotify:artist:2YZyLoL8N0Wb9xBt1NhZWg',
    }))
  })

  it("getArtistAbout", async () => {
    const results = await spotify.getArtistAbout('2YZyLoL8N0Wb9xBt1NhZWg')

    expect(results).toEqual(expect.objectContaining({
      artistUri: 'spotify:artist:2YZyLoL8N0Wb9xBt1NhZWg',
    }))
  })

  it("getArtistInsights", async () => {
    const results = await spotify.getArtistInsights('2YZyLoL8N0Wb9xBt1NhZWg')

    expect(results).toEqual(expect.objectContaining({
      name: expect.any(String),
    }))
  })

  it("disconnect", async () => {
    await spotify.disconnect();

    expect(spotify.isConnected).toBe(false)
  })
})
