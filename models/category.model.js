const db = require('../utils/db');

module.exports = {
  async all() {
    const sql = 'select * from categories';
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

  async single(id) {
    const sql = `select * from categories where idCategory = ${id}`;
    const [rows, fields] = await db.load(sql);
    if (rows.length === 0)
      return null;

    return rows[0];
  },

  async add(category) {
    const [result, fields] = await db.add(category, 'categories');
    console.log(result);
    return result;
  },

  async del(id) {
    const condition = {
      idCategory: id
    };
    const [result, fields] = await db.delete(condition, 'categories');
    return result;
  },

  async patch(entity) {
    const condition = {
      idCategory: entity.idCategory
    };
    delete (entity.idCategory);

    const [result, fields] = await db.patch(entity, condition, 'categories');
    return result;
  }
};
