import moment from "moment";
import { DATABASE } from "../commons/constants";
import { join } from "path";
import FileSystem, { Filter } from "../commons/FileSystem";
import trash from "trash";
import schedule from "node-schedule";
import database from "../databases/database";
import config from "../commons/config";
class BackupFolder {
    path = DATABASE.BACKUP_PATH;
    n_day: number = config.keepRecentBackup;
    constructor() {
        FileSystem.keepDirs(this.path);
        schedule.scheduleJob({ hour: 0, minute: 0 }, () => {
            database.backup();
            this.removeInvalidFiles();
        });
    }
    get whitelist() {
        const paths: Set<string> = new Set();
        paths.add(`${DATABASE.FILE_NAME}-${moment().format("YYYY-MM-DD")}.db`);
        for (let i = 1; i <= this.n_day; i++) {
            paths.add(join(DATABASE.BACKUP_PATH, `${DATABASE.FILE_NAME}-${moment().subtract(i, "day").format("YYYY-MM-DD")}.db`));
        }
        return paths;
    }
    removeInvalidFiles() {
        const _this = this;
        FileSystem.recurDir({
            path: this.path,
            filter: Filter.fileOnly,
            depth: 0,
            callback(file) {
                if (!_this.whitelist.has(file.path)) {
                    (async () => {
                        await trash(file.path);
                    })();
                }
            }
        });
    }
}
export default new BackupFolder();