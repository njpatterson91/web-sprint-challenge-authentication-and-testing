const jwtSecret =
  process.env.JWT_SECRET || "hippopotomonstrosesquippedaliophobia";

module.exports = {
  jwtSecret,
};
