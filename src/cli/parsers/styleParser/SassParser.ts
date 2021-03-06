import StyleParser from './StyleParser';
import { MAP } from '../../consts/index';
import { StyleParserOptions } from './StyleParserFactory';
import * as path from 'path';
const calculateAlias = require('../../packages/utils/calculateAlias');

class SassParser extends StyleParser {
    constructor(props: StyleParserOptions) {
        super(props);
        this._postcssPlugins = this._postcssPlugins.concat([
            require('postcss-import')({
                resolve: function(importer: string, baseDir: string){
                    //如果@import的值没有文件后缀
                    if (!/\.s[ca]ss$/.test(importer)) {
                        importer = importer + '.scss';
                    }
                    //处理alias路径
                    var filePathAbPath = path.join(
                        baseDir,
                        calculateAlias(props.filepath, importer)
                    )
                    // 返回绝对路径
                    /**
                     * If you do not return an absolute path, your path will be resolved to an absolute path using the default resolver. You can use resolve for this.
                     */
                    return filePathAbPath;
                    // return calculateAlias(props.filepath, importer);
                },
                // from: props.filepath,
                plugins: this.platform !== 'h5' ? [
                    require('../../packages/postcssPlugins/postCssPluginRemoveRules') // 删除import文件的所有rules，保留@mixins、$variables、@functions等
                ] : []
            }),
            require('@csstools/postcss-sass'),
            ...this.platform !== 'h5' ? [
                require('../../packages/postcssPlugins/postCssPluginAddImport')({
                    extName: MAP[this.platform]['EXT_NAME'][this.type],
                    type: this.type
                }), // 添加@import规则，小程序可以解析原有依赖
            ] : [
                require('../../packages/postcssPlugins/postCssPluginRpxToRem'),
                require('../../packages/postcssPlugins/postCssPluginAddStyleHash')
            ],
            require('../../packages/postcssPlugins/postCssPluginFixNumber'), // 数字精度插件
            require('../../packages/postcssPlugins/postCssPluginValidateStyle'),
            require('../../packages/postcssPlugins/postCssPluginTransformKeyFrames'),
            require('../../packages/postcssPlugins/postCssPluginRemoveComments')
        ]);
        this._postcssOptions = {
            from: this.filepath,
            syntax: require('postcss-scss')
        };
    }
}

export default SassParser;