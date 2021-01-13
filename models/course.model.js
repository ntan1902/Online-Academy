const db = require("../utils/db");
const { paginate } = require("../config/default.json");

module.exports = {
  async all() {
    //with detail now
    const sql =
      "select * from courses co, categories cat where cat.idCategory = co.idCat";
    const [rows, fields] = await db.load(sql);
    return rows;
  },

  async countCourse() {
    const sql = `select count(*) as total from courses`;
    const [rows, fields] = await db.load(sql);
    return rows[0].total;
  },

  async pageCourse(offset) {
    const sql = `select co.*, u.fullname from courses co, users u where co.idTeacher = u.idUser limit ${paginate.limit} offset ${offset}`;
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
    const sql = `select co.*, cat.name, u.fullname, u.userDescription, u.avatar from courses co, users u, categories cat where co.idCourse = ${id} and co.idTeacher = u.idUser and co.idCat = cat.idCategory`;
    const [rows, fields] = await db.load(sql);
    if (rows.length === 0) return null;
    return rows[0];
  },
  async getLessons(idCourse) {
    const sql = `select less.* from courses co, lessons less where co.idCourse = ${idCourse} and less.idCourse = co.idCourse`;
    const [rows, fields] = await db.load(sql);
    if (rows.length === 0) return null;
    return rows;
  },

  async countLessons(idCourse) {
    const sql = `select less.* from courses co, lessons less where co.idCourse = ${idCourse} and less.idCourse = co.idCourse`;
    const [rows, fields] = await db.load(sql);
    return rows.length;
  },

  async singleByIdTeacher(teacherID) {
    const sql = `select * from courses where idTeacher = '${teacherID}'`;
    const [rows, fields] = await db.load(sql);
    if (rows.length === 0) return null;

    return rows[0];
  },

  async allWithTeacher() {
    const sql = `select * from courses co, users u where co.idTeacher=u.idUser 
                order by co.title limit 10`;
    const [rows, fields] = await db.load(sql);
    if (rows.length === 0) return null;
    return rows;
  },

  async allByIdTeacher(idTeacher) {
    const sql = `select * from courses co where co.idTeacher = ${idTeacher}`;
    const [rows, fields] = await db.load(sql);
    if (rows.length === 0) return null;
    return rows;
  },

  async topViewCourses() {
    const sql = `select c.*, u.fullname
                from courses c, view v, users u
                where c.idCourse = v.idCourse and c.idTeacher = u.idUser
                group by c.idCourse
                order by count(*) desc limit 10`;
    const [rows, fields] = await db.load(sql);
    if (rows.length === 0) return null;
    return rows;
  },

  async topRegistedCourses() {
    const sql = `select c.*, u.fullname
                from courses c, registers r, users u
                where c.idCourse= r.idCourse and c.idTeacher = u.idUser
                group by c.idCourse
                order by count(*) desc limit 10`;
    const [rows, fields] = await db.load(sql);
    if (rows.length === 0) return null;
    return rows;
  },

  async topRegistedCoursesWithIdCat(idCat) {
    const sql = `select c.*, u.fullname
                from courses c, registers r, users u
                where c.idCourse= r.idCourse and c.idTeacher = u.idUser and c.idCat = ${idCat}
                group by c.idCourse
                order by count(*) desc limit 5`;
    const [rows, fields] = await db.load(sql);
    if (rows.length === 0) return null;
    return rows;
  },

  async newCourses() {
    const sql = `select c.*, u.fullname
              from courses c, users u 
              where c.idTeacher = u.idUser
              order by c.lastModified desc
              limit 10`;
    const [rows, fields] = await db.load(sql);
    if (rows.length === 0) return null;
    return rows;
  },

  async topCourses() {
    const sql = `select c.*, u.fullname
                from courses c, view v, users u
                where yearweek(v.date) = yearweek(curdate()) and c.idCourse=v.idCourse and c.idTeacher = u.idUser
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

  async deleteLesson(idCourse, idLesson) {
    const condition = {
      idCourse: idCourse,
      chapter: idLesson,
    };
    const [result, fields] = await db.DeleteLesson(condition, "lessons");
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

  async addLesson(lesson) {
    const [result, fields] = await db.add(lesson, "lessons");
    return result;
  },

  async patchLesson(entity) {
    const condition = {
      idCourse: entity.idCourse,
      chapter: entity.chapter,
    };
    delete entity.idCourse;
    delete entity.chapter;

    for (let key in entity) {
      if (entity.hasOwnProperty(key)) {
        let entityTemp = {};
        entityTemp[key] = entity[key];
        await db.patchLesson(entityTemp, condition, "lessons");
      }
    }
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

  async pageCourseByKeyword(offset, keyword, sort) {
    if (sort == null) {
      sort = "title";
    }
    if (sort !== "rating") {
      const sql = `select distinct c.*, u.fullname
                from users u, courses c
                where u.idUser=c.idTeacher and (match(c.title) against ('${keyword}') or 
                  match(u.fullname) against('${keyword}')
                  or match(c.description) against ('${keyword}'))
                order by ${sort}
                limit ${paginate.limit} offset ${offset}`;
      const [rows, fields] = await db.load(sql);
      return rows;
    } else {
      const sql = `select distinct c.*
                  from users u, courses c, feedbacks f
                  where (match(c.title) against ('${keyword}') or 
                    match(u.fullname) against('${keyword}') and u.idUser=c.idTeacher 
                    or match(c.description) against ('${keyword}')) and f.idCourse=c.idCourse 
                  group by c.idCourse
                  order by avg (distinct f.ratingPoint) desc
      limit ${paginate.limit} offset ${offset}`;
      const [rows, fields] = await db.load(sql);
      if (rows.length == 0) {
        const sql = `select distinct c.*, u.fullname
                from users u, courses c
                where u.idUser=c.idTeacher and (match(c.title) against ('${keyword}') or 
                  match(u.fullname) against('${keyword}')
                  or match(c.description) against ('${keyword}'))
                limit ${paginate.limit} offset ${offset}`;
        const [rows, fields] = await db.load(sql);
        return rows;
      } else return rows;
    }
    /*const sql = `select distinct c.*
                from users u, courses c
                where match(c.title) against ('${keyword}') or 
                  match(u.fullname) against('${keyword}') and u.idUser=c.idTeacher 
                  or match(c.description) against ('${keyword}')

                limit ${paginate.limit} offset ${offset}`;
      const [rows, fields] = await db.load(sql);
      return rows;*/
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
