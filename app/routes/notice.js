export default async function notice(method, request, response, params, get=null) {

  let ACT = 'notice';
  // let ACT = params[1] ? params[1] : 'notice';
  let DO = params[2] ? params[2] : 'view';
  let ID = params[3] ? params[3] : 1;
  let PAGE = params[4] ? params[4] : 1;

  if (method === 'GET') {

    if (DO == 'view' || DO == 'search') {

      let page = ID;
      let group = Math.ceil(page/10);

      let startRow = (page - 1) * 10;
      let sql = '';
      if (DO == 'view') {
        sql = `SELECT * FROM notice 
               ORDER BY no DESC 
               LIMIT ${startRow}, 10 `;
      } else if (DO == 'search') {
        sql = `SELECT * FROM notice 
               WHERE title LIKE '%${get.query}%'
               ORDER BY no DESC 
               LIMIT ${startRow}, 10 `;
      }
      let listData = await APP.database.query(sql);

      // 랜더링
      let document = 'notice.ejs';
      let data = {
        DO: DO,
        get: get,
        page: page,
        listData : listData,
        pageLinks : await getPageLinks(page, group, get)
      };
      response.render(document, data);

    } else if (DO == 'write') {

      let document = 'notice_edit.ejs';
      let data = {
        title : '공지사항 작성',
        page : PAGE,
        postData : {
          title : '',
          content : ''
        }
      }
      response.render(document, data);

    } else if (DO == 'update') {
        
      let sql = `SELECT * FROM notice WHERE no = ${ID}`;
      let postData = await APP.database.query(sql);
      
      let data = {
        title : '공지사항 수정',
        page : PAGE,
        postData : postData[0]
      }
      let document = 'notice_edit.ejs';
      response.render(document, data);

    }

  } else if (method === 'POST') {

    if (DO == 'write') {
      let query = request.body;
      let title = query.title;
      let content = query.content;
      let writeday = getDate();

      let sql = `INSERT INTO notice 
                 (title, content, writer, writeday)
                 VALUES 
                 ('${title}', '${content}', '관리자', '${writeday}')`;
      await APP.database.query(sql);
      response.redirect(`/notice/view`);

    } else if (DO == 'update') {

      let query = request.body;
      let title = query.title;
      let content = query.content;
      let writeday = getDate();

      let sql = `UPDATE notice SET
                 title = '${title}',
                 content = '${content}',
                 writeday = '${writeday}'
                 WHERE no = '${ID}' `;
      await APP.database.query(sql);
      response.redirect(`/notice/view/${PAGE}`);

    } else if (DO == 'delete') {

      let query = request.body;
      let no = query.no;

      let sql = `DELETE FROM notice WHERE no = '${no}'`;
      await APP.database.query(sql);
      response.redirect(`/notice/view/${PAGE}`);

    }

  }
}

function getDate() {
  let today = new Date();
  let year = today.getFullYear();
  let month = ('0' + (today.getMonth() + 1)).slice(-2);
  let day = ('0' + today.getDate()).slice(-2);
  let dateString = year + '-' + month  + '-' + day;
  return dateString;
}

async function getPageLinks(page, group, get=null) {
  let pageLinks = '';

  let sql = `SELECT COUNT(*) AS cnt FROM notice `;
  if (get && get.query) {
    sql += `WHERE title LIKE '%${get.query}%'`;
  }
  let result = await APP.database.query(sql);
  let pageCount = Math.ceil(result[0].cnt/10);
  let groupCount = Math.ceil(pageCount/10);

  let startPage = (group - 1) * 10 + 1;
  let endPage = startPage + 9;
  let prevPage, nextPage;

  let act = 'view';
  let query = '';
  if (get && get.query) {
    act = 'search';
    query = `?query=${get.query}`;
  }

  pageLinks += `<div class="buttons">`;
    if (page > 1) {
      pageLinks += `<a href="/notice/${act}/1${query}">FIRST</a>`;
    } else {
      pageLinks += `<span style="color:grey;">FIRST</span>`;
    }
    if (group > 1) {
      prevPage = (group - 2) * 10 + 1;
      pageLinks += `<a href="/notice/${act}/${prevPage}${query}">PREV</a> `;
    } else {
      pageLinks += `<span style="color:grey;">PREV</span>`;
    }
  pageLinks += `</div>`;

  pageLinks += `<div class="pages">`;
    for (let i=startPage; i<=endPage; i++) {
      let style = '';
      if (i > pageCount) {
        break;
      }
      if (i == page) {
        style = `font-weight:bold;color:red;`;
      }
      pageLinks += `<a href="/notice/${act}/${i}${query}" style="${style}">[${i}]</a>`;
    }
  pageLinks += `</div>`;

  pageLinks += `<div class="buttons">`;
    if (group < groupCount) {
      nextPage = group * 10 + 1;
      pageLinks += `<a href="/notice/${act}/${nextPage}${query}">NEXT</a>`;
    } else {
      pageLinks += `<span style="color:grey;">NEXT</span>`;
    }
    if (page != pageCount) {
      pageLinks += `<a href="/notice/${act}/${pageCount}${query}">LAST</a>`;
    } else {
      pageLinks += `<span style="color:grey;">LAST</span>`;
    }
  pageLinks += `</div>`;

  return pageLinks;
}