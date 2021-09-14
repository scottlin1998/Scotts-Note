import BetterSqlite3 from "better-sqlite3";
import fs from "fs";
import { COMMONS, DATABASE } from "../commons/constants";
import moment from "moment";
import AbstractDatabase from "./AbstractDatabase";
import { sep, join } from "path";
import config from "../commons/config";
import FileNode from "../leitner_system/FileNode";
import FileData from "../leitner_system/FileData";
import hasha from "hasha";
class SqliteDataBase extends AbstractDatabase {
    extName: string = ".db";
    // protected db = BetterSqlite3(this.path, { verbose: console.log });
    protected db = BetterSqlite3(this.path);
    constructor() {
        // synchronous Pragma 获取或设置当前磁盘的同步模式，该模式控制积极的 SQLite 如何将数据写入物理存储。
        super();
        this.db.pragma('auto_vacuum = 1');
        this.db.pragma("synchronous = 1");
        this.db.pragma("foreign_keys = 1");
        // journal_mode Pragma 获取或设置控制日志文件如何存储和处理的日志模式。
        this.db.pragma('journal_mode = WAL');
        // this.db.prepare("VACUUM").run();
        // 初始化创建表
        this.db.prepare(`
        CREATE TABLE IF NOT EXISTS FileDatas (
            fMd5 TEXT NOT NULL UNIQUE PRIMARY KEY,
            level INTEGER NOT NULL DEFAULT -1,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL);
            /**
            @table: FileDatas
            @description: 文件数据
            */
         `).run();
        this.db.prepare(`
         CREATE TABLE IF NOT EXISTS FileNodes (
            sMd5 TEXT NOT NULL UNIQUE PRIMARY KEY,
            fMd5 TEXT NOT NULL,
            root TEXT NOT NULL,
            dir TEXT NOT NULL,
            name TEXT NOT NULL,
            ext TEXT NOT NULL,
            FOREIGN KEY(fMd5) REFERENCES FileDatas(fMd5) ON DELETE CASCADE ON UPDATE CASCADE);
            /**
            @table: FileNodes
            @description: 文件索引节点
            */
         `).run();
        this.db.prepare(`
        CREATE VIEW IF NOT EXISTS [Files And Datas] AS
            SELECT n.name || n.ext AS 文件名,
                n.ext || '' AS 类型,
                d.level AS 周期,
                n.root || '/' || CASE n.dir WHEN '' THEN '' ELSE n.dir || '/' END || n.name || n.ext AS 路径,
                d.createdAt AS 添加时间,
                d.updatedAt AS 更新时间
            FROM FileDatas d,
                FileNodes n
            WHERE d.fMd5 = n.fMd5;    
         `).run();
        // if (config.dataIndexMode) this.createIndexes();
        // else this.dropIndexes();
    }

    getNode(sMd5: string): FileNode | undefined {
        try {
            return this.db.prepare("SELECT * FROM `FileNodes` WHERE `sMd5`=? LIMIT 1;").get(sMd5);
        } catch (error) {
            console.error(moment().format(COMMONS.DATE_FORMAT), error.name, error.message);
        }

    }
    getNodes(params: { fMd5?: string | undefined; dir?: string | undefined; } = {}): FileNode[] | undefined {
        try {
            let { fMd5, dir } = params;
            if (fMd5) {
                return this.db.prepare("SELECT * FROM `FileNodes` WHERE `fMd5`=?;").all(fMd5);
            } else if (dir) {
                dir = (dir.endsWith(sep) ? dir : dir + sep) + "%";
                return this.db.prepare("SELECT * FROM `FileNodes` WHERE `dir` LIKE ?;").all(dir);
            } else {
                return this.db.prepare("SELECT * FROM `FileNodes`;").all();
            }
        } catch (error) {
            console.error(moment().format(COMMONS.DATE_FORMAT), error.name, error.message);
        }
    }
    addNode(fileNode: FileNode) {
        try {
            this.db.prepare("INSERT INTO `FileNodes` (`sMd5`, `fMd5`, `root`, `dir`, `name`, `ext`) VALUES (?, ?, ?, ?, ?, ?);").run(fileNode.sMd5, fileNode.fMd5, fileNode.root, fileNode.dir, fileNode.name, fileNode.ext);
        } catch (error) {
            console.error(moment().format(COMMONS.DATE_FORMAT), error.name, error.message);
        }
        return this;
    }
    updateNode(fileNode: FileNode) {
        const node = this.getNode(fileNode.sMd5);
        if (node) {
            this.db.prepare("UPDATE `FileNodes` SET `fMd5`=?, `root`=?, `dir`=?, `name`=?, `ext`=?  WHERE `sMd5`=?;").run(fileNode.fMd5, fileNode.root, fileNode.dir, fileNode.name, fileNode.ext, fileNode.sMd5);
        } else {
            try {
                this.db.prepare("INSERT INTO `FileNodes` (`sMd5`, `fMd5`, `root`, `dir`, `name`, `ext`) VALUES (?, ?, ?, ?, ?, ?);").run(fileNode.sMd5, fileNode.fMd5, fileNode.root, fileNode.dir, fileNode.name, fileNode.ext);
            } catch (error) {
                console.error(moment().format(COMMONS.DATE_FORMAT), error.name, error.message);
            }
        }
        return this;
    }
    removeNode(sMd5: string) {
        try {
            this.db.prepare("DELETE FROM `FileNodes` WHERE `sMd5`=?;").run(sMd5);
        } catch (error) {
            console.error(moment().format(COMMONS.DATE_FORMAT), error.name, error.message);
        }
        return this;
    }
    removeNodes(params: { fMd5?: string | undefined; dir?: string | undefined; } = {}) {
        try {
            let { fMd5, dir } = params;
            if (fMd5) {
                this.db.prepare("DELETE FROM `FileNodes` WHERE `fMd5`=?;").run(fMd5);
            } else if (dir) {
                dir = (dir.endsWith(sep) ? dir : dir + sep) + "%";
                this.db.prepare("DELETE FROM `FileNodes` WHERE `dir` LIKE ?;").run(dir);
            } else {
                this.db.prepare("DELETE FROM `FileNodes`;").run();
            }
        } catch (error) {
            console.error(moment().format(COMMONS.DATE_FORMAT), error.name, error.message);
        }
        return this;
    }
    getData(fMd5: string): FileData | undefined {
        try {
            return this.db.prepare("SELECT * FROM `FileDatas` WHERE `fMd5`=?;").get(fMd5);
        } catch (error) {
            console.error(moment().format(COMMONS.DATE_FORMAT), error.name, error.message);
        }
    }
    getDatas(): FileData[] | undefined {
        try {
            return this.db.prepare("SELECT * FROM `FileDatas`;").all();
        } catch (error) {
            console.error(moment().format(COMMONS.DATE_FORMAT), error.name, error.message);
        }
    }
    updateData(fileData: FileData) {
        const date = moment().format("YYYY-MM-DD HH:mm:ss");
        const data = this.getData(fileData.fMd5);
        if (data) {
            this.db.prepare("UPDATE `FileDatas` SET `level`=?, `updatedAt`=? WHERE `fMd5`=?;").run(fileData.level, date, fileData.fMd5);
        } else {
            try {
                this.db.prepare("INSERT INTO `FileDatas` (`fMd5`, `level`, `createdAt`, `updatedAt`) VALUES (?, ?, ?, ?);").run(fileData.fMd5, fileData.level, date, date);
            } catch (error) {
                console.error(moment().format(COMMONS.DATE_FORMAT), error.name, error.message);
            }
        }
        return this;
    }

    removeData(fMd5: string) {
        try {
            this.db.prepare("DELETE FROM `FileDatas` WHERE `fMd5`=?;").run(fMd5);
        } catch (error) {
            console.error(moment().format(COMMONS.DATE_FORMAT), error.name, error.message);
        }
        return this;
    }
    removeInvalidNodes() {
        const nodes = this.getNodes();
        if (nodes) {
            nodes.forEach((node) => {
                const path = join(node.root, node.dir, node.name + node.ext).replace(/\\/g, "/");;
                if (fs.existsSync(path)) {
                    const stat = fs.statSync(path);
                    const sMd5 = hasha([path, stat.ino.toString(), stat.size.toString(), stat.birthtimeMs.toString(), stat.mtimeMs.toString()], { algorithm: 'md5' });
                    if (sMd5 !== node.sMd5) {
                        this.removeNode(node.sMd5);
                        // console.log(sMd5,node.sMd5);
                    }
                } else {
                    this.removeNode(node.sMd5);
                }
            });
        }
        return this;
    }
    removeInvalidDatas() {
        try {
            this.db.prepare("DELETE FROM `FileDatas` WHERE (SELECT COUNT (*) FROM `FileNodes` WHERE `fMd5` = `FileDatas`.`fMd5`) =0").run();
        } catch (error) {
            console.error(moment().format(COMMONS.DATE_FORMAT), error.name, error.message);
        }
        return this;
    }
    // createIndexes() {
    //     this.db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS [FileDatas Indexes] ON FileDatas (fMd5);`).run();
    //     this.db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS [FileNodes Indexes] ON FileNodes (sMd5);`).run();
    // }
    // dropIndexes() {
    //     this.db.prepare(`DROP INDEX IF EXISTS [FileDatas Indexes];`).run();
    //     this.db.prepare(`DROP INDEX IF EXISTS [FileNodes Indexes];`).run();
    // }
    backup() {
        this.db.backup(join(DATABASE.BACKUP_PATH, `${DATABASE.FILE_NAME}-${moment().format("YYYY-MM-DD")}.db`))
            // .then(() => {
            //     console.log('backup complete!');
            // })
            .catch((error) => {
                console.error(moment().format(COMMONS.DATE_FORMAT), error.name, error.message);
            });
    }
    // 不可撤销删除，速度最快
}

export default SqliteDataBase;