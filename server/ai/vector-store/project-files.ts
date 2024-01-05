import fs from "fs";
import path from "path";
import debug from "debug";
import { globby } from "globby";

import { absProjectPath, settings } from "../../settings.js";
import { getGlobalGitignoreGlobs } from "../../tools/project/utils.js";
import { embeddings } from "../embeddings.js";
import { splitWords } from "../text-splitters.js";
import type { ProjectFileAttributes } from "../../models/project-file.js";
import { ProjectFile } from "../../models/project-file.js";
import { getSocketIO } from "../../socket.io-server.js";
import { getDB } from "../../database/index.js";

const log = debug("gpp:server:ai:vector-store");

const dotProduct = (a: number[], b: number[]): number => {
  return a.reduce((acc, _, i) => acc + a[i] * b[i], 0);
};

export type ProjectFileWithScore = Omit<ProjectFileAttributes, "embedding"> & {
  score: number;
};

export type ProjectFileExpanded = Omit<
  ProjectFileAttributes,
  "id" | "embedding" | "chunk"
> & {
  chunkStart: number;
  chunkEnd: number;
};

export type ProjectFileMerge = Omit<
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
 */
export const projectFileToSearchResultString = (
  projectFile:
    | ProjectFile
    | ProjectFileWithScore
    | ProjectFileMerge
    | ProjectFileExpanded,
): string => {
  const { path, content } = projectFile;
  return `// File: ${path}\n${content}`;
};

/**
 * Expand a ProjectFile to include surrounding content.
 */
export const expandProjectFileResult = async (
  projectFile: ProjectFile | ProjectFileWithScore | ProjectFileMerge,
  expandToLength = 1024,
): Promise<ProjectFileExpanded> => {
  const chunkArr = [].concat(projectFile.chunk);
  const file: ProjectFileExpanded = {
    ...projectFile,
    chunkStart: chunkArr.shift(),
    chunkEnd: chunkArr.pop(),
  };

  const lengthNeeded = () => expandToLength - file.content.length;
  const hasChunksBefore = () => file.chunkStart > 1;
  const hasChunksAfter = () => file.chunkEnd < projectFile.chunks;
  const canExpand = () => hasChunksBefore() || hasChunksAfter();

  if (lengthNeeded() <= 0) return file;
  if (!canExpand()) return file;

  while (lengthNeeded() > 0 && canExpand()) {
    log(`expandProjectFileResult lengthNeeded: ${lengthNeeded()}`);

    if (hasChunksBefore()) {
      file.chunkStart--;
      const head = await ProjectFile.findOne({
        where: { path: projectFile.path, chunk: file.chunkStart },
        attributes: ["content"],
      });
      const slice = head.content.slice(-lengthNeeded());
      file.content = slice + file.content;
      file.indexStart -= slice.length;
    }

    if (hasChunksAfter() && lengthNeeded()) {
      file.chunkEnd++;
      const tail = await ProjectFile.findOne({
        where: { path: projectFile.path, chunk: file.chunkEnd },
        attributes: ["content"],
      });
      const slice = tail.content.slice(0, lengthNeeded());
      file.content += slice;
      file.indexEnd += slice.length;
    }
  }

  return file;
};

/**
 * Merge results from multiple chunks of the same file.
 */
export const mergeProjectFileResults = (
  projectFiles: ProjectFileWithScore[],
): ProjectFileMerge[] => {
  const makeMergeable = (result: ProjectFileWithScore): ProjectFileMerge => ({
    project: result.project,
    name: result.name,
    path: result.path,
    content: result.content,
    chunk: [].concat(result.chunk),
    chunks: result.chunks,
    indexStart: result.indexStart,
    indexEnd: result.indexEnd,
    score: [].concat(result.score),
  });

  if (projectFiles.length === 0) return [];

  if (projectFiles.length === 1) return [makeMergeable(projectFiles[0])];

  const assign = (a: ProjectFileMerge, b: ProjectFileWithScore) => {
    a.name = b.name;
    a.path = b.path;
    a.content += b.content;
    a.chunk.push(b.chunk);
    a.chunks = b.chunks;
    a.indexStart = Math.min(a.indexStart, b.indexStart);
    a.indexEnd = Math.max(a.indexEnd, b.indexEnd);
    if (typeof b.score !== "undefined") a.score.push(b.score);
  };

  // group by path
  const resultsByPath = projectFiles.reduce<{
    [path: string]: ProjectFileWithScore[];
  }>((acc, next) => {
    const path = next.path;
    acc[path] = acc[path] || [];
    acc[path].push(next);

    return acc;
  }, {});

  // sort each group by chunk
  for (const results of Object.values(resultsByPath)) {
    results.sort((a, b) => a.chunk - b.chunk);
  }

  // merge each group if chunks are consecutive
  const mergedResults: ProjectFileMerge[] = [];

  for (const results of Object.values(resultsByPath)) {
    const mergedResult = makeMergeable(results[0]);
    mergedResults.push(mergedResult);

    for (const result of results.slice(1)) {
      if (
        result.chunk ===
        mergedResult.chunk[mergedResult.chunk.length - 1] + 1
      ) {
        assign(mergedResult, result);
      } else {
        mergedResults.push(makeMergeable(result));
      }
    }
  }

  return mergedResults;
};

/**
 * Search the project files for the given query.
 */
export const searchProjectFiles = async ({
  query,
  limit = 5,
}: {
  query: string;
  limit?: number;
}): Promise<ProjectFileWithScore[]> => {
  const db = await getDB();
  const startTime = Date.now();
  const results: ProjectFileWithScore[] = [];

  const queryChunks = splitWords({
    str: query,
    maxLength: embeddings.sequenceLength,
  });

  for (const queryChunk of queryChunks) {
    const chunkEmbedding = await embeddings.encode(queryChunk);
    const projectFiles = await ProjectFile.findAll({
      where: { project: settings.projectName },
      // https://github.com/pgvector/pgvector?tab=readme-ov-file#vector-operators
      // OPERATOR                           BEST FOR
      // +    element-wise addition         Combining features or bias addition in neural networks.
      // -    element-wise subtraction      Finding feature differences or in differential equations.
      // *    element-wise multiplication   Feature scaling, applying weights in neural networks.
      // <->  Euclidean distance            Measuring actual distance, used in k-means and nearest neighbor searches.
      // <#>  negative inner product        Specialized optimization or similarity measurements.
      // <=>  cosine distance               Matching queries with documents, text similarity in NLP,
      //                                      scale-invariant (considers orientation, not magnitude).
      order: [db.literal(`embedding <=> '[${chunkEmbedding}]'`)],
      limit,
    });

    for (const projectFile of projectFiles) {
      const score = dotProduct(chunkEmbedding, projectFile.embedding);
      const json = projectFile.toJSON();
      delete json.embedding;

      const projectFileWithScore = { ...json, score };

      results.push(projectFileWithScore);
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
