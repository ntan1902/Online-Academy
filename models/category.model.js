const db = require('../utils/db');

// const list = [
//   { CatID: 1, CatName: 'Laptop' },
//   { CatID: 2, CatName: 'Phone' },
//   { CatID: 3, CatName: 'Quần áo' },
//   { CatID: 4, CatName: 'Giày dép' },
//   { CatID: 5, CatName: 'Trang sức' },
//   { CatID: 6, CatName: 'Khác' },
// ];

module.exports = {
  async all() {
    const sql = 'select * from categories';
    const [rows, fields] = await db.load(sql);
    return rows;
  },

  async allWithDetails() {
    const sql = `
      select c.*, count(p.id) as ProductCount, 0 as IsActive
      from categories c left join products p on c.CatID = p.CatID
      group by c.CatID, c.CatName
    `;
    const [rows, fields] = await db.load(sql);
    return rows;
  },

  async single(id) {
    const sql = `select * from categories where CatID = ${id}`;
    const [rows, fields] = await db.load(sql);
    if (rows.length === 0)
      return null;

    return rows[0];
  },

  async add(category) {
    const [result, fields] = await db.add(category, 'categories');
    // console.log(result);
    return result;
  },

  async del(id) {
    const condition = {
      CatID: id
    };
    const [result, fields] = await db.del(condition, 'categories');
    return result;
  },

  async patch(entity) {
    const condition = {
      CatID: entity.CatID
    };
    delete (entity.CatID);

    const [result, fields] = await db.patch(entity, condition, 'categories');
    return result;
  }
};
