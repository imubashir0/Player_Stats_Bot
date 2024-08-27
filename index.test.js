// tests/index.test.js
const { Client, GatewayIntentBits } = require('discord.js');
const { exchangeCodeForAccessToken, exchangeNpssoForCode, makeUniversalSearch, getUserTrophiesEarnedForTitle } = require('psn-api');
const { fetchTrophiesForTitle } = require('../index'); // Import function from your main bot file
require('dotenv').config();

// Mock Discord Client
jest.mock('discord.js', () => {
  const originalModule = jest.requireActual('discord.js');
  return {
    ...originalModule,
    Client: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      login: jest.fn(),
      once: jest.fn(),
    })),
  };
});

// Mock PSN API functions
jest.mock('psn-api', () => ({
  exchangeCodeForAccessToken: jest.fn(),
  exchangeNpssoForCode: jest.fn(),
  makeUniversalSearch: jest.fn(),
  getUserTrophiesEarnedForTitle: jest.fn(),
}));

describe('Player Stats Bot Unit Tests', () => {
  let client;
  let message;

  beforeEach(() => {
    client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

    // Mock Discord message object
    message = {
      content: '!gamestats me',
      author: {
        id: 'test-user-id',
      },
      channel: {
        send: jest.fn(), // Mock the send function
      },
    };
  });

  it('should respond to the !gamestats me command with the user\'s PlayStation stats', async () => {
    // Mocking PSN API responses
    exchangeNpssoForCode.mockResolvedValue('mockAccessCode');
    exchangeCodeForAccessToken.mockResolvedValue({ accessToken: 'mockAccessToken' });
    makeUniversalSearch.mockResolvedValue({
      domainResponses: [
        {
          results: [
            {
              socialMetadata: {
                accountId: 'mockAccountId',
              },
            },
          ],
        },
      ],
    });

    getUserTrophiesEarnedForTitle.mockResolvedValue({
      trophies: [
        { trophyName: 'Trophy 1', earnedDate: '2024-08-01' },
        { trophyName: 'Trophy 2', earnedDate: null },
      ],
    });

    await fetchTrophiesForTitle({ accessToken: 'mockAccessToken' }, 'mockAccountId', 'mockNpCommunicationId');

    // Simulate receiving the message in the Discord server
    client.emit('messageCreate', message);

    // Expect the bot to send a response
    expect(message.channel.send).toHaveBeenCalledWith(expect.stringContaining('Trophy 1: Earned on 2024-08-01'));
    expect(message.channel.send).toHaveBeenCalledWith(expect.stringContaining('Trophy 2: Not earned'));
  });
});
