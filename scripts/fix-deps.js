import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import {fileURLToPath} from "url";

export const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pkgPath = path.resolve(__dirname, "..", "package.json");
const pkgBackupPath = `${pkgPath}.bak`;

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

// make a backup of package.json
fs.copyFileSync(pkgPath, pkgBackupPath);

const devDeps = Object.keys(pkg.devDependencies);
const deps = Object.keys(pkg.dependencies);

try {

const commands = [
  `yarn remove ${devDeps.join(" ")} ${deps.join(" ")}`,
  `yarn add ${devDeps.join(" ")} --dev`,
  `yarn add ${deps.join(" ")}`
];

commands.forEach((command) => {
  console.log('==========================');
  console.log(command);
  console.log('==========================');
  execSync(command, { stdio: "inherit" });
});

// remove backup
fs.unlinkSync(pkgBackupPath);
} catch (error) {
  console.error("Something failed. Restoring package.json from backup.")
  console.error(error);

  // restore backup
  fs.copyFileSync(pkgBackupPath, pkgPath);

  // remove backup
  fs.unlinkSync(pkgBackupPath);

  process.exit(1);
}
