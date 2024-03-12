import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = 'https://hdrezka1rffqk.org/ajax/get_cdn_series/?t={}'

function clearTrash(data) {
    const trashList = ["@", "#", "!", "^", "$"];
    let trashCodesSet = [];
    for (let i = 2; i <= 3; i++) {
        var startchar = ''
        for (const chars of product(trashList, i)) {
            let dataBytes = startchar + chars.join(startchar);
            let trashCombo = Buffer.from(dataBytes).toString('base64');
            trashCodesSet.push(trashCombo);
        }
    }

    let arr = data.replace("#h", "").split("//_//");
    let trashString = arr.join('');

    for (let i of trashCodesSet) {
        let temp = Buffer.from(i).toString('utf-8');
        trashString = trashString.replace(temp, '');
    }

    let finalString = Buffer.from(trashString + "==", 'base64').toString('utf-8');
    return finalString;
}

function* product(arr, len) {
    if (len === void 0) len = arr.length;
    let indices = Array(len).fill(0);
    let current = Array(len).fill(null).map((_, i) => arr[indices[i]]);

    yield current;
    while (true) {
        let i = len - 1;
        for (; i >= 0; i--) {
            if (indices[i] < arr.length - 1) {
                indices[i]++;
                break;
            }
            indices[i] = 0;
        }
        if (i < 0) return;
        current = current.map((_, i) => arr[indices[i]]);
        yield current;
    }
}

async function search(message) {
    const base = 'https://rezka.ag/search/?do=search&subaction=search&q=';
    const req = message;
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
    };

    try {
        const response = await axios.get(base + req, { headers });
        const html = response.data;
        const $ = cheerio.load(html);
        const finalRes = [{
            name: $('div.b-content__inline_item').first()
                .find('div.b-content__inline_item-link a').text(),
            some_inf: $('div.b-content__inline_item').first()
                .find('div.b-content__inline_item-link div').text(),
            img_link: $('div.b-content__inline_item').first()
                .find('div.b-content__inline_item-cover img').attr('src'),
            link: $('div.b-content__inline_item').first()
                .find('div.b-content__inline_item-cover a').attr('href'),
        }];

        const inf = Object.values(finalRes[0]);
        return inf[3];
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function getUrls(filmId) {
    const payload = {
        'id': filmId,
        'translator_id': '1',
        // 'season': season,
        // 'episode': episode,
        'action': 'get_movie' // get_stream
    };
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
    };
    const url = `${BASE_URL}/${parseInt(Date.now() / 1000)}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: new URLSearchParams(payload)
        });

        if (response.status !== 200) {
            console.error('Ошибка');
            return;
        }

        const data = await response.json();

        if (data.success !== true) {
            console.error('Ошибка');
            console.error(data);
            return;
        }

        return data.url;
    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
    }
}

function extractFilmId(url) {
    const regex = /\/films\/[^\/]+\/(\d+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

const mirrorInput = document.getElementById("mirror-input");

document.getElementById("saveMirror").addEventListener("click", function() {
    localStorage.setItem("mirror", mirrorInput.value.trim());
    console.log("saved")
});