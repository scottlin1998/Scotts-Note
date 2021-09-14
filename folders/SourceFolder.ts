import chokidar from "chokidar";
// import { ToadScheduler, SimpleIntervalJob, Task } from "toad-scheduler";
import { SOURCE_FOLDER } from "../commons/constants";
import Retry from "../commons/Retry";
import FileData from "../leitner_system/FileData";
import FileNode from "../leitner_system/FileNode";
import FileSystem from "../commons/FileSystem";
import MarkerFolder from "./MarkerFolder";
import config from "../commons/config";
import fs from "fs";
import { extname } from "path";

class SourceFolder {
    readonly path = SOURCE_FOLDER.PATH;
    readonly watcher: chokidar.FSWatcher;
    readonly md5ToPaths: Map<string, Set<string>> = new Map();
    readonly fileDatas: Map<string, FileData> = new Map();
    readonly fileNodes: Map<string, FileNode> = new Map();
    constructor() {
        console.time(SOURCE_FOLDER.READY);
        FileSystem.keepDirs(this.path);
        this.watcher = chokidar
            .watch(this.path, {
                // ignored: config.fileFilteringRegexp, // ignore dotfiles
                persistent: true,
                // alwaysStat: true,
                // 精度有问题
                // usePolling: true
            })
            .on('add', path => Retry().setWait(100).invoke(() => {
                if (config.fileFilteringRegexp.has(extname(path))) return;
                this.addFile(path);
            }).catch((err) => console.log(err)))
            .on('change', path => Retry().setWait(100).invoke(() => {
                if (config.fileFilteringRegexp.has(extname(path))) return;
                this.addFile(path);
            }).catch((err) => console.log(err)))
            .on('unlink', path => Retry().setWait(100).invoke(() => {
                if (config.fileFilteringRegexp.has(extname(path))) return;
                MarkerFolder.addToRelink(this.fileNodes.get(path) as FileNode);
                // if (!isRelink) 
                this.delFile(path);
            }).catch((err) => console.log(err)))
            .on('ready', () => {
                console.timeEnd(SOURCE_FOLDER.READY);
            });
        // 每一个小时查询一次
        setInterval(() => {
            this.fileDatas.forEach((fileData) => {
                if (fileData.reviewable) {
                    fileData.revealAll();
                }
            });
        }, 60000 * config.checkReviewableInterval);
        // const scheduler = new ToadScheduler()

        // const task = new Task('check reviewable files', () => { 
        //     this.fileDatas.forEach((fileData) => {
        //         if (fileData.reviewable) {
        //             fileData.revealAll();
        //         }
        //     });
        // })
        // const job = new SimpleIntervalJob({ minutes: config.checkReviewableInterval, }, task)

        // scheduler.addSimpleIntervalJob(job);
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

        if (fileData.archivable) {
            fileNode.archive();
            this.fileDatas.delete(fileData.fMd5);
        } else if (!fileData.reviewable) {
            fileNode.hide();
        } else {
            fileNode.reveal();
        }
    }
}
export default new SourceFolder();