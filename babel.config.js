module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: 'last 2 versions, ie 10-11',
        },
      },
    ],
  ],
}
