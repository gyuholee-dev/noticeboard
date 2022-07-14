import Server from './app/Server.js';
import merge from 'deepmerge';
import fs from 'fs';

// 컨피그
let config = {
  hostname: 'localhost',
  port: 8080,
  // 디렉토리
  paths : {
    app : 'app',
    pub : 'public',
    view : 'views',
    src : 'src',
    conf : 'config',
  },
  db : {
    host : 'localhost',
    user : 'root',
    password : null,
    port : '3306',
    // socketPath: '/var/lib/mysql/mysql.sock',
    socketPath: null,
    database : 'testdb'
  }
}
let userConfig = './config/server.json';
if (fs.existsSync(userConfig)) {
  config = merge(config, JSON.parse(fs.readFileSync(userConfig, 'utf8')));
}

global.APP = new Server(config);
APP.start();
