// 系统
// 插件
import moment from "moment";
// 我的
// import MaterialDao from "./MaterialDao";
import { COMMONS } from "../commons/constants";
import FileNode from "./FileNode";
import config from "../commons/config";
import database from "../databases/database";
export default class Material {
    fMd5: string;
    private _level: number = 0;
    get level() {
        return this._level;
    }
    /**
     * @param value 取值范围：0<=value<=莱特纳盒子数
     */
    private changed: boolean = false;
    private hasData: boolean = false;
    fileNodes: Map<string, FileNode> = new Map();
    // private initialized: boolean = false;
    set level(value: number) {
        // 标记严格模式
        if (config.markerStrictMode && !this.reviewable) return;
        if (this._level === value) return;
        // 如果等级小于0
        if (value < 0)
            this._level = 0;
        // 如果等级超过目标等级
        else if (value > this.target)
            this._level = this.target;
        else
            this._level = value;
        // 记录最新的时间
        this.changed = true;
        this.updatedAt = moment().format(COMMONS.DATE_FORMAT);

    }
    // archived: boolean = false;
    /**
      * 莱特纳总盒子数，同时也是艾宾浩斯目标周期
      */
    target: number = config.reviewIntervalSet.length - 1;
    /**
     * 最近一次复习的日期
     */
    updatedAt: string = moment().format(COMMONS.DATE_FORMAT);
    // fileNodes: Set<FileNode> = new Set();
    /**
     * 根据当前日期和上次复习的日期的天数差计算是否超过指定的复习周期来判断是否可以复习
     */
    get reviewable() {
        let nextDate = moment(this.reviewDate, COMMONS.DATE_FORMAT);
        let nowDate = moment();
        return (nextDate <= nowDate) && !this.archivable;
    }
    /**
     * 根据当前文件所在的等级是否已经达到了目标周期来判断是否可以存档
     */
    get archivable() {
        return this.level >= this.target;
    }
    /**
     * 根据艾宾浩斯遗忘曲线复习天数间隔来获取下一次的复习时间
     */
    get reviewDate(): string {
        return moment(this.updatedAt, COMMONS.DATE_FORMAT).add(this.reviewInterval, 'day').format(COMMONS.DATE_FORMAT);
    }
    /**
     * 根据当前文件所在的等级来获取艾宾浩斯遗忘曲线复习天数间隔
     */
    get reviewInterval(): number {
        // 如果等级为-1的时候则为新添加的文件
        // if (this.level === -1) return 0;
        //  返回间隔天数
        // else 
        return config.reviewIntervalSet[this.level];
    }
    constructor(fileNode: FileNode)
    constructor(fMd5: string)
    constructor(x: FileNode | string) {
        this.fMd5 = typeof x === "string" ? x : x.fMd5;
        // 根据当前的文件md5获取数据库中的数据
        const data = database.getData(this.fMd5);
        if (data) {
            this.hasData = true;
            this._level = data.level;
            this.updatedAt = data.updatedAt;
        }
    }
    update() {
        // 更新数据
        if (!this.hasData || this.changed) {
            database.updateData(this);
            this.hasData = true;
            this.changed = false;
        }
    }
    delete() {
        if (this.hasData) {
            database.removeData(this.fMd5);
            this.hasData = false;
        }
    }
    hideAll() {
        this.fileNodes.forEach(fileNode => fileNode.hide());
    }
    revealAll() {
        this.fileNodes.forEach(fileNode => fileNode.reveal());
    }
    archiveAll() {
        this.fileNodes.forEach(fileNode => fileNode.archive());
    }
}