import debug from "debug";
import { pipeline } from "@xenova/transformers";

const log = debug("gpp:server:ai:embeddings");

export type Embeddings = {
  dimension: number;
  sequenceLength: number;
  encode: (str: string) => Promise<number[]>;
};

type HfEmbeddingModel = {
  name: "Xenova/gte-base" | "Xenova/gte-small" | "Xenova/bge-small-en-v1.5";
  dimension: number;
  sequenceLength: number;
  sizeGB: number;
  leaderboard: number;
  scoreAverage: number;
  scoreSTS: number;
};

type PipelineUpdateInitiate = {
  status: "initiate";
  name: string;
  file: string;
};
type PipelineUpdateDownload = {
  status: "download";
  name: string;
  file: string;
};
type PipelineUpdateProgress = {
  status: "progress";
  progress: number;
  loaded: number;
  total: number;
  name: string;
  file: string;
};
type PipelineUpdateDone = {
  status: "done";
  name: string;
  file: string;
};
type PipelineUpdateReady = {
  status: "ready";
  task: "feature-extraction";
  model: string;
};
type PipelineUpdate =
  | PipelineUpdateInitiate
  | PipelineUpdateDownload
  | PipelineUpdateDone
  | PipelineUpdateReady
  | PipelineUpdateProgress;

type TensorReturn = { dims: number[]; type: string; data: Float32Array };

// All models below score higher than OpenAI's text-embedding-ada-002:
//  scoreAverage: 60.99
//  scoreSTS: 80.97
export const HF_EMBEDDING_MODELS: Record<
  HfEmbeddingModel["name"],
  HfEmbeddingModel
> = {
  "Xenova/gte-base": {
    name: "Xenova/gte-base",
    dimension: 768,
    sequenceLength: 512,
    sizeGB: 0.22,
    leaderboard: 5,
    scoreAverage: 62.39,
    scoreSTS: 82.3,
  },

  "Xenova/gte-small": {
    name: "Xenova/gte-small",
    dimension: 384,
    sequenceLength: 512,
    sizeGB: 0.07,
    leaderboard: 13,
    scoreAverage: 61.36,
    scoreSTS: 82.07,
  },

  "Xenova/bge-small-en-v1.5": {
    name: "Xenova/bge-small-en-v1.5",
    dimension: 384,
    sequenceLength: 512,
    sizeGB: 0.13,
    leaderboard: 7,
    scoreAverage: 62.17,
    scoreSTS: 81.59,
  },
};

export const EMBEDDING_MODEL = HF_EMBEDDING_MODELS["Xenova/gte-small"];

const extractor = await pipeline("feature-extraction", EMBEDDING_MODEL.name, {
  quantized: false,
  progress_callback: (update: PipelineUpdate) => {
    if (update.status === "progress") {
      log("...download", update.name, update.file, update.progress);
    }
    if (update.status === "ready") {
      log("...ready", update.task, update.model);
    }
  },
});

export const embeddings: Embeddings = {
  dimension: EMBEDDING_MODEL.dimension,
  sequenceLength: EMBEDDING_MODEL.sequenceLength,
  encode: async (str: string) => {
    const tensor = await extractor(str, {
      pooling: "mean",
      normalize: true,
    });

    return Array.from(tensor.data);
  },
};
