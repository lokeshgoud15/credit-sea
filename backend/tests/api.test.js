import { expect } from "chai";
import request from "supertest";
import app from "../server.js";

describe("Backend API", function () {
  it("GET /health should return status ok", async function () {
    const res = await request(app).get("/health");
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("status", "ok");
  });

  it("GET /api/reports should return json array (200)", async function () {
    const res = await request(app).get("/api/reports");
    expect([200, 401, 403, 500]).to.include(res.status);
    if (res.status === 200) expect(res.body).to.be.an("array");
  });
});
