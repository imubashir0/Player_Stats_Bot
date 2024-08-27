# Player Stat Bot

The **Player Stat Bot** is a Discord bot designed to provide PlayStation game stats and trophies information directly in your Discord server. The bot uses the PlayStation Network (PSN) API to fetch player data and display it in an easy-to-read format. This application also includes an OAuth server to handle the authentication process with Sony's API.

## Table of Contents

- Overview
- Installation
- Usage
- How to Run the Bot
- Features
- License
- Contact
- Acknowledgments

## Usage

The bot is designed to provide real-time PlayStation game statistics and trophy information directly within your Discord server. It responds to specific commands entered by users in the server chat.

## How to Run the Bot

To run the bot and the integrated OAuth server, follow these steps:

**Start the OAuth Server**:

The OAuth server is required to handle the authentication with Sony's API.
Run the following command to start the OAuth server in bash:

node oauth.js

The OAuth server will start and listen on http://localhost:3000. This server will handle the OAuth flow for authenticating with Sony's API.

**Authenticate with the PSN API**:

Navigate to http://localhost:3000/auth in your web browser to initiate the OAuth authentication process. Follow the on-screen instructions to authorize the bot.

**Add your Discord Bot Token**:

Open the .env file and complete the variable with your actual Discord Bot Token provided by Discord at https://discord.com/developers/applications.

**Run the Discord Bot**:

Open another terminal window or tab and run the following command to start the Discord bot in bash:

node index.js

The bot will connect to your Discord server using the token specified in your .env file.

**Using the Bot**:

Once the bot is online, you can use the command !gamestats <PSN_ID> in your Discord server to fetch game stats for a specific PlayStation Network ID.

The bot will respond with the requested stats, including details on game trophies and achievements.

## Features

Fetch Game Stats: Retrieves and displays PlayStation game stats for a given user.

OAuth Authentication: Securely connects with the PlayStation Network to access player data.

Discord Integration: Listens for specific commands in a Discord server and responds with requested data.

Error Handling: Provides clear error messages if something goes wrong.


## License

This project is licensed under the MIT license. psn-api is not affiliated with Sony or PlayStation in any way.

## Contact

imubashir0

https://imubashir0.github.io/aboutme

## Acknowledgments

Discord.js - For providing a powerful library to interact with the Discord API.

PSN API - For enabling integration with PlayStation Network.

Vector by Kahovsky - For bot icon

Feel free to modify it further based on your needs!
