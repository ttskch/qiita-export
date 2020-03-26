#!/usr/bin/env node

'use strict'

const fs = require('fs')
const program = require('commander')
const Qiita = require('qiita-js')
global.Promise = require('bluebird')
require('isomorphic-fetch')

const dirName = 'qiita-export'

program
  .usage('-t {access_token}')
  .requiredOption('-t, --token <value>')
  .parse(process.argv)

Qiita.setToken(program.token)
Qiita.setEndpoint('https://qiita.com')

if (!fs.existsSync(dirName)) {
  fs.mkdirSync(dirName)
  fs.mkdirSync(`${dirName}/raw`)
  fs.mkdirSync(`${dirName}/raw/comments`)
}

const getItems = async () => {
  for (let i = 1; i < 100; i++) {
    const items = await Qiita.Resources.Item.list_authenticated_user_items({page: i, per_page: 100})
    if (!items.length) {
      break
    }
    items.forEach((item) => {
      const title = item.title.replace(/\//g, '_')
      fs.writeFileSync(`${dirName}/raw/${title}.json`, JSON.stringify(item))
      fs.writeFileSync(`${dirName}/${title}.md`, item.body)

      const getComments = async () => {
        const comments = await Qiita.Resources.Comment.list_item_comments(item.id)
        fs.writeFileSync(`${dirName}/raw/comments/${title}.json`, JSON.stringify(comments))
      }
      getComments()
    })
  }

  console.info(`exported to ./${dirName}`)
}
getItems()
