const request = require("supertest");
const server = require("./server");
const db = require("../data/dbConfig");
const Auth = require("./auth/auth-model");

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});
beforeEach(async () => {
  await db("users").truncate();
});
afterAll(async () => {
  await db.destroy();
});
const user = {
  username: "nathan",
  password: "yeehaw",
};
const badUser = {
  password: "yeehaw",
};

test("sanity", () => {
  expect(true).toBe(true);
});

describe("[post]/api/auth/login", () => {
  it("Login with a nonexistant user", async () => {
    const response = await request(server).post("/api/auth/login").send(user);
    expect(response.body).toBe("invalid credentials");
  });
  it("Login with a valid user", async () => {
    await request(server).post("/api/auth/register").send(user);
    const response = await request(server).post("/api/auth/login").send(user);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("token");
  });
});
describe("[post]/api/auth/register", () => {
  it("Invalid object sent on registration", async () => {
    const response = await request(server)
      .post("/api/auth/register")
      .send(badUser);
    expect(response.body).toBe("username and password required");
  });
  it("Valid registration", async () => {
    const response = await request(server)
      .post("/api/auth/register")
      .send(user);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("username");
    expect(response.body).toHaveProperty("password");
  });
});

describe("[get]/api/jokes/", () => {
  it("accessing protected endpoint with no token", async () => {
    const response = await request(server).get("/api/jokes");
    expect(response.body).toBe("token required");
  });
  it("accessing protected route with valid token", async () => {
    await request(server).post("/api/auth/register").send(user);
    const {
      body: { token },
    } = await request(server).post("/api/auth/login").send(user);
    const response = await request(server)
      .get("/api/jokes")
      .set("Authorization", token);
    expect(response.body).toHaveLength(3);
  });
});
