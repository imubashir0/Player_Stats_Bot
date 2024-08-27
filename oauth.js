const express = require('express');
const axios = require('axios');
const qs = require('qs');

const app = express();
const port = 3000;

app.get('/auth', (req, res) => {
    const authUrl = `https://ca.account.sony.com/api/authz/v3/oauth/authorize?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&scope=psn:mobile.v2.core`;
    res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
    const { code } = req.query;

    const tokenUrl = 'https://ca.account.sony.com/api/authz/v3/oauth/token';
    const data = qs.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.REDIRECT_URI,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
    });

    try {
        const response = await axios.post(tokenUrl, data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        const { access_token, refresh_token } = response.data;
        // Save tokens or proceed to get NPSSO token
        res.send(`Access Token: ${access_token}, Refresh Token: ${refresh_token}`);
    } catch (error) {
        console.error(error);
        res.send('Error retrieving tokens');
    }
});

app.listen(port, () => {
    console.log(`OAuth server listening at http://localhost:${port}`);
});
