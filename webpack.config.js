/// <binding ProjectOpened='Watch - Production' />
//var webpack = require( 'webpack' );
var glob = require( "glob" );
//console.log( files );
var entries = {};
var files = glob.sync( "./dist/*.ts" );
files.forEach( function (file) {
    //console.log( file );
    var found;
    if ( found = file.match( /\/([^\/]+)\.ts$/ ) ) {
        //console.log( '-->', found );
        entries[found[1]] = file;
    }
} );

module.exports = {
    entry: entries,
    output: {
        filename: "[name].min.js",
        path: __dirname + "/bin"
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",//"cheap-module-source-map",//"cheap-module-eval-source-map",//"source-map",//

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },
    // Add minification
    //plugins: [
    //    new webpack.optimize.UglifyJsPlugin()
    //],
    module: {
        loaders: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" }
        ],

        preLoaders: [
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { test: /\.js$/, loader: "source-map-loader" }
        ]
    },

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    externals: {
        "jquery": "jQuery",
    },
};