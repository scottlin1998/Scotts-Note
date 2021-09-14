import { ConfigOptions } from "./Configurator";

// 设置类解析器的接口
interface IConfigAdapter {
    parse(val: string): ConfigOptions;
    stringify(obj: ConfigOptions): string
}
export default IConfigAdapter;