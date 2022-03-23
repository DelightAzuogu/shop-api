const { header } = require("express/lib/request");
const authMiddleware = require("../middleware/is-auth");
const expect = require("chai").expect;
const jwt = require("jsonwebtoken");
const sinon = require("sinon");

describe("the auth middleware", () => {
  it("should throw error", () => {
    const req = {
      get: (header) => null,
    };

    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw(
      "not authorized"
    );
  });

  it("should throw error if token is not splitable on ' ' ", () => {
    const req = {
      get: (header) => "del",
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });

  it("should throw an error on the decoded check", () => {
    const req = {
      get: (header) => "del ight",
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });

  it("should have a userId property in req", () => {
    const req = {
      get: (header) => "del ight",
    };
    sinon.stub(jwt, "verify");
    jwt.verify.returns({ userId: "12" });

    authMiddleware(req, {}, () => {});
    // console.log(req);
    expect(req).to.have.property("userId");
    jwt.verify.restore();
  });
});
