import hasha from "hasha";
import { DATABASE, SOURCE_FOLDER } from "../commons/constants";
import database from "./database";
import fs from "fs";
import FileNode from "../leitner_system/FileNode";
import FileData from "../leitner_system/FileData";
// 学习材料的文件信息
type Node = {
    // 父级文件夹
    dir: string,
    // 文件名
    name: string,
    // 文件拓展名
    ext: string,
    // 基础目录
    root: string,
    // 基础文件信息Stat的md5值（path, ino, size, birthtimeMs, mtimeMs）
    sMd5: string,
    // 文件内容hash
    fMd5: string
};

// 学习材料的学习数据
type Data = {
    // 文件内容hash
    fMd5: string,
    // 艾宾浩斯等级
    level: number,
    // 是否已经存档
    archived: boolean,
    // 开始日期
    createdAt: string,
    // 最后一次日期
    updatedAt: string
};

// 学习材料的操作数据库类
/**
 * 文件数据库操作类
 * @author 林承耀同学
 * @version 2.2.4
 */
abstract class AbstractDatabase {
    fileName: string = DATABASE.FILE_NAME;
    abstract extName: string;
    get path() {
        return this.fileName + this.extName;
    };
    backupPath: string = DATABASE.BACKUP_PATH;
    protected abstract db: any;
    // 获取文件索引节点
    abstract getNode(sMd5: string): FileNode | undefined;
    abstract getNodes(params?: { fMd5?: string, dir?: string }): FileNode[] | undefined;
    // 添加文件索引节点
    abstract addNode(node: FileNode): void;
    // 移除文件索引节点
    abstract removeNode(sMd5: string): void;
    abstract removeNodes(params: { fMd5?: string, dir?: string }): void;
    // 获取文件的学习数据
    abstract getData(fMd5: string): FileData | undefined;
    abstract getDatas(): FileData[] | undefined;
    // 更新文件的学习数据
    abstract updateData(fileData:FileData): void;
    // 移除文件的学习数据
    abstract removeData(fMd5: string): void;
    // 移除文件无效的索引节点和学习数据
    abstract removeInvalidNodes(): void;
    abstract removeInvalidDatas(): void;
    // 文件数据备份
    abstract backup(): void;
}
export {
    Node,
    Data
}
export default AbstractDatabase;