import mysql from 'mysql2';

// 데이터베이스 클래스
export default class Database {
  constructor (config) {
    this.dbConfig = config.db;
    this.connect(this.dbConfig);
  }

  connect(dbConfig) {
    this.DB = mysql.createConnection(dbConfig);
    this.DB.connect((error) => {
      if (error) {
        this.handleError(error);
      }
    });
    this.DB.on('error', (error) => {
      this.handleError(error);
    });
  }

  handleError(error) {
    console.log(error);
    switch (error.code) {
      case 'PROTOCOL_CONNECTION_LOST':
        this.connect(this.dbConfig);
        break;
      default:
        setTimeout(() => {
          this.connect(this.dbConfig);
        }, 2000);
        break;
    }
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