import { COMMONS, SETTINGS } from "./constants";
import fs from "fs";
import IConfigAdapter from "./IConfigAdapter";
import moment from "moment";
type ConfigOptions = {
    [x: string]: string | number | boolean | number[] | string[];
}
class Configurator {
    path: string = SETTINGS.FILE_NAME;
    // 默认的设置
    private options = {
        [SETTINGS.AUTO_ARCHIVE_MODE]: true,
        [SETTINGS.MARKER_STRICT_MODE]: true,
        // [SETTINGS.DATA_INDEX_MODE]: true,
        [SETTINGS.DELETE_INVALID_DATA]: true,
        [SETTINGS.MARK_REGRET_DURATION]: 60,
        [SETTINGS.CHECK_REVIEWABLE_INTERVAL]: 10,
        [SETTINGS.AUTO_BACKUP_DATA]: true,
        [SETTINGS.KEEP_RECENT_BACKUP]: 7,
        [SETTINGS.REVIEW_INTERVAL_SET]: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144],
        [SETTINGS.FILE_EXTENSION_BLACKLIST]: [".cfg", ".ini"],
    };
    constructor(adapter: IConfigAdapter, extName?: string) {
        if (extName) this.path = SETTINGS.FILE_NAME + extName;
        try {
            if (fs.existsSync(this.path)) {
                const options = adapter.parse(fs.readFileSync(this.path, "utf-8"));
                this.options = Object.assign(this.options, options);
            }
            fs.writeFileSync(this.path, adapter.stringify(this.options));
        } catch (error) {
            console.error(moment().format(COMMONS.DATE_FORMAT), error.name, error.message);
        }
    }
    get markerStrictMode() {
        return this.options[SETTINGS.MARKER_STRICT_MODE] as boolean;
    }
    get deleteInvalidData() {
        return this.options[SETTINGS.DELETE_INVALID_DATA] as boolean;
    }
    get autoArchiveMode() {
        return this.options[SETTINGS.AUTO_ARCHIVE_MODE] as boolean;
    }
    // get dataIndexMode() {
    //     return this.options[SETTINGS.DATA_INDEX_MODE] as boolean;
    // }
    get reviewIntervalSet() {
        return this.options[SETTINGS.REVIEW_INTERVAL_SET] as number[];
    }
    get markRegretDuration() {
        return this.options[SETTINGS.MARK_REGRET_DURATION] as number;
    }
    get checkReviewableInterval() {
        return this.options[SETTINGS.CHECK_REVIEWABLE_INTERVAL] as number;
    }
    get autoDataBackup() {
        return this.options[SETTINGS.AUTO_BACKUP_DATA] as boolean;
    }
    get keepRecentBackup() {
        return this.options[SETTINGS.KEEP_RECENT_BACKUP] as number;
    }
    get fileFilteringRegexp() {
        return new Set(this.options[SETTINGS.FILE_EXTENSION_BLACKLIST] as string[]);
    }
}
export { ConfigOptions };
export default Configurator;