import express from 'express';
import asyncHandler from 'express-async-handler';
// import session from 'express-session';
// const FileStore = fileStore(session);
import fileStore from 'session-file-store';
import ejs from 'ejs';
import path from 'path';
import cookieParser from 'cookie-parser';
import crypto from 'crypto'; 

import Database from './Database.js';
import Router from './Router.js';

// 서버 클래스
export default class Server {
  constructor(config) {
    this.config = config;
    this.server = express();
    this.router = new Router(config);
    this.database = new Database(config);
    this.init();
  }

  // 초기화
  init() {
    const config = this.config;
    const paths = config.paths;
    const publicPath = path.resolve(paths.pub);
    const viewsPath = path.resolve(paths.app, paths.view);

    this.server.use( // 미들웨어
      // session({ // 세션 
      //   secret: "secret key",
      //   resave: false,
      //   saveUninitialized: true,
      //   store: new FileStore(),
      // }),
      cookieParser(), // 쿠키
      // express.static(publicPath),
      // express.json(),
      express.urlencoded({extended:false}),
    );
    
    this.server.set( // 뷰 엔진, ejs
      'view engine', 'ejs', 
    );
    this.server.set( // 뷰 파일 경로
      'views', viewsPath,
    );

    // 비동기 라우팅
    this.server.all('*', asyncHandler(async(request, response, next)=>{
      try {
        await this.router.route(request, response);
      } catch (error) {
        next(error);
      }
    }));
  }

  // 서버 시작
  start () {
    const config = this.config;
    const hostname = config.hostname;
    const port = config.port;
    this.server.listen(port, hostname, ()=>{
      console.log(`SERVER STARTED: http://${hostname}:${port}/`);
    });
  }

}