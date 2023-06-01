import { spawn } from 'child_process';
import net from "net"
import fs from "fs/promises"
import fetch from 'node-fetch';
import path from 'path';
import { AlbumPlayCount } from './interfaces/album-play-count';

import { __dirname } from './dirname.cjs';
const binPath = path.join(__dirname, '../bin')

async function getPortFree(): Promise<number> {
  return new Promise(res => {
    const srv = net.createServer();
    srv.listen(0, () => {
      const port = (srv.address() as net.AddressInfo).port
      srv.close(() => res(port))
    });
  })
}

export class PlayCountLibrespot {
  private javaProcess?: ReturnType<typeof spawn>;
  private credentials;
  public onMessage;
  public onClose;
  public isConnected;
  private port?: number;

  constructor({ username, password, onMessage = () => { }, onClose = () => { } }: {
    username: string;
    password: string;
    onMessage: (payload: {type: string; data: Buffer}) => any;
    onClose: (payload: {code: number | null}) => any;
  }) {
    this.credentials = {
      username,
      password
    }
    this.onMessage = onMessage;
    this.onClose = onClose;
    this.isConnected = false;
  }

  writeConfigFile({ port }: { port: number }) {
    fs.writeFile(path.join(binPath, 'config.toml'), `
preferredLocale = "en"
logLevel = "INFO"
storeCredentials = false
credentialsFile = "creds.json"

[server]
port = ${port}
albumEndpoint = "/albumPlayCount"
artistEndpoint = "/artistInfo"
artistAboutEndpoint = "/artistAbout"
artistInsightsEndpoint = "/artistInsights"
enableHttps = false
httpsKs = ""
httpsKsPass = ""
    `)
  }
  connect(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      this.port = await getPortFree();
      await this.writeConfigFile({ port: this.port })
      
      this.javaProcess = spawn('java', ['-jar', './sp-playcount.jar', this.credentials.username, this.credentials.password], {
        cwd: binPath
      });

      this.javaProcess.stdout?.on('data', (data) => {

        if (data.toString().includes(`Listening on port ${this.port}`)) {
          this.isConnected = true;
          resolve();
        }

        this.onMessage({
          type: 'stdout',
          data,
        })
      });

      this.javaProcess.stderr?.on('data', (data) => {

        this.onMessage({
          type: 'stderr',
          data,
        })

        if (data.toString().includes(`BadCredentials`)) {
          this.isConnected = false;
          reject(new Error("Bad credentials"));
          this.javaProcess?.kill();
          return;
        }
      });

      this.javaProcess.on('close', (code) => {
        this.isConnected = false;
        
        this.onClose({
          code,
        });
      });

      ['uncaughtException', 'SIGINT, SIGTERM'].forEach(event => {
        process.on(event, this.disconnect)
      })

    })
  }

  disconnect() {
    this.javaProcess?.kill();
    this.isConnected = false;
  }

  async request(path: string) {
    const response = await fetch(new URL(path, `http://localhost:${this.port}`));

    const body = await response.text();
    try {
      return JSON.parse(body).data;
    } catch (error) {
      try {
        return JSON.parse(body.slice(27, -2));
      } catch (error) {
        return body;
      }
    }
  }

  getAlbumPlayCount(albumId: string): Promise<AlbumPlayCount> {
    return this.request(`/albumPlayCount?albumid=${albumId}`);
  }

  getArtistInfo(artistId: string) {
    return this.request(`/artistInfo?artistid=${artistId}`);
  }

  getArtistAbout(artistId: string) {
    return this.request(`/artistAbout?artistid=${artistId}`);
  }

  getArtistInsights(artistId: string) {
    return this.request(`/artistInsights?artistid=${artistId}`);
  }
}
