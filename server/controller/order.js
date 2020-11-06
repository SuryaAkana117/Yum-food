// eslint-disable-next-line no-unused-vars
const Express = require("express");
const {
  Helper: { checkPayload, checkOrderItems, checkShippingData },
  ErrorCodes,
  ErrorMessage,
  CustomException,
  Logger,
} = require("../utils");
const { Order } = require("../model");

const log = new Logger("Controller:Order");

/**
 * Send result to user
 * @param  {object} order
 * @param  {Express.Response} res
 * @param {function} next
 */
const handleResult = function (order, res, next) {
  if (order) {
    res.json({ data: order });
  } else {
    res.status(404);
    next(
      new CustomException(
        // eslint-disable-next-line new-cap
        ErrorMessage.ORDER_NOT_FOUND,
        ErrorCodes.ORDER_NOT_FOUND
      )
    );
  }
};

/**
 * make sure protected content is not overriden
 * @param  {string} body
 */

/* eslint no-param-reassign: ["error", { "props": false }] no-underscore-dangle: ["error", { "allow": ["_id"] }] */

const sanitizeBody = function (body) {
  delete body._id;
  delete body.createdAt;
  delete body.updatedAt;
  delete body.user;
  delete body.itemsPrice;
  delete body.isDelivered;
  delete body.deliveredAt;
  delete body.isPaid;
  delete body.paidAt;
  delete body.totalPrice;
  delete body.orderItems;
};

/**
 * check if the order data from the body has proper items and shipping data
 * @param  {object} order
 * @param  {function} next
 * @return {boolean}
 */
function checkOrder(order, next) {
  const { orderItems: items, shipping } = order;
  if (checkOrderItems(items, next) && checkShippingData(shipping, next)) {
    // ensure desired object values
    return true;
  }

  return false;
}

/* eslint func-names: ["error", "never"] */

/**
 * Adds an order record
 * @param  {Express.Request} req
 * @param  {Express.Response} res
 * @param  {function} next
 */
const post = async function (req, res, next) {
  if (checkPayload(req.user || {})) {
    const { body } = req;
    if (!("items" in body)) {
      res.status(422);
      return next(
        new CustomException(
          ErrorMessage.REQUIRED_ITEMS,
          ErrorCodes.REQUIRED_ITEMS
        )
      );
    }
    if (!("shippingData" in body)) {
      res.status(422);
      return next(
        new CustomException(
          ErrorMessage.REQUIRED_SHIPPING_DATA,
          ErrorCodes.REQUIRED_SHIPPING_DATA
        )
      );
    }

    sanitizeBody(req.body);

    const { items, shippingData } = body;
    const order = {
      shipping: shippingData,
      orderItems: items,
      user: req.user.id,
    };
    const isValid = checkOrder(order, next);
    if (!isValid) return false;

    delete order.orderItems;
    const validOrder = await new Order(order);

    let error = null;
    await Promise.all(
      items.map(async (val) => {
        try {
          await validOrder.addItem(val);
          return val;
        } catch (err) {
          log.info(err);
          error = err;
          return err;
        }
      })
    );
    if (error) return next({ error });
    await validOrder.save();
    return handleResult(validOrder, res, next);
  }
  return next(
    new CustomException(
      // eslint-disable-next-line new-cap
      ErrorMessage.NO_PRIVILEGE,
      ErrorCodes.NO_PRIVILEGE
    )
  );
};

module.exports = {
  post,
};
