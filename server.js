const express = require('express')
const path = require('path')
require('dotenv').config()

// DECLARE AND CONFIGURE SERVER
const app = express()
app.use(express.json())


// SERVE PAGES

// Whenever the path has '/static' in it, serve the `static/` dir as usual
app.use('/static', express.static(path.resolve(__dirname, 'frontend', 'static')))
// For any path, go to the root and send back index.html
app.get('/*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'index.html'))
})


// START SERVER
listener = app.listen(process.env.PORT || 3000, () => console.log(`Server running on port ${listener.address().port}`))



// SCORING
const leaderboard = []
leaderboard.push(
    {
        name: 'doug',
        clicks: 4,
    },
    {
        name: 'david',
        clicks: 3,
    },
    {
        name: 'isabel',
        clicks: 10,
    },
)

app.post('/leaderboard', (req, res) => {
    // return the leaderboard top 10 and where user has placed
    const score = req.body
    
    console.log(score)

    leaderboard.push(score)
    
    leaderboard.sort((a, b) => a.clicks - b.clicks)
    
    const placement = leaderboard.indexOf(score)

    const body = {
        placement: placement,
        leaderboard: leaderboard.slice(0, 10),
    }

    res.send(body)
})



// OPENAI CALLS
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const complete = async (p) => {

    console.log('complete(): prompt is...' + p)

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

    // completion.data.choices[0]
    // console.log(completion)
    // console.log(completion.data.choices.slice(0, 3));

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

    console.log(chosen_word)

    const choices = await complete(chosen_word)

    console.log(choices)

    res.send(choices)
})