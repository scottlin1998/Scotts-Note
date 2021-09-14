class Retry {
    private ms: number = -1;
    private max: number = 60;
    private ind: number = 0;
    private err: Error | undefined;
    // 设置重试等待时间
    setWait(ms: number) {
        this.ms = ms;
        return this;
    }
    // 设置重试最大次数
    setMax(max: number) {
        this.max = max;
        return this;
    }
    // 调用函数并重试
    invoke(func: (ind: number) => any) {
        return new Promise((resolve, reject) => {
            const _this = this;
            (function retry(func: (ind: number) => any) {
                if (_this.max === -1 || _this.ind < _this.max) {
                    try {
                        func(_this.ind);
                        resolve(_this.ind);
                        // this.ind = 0;
                    } catch (err) {
                        _this.err = err;
                        if (_this.ms !== -1) {
                            setTimeout(() => retry(func), _this.ms);
                        } else {
                            setImmediate(() => retry(func));
                        }
                        _this.ind++;
                    }
                } else reject({ err: _this.err, ind: _this.ind });
            })(func)
        });
    }
    // 获取一个重试实例
    static getInstance(){
        return new Retry();
    }
}
export default Retry.getInstance;