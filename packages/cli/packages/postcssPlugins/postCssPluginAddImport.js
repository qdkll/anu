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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postcss_1 = __importDefault(require("postcss"));
const path = __importStar(require("path"));
const utils_1 = __importDefault(require("../utils"));
const config_1 = __importDefault(require("../../config/config"));
const postCssPluginAddImport = postcss_1.default.plugin('postcss-plugin-add-import', function ({ extName, type } = {}) {
    return function (root, res) {
        const deps = utils_1.default.getDeps(res.messages);
        function getRelativeImportPath(dirname, filepath) {
            const reg = (type === 'sass' ? /\.(s[c|a]ss)$/ : /\.(less)$/);
            return '\'' + path.relative(dirname, filepath)
                .replace(reg, `.${extName || '$1'}`)
                .replace(/(^\w)/, './$1') +
                '\'';
        }
        if (!deps.length) {
            return;
        }
        root.raws.semicolon = true;
        for (var i = deps.length - 1; i >= 0; i--) {
            let importPath = getRelativeImportPath(path.dirname(res.opts.from), deps[i].file).replace(/\\/g, '/');
            if (config_1.default['buildType'] === 'quick') {
                importPath = importPath.replace(/\.s[ac]ss(')?$/, '.css$1');
            }
            const importNode = postcss_1.default.atRule({
                name: 'import',
                params: importPath
            });
            root.insertBefore(root.nodes[0], importNode);
        }
    };
});
module.exports = postCssPluginAddImport;
