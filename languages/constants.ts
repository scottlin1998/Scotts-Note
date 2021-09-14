import chalk from "chalk";

const SCRIPT_INFO = `
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++·
                       欢迎使用${chalk.rgb(247, 151, 29)("阿耀的笔记v3.0.0")}                       ·
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++·

${chalk.bgRgb(255, 79, 135)("      ") + chalk.bgRgb(255, 255, 255)("                ")}  ++++++++++++++++++++++++++++++++++++++++++++++·
${chalk.rgb(255, 255, 255).bgRgb(255, 79, 135)(" BILI ") + chalk.rgb(0, 0, 0).bgRgb(255, 255, 255)("   林承耀同学   ")}   创作不易，点赞投币收藏加关注，就是最大的支持 ·
${chalk.bgRgb(255, 79, 135)("      ") + chalk.bgRgb(255, 255, 255)("                ")}  ++++++++++++++++++++++++++++++++++++++++++++++·

${chalk.bgRgb(18, 183, 245)("      ") + chalk.bgRgb(255, 255, 255)("                ")}  ++++++++++++++++++++++++++++++++++++++++++++++·
${chalk.rgb(255, 255, 255).bgRgb(18, 183, 245)(" QQ群 ") + chalk.rgb(0, 0, 0).bgRgb(255, 255, 255)("   773708384    ")}   欢迎新人进群交流，反馈问题，备注：阿耀的笔记 ·
${chalk.bgRgb(18, 183, 245)("      ") + chalk.bgRgb(255, 255, 255)("                ")}  ++++++++++++++++++++++++++++++++++++++++++++++·

${chalk.bgRgb(84, 17, 40)("      ") + chalk.bgRgb(255, 255, 255)("                ")}  ${chalk.bgRgb(255, 73, 6)("      ") + chalk.bgRgb(255, 255, 255)("                ")}  ${chalk.bgRgb(230, 22, 45)("      ") + chalk.bgRgb(255, 255, 255)("                ")}·
${chalk.rgb(255, 255, 255).bgRgb(84, 17, 40)(" 抖音 ") + chalk.rgb(0, 0, 0).bgRgb(255, 255, 255)("  scottlin1998  ")}  ${chalk.rgb(255, 255, 255).bgRgb(255, 73, 6)(" 快手 ") + chalk.rgb(0, 0, 0).bgRgb(255, 255, 255)("   林承耀同学   ")}  ${chalk.rgb(255, 255, 255).bgRgb(230, 22, 45)(" 微博 ") + chalk.rgb(0, 0, 0).bgRgb(255, 255, 255)("   林承耀同学   ")}·
${chalk.bgRgb(84, 17, 40)("      ") + chalk.bgRgb(255, 255, 255)("                ")}  ${chalk.bgRgb(255, 73, 6)("      ") + chalk.bgRgb(255, 255, 255)("                ")}  ${chalk.bgRgb(230, 22, 45)("      ") + chalk.bgRgb(255, 255, 255)("                ")}·
`;

const MARKER_FOLDER = {
    PATH: "1.标记区",
    EASY: "1.简单",
    HARD: "2.困难",
    MASTERED: "3.掌握",
    get READY() {
        return this.PATH + "：准备就绪！耗时"
    }
    // MAXIMUM: "最大值",
    // MINIMUM: "最小值",
    // PERCENTAGE: "百分比",
}
const SOURCE_FOLDER = {
    PATH: "2.资源区",
    get READY() {
        return this.PATH + "：准备就绪！耗时"
    }
}

const ARCHIVE_FOLDER = {
    PATH: "3.存档区",
    get READY() {
        return this.PATH + "：准备就绪！耗时"
    }
}
const SETTINGS = {
    FILE_NAME: "config",
    MARK_REGRET_DURATION: "标记延时时长 (秒数)",
    REVIEW_INTERVAL_SET: "复习周期间隔 (天数)",
    CHECK_REVIEWABLE_INTERVAL: "检查可复习文件间隔 (分钟)",
    AUTO_ARCHIVE_MODE: "自动存档模式 (true|false)",
    MARKER_STRICT_MODE: "标记严格模式 (true|false)",
    // DATA_INDEX_MODE: "数据库索引查询模式（true|false）",
    DELETE_INVALID_DATA: "自动删除无效数据 (true|false)",
    AUTO_BACKUP_DATA: "自动备份学习数据 (true|false)",
    KEEP_RECENT_BACKUP: "只保留最近N天的备份 (天数)",
    FILE_EXTENSION_BLACKLIST: "文件后缀黑名单"
}
const COMMONS = {
    DATE_FORMAT: "YYYY-MM-DD HH:mm:ss"
}
const DATABASE = {
    FILE_NAME: "data",
    BACKUP_PATH: "4.备份区"
}
export {
    MARKER_FOLDER,
    SOURCE_FOLDER,
    ARCHIVE_FOLDER,
    SETTINGS,
    DATABASE,
    COMMONS,
    SCRIPT_INFO
};
export default {
    MARKER_FOLDER,
    SOURCE_FOLDER,
    ARCHIVE_FOLDER,
    SETTINGS,
    DATABASE,
    COMMONS,
    SCRIPT_INFO
};