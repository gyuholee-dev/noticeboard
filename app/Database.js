import mysql from 'mysql';
import fs from 'fs';

// 데이터베이스 클래스
export default class Database {
  constructor (config) {
    // this.dbConfig = JSON.parse(fs.readFileSync('./config/db.json', 'utf8'));
    this.dbConfig = config.db;
    this.DB = mysql.createConnection(config.db);
    this.DB.connect();
  }

  async query(sql) {
    sql = sql.replace(/\n\s+/g, ' ');
    return new Promise((resolve, reject) => {
      this.DB.query(sql, (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });
  }
}