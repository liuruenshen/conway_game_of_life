const { spawn } = require('child_process');
const { kill } = require('process');

let apiServer = null;
module.exports = () => {
  if (apiServer) {
    kill(`-${apiServer.pid}`, 'SIGKILL');
    return Promise.resolve();
  } else {
    let localResolve = null;
    let localReject = null;
    const promise = new Promise((resolve, reject) => {
      localResolve = resolve;
      localReject = reject;
    });
    apiServer = spawn('yarn', ['dev:ws'], { detached: true });
    apiServer.stdout.on('data', (data) => {
      console.log('[WS SERVER][stdout]', data.toString());
      localResolve();
    });
    apiServer.stderr.on('data', (data) => {
      console.log('[WS SERVER][stderr]', data.toString());
      localReject();
    });

    return promise;
  }
};
