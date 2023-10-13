import { SimpleDirectoryReader } from "llamaindex";

// example.ts
import fs from "fs/promises";
import path from "path";

import { Document, VectorStoreIndex, SubQuestionQueryEngine } from "llamaindex";

import { PROJECT_ROOT } from "../../config.js";

//
// FILES
//
const essay = await fs.readFile(
  path.resolve(PROJECT_ROOT, "node_modules/llamaindex/examples/abramov.txt"),
  "utf-8",
);

//
// DOCUMENTS
//
const document = new Document({ text: essay });
const documents = [document];
console.log();
console.log("DOCUMENTS");
console.log(documents);
// const documents = new SimpleDirectoryReader().loadData("./data");

//
// INDEX
//
// Split text and create embeddings. Store them in a VectorStoreIndex
const index = await VectorStoreIndex.fromDocuments(documents);

//
// QUERY ENGINE
//
const queryEngine = index.asQueryEngine();
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
const questions = [
  // "How was Paul Grahams life different before and after YC?",
  "What did the author do in college?",
];

const response = await queryEngine.query(questions[0]);

console.log(response.toString());
