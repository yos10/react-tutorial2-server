import express from "express";
import cors from "cors";
import sequelize from "sequelize";
import { Restaurant, Review, User } from "./models.js";
import { checkJwt, getUser } from "./auth0.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/restaurants", async (req, res) => {
  const limit = +req.query.limit || 5;
  const offset = +req.query.offset || 0;
  const restaurants = await Restaurant.findAndCountAll({
    attributes: {
      include: [
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM reviews AS r WHERE r.restaurant_id = restaurant.id)`,
          ),
          "review_count",
        ],
      ],
    },
    include: { model: Review, limit: 3, include: { model: User } },
    order: [[sequelize.literal("review_count"), "DESC"]],
    limit,
    offset,
  });
  res.json(restaurants);

});

app.get("/restaurants/:restaurantId", async (req, res) => {
  const restaurantId = +req.params.restaurantId;
  const restaurant = await Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    res.status(404).send("not found");
    return;
  }
  res.json(restaurant);
});

app.get("/restaurants/:restaurantId/reviews", async (req, res) => {
  const restaurantId = +req.params.restaurantId;
  const limit = +req.query.limit || 5;
  const offset = +req.query.offset || 0;
  const restaurant = await Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    res.status(404).send("not found");
    return;
  }
  const reviews = await Review.findAndCountAll({
    include: { model: User },
    where: { restaurantId },
    limit,
    offset,
  });
  res.json(reviews);
});

app.post("/restaurants/:restaurantId/reviews", checkJwt, async (req, res) => {
  const auth0User = await getUser(req.get("Authorization"));
  const [user, created] = await User.findOrCreate({
    where: { sub: auth0User.sub },
    defaults: {
      nickname: auth0User.nickname,
    },
  });
  if (!created) {
    user.nickname = auth0User.nickname;
    await user.save();
  }

  const restaurantId = +req.params.restaurantId;
  const restaurant = await Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    res.status(404).send("not found");
    return;
  }

  const record = {
    title: req.body.title,
    comment: req.body.comment,
    userId: user.id,
    restaurantId,
  };

  if (!record.title || !record.comment) {
    res.status(400).send("bad request");
    return;
  }

  const review = await Review.create(record);
  res.json(review);
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
