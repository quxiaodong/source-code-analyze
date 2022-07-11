const glob = require('glob')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin')

const pages = []

glob.sync('./sandbox/**/*.html').forEach(file => {
  pages.push(
    new HtmlWebpackPlugin({
      filename: file,
      template: file,
      inject: 'head',
      scriptLoading: 'blocking'
    })
  )
})

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  devServer: {
    static: './'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.s[ac]ss$/,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader"
        ]
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackTagsPlugin({
      scripts: ['node_modules/vue/dist/vue.min.js'],
      append: false
    }),
    ...pages
  ]
}