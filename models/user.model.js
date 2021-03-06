const db = require("../utils/db");

module.exports = {
  async all() {
    const sql = "select * from users";
    const [rows, fields] = await db.load(sql);
    return rows;
  },
  async allByRole(role) {
    const sql = `select * from users where role = '${role}'`;
    const [rows, fields] = await db.load(sql);
    return rows;
  },

  async add(user) {
    const [result, fields] = await db.add(user, "users");
    return result;
  },

  async singleByUserName(username) {
    const sql = `select * from users where username = '${username}'`;
    const [rows, fields] = await db.load(sql);
    if (rows.length === 0) return null;

    return rows[0];
  },

  async singleByEmail(email) {
    const sql = `select * from users where email = '${email}'`;
    const [rows, fields] = await db.load(sql);
    if (rows.length === 0) return null;

    return rows[0];
  },

  async single(id) {
    const sql = `select * from users where idUser = ${id}`;
    const [rows, fields] = await db.load(sql);
    if (rows.length === 0) return null;

    return rows[0];
  },

  async patch(entity) {
    const condition = {
      idUser: entity.idUser,
    };
    delete entity.idUser;

    const [result, fields] = await db.patch(entity, condition, "users");
    return result;
  },

  async delete(id) {
    const condition = {
      idUser: id,
    };
    const [result, fields] = await db.delete(condition, "users");
    return result;
  },
};
