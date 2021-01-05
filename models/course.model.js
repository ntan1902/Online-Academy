const db = require("../utils/db");
const { paginate } = require("../config/default.json");

module.exports = {
  async all() { //with detail now
    const sql = "select * from courses co, categories cat where cat.idCategory = co.idCat";
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

  async allByField(field) {
    const sql = `select * from courses where field = '${field}'`;
    const [rows, fields] = await db.load(sql);
    return rows;
  },

  async countCourseByField(field) {
    const sql = `select count(*) as total from courses co, categories cat where cat.name = '${field}' and cat.idCategory = co.idCat`;
    const [rows, fields] = await db.load(sql);
    return rows[0].total;
  },

  async pageCourseByField(offset, field) {
    const sql = `select * from courses co, categories cat where cat.name= '${field}' and cat.idCategory = co.idCat limit ${paginate.limit} offset ${offset}`;
    const [rows, fields] = await db.load(sql);
    return rows;
  },

  async single(id) {
    const sql = `select * from courses where idCourse = ${id}`;
    const [rows, fields] = await db.load(sql);
    if (rows.length === 0) return null;
    return rows[0];
  },
  async singlePreviews(id) {
    const sql = `select * from courses co, categories cat, lessons less where co.idCourse = ${id} and co.idCat = cat.idCategory and less.idCourse = co.idCourse`;
    const [rows, fields] = await db.load(sql);
    if (rows.length === 0) return null;
    return rows;
  },

  async singleByIdTeacher(teacherID) {
    const sql = `select * from courses where idTeacher = '${teacherID}'`;
    const [rows, fields] = await db.load(sql);
    if (rows.length === 0) return null;

    return rows[0];
  },

  async allWithTeacher() {
    const sql = `select * from courses co, users u where co.idTeacher=u.idUserUser 
                order by co.title limit 10`;
    const [rows, fields] = await db.load(sql);
    if (rows.length === 0) return null;
    return rows;
  },

  async topViewCourses() {
    const sql = `select c.*
                from courses c, view v
                where c.idCourse=v.idCourse
                group by c.idCourse
                order by count(*) desc limit 10`;
    const [rows, fields] = await db.load(sql);
    if (rows.length === 0) return null;
    return rows;
  },

  async topRegistedCourses() {
    const sql = `select c.*
                from courses c, register r
                where c.idCourse= r.idCourse
                group by c.idCourse
                order by count(*) desc limit 10`;
    const [rows, fields] = await db.load(sql);
    if (rows.length === 0) return null;
    return rows;
  },

  async newCourses() {
    const sql = `select c.*
              from courses c
              order by c.lastModified desc
              limit 10`;
    const [rows, fields] = await db.load(sql);
    if (rows.length === 0) return null;
    return rows;
  },

  async topCourses() {
    const sql = `select c.*
                from courses c, view v
                where yearweek(v.date) = yearweek(curdate()) and c.idCourse=v.idCourse
                group by (c.idCourse)
                order by count(*) desc limit 4`;
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
      idCourse: idCourse,
    };
    const [result, fields] = await db.delete(condition, "courses");
    return result;
  },

  async patch(entity) {
    const condition = {
      idCourse: entity.id,
    };
    delete entity.id;

    const [result, fields] = await db.patch(entity, condition, "courses");
    return result;
  },

  async countCourseByKeyword(keyword) {
    const sql = `select count(distinct c.idCourse) as total
                    from users u, courses c
                    where match(c.title) against ('${keyword}') or 
                    match(u.fullname) against('${keyword}') and u.idUser=c.idTeacher 
                    or match(c.description) against ('${keyword}')`;
    const [rows, fields] = await db.load(sql);
    return rows[0].total;
  },

  async pageCourseByKeyword(offset, keyword) {
    const sql = `select distinct c.*
                    from users u, courses c
                    where match(c.title) against ('${keyword}') or 
                    match(u.fullname) against('${keyword}') and u.idUser=c.idTeacher 
                    or match(c.description) against ('${keyword}') 
                    limit ${paginate.limit} offset ${offset}`;
    const [rows, fields] = await db.load(sql);
    return rows;
  },

  //categories
  async allByCat(CatName) {
    const sql = `select * from courses co, categories cat 
                    where cat.name = '${CatName}' and co.idCat = cat.idCategory`;
    console.log(sql);
    const [rows, fields] = await db.load(sql);
    console.log(rows);
    return rows;
  },
};
