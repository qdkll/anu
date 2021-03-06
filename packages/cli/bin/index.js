#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const platforms_1 = __importDefault(require("../consts/platforms"));
const buildOptions_1 = __importDefault(require("../consts/buildOptions"));
const cliBuilder_1 = __importDefault(require("./cliBuilder"));
const init_1 = __importDefault(require("./commands/init"));
const createPage_1 = __importDefault(require("./commands/createPage"));
const install_1 = __importDefault(require("./commands/install"));
const path = __importStar(require("path"));
require("../tasks/chaikaMergeTask/injectChaikaEnv");
const { version } = require('../package.json');
const index_1 = __importDefault(require("../tasks/chaikaMergeTask/index"));
let cwd = process.cwd();
function changeWorkingDir() {
    process.chdir(path.join(cwd, '.CACHE/nanachi'));
}
function isChaikaMode() {
    return process.env.NANACHI_CHAIK_MODE === 'CHAIK_MODE';
}
const cli = new cliBuilder_1.default();
cli.checkNodeVersion('8.6.0');
cli.version = version;
cli.addCommand('init <app-name>', null, 'description: 初始化项目', {}, (appName) => {
    init_1.default(appName);
});
cli.addCommand('install [name]', null, 'description: 安装拆库模块. 文档: https://rubylouvre.github.io/nanachi/documents/chaika.html', {
    'remote': {
        desc: '获取发布平台(mportal)最新的一次发布的相关联的各个业务模块。(示例 nanachi install -r quick --huawei) 详细文档: https://wiki.corp.qunar.com/confluence/pages/viewpage.action?pageId=329213763',
        args: 'wx|ali|bu|quick',
        alias: 'r'
    },
    'huawei': {
        desc: '华为快应用, 只有在 remote 为 quick 时生效'
    },
    'branch': {
        desc: '指定分支',
        alias: 'b'
    }
}, function (name, opts) {
    install_1.default(name, opts);
});
['page', 'component'].forEach(type => {
    cli.addCommand(`${type} <page-name>`, null, `description: 创建${type}s/<${type}-name>/index.js模版`, {}, (name) => {
        createPage_1.default({ name, isPage: type === 'page' });
    });
});
platforms_1.default.forEach(function (el) {
    const { buildType, des, isDefault } = el;
    ['build', 'watch'].forEach(function (compileType) {
        cli.addCommand(`${compileType}:${buildType}`, isDefault ? compileType : null, des, buildOptions_1.default, (options) => __awaiter(this, void 0, void 0, function* () {
            if (isChaikaMode()) {
                try {
                    yield index_1.default();
                    changeWorkingDir();
                }
                catch (err) {
                    console.error(err);
                    process.exit(1);
                }
            }
            require('./commands/build')(Object.assign(Object.assign({}, options), { watch: compileType === 'watch', buildType }));
        }));
    });
});
cli.run();
