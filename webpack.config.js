const path = require('path')
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ESLintPlugin  = require("eslint-webpack-plugin");
const MiniCssExtractPlugin  = require("mini-css-extract-plugin");
module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname,'dist'), // 必须是绝对路径
        filename: "bundle.js",
        clean: true // 确保输出目录在构建时被清理
    },
    mode:"development",
    devServer:{ // 代码运行时的配置文件，配置本地开发服务器的一些选项
        static:{ // 指定静态文件根目录，这里是 dist 文件夹。
            directory:path.join(__dirname,"dist")
        },
        compress:true,
        port:9000, // 指定运行端口
        hot:true, // 开启热模块替换（HMR），允许在不刷新页面的情况下更新代码
        open:false, // 自动打开浏览器窗口
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'My Awesome Application',
            template: "./src/index.html",
            filename: 'index.html',
        }),
        new ESLintPlugin({
            extensions: ['js','jsx','ts','tsx']
        }),
        new MiniCssExtractPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.js$/, // 匹配所有js结尾的文件
                exclude: /node_modules/, // 排除node_modules目录下的文件
                use: {
                    loader: "babel-loader" // 使用babel-loader来转译这些文件，使得最新的JavaScript特性也可以在老版本浏览器中运行
                }
            },
            {
                test: /\.ts$/, // 匹配所有ts文件
                exclude: /node_modules/, // 排除node_modules目录下的文件
                use: {
                    loader: "ts-loader" // 使用ts-loader来转译ts文件
                }
            }
            ,
            {
                test: /\.css$/, // 匹配所有css文件
                use: [
                    // 生产环境下使用MiniCssExtractPlugin，正常开发环境下使用style-loader
                    process.env.NODE_ENV !== 'production'
                    ?'style-loader': MiniCssExtractPlugin.loader,'css-loader',
                ]
            },
            {
                test: /\.less$/,
                use: [
                    process.env.NODE_ENV !== 'production'
                        ?'style-loader': MiniCssExtractPlugin.loader,
                    "css-loader",
                    "less-loader", //编译less为css
                    "postcss-loader"
                ] // 从右往左依次执行
            }
        ]
    },
    resolve: {
        extensions: [".ts",".js"]
    }
}
