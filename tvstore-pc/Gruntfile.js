module.exports = function (grunt) {
    grunt.initConfig({
        jade: {
            compile: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/jade',
                        src: ['**/*.jade'],
                        dest: 'build/app',
                        ext: '.html'
                    }
                ]
            }
        },
        sass: {
            compile: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/sass',
                        src: ['**/*.scss'],
                        dest: 'build/app/css',
                        ext: '.css'
                    }
                ]
            }
        },
        coffee: {
            compile: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/coffee',
                        src: ['**/*.coffee'],
                        dest: 'build/app/js',
                        ext: '.js'
                    }
                ]
            }
        },
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        src: ['package.json'],
                        dest: 'build'
                    },
                    {
                        expand: true,
                        cwd: 'lib',
                        src: ['**'],
                        dest: 'build/app/lib'
                    },
                    {
                        expand: true,
                        cwd: 'src/js',
                        src: ['**.js'],
                        dest: 'build/app/js/'
                    }
                ]
            }
        },
        watch: {
            jade: {
                files: ['src/**/*.jade'],
                tasks: ['jade']
            },
            sass: {
                files: ['src/sass/**/*.scss'],
                tasks: ['sass']
            },
            coffee: {
                files: ['src/coffee/**/*.coffee'],
                tasks: ['coffee']
            },
            copy: {
                files: ['lib/**', 'package.json', 'src/js/**'],
                tasks: ['copy']
            }
        }
    });

    // 加载任务
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks("grunt-contrib-sass");
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-coffee');

    // 定义任务
};