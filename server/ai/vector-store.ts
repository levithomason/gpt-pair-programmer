import fs from "fs";
import path from "path";
import debug from "debug";
import { globby } from "globby";

import { absProjectPath, settings } from "../settings.js";
import { getGlobalGitignoreGlobs } from "../tools/project/utils.js";
import { embeddings } from "./embeddings.js";
import { splitWords } from "./text-splitters.js";
import { ProjectFile } from "../models/project-file.js";
import { getSocketIO } from "../socket.io-server.js";
import { getDB } from "../database/index.js";

const log = debug("gpp:server:ai:vector-store");

/**
 * Streams every file in the project's root which should be indexed.
 */
export const filesToIndex = async (): Promise<string[]> => {
  const projectRoot = absProjectPath();
  log(`streamFilesToIndex: in "${projectRoot}"`);

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

export const indexProject = async () => {
  const io = getSocketIO();
  const startTime = Date.now();
  const files = await filesToIndex();
  const maxLength = embeddings.sequenceLength;

  let totalChunks = 0;
  let filesIndexed = 0;
  for await (const file of files) {
    filesIndexed++;
    // if (filesIndexed > 10) break;

    const content = fs.readFileSync(absProjectPath(file), "utf8");
    const chunks = splitWords(content, maxLength);

    let chunkNumber = 0;
    for (const chunk of chunks) {
      chunkNumber++;
      totalChunks++;
      const embedding = await embeddings.encode(chunk);

      const indexStart = (chunkNumber - 1) * maxLength;
      const indexEnd = indexStart + chunk.length;

      await ProjectFile.upsert({
        id: `${settings.projectName}:${file}:${chunkNumber}`,
        project: settings.projectName,
        name: path.basename(file),
        path: file,
        content: chunk,
        chunk: chunkNumber,
        chunks: chunks.length,
        indexStart: indexStart,
        indexEnd: indexEnd,
        embedding: embedding,
      });

      io.emit("indexingProgress", {
        filename: file,
        file: filesIndexed,
        files: files.length,
        chunk: chunkNumber,
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
