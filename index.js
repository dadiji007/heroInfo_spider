var request = require("request");
var cheerio = require("cheerio");
var async = require('async');
var fs = require('fs');
var iconv = require('iconv-lite')

//引入url数据
const allHeroUrl = require('./allHeroUrl')

// 基础分类
const fileName = '英雄列表'
const type = {
    '1': '战士',
    '2': '法师',
    '3': '坦克',
    '4': '刺客',
    '5': '射手',
    '6': '辅助'
}

//爬取英雄详情
function fetchHTML(body,callback) {

    //处理网站编码
    const buf = iconv.decode(body, 'gbk')
    const $ = cheerio.load(buf)

    //爬取的内容
    const titile = $('.hero-attribute>p').eq(0).text()
    const name = $('.hero-attribute>p').eq(1).text()
    const banner = $('.header-hero>img').eq(0).attr('src')
    const usageTips = $('.use-skills').eq(0).text()
    const battleTips = $('.use-skills').eq(1).text()
    const teamTips = $('.use-skills').eq(2).text()

    //categories处理
    const categories = $('.hero-attribute>p').eq(2).attr('data-herotype').split('/').map(el => type[el])
    if (categories[1] === undefined) categories.splice(1, 1)

    //partners
    const partners = []
    $('.rela-text').each(function (i, el) {
        if (i > 1) return false
        partners.push({
            hero: el.children[0].data.split('：', 1).toString(),
            description: el.children[0].data
        })
    })

    //skills
    const skills = []
    const sIcon = []
    const sName = []
    const description = []
    const tips = []
    const delay = []
    const cost = []

    $('.controller>li>img').each(function (i, el) {
        sIcon[i] = el.attribs.src
    })
    $('.plus-name').each(function (i, el) {
        if (i > $('.plus-name').length - 2) {
            return false
        }
        sName[i] = el.children[0].data
    })
    $('.plus-int').each(function (i, el) {
        if (i > $('.plus-int').length - 2) {
            return false
        }
        description[i] = el.children[0].data
    })
    $('.prompt').each(function (i, el) {
        if (i > 3) { return false }
        tips[i] = el.children[0].data
    })
    $('.plus-value').each(function (i, el) {
        if (i > $('.plus-value').length - 2) { return false }
        delay[i] = el.children[0].data.split(/[： ]/)[1]
        cost[i] = el.children[0].data.split(/[：)]/)[2]
    })

    for (let i = 0; i < 4; i++) {
        skills.push({
            icon: sIcon[i],
            name: sName[i],
            description: description[i],
            tips: tips[i],
            delay: delay[i],
            cost: cost[i],
        })
    }

    const input = {
        titile: titile,
        name: name,
        banner: banner,
        usageTips: usageTips,
        battleTips: battleTips,
        teamTips: teamTips,
        categories: categories,
        partners: partners,
        skills: skills
    }

    //添加进文档
    fs.appendFileSync(fileName + '.json', JSON.stringify(input)+',')

    //慢一点
    const time = (Math.random() * 12) * 1000

    setTimeout(function () {
        // eslint-disable-next-line no-console
        console.log(name + '的信息已爬取')
        callback()
    }, time)

}

//爬取新闻资讯


//异步请求，防止被封
async.mapLimit(allHeroUrl, 5, function (url, callback) {

    //请求设置
    const options = {
        url: url,
        methods: 'Get',
        encoding: null,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.93 Safari/537.36"
        }
    }

    request(options, function (err, res, body) {

        //失败
        if (err) {
            // eslint-disable-next-line no-console
            console.log('爬取失败', err)
        }

        //请求成功
        if (res.statusCode == 200) {
            fetchHTML(body,callback)
        }
    })
})



