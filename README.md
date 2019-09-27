## heroInfo_spider

###准备
```javascript
var request = require("request");
var cheerio = require("cheerio");
var async = require('async');
var fs = require('fs');
var iconv = require('iconv-lite')
```

###处理
```javascript
#设置爬虫方法
function fetchHTML(body, callback){
    
    //处理网站编码
    //iconv，将请求url的html内容进行重编码
    //cheerio，将html内容通过jquery的方式进行操作
    const buf = iconv.decode(body, 'gbk')
    const $ = cheerio.load(buf)
    
    #code...
    
    //将爬取内容添加进文档（异步方式）
    fs.appendFileSync(fileName + '.json', JSON.stringify(input)+',')
    
    //放慢步调
    const time = (Math.random() * 12) * 1000

    setTimeout(function () {
        console.log(name + '的信息已爬取')
        callback()
    }, time)   
}
```

###请求处理
```javascript
#使用异步方式处理（防止被当做ip而已访问）
#allHeroUrl，请求url
#5，最大并发数
#function (url, callback){}，每个url执行的函数，切记callbak()
async.mapLimit(allHeroUrl, 5, function (url, callback) {

    //请求头设置
    const options = {
        url: url,
        methods: 'Get',
        encoding: null,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.93 Safari/537.36"
        }
    }

    //发送请求
    request(options, function (err, res, body) {

        //失败
        if (err) {
            console.log('爬取失败', err)
        }

        //请求成功时实行
        if (res.statusCode == 200) {
            fetchHTML(body,callback)
        }
    })
})
```

###总结
```
以上步骤最后完成，将能够在终端目录下生产 .json文件
具体爬取 #code 需要根据网页情况进行处理（大多在服务端js、json等文件中查询）

```