const db = require("../../data/dbConfig");

module.exports = {
  insert,
  get,
  getById,
  getByUsername,
};

async function insert(data) {
  const id = await db("users").insert(data);
  return db("users").where("id", id).first();
}

function get() {
  return db("users");
}

function getById(id) {
  return db("users").where("id", id).first();
}

function getByUsername(name) {
  return db("users").where("username", name);
}
