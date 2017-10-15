import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import pkg from './package.json';

export default [
    {
        input: 'src/index.js',
        output: {
            file: `dist/${pkg.name}.min.js`,
            format: 'umd',
            name: 'LinkageSelector'
        },
        plugins: [
            babel({
                exclude: 'node_modules/**'
            }),
            uglify({
                output: {
                    comments: /^!/
                }
            })
        ],
        banner: `/*! ${pkg.name}.min.js v${pkg.version} ${pkg.homepage} */`,
        watch: {
            include: 'src/**'
        }
    },
    {
        input: 'src/jquery.js',
        output: {
            file: `dist/jquery.${pkg.name}.min.js`,
            format: 'umd',
            name: 'LinkageSelector'
        },
        plugins: [
            babel({
                exclude: 'node_modules/**'
            }),
            uglify({
                output: {
                    comments: /^!/
                },
                ie8: true
            })
        ],
        external: ['jquery'],
        globals: {
            jquery: 'jQuery'
        },
        banner: `/*! jquery.${pkg.name}.min.js v${pkg.version} ${pkg.homepage} */`,
        watch: {
            include: 'src/**'
        }
    }
];
