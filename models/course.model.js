const db = require("../utils/db");
const { paginate } = require('../config/default.json');

module.exports = {
    async all() {
        const sql = 'select * from courses';
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
        const[rows, fields] = await db.load(sql);
        return rows;
    },

    async single(id) {
        const sql = `select * from courses where id = ${id}`;
        const [rows, fields] = await db.load(sql);
        if(rows.length === 0) 
            return null;
        return rows[0];
    },

    async singleByIdTeacher(teacherID) {
        const sql = `select * from courses where idTeacher = '${teacherID}'`;
        const [rows, fields] = await db.load(sql);
        if(rows.length === 0) return null;
        
        return rows[0];
    },

    async add(course) {
        const [result, fields] = await db.add(course, 'courses');
        console.log(result);
        return result;
    },
    
    async delete(idCourse) {
        const condition = {
            id: idCourse
        };
        const [result, fields] = await db.delete(condition, 'courses');
        return result;
    },

    async patch(entity) {
        const condition = {
            id: entity.id
        };
        delete (entity.id);

        const [result, fields] = await db.patch(entity, condition, 'courses');
        return result;
    }
}