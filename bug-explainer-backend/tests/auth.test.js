const request = require("supertest");
const app = require("../src/app");
const { User } = require("../src/models");
const { userOne, setupDatabase } = require("./fixtures/db");

beforeEach(setupDatabase);

test("Should register a new user", async () => {
  const uniqueEmail = `test_${Date.now()}@example.com`;
  const response = await request(app)
    .post("/api/auth/register")
    .send({
      email: uniqueEmail,
      password: "Test123!",
    })
    .expect(201);

  // Assert that the database was changed correctly
  const user = await User.findById(response.body.data.user.id);
  expect(user).not.toBeNull();

  // Assertions about the response
  expect(response.body).toMatchObject({
    success: true,
    data: {
      user: {
        email: uniqueEmail,
      },
      token: expect.any(String),
    },
  });

  expect(user.password).not.toBe("Test123!");
});

test("Should login existing user", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  expect(response.body.data.token).toBeDefined();
});

test("Should not login with wrong password", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: userOne.email,
      password: "wrongpassword",
    })
    .expect(401);

  //expect(response.status).toBe(401);
  expect(response.body).toMatchObject({
    success: false,
    error: {
      code: 401,
      message: "Incorrect email or password",
      ...(process.env.NODE_ENV === "development" && {
        stack: expect.any(String),
      }),
    },
  });
});
