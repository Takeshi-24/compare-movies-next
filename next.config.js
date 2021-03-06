const withOffline = require('next-offline');
const withSass = require('@zeit/next-sass');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const webpack = require('webpack');

if (process.env.NODE_ENV !== 'production') {
  require('now-env');
}

const { ANALYZE } = process.env;

module.exports = withOffline(
  withSass({
    target: 'serverless',
    poweredByHeader: false,
    webpack: (config, { isServer }) => {
      config.plugins = config.plugins || [];

      config.plugins.push(
        new webpack.EnvironmentPlugin(['TMDB_API_KEY', 'ROLLBAR_CLIENT_KEY'])
      );

      if (ANALYZE) {
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'server',
            analyzerPort: isServer ? 8888 : 8889,
            openAnalyzer: true
          })
        );
      }

      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();
        if (
          entries['main.js'] &&
          !entries['main.js'].includes('./polyfills.js')
        ) {
          entries['main.js'].unshift('./polyfills.js');
        }
        return entries;
      };

      return config;
    },
    workboxOpts: {
      swDest: 'static/service-worker.js',
      runtimeCaching: [
        {
          urlPattern: /\.(?:png|gif|jpg|jpeg|svg|ico)$/,
          handler: 'cacheFirst',
          options: {
            cacheName: 'images'
          }
        },
        {
          urlPattern: new RegExp(
            '^(http|https)://(fonts.googleapis.com|maxcdn.bootstrapcdn.com/font-awesome)/(.*)'
          ),
          handler: 'cacheFirst',
          options: {
            cacheName: 'fonts'
          }
        },
        {
          urlPattern: /^https:\/\/www.comparemovies.info(\/?|\/c\/.+)$/,
          handler: 'networkFirst',
          options: {
            cacheName: 'pages'
          }
        }
      ]
    }
  })
);
