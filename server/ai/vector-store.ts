import fs from "fs";
import path from "path";
import debug from "debug";
import { globby } from "globby";

import { absProjectPath, settings } from "../settings.js";
import { getGlobalGitignoreGlobs } from "../tools/project/utils.js";
import { embeddings } from "./embeddings.js";
import { splitWords } from "./text-splitters.js";
import type { ProjectFileAttributes } from "../models/project-file.js";
import { ProjectFile } from "../models/project-file.js";
import { getSocketIO } from "../socket.io-server.js";
import { getDB } from "../database/index.js";
import yaml from "js-yaml";

const log = debug("gpp:server:ai:vector-store");

const dotProduct = (a: number[], b: number[]): number => {
  return a.reduce((acc, _, i) => acc + a[i] * b[i], 0);
};

type ProjectFileWithScore = Omit<ProjectFileAttributes, "embedding"> & {
  score: number;
};

type ProjectFileMerge = Omit<
  ProjectFileAttributes,
  "id" | "embedding" | "chunk"
> & {
  score: number[];
  chunk: number[];
};

/**
 * Streams every file in the project's root which should be indexed.
 */
export const filesToIndex = async (): Promise<string[]> => {
  const projectRoot = absProjectPath();
  log(`filesToIndex: in "${projectRoot}"`);

  // Index all files in the project root, except .git and .gitignored
  const globalGitignoreGlobs = await getGlobalGitignoreGlobs();

  // TODO: meaningful/dedicated splitters for each file extension?
  return globby(
    [
      /* code     */ "**/*.{js,jsx,ts,tsx}",
      /* html     */ "**/*.{html,ejs}",
      /* css      */ "**/*.{css,scss,less}",
      /* markdown */ "**/*.{md,markdown,mdx}",
      /* config   */ "**/*.{yml,yaml,json,*rc}",
      /* text     */ "**/*.{txt,log,rtf}",
      /* shell    */ "**/*.{sh,zsh}",
    ],
    {
      cwd: projectRoot,
      dot: true,
      gitignore: true,
      ignore: [
        "**/.git/**",
        "**/.yarn/**" /* yarn 3+ unignores some .yarn files */,
        "**/yarn.lock/**",
        "**/node_modules/**",
        ...globalGitignoreGlobs,
      ],
      onlyFiles: true,
    },
  );
};

// TODO: Index the project tree for HIGH-level search
// TODO: Index file structure for MEDIUM-level search

// TODO: Index github for project history search
// TODO: Index the git history for project history search

export const indexProjectFiles = async () => {
  const io = getSocketIO();
  const startTime = Date.now();
  const files = await filesToIndex();
  const maxLength = embeddings.sequenceLength;

  let filesIndexed = 0;
  let totalChunks = 0;
  for await (const file of files) {
    filesIndexed++;

    const existingFile = await ProjectFile.findByPk(
      `${settings.projectName}:${file}:1`,
    );

    if (existingFile) {
      io.emit("indexingProgress", {
        filename: `skip: ${file}`,
        file: filesIndexed,
        files: files.length,
        chunk: 1,
        chunks: 1,
      });

      log(`skipping ${file} because it's already indexed`);
      continue;
    }

    const content = fs.readFileSync(absProjectPath(file), "utf8");
    const chunks = splitWords({ str: content, maxLength });

    let chunkNumber = 0;
    let indexStart = 0;
    let indexEnd = 0;

    for (const chunk of chunks) {
      chunkNumber++;
      totalChunks++;
      indexEnd += chunk.length;
      indexStart = indexEnd - chunk.length;

      await ProjectFile.upsert({
        id: `${settings.projectName}:${file}:${chunkNumber}`,
        project: settings.projectName,
        name: path.basename(file),
        path: file,
        content: chunk,
        chunk: chunkNumber,
        chunks: chunks.length,
        // TODO: include line
        // TODO: include column
        indexStart: indexStart,
        indexEnd: indexEnd,
        embedding: await embeddings.encode(chunk),
      });

      io.emit("indexingProgress", {
        filename: file,
        file: filesIndexed,
        files: files.length,
        chunk: chunkNumber,
        chunks: chunks.length,
      });
    }

    log(chunkNumber, `chunks ${file}`);
  }

  const endTime = Date.now();

  const timeTotalMS = endTime - startTime;
  const timeTotalS = Math.round(timeTotalMS / 1000);
  const timePerFile = Math.round(timeTotalMS / filesIndexed);
  const filesPerSecond = Math.round(filesIndexed / (timeTotalMS / 1000));

  log("= INDEXED ====================");
  log("  project  :", settings.projectName);
  log("  files    :", filesIndexed.toLocaleString());
  log("  seconds  :", timeTotalS.toLocaleString());
  log("-------------------------");
  log("  files/sec:", filesPerSecond.toLocaleString());
  log("  ms/file  :", timePerFile.toLocaleString());

  io.emit("indexingComplete", {
    files: filesIndexed,
    chunks: totalChunks,
  });
};

/**
 * Converts a ProjectFile to a low-token-count string based on yaml.
 * @param projectFile
 */
export const projectFileToSearchResultString = (
  projectFile: ProjectFile | ProjectFileWithScore | ProjectFileMerge,
): string => {
  const keys = ["project", "path", "indexStart", "indexEnd", "content"];

  const projectFileSearchResult = keys.reduce((acc, key) => {
    acc[key] = projectFile[key];
    return acc;
  }, {});

  return yaml.dump(projectFileSearchResult);
};

export const mergeProjectFileResults = async (
  projectFiles: ProjectFileWithScore[],
): Promise<ProjectFileMerge[]> => {
  const makeMergeable = (result: ProjectFileWithScore): ProjectFileMerge => ({
    project: result.project,
    name: result.name,
    path: result.path,
    content: result.content,
    chunk: [result.chunk],
    chunks: result.chunks,
    indexStart: result.indexStart,
    indexEnd: result.indexEnd,
    score: [result.score],
  });

  if (projectFiles.length === 0) return [];

  if (projectFiles.length === 1) return [makeMergeable(projectFiles[0])];

  const resultsByPath: {
    [path: string]: ProjectFileWithScore[];
  } = {};

  projectFiles.forEach((projectFile) => {
    resultsByPath[projectFile.path] = resultsByPath[projectFile.path] || [];
    resultsByPath[projectFile.path].push(projectFile);
  });

  return Object.entries(resultsByPath).reduce((acc, [_, results]) => {
    let minIndexStart = Infinity;
    let maxIndexEnd = -Infinity;
    let minChunk = Infinity;
    let maxChunk = -Infinity;

    results.forEach((result) => {
      minIndexStart = Math.min(minIndexStart, result.indexStart);
      maxIndexEnd = Math.max(maxIndexEnd, result.indexEnd);
      minChunk = Math.min(minChunk, result.chunk);
      maxChunk = Math.max(maxChunk, result.chunk);
    });

    // TODO: merge if chunks are adjacent or fetch missing chunks if within distance?
    //       could consider an "expandChunks" function to fetch missing chunks

    const sorted = results.sort((a, b) => {
      return a.chunk > b.chunk ? 1 : -1;
    });

    const merge = (a: ProjectFileMerge, b: ProjectFileWithScore) => {
      a.name = b.name;
      a.path = b.path;
      a.content += b.content;
      a.chunk.push(b.chunk);
      a.chunks = b.chunks;
      a.indexStart = Math.min(a.indexStart, b.indexStart);
      a.indexEnd = Math.max(a.indexEnd, b.indexEnd);
      if (typeof b.score !== "undefined") a.score.push(b.score);
    };

    const merged = sorted.reduce((mergeAcc, result, i) => {
      if (i === 0) {
        mergeAcc.push(makeMergeable(result));
        return mergeAcc;
      }

      const prev = mergeAcc[i - 1];
      const doesPathMatch = prev.path === result.path;
      const isNextChunk =
        prev.chunk[prev.chunk.length - 1] + 1 === result.chunk;

      if (doesPathMatch && isNextChunk) {
        merge(prev, result);
      } else {
        mergeAcc.push(result);
      }

      return mergeAcc;
    }, []);

    acc.push(...merged);

    return acc;
  }, []);
};

export const searchProjectFiles = async ({
  query,
  limit = 5,
  expand = 0,
}: {
  query: string;
  limit?: number;
  expand?: number;
}): Promise<ProjectFileWithScore[]> => {
  const db = await getDB();
  const startTime = Date.now();
  const results: ProjectFileWithScore[] = [];

  const queryChunks = splitWords({
    str: query,
    maxLength: embeddings.sequenceLength,
  });

  const chunksToFetch: { [path: string]: Set<number> } = {};

  for (const queryChunk of queryChunks) {
    const chunkEmbedding = await embeddings.encode(queryChunk);
    const projectFiles = await ProjectFile.findAll({
      where: { project: settings.projectName },
      order: [db.literal(`embedding <-> '[${chunkEmbedding}]'`)],
      limit,
    });

    projectFiles.forEach((projectFile) => {
      const score = dotProduct(chunkEmbedding, projectFile.embedding);
      const json = projectFile.toJSON();
      delete json.embedding;
      results.push({ ...json, score });

      for (let i = 1; i <= expand; i++) {
        chunksToFetch[json.path] = chunksToFetch[json.path] || new Set();
        chunksToFetch[json.path].add(json.chunk + i);
        chunksToFetch[json.path].add(json.chunk - i);
      }
    });

    for (const [path, chunks] of Object.entries(chunksToFetch)) {
      for (const chunk of chunks) {
        // don't fetch chunks that are already in the results
        if (results.some((r) => r.path === path && r.chunk === chunk)) {
          continue;
        }

        const projectFile = await ProjectFile.findOne({
          where: { project: settings.projectName, path, chunk },
        });

        if (!projectFile) continue;

        const score = dotProduct(chunkEmbedding, projectFile.embedding);
        const json = projectFile.toJSON();
        delete json.embedding;
        results.push({ ...json, score });
      }
    }
  }

  const endTime = Date.now();
  const timeTotalMS = endTime - startTime;
  const timeTotalS = Math.round(timeTotalMS);

  log("= SEARCH =====================");
  log("  project  :", settings.projectName);
  log("  query    :", query);
  log("  results  :", results.length.toLocaleString());
  log("  time (ms):", timeTotalS.toLocaleString());

  return results;
};
