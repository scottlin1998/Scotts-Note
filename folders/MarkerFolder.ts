// 系统
import fs from "fs";
import { join } from "path";
// 插件
import _ from "lodash";
import chokidar from "chokidar";
import hasha from "hasha";
// 我的
import { MARKER_FOLDER } from "../commons/constants";
import Retry from "../commons/Retry";
import SourceFolder from "./SourceFolder";
import FileData from "../leitner_system/FileData";
import FileSystem from "../commons/FileSystem";
import FileNode from "../leitner_system/FileNode";
import config from "../commons/config";
import ArchiveFolder from "./ArchiveFolder";
import { extname } from "path";
class MarkerFolder {
    get path() {
        return MARKER_FOLDER.PATH;
    }
    get easyPath() {
        return join(MARKER_FOLDER.PATH, MARKER_FOLDER.EASY);
    }
    get hardPath() {
        return join(MARKER_FOLDER.PATH, MARKER_FOLDER.HARD);
    }
    get masteredPath() {
        return join(MARKER_FOLDER.PATH, MARKER_FOLDER.MASTERED);
    }
    readonly watcher: chokidar.FSWatcher;
    readonly files: { fMd5: string, path: string, relinked: boolean | undefined, ino: number }[] = [];
    constructor() {
        console.time(MARKER_FOLDER.READY);
        FileSystem.keepDirs(
            this.path,
            this.easyPath,
            this.hardPath,
            this.masteredPath
        );
        this.watcher = chokidar
            .watch([this.easyPath, this.hardPath, this.masteredPath], {
                // ignored: config.fileFilteringRegexp, // ignore dotfiles
                persistent: true,
                // depth: 0,
                // usePolling:true
            })
            .on('add', path => Retry().setWait(1000).invoke(() => {
                if (config.fileFilteringRegexp.has(extname(path))) return;
                this.addFile(path);
            }).catch((err) => console.log(err)))
            .on('change', path => Retry().setWait(100).invoke(() => {
                if (config.fileFilteringRegexp.has(extname(path))) return;
                this.delFile(path);
                this.addFile(path);
            }).catch((err) => console.log(err)))
            .on('unlink', path => Retry().setWait(100).invoke(() => {
                if (config.fileFilteringRegexp.has(extname(path))) return;
                this.delFile(path);
            }).catch((err) => console.log(err)))
            .on('ready', () => {
                console.timeEnd(MARKER_FOLDER.READY);
            });
    }
    addToRelink(fileNode: FileNode) {
        const file = _.find(this.files, {
            ino: fileNode.ino,
            relinked: false
        });
        if (file) {
            file.relinked = true;
            FileSystem.linkFile(file.path, fileNode.fullPath);
            return true;
        } else return false;


    }
    addFile(path: string) {
        fs.accessSync(path, fs.constants.R_OK | fs.constants.W_OK);
        const fMd5 = hasha.fromFileSync(path, { algorithm: 'md5' });
        const ino = fs.statSync(path).ino;
        if (SourceFolder.fileDatas.has(fMd5)) {
            this.delFile(path);
            this.files.push({
                fMd5,
                ino,
                path,
                relinked: false
            });
            setTimeout(() => {
                const file = _.find(this.files, { path });
                if (file) {
                    const matched = file.path.match(/^([^\\/]+[\\/][^\\/]+).*$/);
                    if (matched) {
                        switch (matched[1]) {
                            case this.easyPath:
                                this.mark(fMd5, 1);
                                break;
                            case this.hardPath:
                                this.mark(fMd5, -(config.reviewIntervalSet.length - 1));
                                break;
                            case this.masteredPath:
                                this.mark(fMd5, config.reviewIntervalSet.length - 1);
                                break;
                        }
                        fs.unlinkSync(file.path);
                    }
                }
            }, 1000 * config.markRegretDuration);
        } else if (ArchiveFolder.fileDatas.has(fMd5)) {
            fs.unlinkSync(path);
        }
    }
    delFile(path: string) {
        _.remove(this.files, { path });
    }
    mark(fMd5: string, factor: number) {
        const fileData = SourceFolder.fileDatas.get(fMd5) as FileData;
        // 设置当前的level
        fileData.level += factor;
        fileData.update();
        if (fileData.archivable) {
            fileData.archiveAll();
            SourceFolder.fileDatas.delete(fMd5);
        } else if (!fileData.reviewable) {
            fileData.hideAll();
        } else {
            fileData.revealAll();
        }
    }
}
export default new MarkerFolder();