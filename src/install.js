import { downloadRelease } from '@terascope/fetch-github-release';
import { spawn } from 'child_process';
import fs from 'fs';
import * as url from 'url';
import path from 'path';
import os from 'os';
const user = 'entriphy';
const repo = 'sp-playcount-librespot';
const outputdir = './bin';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const {uid, gid} = os.userInfo();

const filterRelease = (release) => {
  return release.prerelease === false;
}

const filterAsset = (asset) => {
  return asset.name.endsWith('.jar');
}

const getJavaVersion = () => {
  return new Promise((resolve, reject) => {
    var java = spawn('java', ['-version']);
    java.on('error', function (err) {
      reject(err);
      java.kill();
    })
    java.stderr.on('data', function (data) {
      // data = data.toString().split('\n')[0];
      let version;
      data.toString().split('\n').forEach(line => {
        version = line.match(/(?:java|openjdk) version "(.*)"/i)?.[1] ?? version;
      })

      if (version) {
        resolve(version);
        java.kill();
      }
    });
  })

}
getJavaVersion()
  .then((version) => {
    console.log(`Java version ${version} detected`);
    return downloadRelease(user, repo, outputdir, filterRelease, filterAsset)
  })
  .then(function (paths) {
    const jarPath = path.join(__dirname, "../bin/sp-playcount.jar");
    fs.renameSync(paths[0], jarPath)
    fs.chownSync(jarPath, uid, gid);
    console.log('Binary downloaded');
  })
  .catch(function (err) {
    console.error(err.message);
  });
