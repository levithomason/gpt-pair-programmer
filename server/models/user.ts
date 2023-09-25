import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { getSequelize } from "../database";

const sequelize = getSequelize();

export interface User
  extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  id: CreationOptional<string>;
  name: string;
}

export const User = sequelize.define<User>("user", {
  id: { type: DataTypes.UUID, primaryKey: true },
  name: DataTypes.TEXT,
});
