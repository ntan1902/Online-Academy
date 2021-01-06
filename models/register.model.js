const db = require("../utils/db");

module.exports = {
  async all() {
    const sql = "select * from registers";
    const [rows, fields] = await db.load(sql);
    return rows;
  },
  async isRegister(idStudent, idCourse) {
    const sql = `select * from registers re where re.idCourse = ${idCourse} and re.idStudent = ${idStudent}`;
    const [rows, fields] = await db.load(sql);
    return rows.length === 0 ? false : true;
  },
};
