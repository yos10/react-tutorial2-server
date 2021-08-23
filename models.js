import Sequelize from 'sequelize';

const { DataTypes } = Sequelize;

export const sequelize = process.env.DATABASE_URL ?
  // 本番環境
  new Sequelize(
    process.env.DATABASE_URL,
    {
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    }
  )
  :
  // 開発環境
  new Sequelize(
    'postgres://postgres:postgres@db/review_data',
    {
      logging: false
    }
  );

export const User = sequelize.define(
  'user',
  {
    sub: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { underscored: true }
);

export const Restaurant = sequelize.define(
  'restaurant',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
    },
    map: {
      type: DataTypes.TEXT,
    },
  },
  { underscored: true }
);

export const Review = sequelize.define(
  'review',
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
      },
    },
    restaurantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Restaurant,
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { underscored: true }
);

Restaurant.hasMany(Review);
Review.belongsTo(Restaurant);
User.hasMany(Review);
Review.belongsTo(User);
