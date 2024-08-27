require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { exchangeCodeForAccessToken, exchangeNpssoForCode, getTrophyGroups, getUserTitles, getUserTrophiesEarnedForTitle, makeUniversalSearch } = require('psn-api');
const express = require('express');
const axios = require('axios');
const qs = require('qs');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const app = express();
const port = 3001;

const discordToken = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;

app.get('/auth', (req, res) => {
    const authUrl = `https://ca.account.sony.com/api/authz/v3/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=psn:mobile.v2.core`;
    res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
    const { code } = req.query;

    const tokenUrl = 'https://ca.account.sony.com/api/authz/v3/oauth/token';
    const data = qs.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
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

client.once('ready', () => {
    console.log('Bot is online!');
});

const fetchTrophiesForTitle = async (auth, accountId, npCommunicationId) => {
    console.log(`Fetching trophies for npCommunicationId: ${npCommunicationId}`);
    const trophiesResponse = await getUserTrophiesEarnedForTitle(auth, accountId, npCommunicationId, "default");
    console.log('Trophies Response:', trophiesResponse);
    const trophies = trophiesResponse.trophies;

    let allTrophies = '';

    if (trophies && trophies.length > 0) {
        allTrophies += trophies.map(trophy => `${trophy.trophyName}: ${trophy.earnedDate ? `Earned on ${trophy.earnedDate}` : 'Not earned'}`).join('\n');
    }

    return allTrophies;
};
const splitMessage = (message, maxLength) => {
    const parts = [];
    while (message.length > maxLength) {
        let splitIndex = message.lastIndexOf('\n', maxLength);
        if (splitIndex === -1) splitIndex = maxLength;
        parts.push(message.slice(0, splitIndex));
        message = message.slice(splitIndex);
    }
    parts.push(message);
    return parts;
};

client.on('messageCreate', async message => {
    if (message.content.startsWith('!gamestats')) {
        const psnId = message.content.split(' ')[1];
        
        try {
            console.log('Attempting to exchange NPSSO for access code...');
            const accessCode = await exchangeNpssoForCode(process.env.NPSSO_TOKEN);
            console.log('Access code obtained:', accessCode);
            const auth = await exchangeCodeForAccessToken(accessCode);
            console.log('Auth token obtained:', auth);

            console.log(`Searching for account ID of PSN ID: ${psnId}`);
            const searchResponse = await makeUniversalSearch(auth, psnId, 'SocialAllAccounts');
            const accountId = searchResponse.domainResponses[0]?.results[0]?.socialMetadata?.accountId;

            if (!accountId) {
                message.channel.send(`No account found for PSN ID: ${psnId}`);
                return;
            }

            console.log(`Account ID obtained: ${accountId}`);

            const npCommunicationIds = [
                { name: 'EA Sports FC', npCommunicationId: 'NPWR12345_00' },
                { name: 'Grand Theft Auto V', npCommunicationId: 'NPWR06221_00' }
            ];

            let allTrophies = '';
            for (const { name, npCommunicationId } of npCommunicationIds) {
                console.log(`Fetching trophies for ${name}`);
                const trophies = await fetchTrophiesForTitle(auth, accountId,'NPWR12345_00'|'NPWR06221_00', 'all');
                if (trophies) {
                    allTrophies += `**${name}**\n${trophies}\n\n`;
                }
            }


            if (!allTrophies) {
                message.channel.send('No trophies found for the specified titles.');
            } else {
                const messages = splitMessage(allTrophies, 2000);
                for (const msg of messages) {
                    await message.channel.send(msg);
                }
            }
            
        } catch (error) {
            console.error(error);
            message.channel.send('An error occurred while fetching game stats.');
        }
    }
});

client.login(discordToken);

app.listen(port, () => {
    console.log(`OAuth server listening at http://localhost:${port}`);
});