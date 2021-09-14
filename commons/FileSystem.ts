import fs from "fs";
import moment from "moment";
import { join, sep, dirname, extname, basename, parse } from "path";
import trash from "trash";
import { COMMONS } from "./constants";
/** 遍历目标 */
enum Filter {
    /** 只限文件 */
    fileOnly,
    /** 只限文件夹 */
    dirOnly,
    /** 文件和文件夹 */
    both
}
type Options = {
    path: string,
    filter?: Filter,
    ignored?: RegExp,
    depth?: number,
    callback: (file: { name: string, dir: string, path: string, type: string, depth: number }) => any
}

class FileSystem {
    // 遍历指定文件夹
    static recurDir(options: Options, index: number = 0) {
        index++;
        let { path, filter, ignored, depth, callback } = options;
        if (filter === undefined) filter = Filter.both;
        if (depth === undefined) depth = -1;
        const paths = fs.readdirSync(path, { withFileTypes: true });
        for (let i = 0, len = paths.length; i < len; i++) {
            if (ignored && ignored.test(paths[i].name)) continue;
            if (paths[i].isDirectory()) {
                let skip;
                if (filter === Filter.both || filter === Filter.dirOnly) {
                    skip = callback({ name: paths[i].name, dir: path, path: join(path, paths[i].name), type: "dir", depth: index });
                }
                if ((skip === undefined || skip) && (depth >= index || depth === -1)) this.recurDir({ path: join(path, paths[i].name), filter, ignored, depth, callback }, index);
            } else if (paths[i].isFile()) {
                if (filter === Filter.both || filter === Filter.fileOnly) callback({ name: paths[i].name, dir: path, path: join(path, paths[i].name), type: "file", depth: index });
            }
        }
    }
    // 移动文件
    static moveFile(oldPath: string, newPath: string, index = 0) {
        const { name, ext, dir } = parse(newPath);
        const tempExt = (index ? ` (${index})` : "") + ext;
        const tempName = name.slice(0, 221 - (tempExt.length));
        const tempPath = join(dir, tempName + tempExt);
        // 先判断文件是否存在
        // 递归重试，index递增
        if (fs.existsSync(tempPath)) {
            this.moveFile(oldPath, newPath, ++index);
        } else {
            // 创建深度文件夹
            this.makeDirs(dirname(tempPath));
            fs.renameSync(oldPath, tempPath);
        }
        return this;
    }
    // 创建文件硬链接
    static linkFile(oldPath: string, newPath: string, index = 0) {
        const { name, ext, dir } = parse(newPath);
        const tempExt = (index ? ` (${index})` : "") + ext;
        const tempName = name.slice(0, 221 - (tempExt.length));
        const tempPath = join(dir, tempName + tempExt);
        // 先判断文件是否存在
        // 递归重试，index递增
        if (fs.existsSync(tempPath)) {
            const oldIno = fs.statSync(oldPath).ino;
            const newIno = fs.statSync(newPath).ino;
            if (oldIno !== newIno) {
                this.moveFile(oldPath, newPath, ++index);
            }
        } else {
            // 创建深度文件夹
            this.makeDirs(dirname(tempPath));
            fs.linkSync(oldPath, tempPath);
        }
        return this;
    }
    // 创建多个深度文件夹
    static makeDirs(...paths: string[]) {
        for (let x = 0, len = paths.length; x < len; x++) {
            let dirs: string[] = paths[x].split(/[\\/]/g);
            for (let i = 0, len = dirs.length; i < len; i++) {
                const path = dirs.slice(0, i + 1).join(sep);
                if (fs.existsSync(path)) continue;
                try {
                    fs.mkdirSync(path);
                } catch (error) {
                    console.error(moment().format(COMMONS.DATE_FORMAT), error.name, error.message);
                }
            }
        }
        return this;
    }
    // 保存文件夹的存在
    static keepDirs(...paths: string[]) {
        paths.forEach((path) => {
            if (!fs.existsSync(path)) {
                this.makeDirs(path);
            } else if (fs.statSync(path).isFile()) {
                (async () => {
                    await trash(path);
                })();
            }
            fs.watchFile(path, { interval: 100 }, (curr, prev) => {
                if (curr.isFile()) {
                    (async () => {
                        await trash(path);
                        this.makeDirs(path);
                    })();
                } else if (!curr.isDirectory()) {
                    this.makeDirs(path);
                }
            })
        });
        return this;
    }
}
export { Filter }
export default FileSystem;

