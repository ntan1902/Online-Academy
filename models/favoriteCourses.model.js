const { add } = require("../utils/db");
const db = require("../utils/db");

module.exports = {
  async allByUser(id) {
    const sql = `select co.title, co.imagePath, co.idCourse, u.fullname, co.disable
                from favoriteCourses fa, courses co, users u
                where fa.idStudent = ${id} and fa.idCourse = co.idCourse and co.idTeacher = u.idUser`;
    const [rows, fields] = await db.load(sql);
    return rows;
  },
  async isFavoriteCourse(idStudent, idCourse) {
    const sql = `select * from favoriteCourses fa where fa.idCourse = ${idCourse} and fa.idStudent = ${idStudent}`;
    const [rows, fields] = await db.load(sql);
    return rows.length === 0 ? false : true;
  },

  async add(favorite) {
    const [result, fields] = await db.add(favorite, "favoriteCourses");
    return result;
  },

  async delete(idCourse, idStudent) {
    const condition = [{ idCourse: idCourse }, { idStudent: idStudent }];
    // const sql = `where idCourse = ${idCourse} and idStudent = ${idStudent}`;
    const [result, fields] = await db.delete(condition, "favoriteCourses");
    return result;
  },
};
