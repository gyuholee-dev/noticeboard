import * as url from 'url';
import fs from 'fs';
import path from 'path';
import routes from './routes/index.js';

let publicPath, viewsPath;

// 라우터 클래스
export default class Router {
  constructor (config) {
    const paths = config.paths;
    publicPath = path.resolve(paths.pub);
    viewsPath = path.resolve(paths.app, paths.view);
    Object.assign(this, routes);
  }

  async route (request, response) {
    const method = request.method;
    const urls = url.parse(request.url, true);
    const paths = urls.pathname;
    const pathname = paths.split('/')[1]?paths.split('/')[1]:'main';

    // 파일 우선 처리
    const ext = paths.split('.').pop().toLowerCase();
    if (ext !== paths && ext !== 'html') {
      const fileName = paths.split('/').pop();
      const filePath = path.join(publicPath, ext, fileName);
      if (fs.existsSync(filePath)) {
        response.sendFile(filePath);
      } else {
        response.status(404).send('404 NOT FOUND');
      }
      return;
    }
    
    if (method === 'GET') { 

      // HTML 도큐먼트
      // let document = 'index.html';
      // const query = urls.query;
      // switch(pathname) {
      //   case '/' || '/main':
      //     document = 'index.html';
      //     break;
      //   default:
      //     document = pathname + '.html';
      // }
      // response.sendFile(path.join(this.publicDir, document));

      // EJS 도큐먼트
      let document = 'index.ejs';
      let data = {};
      const query = urls.query;
      switch(pathname) {
        case 'main':
        case 'view':
        case 'search':
        case 'update':
        case 'write':
        case 'delete':
          this.main(method, request, response, query);
          break;
        default:
          // document = pathname + '.ejs';
          // if (fs.existsSync(path.join(viewsPath, document))) {
          //   if (typeof this[pathname] === 'function') {
          //     this[pathname](method, request, response, query);
          //   } else {
          //     response.render(document, {data:data});
          //   }
          // } else {
          //   response.render('404.ejs');
          // }
          response.render('404.ejs');
          break;
      }

    } else if (method === 'POST') {

      // 포스트 데이터
      let data = {};
      const query = request.body;

      // 포스트 xhr
      if (query.call) {
        switch(query.call) {
          // case 'test':
            // data = await mysqlTest();
            // break;
          default:
            data = await this[query.call]();
            break;
        }
        response.json(data);
      }

      // 포스트 페이지
      switch(pathname) {
        default:
          // this[pathname](method, request, response);
          this.main(method, request, response, query);
          break;
      }

    }
  }

}