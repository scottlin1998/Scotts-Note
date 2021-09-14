import Configurator from "./Configurator";
import yaml from "yaml";
// 实例化一个设置类，以yaml来解析
export default new Configurator(yaml,".yaml");