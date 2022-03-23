const authMiddleware = require("../controller/auth");
const expect = require("chai").expect;
// const jwt = require("jsonwebtoken");
const sinon = require("sinon");
const User = require("../models/user");
const res = require("express/lib/response");

describe("auth controller", () => {
  describe("login", () => {
    it("should be an error", (done) => {
      const req = {
        body: {
          email: "test@test.com",
          password: "asdfg",
        },
      };

      sinon.stub(User, "findOne");
      User.findOne.throws();
      authMiddleware
        .login(req, {}, () => {})
        .then((result) => {
          expect(result).to.be.an("error");
          done();
        });

      User.findOne.restore();
    });
  });
});
