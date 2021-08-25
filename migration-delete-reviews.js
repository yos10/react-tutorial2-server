import { sequelize, Restaurant, Review, User } from "./models.js";
import * as data from "./sample-data.js";

await sequelize.sync({ force: true });
for (const { name, image, map } of data.restaurants) {
  await Restaurant.create({ name, image, map });
}
