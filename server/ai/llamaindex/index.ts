import fs from "fs";

import {
  SimpleDirectoryReader,
  storageContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";

import { absProjectPath, relProjectPath } from "../../settings.js";
import { LLAMAINDEX_STORAGE_PATH } from "../../paths.js";

//
// FILES
//
const essay = fs.readFileSync(absProjectPath("README.md"), "utf-8");

//
// DOCUMENTS
//
const directoryReader = new SimpleDirectoryReader();
const documents = await directoryReader.loadData({
  directoryPath: absProjectPath("docs"),
});

console.log();
console.log("DOCUMENTS");
console.log(
  documents.map((d) => {
    return relProjectPath(d.id_);
  }),
);

//
// INDEX
//

// TODO: load index if it exists, otherwise, create

// Split text and create embeddings. Store them in a VectorStoreIndex
// persist the vector store automatically with the storage context
const storageContext = await storageContextFromDefaults({
  persistDir: LLAMAINDEX_STORAGE_PATH,
});
const index = await VectorStoreIndex.fromDocuments(documents, {
  storageContext,
});

//
// QUERY ENGINE
//
// const queryEngine = index.asQueryEngine();
// const queryEngine = SubQuestionQueryEngine.fromDefaults({
//   queryEngineTools: [
//     {
//       queryEngine: index.asQueryEngine(),
//       metadata: {
//         name: "pg_essay",
//         description: "Paul Graham essay on What I Worked On",
//       },
//     },
//   ],
// });

//
// QUERY & OUTPUT
//
// const questions = [
//   // "How was Paul Grahams life different before and after YC?",
//   "What did the author do in college?",
// ];

// const response = await queryEngine.query(questions[0]);

// console.log(response.toString());
