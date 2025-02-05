const path = require('path')
const HtmlWebpackPlugin = require("html-webpack-plugin");
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
        open:true, // 自动打开浏览器窗口
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index.html" //指定模板文件
        })
    ],
    module: {
        rules: [
            {
                test: /\.js$/, // 匹配所有js结尾的文件
                exclude: /node_modules/, // 排除node_modules目录下的文件
                use: {
                    loader: "babel-loader" // 使用babel-loader来转译这些文件，使得最新的JavaScript特性也可以在老版本浏览器中运行
                }
            }
        ]
    }
}
