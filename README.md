# Crawl-o-matic 9000

## Requirements

The projects require Node version >= 16.14.0

## Setup and Start

1. In the root run `npm run setup` - this will run `npm install` in the two sub-projects.

2. In the root run `npm start` - this will start both the services.

3. Start a crawl by visiting `http://localhost:8081/start-crawl?url=<your url here>`

4. View crawl results by visiting `http://localhost:8081/crawl-status?url=<your url here>` (This is a nice [Chrome extension](https://chrome.google.com/webstore/detail/json-formatter/bcjindcccaagfpapjjmafapmmgkkhgoa) for json formatting if you need one)
