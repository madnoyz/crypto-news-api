const admin = require("firebase-admin")
const functions = require("firebase-functions")
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const cors = require('cors')

const app = express()
app.use(cors({origin: true}))

const newspapers = [
    {
        name: 'associatedpress',
        address: 'https://apnews.com/hub/cryptocurrency',
        base: 'https://apnews.com/'
    },
    {
        name: 'benzinga',
        address: 'https://www.benzinga.com/markets/cryptocurrency',
        base: ''
    },
    {
        name: 'geekwire',
        address: 'https://www.geekwire.com/tag/cryptocurrency/',
        base: ''
    },
    {
        name: 'cnbc',
        address: 'https://www.cnbc.com/',
        base: ''
    },
    {
        name: 'businessinsider',
        address: 'https://markets.businessinsider.com/cryptocurrencies',
        base: ''
    },
    {
        name: 'reuters',
        address: 'https://www.reuters.com/business/future-of-money/',
        base: ''
    },

]
const articles = []


newspapers.forEach(newspaper => {
    axios.get(newspaper.address)
        .then((response) => {
            const html = response.data
            const $ = cheerio.load(html)

            $('a:contains("bitcoin")', html).each(function () {
                const title = $(this).text().replace(/\n/g, '').trim()
                const url = $(this).attr('href')
                articles.push({
                    title,
                    url: newspaper.base + url,
                    source: newspaper.name
                })
            })

            $('a:contains("crypto")', html).each(function () {
                const title = $(this).text().replace(/\n/g, '').trim()
                const url = $(this).attr('href')
                articles.push({
                    title,
                    url: newspaper.base + url,
                    source: newspaper.name
                })
            })

        }).catch((err) => console.log(err))
})



app.get('/', (req, res) => {
    res.json("Welcome to Crypto News Wire API")
})

app.get('/news', (req, res) => {
    res.json(articles)
})

app.get('/news/:newspaperId', (req,res) => {
    const newspaperId = req.params.newspaperId
    const newspaperAddress = newspapers.filter(newspaper => newspaper.name === newspaperId)[0].address
    const newspaperBase = newspapers.filter(newspaper => newspaper.name === newspaperId)[0].base
    axios.get(newspaperAddress)
        .then((response) => {
            const html = response.data
            const $ = cheerio.load(html)

            const specificArticles = []

            $('a:contains("bitcoin")', html).each(function() {
                const title = $(this).text().replace(/\n/g, '').trim()
                const url = $(this).attr('href')
                specificArticles.push({
                    title,
                    url: newspaperBase + url,
                    source: newspaperId
                })
            })

            $('a:contains("crypto")', html).each(function() {
                const title = $(this).text().replace(/\n/g, '').trim()
                const url = $(this).attr('href')
                specificArticles.push({
                    title,
                    url: newspaperBase + url,
                    source: newspaperId
                })
            })

            res.json(specificArticles)
        }).catch((err) => console.log(err))
})

exports.expressApi = functions.https.onRequest(app);
