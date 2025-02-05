const  fs = require('fs');
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const { transformFromAst } = require('@babel/core')
const options = require('./webpack.config')
const path = require("path");

// const ast = ''
// traverse(ast,{
//     // 注册处理函数对ast进行处理
// })

const Parser = {
    // 这里的path是指需要将入口文件的路径传过来
    getAst: path=>{
        // 读取入口文件,将其转换为utf-8
        const context = fs.readFileSync(path,'utf-8')
        return parser.parse(context,{
            sourceType:'module'
        })
    },
    // 获取入口文件的依赖的方法
    getDependence: (ast,fileName)=>{
        // 注册处理函数对ast进行处理
        const dependence ={}
        // node是调用traverse中的方法时的自带的参数。第二个参数是traverse的配置对象
        // import 语句结点
        traverse(ast,{
            ImportDeclaration({node}) {
                // 获取到整个依赖树的根节点-根据传进来的入口文件
                const dirname = path.dirname(fileName)
                // 生成依赖模块的路径
                const filePath = './'+path.join(dirname,node.source.value)
                dependence[node.source.value] = filePath
            },
            // 当遇到函数调用表达式的情况的时候
            // 获取到node结点的信息
            CallExpression({node}){
                // 如果函数调用名是require的话
                if (node.callee.name ==='require') {
                    const moduleName = node.arguments[0].value
                    // 将模块名添加到依赖列表中
                    dependence[moduleName] = moduleName
                }
            }
        })
        return dependence
    },
    // 进行代码转换的方法--将ast转换为浏览器能执行的code
    getCode:(ast)=>{
        const {code} = transformFromAst(ast,null,{
            presets:['@babel/preset-env'] // 通过预设的模块来进行转换
        })
        return code
    }
}

class Compiler {
    constructor(options) {
        const { entry , output } = options
        // 入口文件
        this.entry = entry
        // 出口文件
        this.output = output
        this.modules = []
    }
    run(){
        const info = this.build(this.entry)
        this.modules.push(info)
        // 获取到每个成员的依赖信息
        this.modules.forEach(({dependence})=>{
            if (dependence) {
                for (let item in dependence) {
                    this.modules.push(this.build(dependence[item]));
                }
            }
        })
        // 生成依赖关系图 Array.reduce 入参分别是Array[0],Array[1]
        const dependencyGraph = this.modules.reduce((graph,item)=>({
            ...graph,
            // 使用文件路径作为每个模块的标识，保存对应模块的依赖对象和文件内容
            [item.filename]:{
                dependence:item.dependence,
                code:item.code
            }
        }),{})
        this.generate(dependencyGraph)
    }
    // 进行构建
    build(filename){
        const {getAst,getDependence,getCode} = Parser
        const ast = getAst(filename)
        const dependence = getDependence(ast,filename)
        // 将入口文件内容转换为可执行的代码，从输出结果来看，就是文件中的代码本身
        const code = getCode(ast)
        return {
            // 文件名称
            filename,
            // 文件路径 每个模块的唯一标识符
            ast,
            // 依赖对象，保存着依赖模块路径
            dependence,
            // 文件内容
            code
        }
    }
    // 输出bundle
    generate(graph){
        console.log(graph)
        // 输出的文件路径
        const filepath = path.join(this.output.path,this.output.filename)
        // template
        const bundle = `
        // 创建一个dist文件夹，文件内容
        (function (graph){
            // 重写require函数
            function require(moduleId){
                function localRequire(relativePath){ // 依赖模块的路径
                    return require(graph[moduleId].dependence[relativePath])
                }
                console.log(moduleId);
                const exports = {};
                (function (require,exports,code){
                })(localRequire,exports,graph[moduleId].code)
                // 暴露exports对象
                return exports
            }
            // 从入口文件开始执行
            require("${this.entry}")
        })(JSON.stringify(graph))`
        const distFolder = path.dirname(filepath) // 去除文件名 返回目录 检测dist目录是否存在
        if (!fs.existsSync(distFolder)) {
            fs.mkdirSync(distFolder,{recursive:true})
        }
        // 创建一个文件夹，文件内容就是bundle
        fs.writeFileSync(filepath,bundle,"utf-8")
    }
}
// 创建一个Compiler实例
new Compiler(options).run();
