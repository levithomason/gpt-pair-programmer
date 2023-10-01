import path from "path";

import { Sequelize } from "sequelize-typescript";
import debug from "debug";

import { BaseError } from "../utils/index.js";
import { SERVER_ROOT } from "../../config.js";
import * as models from "../models/index.js";

export const log = debug("gpp:db");

export const getSequelize = (): Sequelize => {
  return new Sequelize({
    dialect: "sqlite",
    storage: path.resolve(SERVER_ROOT, "database", "db.sqlite"),
    logging: (sql, timing) => log(sql, timing),
    models: [...Object.values(models)],
  });
};

export const getDB = async (): Promise<Sequelize> => {
  let sequelize: Sequelize;

  try {
    sequelize = getSequelize();
  } catch (error) {
    const message = "Failed to create the database:";
    log(message, error);
    throw new BaseError(message);
  }

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
  if (!db) {
    const message = "Missing required `db` argument.";
    log(message);
    throw new BaseError(message);
  }
  await db.sync();
};

export const resetDB = async (db: Sequelize) => {
  if (!db) {
    const message = "Missing required `db` argument.";
    log(message);
    throw new BaseError(message);
  }
  await db.drop();
  await setupDB(db);
};
