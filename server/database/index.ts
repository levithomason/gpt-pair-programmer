import debug from "debug";
import { Sequelize } from "sequelize-typescript";

import { BaseError } from "../utils/index.js";
import * as models from "../models/index.js";

const log = debug("gpp:server:database:index");
const sequelLogger = debug("gpp:sequelize");

let _sequelize: Sequelize;
export const getDB = async (): Promise<Sequelize> => {
  if (_sequelize) return _sequelize;

  _sequelize = new Sequelize({
    dialect: "postgres",
    username: "postgres",
    password: "admin",
    host: "localhost",
    port: 5432,
    database: "postgres",
    logging: (sql, timing) => sequelLogger(sql),
    models: [...Object.values(models)],
  });

  try {
    await _sequelize.authenticate();
    log("Connected to database.");
    return _sequelize;
  } catch (error) {
    const message = "Failed to connect to database.";
    log(message, error);
    throw new BaseError(message);
  }
};

export const setupDB = async (db: Sequelize) => {
  log("Setting up database.");

  if (!db) {
    const message = "Missing required `db` argument.";
    log(message);
    throw new BaseError(message);
  }

  await db.query("CREATE EXTENSION IF NOT EXISTS vector");
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
