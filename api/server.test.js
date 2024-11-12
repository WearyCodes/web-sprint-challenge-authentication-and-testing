const request = require("supertest");
const server = require("../api/server");
const db = require("../data/dbConfig");

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

afterAll(async () => {
  await db.destroy();
});

describe("Auth Endpoints", () => {
  describe("[POST] /api/auth/register", () => {
    it("successfully creates a new user", async () => {
      const res = await request(server).post("/api/auth/register").send({
        username: "testuser",
        password: "testpass",
      });

      expect(res.status).toBe(201);
      expect(typeof res.body).toBe("object");
      expect(res.body.id).toBeDefined();
      expect(res.body.username).toBe("testuser");
      expect(res.body.password).toBeDefined();
      expect(res.body.password).not.toBe("testpass");
    });

    it("fails when username is already taken", async () => {
      // First create a user
      await request(server).post("/api/auth/register").send({
        username: "existinguser",
        password: "testpass",
      });

      // Try to create another user with same username
      const res = await request(server).post("/api/auth/register").send({
        username: "existinguser",
        password: "differentpass",
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "username taken");
    });
  });

  describe("[POST] /api/auth/login", () => {
    it("successfully logs in and returns token", async () => {
      // First register a user
      await request(server).post("/api/auth/register").send({
        username: "loginuser",
        password: "loginpass",
      });

      // Try to log in
      const res = await request(server).post("/api/auth/login").send({
        username: "loginuser",
        password: "loginpass",
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("message", "welcome, loginuser");
    });

    it("fails with invalid credentials", async () => {
      const res = await request(server).post("/api/auth/login").send({
        username: "wronguser",
        password: "wrongpass",
      });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "invalid credentials");
    });
  });

  describe("[GET] /api/jokes", () => {
    it("fails without token", async () => {
      const res = await request(server).get("/api/jokes");

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "Token required");
    });
  });
});
