const express = require('express')
const path = require('path')
const fs = require('fs')
require('dotenv').config()

// DECLARE AND CONFIGURE SERVER
const app = express()
app.use(express.json())


// SERVE PAGES

// Whenever the path has '/static' in it, serve the `static/` dir as usual
app.use('/static', express.static(path.resolve(__dirname, 'frontend', 'static')))
// For any path, go to the root and send back index.html
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'index.html'))
})


// START SERVER
listener = app.listen(process.env.PORT || 3000, () => console.log(`Server running on port ${listener.address().port}`))



// SCORING
const leaderboard = []

app.post('/leaderboard', (req, res) => {
    // return the leaderboard top 10 and where user has placed
    const score = req.body
    // const i = req.query.i

    leaderboard.push(score)
    leaderboard.sort((a, b) => a.clicks - b.clicks)
    
    const placement = leaderboard.indexOf(score) + 1
    const body = {
        placement: placement
    }

    res.send(body)
})

app.get('/leaderboard', (req, res) => {
    // return the next 10 in the leaderboard
    const i = Number(req.query.i)
    res.send({
        leaderboard: leaderboard.slice(i, Math.min(i + 10, leaderboard.length)),
        end: i + 10 >= leaderboard.length
    })
})



// OPENAI CALLS
const { Configuration, OpenAIApi } = require("openai");
const { fstat } = require('fs')

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const complete = async (p) => {

    console.log('Completing from... ' + p)

    const completion = await openai.createCompletion(process.env.MODEL_2, {
        prompt: p + ":",
        temperature: 1,
        // max_tokens: 1,
        // top_p: 1,
        frequency_penalty: 2,
        presence_penalty: 2,
        n: 5,
        stop: ["\n"],
        logprobs: 0,
    }).catch(e => {
        // console.log(e)
    });

    const choices = completion.data.choices
        .map(choice => {
            choice.text = choice.text.trim()
            return choice
        })
        .filter(choice => choice.text.trim() && choice.text)

    return completion.data.choices
}

// ENDPOINT TO REQUEST NEW WORDS
app.post('/prompt', async (req, res) => {
    chosen_word = req.body.prompt
    const choices = await complete(chosen_word)
    res.send(choices)
})


// SEND THE DAILY WORDS
