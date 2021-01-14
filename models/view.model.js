const db = require("../utils/db");

module.exports = {
  async add(view) {
    const [result, fields] = await db.add(view, "view");
    return result;
  },
};
