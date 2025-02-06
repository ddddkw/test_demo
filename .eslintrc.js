module.exports = {
    parser: "@babel/eslint-parser", // 使用 Babel 作为解析器
    parserOptions: {
        ecmaVersion: 2021, // 支持 ES2021
        sourceType: "module",
        requireConfigFile: false, // 如果没有 Babel 配置文件
        "babelOptions": {
            "presets": ["@babel/preset-env"]
        }
    },
    env: {
        browser: true,
        node: true,
        es2021: true, // 启用 ES2021 环境
    },
    rules: {
        // 你的规则
    },
};
