import debug from "debug";
import type { InferAttributes, InferCreationAttributes } from "sequelize";
import { Sequelize, DataTypes } from "sequelize";
import { Column, Model, Table } from "sequelize-typescript";
import pgvector from "pgvector/sequelize";

import type { ExtendedDataTypes } from "../../types.js";
import { embeddings } from "../ai/embeddings.js";

export type ProjectFileAttributes = InferAttributes<ProjectFile>;
export type ProjectFileCreationAttributes =
  InferCreationAttributes<ProjectFile>;

const log = debug("gpp:server:models:vector-document");
pgvector.registerType(Sequelize);

@Table({})
export class ProjectFile extends Model<
  ProjectFileAttributes,
  ProjectFileCreationAttributes
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

  @Column({ type: DataTypes.INTEGER })
  indexStart: number;

  @Column({ type: DataTypes.INTEGER })
  indexEnd: number;

  @Column({
    type: (DataTypes as ExtendedDataTypes).VECTOR(embeddings.dimension),
  })
  embedding: number[];
}
