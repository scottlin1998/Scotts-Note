import FileData from "../leitner_system/FileData";
import FileNode from "../leitner_system/FileNode";
import AbstractDatabase from "./AbstractDatabase";

export default class LowdbDatabase extends AbstractDatabase {
    extName: string = ".json";
    protected db: any;
    getNode(sMd5: string): FileNode | undefined {
        throw new Error("Method not implemented.");
    }
    getNodes(params?: { fMd5?: string | undefined; dir?: string | undefined; }): FileNode[] | undefined {
        throw new Error("Method not implemented.");
    }
    addNode(node: FileNode): void {
        throw new Error("Method not implemented.");
    }
    removeNode(sMd5: string): void {
        throw new Error("Method not implemented.");
    }
    removeNodes(params: { fMd5?: string | undefined; dir?: string | undefined; }): void {
        throw new Error("Method not implemented.");
    }
    getData(fMd5: string): FileData | undefined {
        throw new Error("Method not implemented.");
    }
    getDatas(): FileData[] | undefined {
        throw new Error("Method not implemented.");
    }
    updateData(fileData: FileData): void {
        throw new Error("Method not implemented.");
    }
    removeData(fMd5: string): void {
        throw new Error("Method not implemented.");
    }
    removeInvalidNodes(): void {
        throw new Error("Method not implemented.");
    }
    removeInvalidDatas(): void {
        throw new Error("Method not implemented.");
    }
    backup(): void {
        throw new Error("Method not implemented.");
    }
}