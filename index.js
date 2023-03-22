const axios = require('axios');
const crypto = require('crypto');
const express = require("express");
const { sign } = require("./Signer.js");
const Signer = require("./Signer2.js");
const Utils = require("./Utils");
const app = express();
app.use(express.json());

app.post("/xbogus", async (req, res) => {
  try {
    const { url, userAgent } = req.body;

    if (!url || !userAgent) {
      throw new Error("Missing required parameters.");
    }

    const query = url.includes("?") ? url.split("?")[1] : "";
    const xbogus = sign(query, userAgent);
    const newUrl = `${url}&X-Bogus=${xbogus}`;
    const [xbogusToken, ttwid] = await Promise.all([msToken(107), getTtwid()]);

    res.status(200).json({
      code: 200,
      msg: "success",
      data: {
        xbogus: xbogus,
        mstoken: xbogusToken,
        ttwid: ttwid,
        url: newUrl
      }
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ code: 201, msg: err.message });
  }
});
app.post("/signature", async (req, res) => {
  try {
    const { url } = req.body;
    const signer = new Signer();
    if (!url) {
      throw new Error("Missing required parameters.");
    }
    var data = signer.sign(url);
    data['navigator'] = signer.navigator()
    res.status(200).json({
      code: 200,
      msg: "success",
      data: data
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ code: 201, msg: err.message });
  }
});
app.get("/", (req, res) => {
  res.status(200).send(`
    <html>
      <head>
        <title>Tiktok_Signature</title>
        <style>
          body {
            background-color: #f2f2f2;
            font-family: Arial, sans-serif;
            text-align: center;
          }
          h1 {
            color: #333;
            font-size: 3rem;
            margin-top: 3rem;
          }
          p {
            color: #666;
            font-size: 1.5rem;
            margin-top: 1.5rem;
          }
        </style>
      </head>
      <body>
        <h1>dy_signature</h1>
      </body>
    </html>
  `);
});

function msToken(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomBytes = crypto.randomBytes(length);
  return Array.from(randomBytes, byte => characters[byte % characters.length]).join('');
}

async function getTtwid() {
  try {
    const url = 'https://ttwid.bytedance.com/ttwid/union/register/';
    const data = {
      "region": "cn",
      "aid": 1768,
      "needFid": false,
      "service": "www.ixigua.com",
      "migrate_info": { "ticket": "", "source": "node" },
      "cbUrlProtocol": "https",
      "union": true
    };
    const response = await axios.post(url, data, { headers: { 'Content-Type': 'application/json' } });
    const setCookie = response.headers['set-cookie'];
    const regex = /ttwid=([^;]+)/;
    const match = regex.exec(setCookie[0]);
    return match && match.length > 1 ? match[1] : '';
  } catch (error) {
    console.error(error);
    return '';
  }
}

app.listen(80, () => {
  console.log("Server is running on port 80");
});