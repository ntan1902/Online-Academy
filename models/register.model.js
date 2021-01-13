const db = require("../utils/db");
module.exports = {
  async all() {
    const sql = "select * from registers";
    const [rows, fields] = await db.load(sql);
    return rows;
  },
  async getStudentNumbers(idCourse) {
    const sql = `select count(*) as studentNumber from registers where idCourse = ${idCourse}`;
    const [rows, fields] = await db.load(sql);
    return rows[0].studentNumber;
  },
  async isRegister(idStudent, idCourse) {
    const sql = `select * from registers re where re.idCourse = ${idCourse} and re.idStudent = ${idStudent}`;
    const [rows, fields] = await db.load(sql);
    return rows.length === 0 ? false : true;
  },

  async allByUser(id) {
    const sql = `select co.title, co.imagePath, co.idCourse, u.fullname
    from registers r, courses co, users u
    where r.idStudent = ${id} and r.idCourse = co.idCourse and co.idTeacher = u.idUser`;
    const [rows, fields] = await db.load(sql);
    return rows;
  },
};
