const db = require("../utils/db");
const { paginate } = require("../config/default.json");

module.exports = {
  async all() {
    const sql = "select * from courses";
    const [rows, fields] = await db.load(sql);
    return rows;
  },

  async countCourse() {
    const sql = `select count(*) as total from courses`;
    const [rows, fields] = await db.load(sql);
    return rows[0].total;
  },

  async pageCourse(offset) {
    const sql = `select * from courses limit ${paginate.limit} offset ${offset}`;
    const [rows, fields] = await db.load(sql);
    return rows;
  },

  async countCourseByField(field) {
    const sql = `select count(*) as total from courses where field = '${field}'`;
    const [rows, fields] = await db.load(sql);
    return rows[0].total;
  },

  async pageCourseByField(offset, field) {
    const sql = `select * from courses where field = '${field}' limit ${paginate.limit} offset ${offset}`;
    const [rows, fields] = await db.load(sql);
    return rows;
  },

  async single(id) {
    const sql = `select * from courses where id = ${id}`;
    const [rows, fields] = await db.load(sql);
    if (rows.length === 0) return null;
    return rows[0];
  },
  async singleDetail(id) {
    const sql = `select * from courses co, categories cat, lessons less where co.idCourse = ${id} and co.idCat = cat.idCategory and less.idCourse = co.idCourse`;
    const [rows, fields] = await db.load(sql);
    if (rows.length === 0) return null;
    return rows[0];
  },

  async singleByIdTeacher(teacherID) {
    const sql = `select * from courses where idTeacher = '${teacherID}'`;
    const [rows, fields] = await db.load(sql);
    if (rows.length === 0) return null;

    return rows[0];
  },

  async allWithTeacher() {
    const sql = `select * from courses co, users u where co.idTeacher=u.idUser limit 10`;
    const [rows, fields] = await db.load(sql);
    if (rows.length === 0) return null;
    return rows;
  },

  async add(course) {
    const [result, fields] = await db.add(course, "courses");
    return result;
  },

  async delete(idCourse) {
    const condition = {
      id: idCourse,
    };
    const [result, fields] = await db.delete(condition, "courses");
    return result;
  },

  async patch(entity) {
    const condition = {
      id: entity.id,
    };
    delete entity.id;

    const [result, fields] = await db.patch(entity, condition, "courses");
    return result;
  },

  async countCourseByKeyword(keyword) {
    const sql = `select count(distinct c.id) as total
                    from users u, courses c
                    where match(c.title) against ('${keyword}') or 
                    match(u.fullname) against('${keyword}') and u.id=c.idTeacher 
                    or match(c.description) against ('${keyword}')`;
    const [rows, fields] = await db.load(sql);
    return rows[0].total;
  },

  async pageCourseByKeyword(offset, keyword) {
    const sql = `select distinct c.*
                    from users u, courses c
                    where match(c.title) against ('${keyword}') or 
                    match(u.fullname) against('${keyword}') and u.id=c.idTeacher 
                    or match(c.description) against ('${keyword}') 
                    limit ${paginate.limit} offset ${offset}`;
    const [rows, fields] = await db.load(sql);
    return rows;
  },
};
