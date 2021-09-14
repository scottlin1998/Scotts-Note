export default class RunOnce {
    // 执行一次的所有实例
    static instances: Map<Symbol, RunOnce> = new Map();
    // 执行一次的唯一识别符
    static at(symbol: any) {
        if (!this.instances.has(Symbol.for(symbol))) {
            const runOnce = new RunOnce();
            this.instances.set(Symbol.for(symbol), runOnce);
        }
        return this.instances.get(Symbol.for(symbol)) as RunOnce;
    }
    private immediate?: NodeJS.Immediate;
    private timeout?: NodeJS.Timeout;
    private constructor() { }
    setImmediate(func: () => any) {
        if (this.immediate) clearImmediate(this.immediate);
        this.immediate = setImmediate(func);
    }
    setTimeout(func: () => any, ms?: number) {
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(func, ms);
    }
    clear() {
        if (this.immediate) clearImmediate(this.immediate);
        if (this.timeout) clearTimeout(this.timeout);
    }
}