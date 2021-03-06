const express = require('express')
const bodyParser = require('body-parser')
const requestIp = require('request-ip')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const app = express()

const helmet = require('helmet')

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = process.env.NODE_ENV !== 'production'

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const { host, port } = nuxt.options.server

  await nuxt.ready()

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  )

  app.use(bodyParser.json())
  app.use(requestIp.mw())

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true,
  })
}
start()
