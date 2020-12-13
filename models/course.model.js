const db = require("../utils/db");

module.exports = {
    async all() {
        const sql = 'select * from courses';
        const [rows, fields] = await db.load(sql);
        return rows;
    },

    async single(id) {
        const sql = `select * from courses where idCourse = ${id}`;
        const [rows, fields] = await db.load(sql);
        if(rows.length === 0) 
            return null;
        return rows[0];
    },

    async add(course) {
        const [result, fields] = await db.add(course, 'courses');
        console.log(result);
        return result;
    },
    
    async del(id) {
        const condition = {
            idCourse: idCourse
        };
        const [result, fields] = await db.del(condition, 'courses');
        return result;
    },

    async patch(entity) {
        const condition = {
            idCourse: entity.idCourse
        };
        delete (entity.idCourse);

        const [result, fields] = await db.patch(entity, condition, 'courses');
        return result;
    }
}