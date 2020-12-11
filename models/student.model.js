const db = require('../utils/db');

module.exports = {
    async all() {
        const sql = 'select * from users';
        const [rows, fields] = await db.load(sql);
        return rows;
    },

    async add(student) {
        const [result, fields] = await db.add(student, 'users');
        return result;
    },

    async single(id) {
        const sql = `select * from users where id = ${id}`;
        const [rows, fields] = await db.load(sql);
        if (rows.length === 0)
            return null;

        return rows[0];
    },

    async patch(entity) {
        const condition = {
            id: entity.id
        };
        delete (entity.id);

        const [result, fields] = await db.patch(entity, condition, 'users');
        return result;

    },

    async delete(id) {
        const condition = {
            id: id
        };
        const [result, fields] = await db.delete(condition, 'users');
        return result;
    },
};
