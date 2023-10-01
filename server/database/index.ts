import { Sequelize } from "sequelize";
import debug from "debug";

import { BaseError } from "../utils/index.js";

export const log = debug("db");

export const getSequelize = (): Sequelize => {
  return new Sequelize({
    dialect: "sqlite",
    storage: "./db.sqlite",
    logging: (sql, timing) => log(sql, timing),
  });
};

export const getDB = async (): Promise<Sequelize> => {
  const sequelize = getSequelize();
  try {
    await sequelize.authenticate();
    log("Connected to the database.");
    return sequelize;
  } catch (error) {
    const message = "Failed to connect to the database:";
    log(message, error);
    throw new BaseError(message);
  }
};

export const setupDB = async (db: Sequelize) => {
  await db.sync();
};

export const resetDB = async (db: Sequelize) => {
  await db.drop();
  await setupDB(db);
};
