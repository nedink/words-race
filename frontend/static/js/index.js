
let clicks = 0

const onWordOptionClick = async event => {
    const prompt = event.srcElement.textContent
    console.log(prompt)

    const target_word = document.getElementById('target')
    const word_options = document.getElementById('word-options')
    if (prompt.includes(target_word.textContent)) {
        word_options.innerHTML = `
        <div><h1>YOU WIN!</h1></div>
        `

        // OPEN SCORE SUBMISSION
        const submitScoreEl = document.getElementById('submit-score')
        submitScoreEl.innerHTML = `
        <hr>
        <div id="submit-score-div">
            <div>Submit score?</div>
            <form id="submit-score-form">
                <input name="name" type="text" placeholder="Name" required>
                <input type="submit" value="Submit">
            </form>
        </div>
        <input type="button" value="Retry" onclick="location.reload(true)">
        <div id="leaderboard-table-div"></div>
        `
        document.getElementById('submit-score-form').onsubmit = event => {
            document.getElementById('submit-score-div').innerHTML = ``
            onSubmitScore(event)
        }
        return
    }

    word_options.innerHTML = `<div style="display: flex; align-items: center; justify-content: center;"><div class="loader"></div></div>`

    const res = await fetch('/prompt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            prompt: prompt
        })
        // mode: 'cors', // no-cors or cors 
        // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        // credentials: 'same-origin ',// include , same – origin 
    })

    const res_json = await res.json()

    let choices = [...new Set(res_json.map(ch => ch.text))]
    console.log(choices)
    choices = choices.filter(choice => choice.trim())

    word_options.innerHTML = ``
    for (let choice of choices) {
        word_options.innerHTML += `<div id="word-option-1" class="word-option special">${choice}</div>`
    }

    const wordOptionEls = document.getElementsByClassName('word-option')
    for (let i = 0; i < wordOptionEls.length; i++) {
        wordOptionEls[i].onclick = onWordOptionClick
    }

    const click_count = document.getElementById('click-count')
    click_count.innerText = `Clicks - ${++clicks}`

};

const wordOptionEls = document.getElementsByClassName('word-option')
for (let i = 0; i < wordOptionEls.length; i++) {
    wordOptionEls[i].onclick = onWordOptionClick
}



// SUBMIT SCORE
const onSubmitScore = async (event) => {
    event.preventDefault();

    // const submitScoreEl = document.getElementById('submit-score')
    // submitScoreEl.innerHTML = ``

    const data = new FormData(event.target);

    const name = data.get('name');

    const res = await (await fetch('/leaderboard', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            clicks: clicks,
        })
        // mode: 'cors', // no-cors or cors 
        // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        // credentials: 'same-origin ',// include , same – origin 
    })).json()

    const leaderboard = res.leaderboard

    console.log(res)

    const rowsHTML = leaderboard.map(o => `
    <tr>
        <td>${o.name}</td>
        <td>${o.clicks}</td>
    </tr>
    `).reduce((a, b) => a + b)

    document.getElementById('leaderboard').innerHTML = `
    <div style="background-color: antiquewhite;">#${res.placement}</div><div></div>
    <table id="leaderboard">
        <thead>
            <tr>
                <th>Leaderboard</th>
            </tr>
        </thead>
        <tbody id="leaderboard-table-body">
        ${rowsHTML}
        </tbody>
    </table>
    `

    // console.log(res);
}