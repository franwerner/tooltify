import path from "path";
import { fileURLToPath } from "url";
import { startServer } from "./index";

const dir = path.dirname(fileURLToPath(import.meta.url));

// Apunta el cwd al fixture dedicado para que loadConfig() resuelva tooltify.config.json.
process.chdir(path.resolve(dir, "./dev-fixtures"));

startServer();
