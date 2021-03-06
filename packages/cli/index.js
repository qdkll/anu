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
const webpack_1 = __importDefault(require("webpack"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const platforms_1 = __importDefault(require("./consts/platforms"));
const queue_1 = require("./packages/utils/logger/queue");
const index_1 = require("./packages/utils/logger/index");
const chalk_1 = __importDefault(require("chalk"));
const webpackConfig_1 = __importDefault(require("./config/webpackConfig"));
const babel = __importStar(require("@babel/core"));
const child_process_1 = require("child_process");
const index_2 = __importDefault(require("./packages/utils/index"));
const config_1 = __importDefault(require("./config/config"));
const runBeforeParseTasks_1 = __importDefault(require("./tasks/runBeforeParseTasks"));
const createH5Server_1 = __importDefault(require("./tasks/createH5Server"));
const configurations_1 = require("./config/h5/configurations");
const OS = __importStar(require("os"));
const rd = __importStar(require("rd"));
function nanachi(options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const { watch = false, platform = 'wx', beta = false, betaUi = false, compress = false, compressOption = {}, huawei = false, typescript = false, rules = [], prevLoaders = [], postLoaders = [], prevJsLoaders = [], postJsLoaders = [], prevCssLoaders = [], postCssLoaders = [], plugins = [], analysis = false, silent = false, complete = () => { } } = options;
        function callback(err, stats) {
            if (err) {
                console.log(chalk_1.default.red(err.toString()));
                return;
            }
            showLog();
            const info = stats.toJson();
            if (stats.hasWarnings() && !silent) {
                info.warnings.forEach(warning => {
                    if (!/Critical dependency: the request of a dependency is an expression/.test(warning)) {
                        console.log(chalk_1.default.yellow('Warning:\n'), index_2.default.cleanLog(warning));
                    }
                });
            }
            if (stats.hasErrors()) {
                info.errors.forEach(e => {
                    console.error(chalk_1.default.red('Error:\n'), index_2.default.cleanLog(e));
                    if (index_2.default.isMportalEnv()) {
                        process.exit();
                    }
                });
            }
            if (platform === 'h5') {
                const configPath = watch ? './config/h5/webpack.config.js' : './config/h5/webpack.config.prod.js';
                const webpackH5Config = require(configPath);
                if (typescript)
                    webpackH5Config.entry += '.tsx';
                if (config_1.default['360mode']) {
                    const cwd = process.cwd();
                    if (!fs.existsSync(path.join(cwd, 'src'))) {
                        fs.copySync(path.resolve(__dirname, './packages/360helpers/template'), path.resolve(cwd, 'src'));
                    }
                }
                const compilerH5 = webpack_1.default(webpackH5Config);
                if (watch) {
                    createH5Server_1.default(compilerH5);
                }
                else {
                    compilerH5.run(function (err, stats) {
                        if (config_1.default['360mode']) {
                            const appPath = path.resolve(process.cwd(), 'src/app.js');
                            let script = fs.readFileSync(appPath).toString();
                            script = `import './dist/web/bundle.${stats.hash.slice(0, 10)}.js';\n${script}`;
                            fs.writeFileSync(appPath, script, 'utf-8');
                            const files = fs.readdirSync(webpackH5Config.output.path);
                            fs.ensureDirSync(path.resolve(process.cwd(), './src/dist/web'));
                            files.forEach(filename => {
                                if (filename !== configurations_1.intermediateDirectoryName) {
                                    fs.copySync(path.resolve(webpackH5Config.output.path, filename), path.resolve(process.cwd(), './src/dist/web', filename));
                                }
                            });
                        }
                        if (err) {
                            console.log(err);
                            return;
                        }
                        const info = stats.toJson();
                        if (stats.hasWarnings() && !silent) {
                            info.warnings.forEach(warning => {
                                if (!/Critical dependency: the request of a dependency is an expression/.test(warning)) {
                                    console.log(chalk_1.default.yellow('Warning:\n'), index_2.default.cleanLog(warning));
                                }
                            });
                        }
                        if (stats.hasErrors()) {
                            info.errors.forEach(e => {
                                console.error(chalk_1.default.red('Error:\n'), index_2.default.cleanLog(e));
                                if (index_2.default.isMportalEnv()) {
                                    process.exit();
                                }
                            });
                        }
                    });
                }
            }
            complete(err, stats);
        }
        try {
            if (watch && config_1.default['360mode']) {
                throw new Error('360编译不支持watch模式');
            }
            if (!index_2.default.validatePlatform(platform, platforms_1.default)) {
                throw new Error(`不支持的platform：${platform}`);
            }
            const useTs = fs.existsSync(path.resolve(process.cwd(), './source/app.tsx'));
            if (useTs && !typescript) {
                throw '检测到app.tsx，请使用typescript模式编译(-t/--typescript)';
            }
            injectBuildEnv({
                platform,
                compress,
                huawei,
                typescript
            });
            getWebViewRules();
            yield runBeforeParseTasks_1.default({ platform, beta, betaUi, compress });
            if (compress) {
                postLoaders.unshift('nanachi-compress-loader');
            }
            const webpackConfig = webpackConfig_1.default({
                platform,
                compress,
                compressOption,
                beta,
                betaUi,
                plugins,
                typescript,
                analysis,
                prevLoaders,
                postLoaders,
                prevJsLoaders,
                postJsLoaders,
                prevCssLoaders,
                postCssLoaders,
                rules,
                huawei
            });
            const compiler = webpack_1.default(webpackConfig);
            if (watch) {
                compiler.watch({}, callback);
            }
            else {
                compiler.run(callback);
            }
        }
        catch (err) {
            callback(err);
        }
    });
}
function injectBuildEnv({ platform, compress, huawei, typescript }) {
    process.env.ANU_ENV = (platform === 'h5' ? 'web' : platform);
    config_1.default['buildType'] = platform;
    config_1.default['compress'] = compress;
    config_1.default['typescript'] = typescript;
    if (platform === 'quick') {
        config_1.default['huawei'] = huawei || false;
    }
}
function showLog() {
    if (index_2.default.isMportalEnv()) {
        let log = '';
        while (queue_1.build.length) {
            log += queue_1.build.shift() + (queue_1.build.length !== 0 ? '\n' : '');
        }
        console.log(log);
    }
    while (queue_1.warning.length) {
        index_1.warningLog(queue_1.warning.shift());
    }
    if (queue_1.error.length) {
        queue_1.error.forEach(function (error) {
            index_1.errorLog(error);
        });
        if (index_2.default.isMportalEnv()) {
            process.exit(1);
        }
    }
}
function getWebViewRoutes() {
    const pages = path.join(process.cwd(), 'source', 'pages');
    let webViewRoutes = [];
    if ('win32' === OS.platform()) {
        webViewRoutes = rd.readFilterSync(pages, /\.js$/).filter((jsfile) => {
            const reg = new RegExp("pages:\\s*(\\btrue\\b|\\[.+\\])");
            const content = fs.readFileSync(jsfile).toString();
            return reg.test(content);
        });
    }
    else {
        let bin = 'grep';
        let opts = ['-r', '-E', "pages:\\s*(\\btrue\\b|\\[.+\\])", pages];
        let ret = child_process_1.spawnSync(bin, opts).stdout.toString().trim();
        webViewRoutes = ret.split(/\s/)
            .filter(function (el) {
            return /\/pages\//.test(el);
        }).map(function (el) {
            return el.replace(/\:$/g, '');
        });
    }
    return webViewRoutes;
}
function getWebViewRules() {
    const cwd = process.cwd();
    if (config_1.default.buildType != 'quick')
        return;
    let webViewRoutes = getWebViewRoutes();
    webViewRoutes.forEach(function (pagePath) {
        return __awaiter(this, void 0, void 0, function* () {
            babel.transformFileSync(pagePath, {
                configFile: false,
                babelrc: false,
                comments: false,
                ast: true,
                presets: [
                    require('@babel/preset-react')
                ],
                plugins: [
                    [require('@babel/plugin-proposal-decorators'), { legacy: true }],
                    [require('@babel/plugin-proposal-class-properties'), { loose: true }],
                    require('@babel/plugin-proposal-object-rest-spread'),
                    require('@babel/plugin-syntax-jsx'),
                    require('./packages/babelPlugins/collectWebViewPage'),
                ]
            });
        });
    });
    const WebViewRules = config_1.default.WebViewRules;
    if (WebViewRules && WebViewRules.pages.length) {
        process.env.ANU_WEBVIEW = 'need_require_webview_file';
    }
    else {
        process.env.ANU_WEBVIEW = '';
    }
}
exports.default = nanachi;
