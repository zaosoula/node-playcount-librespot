import { z } from "zod";

export const Disk = z.object({
  number: z.number(),
  name: z.string(),
  tracks: z.array(
    z.object({
      uri: z.string(),
      playcount: z.number(),
      name: z.string(),
      popularity: z.number(),
      number: z.number(),
      duration: z.number(),
      explicit: z.boolean(),
      playable: z.boolean(),
      artists: z.array(
        z.object({
          name: z.string(),
          uri: z.string(),
          image: z.object({ uri: z.string() })
        })
      )
    })
  )
})

const Artist = z.object({ name: z.string(), uri: z.string() });

const Release = z.object({
  uri: z.string(),
  name: z.string(),
  cover: z.object({ uri: z.string() }),
  year: z.number(),
  track_count: z.number(),
  month: z.number(),
  day: z.number()
});

export const AlbumPlayCount = z.object({
  uri: z.string(),
  name: z.string(),
  cover: z.object({ uri: z.string() }),
  year: z.number(),
  track_count: z.number(),
  discs: z.array(Disk),
  copyrights: z.array(z.string()),
  artists: z.array(Artist),
  related: z.object({
    releases: z.array(Release)
  }),
  month: z.number(),
  day: z.number(),
  type: z.string(),
  label: z.string()
}).strict();

export type AlbumPlayCount = z.infer<typeof AlbumPlayCount>;
export type Release = z.infer<typeof Release>;
