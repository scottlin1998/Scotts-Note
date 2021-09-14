import config from "./commons/config";
import database from "./databases/database";
import { SCRIPT_INFO } from "./commons/constants";
import ArchiveFolder from "./folders/ArchiveFolder";
import SourceFolder from "./folders/SourceFolder";
import MarkerFolder from "./folders/MarkerFolder";
import BackupFolder from "./folders/BackupFolder";

console.log(SCRIPT_INFO);
if (config.deleteInvalidData) {
    database.removeInvalidDatas();
    database.removeInvalidNodes();
}
ArchiveFolder;
SourceFolder;
MarkerFolder;
if (config.autoDataBackup) BackupFolder;