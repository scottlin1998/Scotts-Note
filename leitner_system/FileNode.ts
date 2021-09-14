// import MaterialDao from "./MaterialDao";
// import { getSMd5 } from "../commons/utils";
import hasha from "hasha";
import database from "../databases/database";
import { sep, parse } from "path";
import fs from "fs";
import hidefile from "hidefile";
import FileSystem from "../commons/FileSystem";
import ArchiveFolder from "../folders/ArchiveFolder";
import config from "../commons/config";
import { join } from "path";
export default class FileNode {
    sMd5!: string;
    fMd5!: string;
    root!: string;
    path!: string;
    fullPath!: string;
    dir!: string;
    name!: string;
    ext!: string;
    ino!: number;
    hasData: boolean = false;
    // changed: boolean = false;
    constructor(path: string) {
        this.setPath(path);
    }
    setPath(path: string) {
        path = path.replace(/\\/g, "/");
        this.fullPath = path;
        const index = path.indexOf("/");
        if (index != -1) {
            this.path = path.slice(index + 1);
            this.root = path.slice(0, index);
        } else {
            this.path = path;
            this.root = "";
        }
        const { dir, name, ext } = parse(this.path);
        this.dir = dir;
        this.name = name;
        this.ext = ext;
        const stat = fs.statSync(path);
        this.ino = stat.ino;
        this.sMd5 = hasha([path, stat.ino.toString(), stat.size.toString(), stat.birthtimeMs.toString(), stat.mtimeMs.toString()], { algorithm: 'md5' });
        const node = database.getNode(this.sMd5);
        if (node) {
            this.fMd5 = node.fMd5;
            this.hasData = true;
        } else {
            this.fMd5 = hasha.fromFileSync(path, { algorithm: 'md5' });
            this.hasData = false;
        }
    }
    get isHidden() {
        return true;
    }
    hide() {
        // console.log(hidefile.isHiddenSync());
        hidefile.isHidden(this.fullPath, (err, result) => {
            if (err == null) {
                // console.log(result);  //-> false
                if (!result) hidefile.hideSync(this.fullPath);
            } else {
                console.log(this.fullPath, err);
            }
        });

        // hidefile.hide(this.fullPath, (err, newpath) => {
        //     if (err == null) {
        //         // this.setPath(newpath as string);
        //         // this.update();
        //         // console.log(newpath, 123456);  //-> 'path/to/.file.ext'
        //     }
        // });
    }
    reveal() {
        hidefile.isHidden(this.fullPath, (err, result) => {
            if (err == null) {
                // console.log(result);  //-> false
                if (result) hidefile.revealSync(this.fullPath);
            } else {
                console.log(this.fullPath, err);
            }
        });
        // hidefile.reveal(this.fullPath, (err, newpath) => {
        //     if (err == null) {
        //         // this.setPath(newpath as string);
        //         // this.update();
        //         // console.log(newpath);  //-> 'path/to/file.ext'
        //     }
        // });
    }
    update() {
        if (!this.hasData
            //  || this.changed
        ) {
            database.addNode(this);
            this.hasData = true;
            // this.changed = false;
        }
    }
    delete() {
        if (this.hasData) {
            database.removeNode(this.sMd5);
            this.hasData = false;
        }
    }
    archive() {
        if (config.autoArchiveMode)
            FileSystem.moveFile(this.fullPath, join(ArchiveFolder.path, this.path));
        else this.hide();
    }
}