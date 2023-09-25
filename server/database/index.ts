import { Sequelize } from "sequelize";
import debug from "debug";

export const log = debug("db");

export const getSequelize = (): Sequelize => {
  return new Sequelize({
    dialect: "sqlite",
    storage: "./db.sqlite",
    logging: (sql, timing) => log(sql, timing),
  });
};

export const getDB = async () => {
  return new Promise<Sequelize>(async (resolve, reject) => {
    const sequelize = getSequelize();
    try {
      await sequelize.authenticate();
      log("Connected to the database.");
      resolve(sequelize);
    } catch (error) {
      log("Failed to connect to the database:", error);
      reject(error);
      return;
    }
  });
};

const setupDB = async (db: Sequelize) => {
  await db.sync();
};

const resetDB = async (db: Sequelize) => {
  await db.drop();
  await setupDB(db);
};
