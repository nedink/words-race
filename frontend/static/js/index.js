
// ON STARTUP
// const target_words = [
//     'coffee', 'tea', 'toast', 'milk', 'juice'
// ]
// document.getElementById('target-words').textContent = target_words.join(' ')
const target_words = document.getElementById('target-words').textContent.split(' ')

let clicks = 0



const onWordOptionClick = async event => {
    const prompt = event.srcElement.textContent
    console.log(prompt)

    const word_options = document.getElementById('word-options')
    const click_count = document.getElementById('click-count')

    click_count.innerText = `clicks: ${++clicks}`

    let found_word
    if (found_word = target_words.find(v => prompt === v)) {
        word_options.innerHTML = `
        <h1>You found <span class="special">${found_word}</span>!</h1>
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
            onSubmitScore(event, found_word)
        }
        return
    }

    word_options.innerHTML = `<div style="display: flex; align-items: center; justify-content: center;"><div class="loader"></div></div>`

    const res = await (await fetch('/prompt', {
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
    })).json()

    // const res_json = await res.json()

    let choices = [...new Set(res.map(ch => ch.text))]
    console.log(choices)
    choices = choices.filter(choice => choice.trim())

    word_options.innerHTML = ``
    for (let choice of choices) {
        word_options.innerHTML += `<div class="word-option">${choice}</div>`
    }

    const wordOptionEls = document.getElementsByClassName('word-option')
    for (let i = 0; i < wordOptionEls.length; i++) {
        wordOptionEls[i].onclick = onWordOptionClick
    }
};

const wordOptionEls = document.getElementsByClassName('word-option')
for (let i = 0; i < wordOptionEls.length; i++) {
    wordOptionEls[i].onclick = onWordOptionClick
}


let leaderboard_i = 0

// SUBMIT SCORE
const onSubmitScore = async (event, found_word) => {
    event.preventDefault();

    // const submitScoreEl = document.getElementById('submit-score')
    // submitScoreEl.innerHTML = ``

    const data = new FormData(event.target);

    const name = data.get('name');

    const placement = (await (await fetch('/leaderboard', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            word: found_word,
            clicks: clicks,
        })
        // mode: 'cors', // no-cors or cors 
        // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        // credentials: 'same-origin ',// include , same – origin 
    })).json()).placement

    const res = await (await fetch('/leaderboard?i=0')).json()

    const leaderboard = res.leaderboard

    console.log(res)

    const rowsHTML = leaderboard.map(o => `
    <tr>
        <td class="td-i">${++leaderboard_i}.</td>
        <td class="td-name">${o.name}</td>
        <td class="td-word">${o.word}</td>
        <td class="td-clicks">${o.clicks}</td>
    </tr>
    `).reduce((a, b) => a + b)

    document.getElementById('leaderboard-container').innerHTML = `
    <div>${name}: #${placement}</div><div></div>
    <table id="leaderboard">
        <thead style="width: 100%">
            <tr>
                <th class="td-i"></th>
                <th class="td-name">Name</th>
                <th class="td-word">Word</th>
                <th class="td-clicks">Clicks</th>
            </tr>
        </thead>
        <tbody id="leaderboard-table-body">
        ${rowsHTML}
        </tbody>
    </table>
    `

    if (res.end) {
        return
    }

    const nextTenButton = document.createElement('input')
    nextTenButton.setAttribute('id', 'next-ten')
    nextTenButton.setAttribute('type', 'button')
    nextTenButton.setAttribute('value', '...')
    const nextTenButtonEl = document.getElementById('scoring').appendChild(nextTenButton)
    nextTenButtonEl.onclick = nextTen
}


const nextTen = async event => {
    // const rowEls = []
    const tableBody = document.getElementById('leaderboard-table-body')

    const json = await (await fetch(`/leaderboard?i=${leaderboard_i}`)).json()
    const leaderboard = json.leaderboard
    const end = json.end

    for (let o of leaderboard) {
        const newRow = document.createElement('tr')
        newRow.innerHTML = `
        <td class="td-i">${++leaderboard_i}</td>
        <td class="td-name">${o.name}</td>
        <td class="td-word">${o.word}</td>
        <td class="td-clicks">${o.clicks}</td>`
        tableBody.appendChild(newRow)
    }
    if (leaderboard_i >= leaderboard.length) {
        event.srcElement.remove()
    }

}