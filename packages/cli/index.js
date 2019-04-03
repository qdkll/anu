const webpack = require('webpack');
const path = require('path');
const cwd = process.cwd();
const NanachiWebpackPlugin = require('./nanachi-loader/plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const globalConfig = require('./packages/config.js');
const { REACT_LIB_MAP } = require('./consts/index');
const runBeforeParseTasks = require('./commands/runBeforeParseTasks');

async function nanachi({
    entry = './source/app',
    watch = false,
    platform = 'wx',
    beta = false,
    betaUi = false,
    compress = false,
    // loaders,
    plugins = [],
    complete = () => {}
} = {}) {
    // TODO：移除复制assets目录操作，使用copy-webpack-plugin插件完成
    await runBeforeParseTasks({
        buildType: platform,
        beta,
        betaUi
    });
    const distPath = path.resolve(cwd, platform === 'quick' ? './src' : './dist');
    globalConfig['buildType'] = platform;
    globalConfig['compress'] = compress;
    const nanachiOptions = {
        mode: 'development',
        context: cwd,
        output: {
            path: distPath,
            filename: 'index.bundle.js'
        },
        module: {
            noParse: /node_modules|React/,
            rules: [
                {
                    test: /\.jsx?$/,
                    use: [
                        require.resolve('./nanachi-loader/loaders/fileLoader'),
                        require.resolve('./nanachi-loader'),
                    ],
                    exclude: /node_modules|React/
                },
                {
                    test: /\.(s[ca]ss|less|css)$/,
                    use: [
                        require.resolve('./nanachi-loader/loaders/fileLoader'),
                        require.resolve('./nanachi-loader/loaders/nanachiStyleLoader'),
                    ]
                }
            ]
        },
        plugins: [
            // new CleanWebpackPlugin(),
            new CopyWebpackPlugin([
                // copy assets
                {
                    from: path.resolve(cwd, 'source/assets'),
                    to: path.resolve(distPath, 'assets')
                },
                // copy core react
                {
                    from: path.resolve(cwd, 'source', REACT_LIB_MAP[platform]),
                    to: distPath
                }
            ], {
                copyUnmodified: true
            }),
            new NanachiWebpackPlugin({
                platform
            })
        ]
    };
    nanachiOptions.plugins = nanachiOptions.plugins.concat(plugins);
    nanachiOptions.entry = entry;
    const compiler = webpack(nanachiOptions);
    
    if (watch) {
        compiler.watch({}, complete);
    } else {
        compiler.run(complete);
    }
}

module.exports = nanachi;