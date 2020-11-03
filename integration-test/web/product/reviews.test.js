const { request } = require("../../index");
const { Product } = require("../../../server/model");
const db = require("../../setup/db_setup");
const {
  Constants: { SAMPLE_MONGO_ID },
} = require("../../../server/utils");
let apikey = process.env.API_KEY;
const userData = {
  name: "Zell",
  email: "test@gmail.com",
  password: "Password2@",
  phone: "09036040503",
};

const productData = {
  name: "Jellof rice",
  price: 2000,
  countInStock: 2,
  description: "Jellof rice as you like it",
};

beforeEach(() => {
  let mockResponse = () => {
    const response = {};
    response.status = jest.fn().mockReturnValue(response);
    response.body = jest.fn().mockReturnValue(response);
    response.json = jest.fn().mockReturnValue(response);
    response.sendStatus = jest.fn().mockReturnValue(response);
    response.clearCookie = jest.fn().mockReturnValue(response);
    response.cookie = jest.fn().mockReturnValue(response);
    return response;
  };
  mockResponse();
});

/**
 * Product test
 */
describe("Product", () => {
  db.setupDB();
  it("should respond with single product object for authenticated user", async (done) => {
    const validProduct = new Product(productData);
    const savedProduct = await validProduct.save();

    let token = await request
      .post("/api/signup")
      .send(userData)
      .set("apikey", apikey);
    token = response.body.data.token;

    let review = {
      rating: 3,
      comment: "Great food",
    };

    let response = await request
      .post(`/api/product/review/${savedProduct._id}`)
      .set("apikey", apikey)
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send("review", review);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.numReviews).toBe(1);
    expect(response.body.data.rating).toBe(3);
    expect(response.status).toBe(200);
    done();
  });

  it("should respond with error for invalid id", async (done) => {
    const validProduct = new Product(productData);
    const savedProduct = await validProduct.save();

    let token = await request
      .post("/api/signup")
      .send(userData)
      .set("apikey", apikey);
    token = response.body.data.token;

    let review = {
      rating: 3,
      comment: "Great food",
    };

    let response = await request
      .post(`/api/product/review/234`)
      .set("apikey", apikey)
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send("review", review);
    expect(response.body.error.message).toBeDefined();
    expect(response.status).toBe(400);
    done();
  });

  //Missing Values
  it("should respond with error for missing value - Rating", async (done) => {
    const validProduct = new Product(productData);
    const savedProduct = await validProduct.save();

    let token = await request
      .post("/api/signup")
      .send(userData)
      .set("apikey", apikey);
    token = response.body.data.token;

    let review = {
      comment: "Great food",
    };

    let response = await request
      .post(`/api/product/review/${savedProduct._id}`)
      .set("apikey", apikey)
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send("review", review);
    expect(response.body.error.message).toBeDefined();
    expect(response.status).toBe(400);
    done();
  });
  it("should respond with error for missing value - Comment", async (done) => {
    const validProduct = new Product(productData);
    const savedProduct = await validProduct.save();

    let token = await request
      .post("/api/signup")
      .send(userData)
      .set("apikey", apikey);
    token = response.body.data.token;

    let review = {
      rating: 2,
    };

    let response = await request
      .post(`/api/product/review/${savedProduct._id}`)
      .set("apikey", apikey)
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send("review", review);
    expect(response.body.error.message).toBeDefined();
    expect(response.status).toBe(400);
    done();
  });

  //Invalid values
  it("should respond with error for invalid value - Rating", async (done) => {
    const validProduct = new Product(productData);
    const savedProduct = await validProduct.save();

    let token = await request
      .post("/api/signup")
      .send(userData)
      .set("apikey", apikey);
    token = response.body.data.token;

    let review = {
      rating: 6,
      comment: "Great food",
    };

    let response = await request
      .post(`/api/product/review/${savedProduct._id}`)
      .set("apikey", apikey)
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send("review", review);
    expect(response.body.error.message).toBeDefined();
    expect(response.status).toBe(400);
    done();
  });
  it("should respond with error for invalid value - Comment", async (done) => {
    const validProduct = new Product(productData);
    const savedProduct = await validProduct.save();

    let token = await request
      .post("/api/signup")
      .send(userData)
      .set("apikey", apikey);
    token = response.body.data.token;

    let review = {
      rating: 3,
      comment: "Nice food",
    };

    let response = await request
      .post(`/api/product/review/${savedProduct._id}`)
      .set("apikey", apikey)
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send("review", review);
    expect(response.body.error.message).toBeDefined();
    expect(response.status).toBe(400);
    done();
  });
  it("should respond with 404 error for missing product", async (done) => {
    const validProduct = new Product(productData);
    const savedProduct = await validProduct.save();

    let token = await request
      .post("/api/signup")
      .send(userData)
      .set("apikey", apikey);
    token = response.body.data.token;

    let review = {
      rating: 3,
      comment: "Great food",
    };

    let response = await request
      .post(`/api/product/review/${SAMPLE_MONGO_ID}`)
      .set("apikey", apikey)
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send("review", review);
    expect(response.body.error.message).toBeDefined();
    expect(response.status).toBe(404);
    done();
  });
  it("should respond with error for duplicate user review", async (done) => {
    const validProduct = new Product(productData);
    const savedProduct = await validProduct.save();

    let token = await request
      .post("/api/signup")
      .send(userData)
      .set("apikey", apikey);
    token = response.body.data.token;

    let review = {
      rating: 3,
      comment: "Great food",
    };

    let response = await request
      .post(`/api/product/review/${savedProduct._id}`)
      .set("apikey", apikey)
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send("review", review);

    response = await request
      .post(`/api/product/review/${savedProduct._id}`)
      .set("apikey", apikey)
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send("review", review);
    expect(response.body.error.message).toBeDefined();
    expect(response.status).toBe(400);
    done();
  });
});
