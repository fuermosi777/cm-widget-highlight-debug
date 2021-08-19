const path = require('path');

module.exports = {
  entry: {
    main: './index.ts',
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'public'),
  },
  // devServer: {
  //   contentBase: path.join(__dirname, 'public'),
  //   compress: false,
  //   port: 7777,
  // },
};
