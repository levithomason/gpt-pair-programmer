import debug from "debug";
import type { InferAttributes, InferCreationAttributes } from "sequelize";
import { DataTypes } from "sequelize";
import { Column, Model, Table } from "sequelize-typescript";

export type VectorDocumentAttributes = InferAttributes<ProjectFile>;
export type VectorDocumentCreationAttributes =
  InferCreationAttributes<ProjectFile>;

const log = debug("gpp:server:models:vector-document");

@Table({})
export class ProjectFile extends Model<
  VectorDocumentAttributes,
  VectorDocumentCreationAttributes
> {
  @Column({ type: DataTypes.STRING, primaryKey: true })
  id: string;

  @Column({ type: DataTypes.STRING })
  project: string;

  @Column({ type: DataTypes.STRING })
  name: string;

  @Column({ type: DataTypes.STRING })
  path: string;

  @Column({ type: DataTypes.TEXT })
  content: string;

  @Column({ type: DataTypes.INTEGER })
  chunk: number;

  @Column({ type: DataTypes.INTEGER })
  chunks: number;

  @Column({ type: DataTypes.ARRAY(DataTypes.FLOAT) })
  embedding: number[];
}
