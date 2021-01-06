const db = require("../utils/db");

module.exports = {
  async all() {
    const sql = "select * from feedbacks";
    const [rows, fields] = await db.load(sql);
    return rows;
  },

  async allWithDetails() {
    const sql = `
      select c.*, count(p.idCourse) as ProductCount, 0 as IsActive
      from categories c left join courses p on c.idCategory = p.idCat
      group by c.idCategory, c.name`;
    const [rows, fields] = await db.load(sql);
    return rows;
  },

  async allWithIdCourse(idCourse) {
    const sql = `select f.ratingPoint, f.dateRating, f.ratingComment, u.fullname , sum(ratingPoint) as total_point
    from feedbacks f, users u 
    where f.idCourse = ${idCourse} and u.idUser = f.idStudent;`;
    const [rows, fields] = await db.load(sql);
    return rows;
  },

  async countFeedbackWithIdCourse(idCourse) {},

  async single(id) {
    const sql = `select * from feedbacks where idFeedback = ${id}`;
    const [rows, fields] = await db.load(sql);
    if (rows.length === 0) return null;

    return rows[0];
  },

  async add(feedback) {
    const [result, fields] = await db.add(feedback, "feedbacks");
    console.log(result);
    return result;
  },

  async del(id) {
    const condition = {
      idFeedback: id,
    };
    const [result, fields] = await db.delete(condition, "feedbacks");
    return result;
  },

  async patch(entity) {
    const condition = {
      idFeedback: entity.idFeedback,
    };
    delete entity.idFeedback;

    const [result, fields] = await db.patch(entity, condition, "feedbacks");
    return result;
  },
};
