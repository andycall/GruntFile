# GruntFile
Grunt 自动化配置


### 安装

```
npm install
```


具有3个任务

```
grunt
```

先编译src下面less和js文件， 保留文件注释， 和回车。 便于开发， 然后开启browserSync

```
grunt build
```

只开启进行文件编译


```
grunt publish
```

压缩css和js文件，移除所有的注释。