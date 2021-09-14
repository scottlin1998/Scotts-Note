// 系统
import fs from "fs";
// 插件
import chokidar from "chokidar";
// 我的
import { ARCHIVE_FOLDER } from "../commons/constants";
import FileNode from "../leitner_system/FileNode";
import FileSystem from "../commons/FileSystem";
import FileData from "../leitner_system/FileData";
import SourceFolder from "./SourceFolder";
import Retry from "../commons/Retry";
import config from "../commons/config";
import { extname } from "path";
class ArchiveFolder {
    get path() {
        return ARCHIVE_FOLDER.PATH;
    }
    watcher: chokidar.FSWatcher;
    readonly fileDatas: Map<string, FileData> = new Map();
    readonly fileNodes: Map<string, FileNode> = new Map();
    constructor() {
        console.time(ARCHIVE_FOLDER.READY);
        FileSystem.keepDirs(this.path);
        this.watcher = chokidar
            .watch(this.path, {
                // ignored: config.fileFilteringRegexp, // ignore dotfiles
                persistent: true,
                // usePolling:true
            })
            .on('add', path => Retry().setWait(100).invoke(() => {
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
                console.timeEnd(ARCHIVE_FOLDER.READY);
            });
    }
    private delFile(path: string) {
        if (this.fileNodes.has(path)) {
            const fileNode = this.fileNodes.get(path) as FileNode;
            this.fileNodes.delete(path);
            if (this.fileDatas.has(fileNode.fMd5)) {
                const fileData = this.fileDatas.get(fileNode.fMd5) as FileData;
                fileData.fileNodes.delete(path);
                if (fileData.fileNodes.size === 0) {
                    this.fileDatas.delete(fileData.fMd5);
                }
            }
            fileNode.delete();
        }
    }
    private addFile(path: string) {
        fs.accessSync(path, fs.constants.R_OK | fs.constants.W_OK);
        this.delFile(path);
        const fileNode = new FileNode(path);
        SourceFolder.fileDatas.get(fileNode.fMd5)?.archiveAll();
        let fileData;
        if (this.fileDatas.has(fileNode.fMd5)) {
            fileData = this.fileDatas.get(fileNode.fMd5) as FileData;
        } else {
            fileData = new FileData(fileNode);
        }

        fileData.update();
        fileNode.update();
        this.fileDatas.set(fileNode.fMd5, fileData);
        this.fileNodes.set(path, fileNode);
        fileData.fileNodes.set(path, fileNode);
        fileNode.reveal();
    }
}
export default new ArchiveFolder();