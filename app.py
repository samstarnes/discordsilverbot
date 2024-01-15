from bs4 import BeautifulSoup
import os
import aiohttp
import discord
from discord.ext import tasks
from dotenv import load_dotenv

# Change to your file location for your .env file
load_dotenv('/home/phoenix/Programs/Discord/CryptoBots/metals/silver/.env')

TOKEN = os.getenv('DISCORD_TOKEN')
CURRENCY_SYMBOL = os.getenv('CURRENCY_SYMBOL')
UPDATE_FREQUENCY = int(os.getenv('UPDATE_FREQUENCY', 1))

intents = discord.Intents.default()
client = discord.Client(intents=intents)

@tasks.loop(minutes=UPDATE_FREQUENCY)
async def get_prices():
    print('Task started.')  # Debug message
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        }
        print('Sending request.')  # Debug message
        
        async with aiohttp.ClientSession() as session:
            async with session.get('https://m.netdania.com/commodities/xagusdoz/idc', headers=headers) as res:
                text = await res.text()
                print('Received response.')  # Debug message
                
                soup = BeautifulSoup(text, 'html.parser')
                print('Parsed HTML.')  # Debug message

                price_element = soup.find('span', {'id': 'recid-1-f6'})
                
                if price_element:
                    current_price = price_element.text
                    print('Updated price to', current_price)
                    for guild in client.guilds:
                        # Get the member object for the bot in each guild
                        member = guild.get_member(client.user.id)
                        if member:
                            # Edit bots nickname for guilds
                            await member.edit(nick=f'{CURRENCY_SYMBOL}{current_price}')
                    await client.change_presence(activity=discord.Activity(type=discord.ActivityType.watching, name=f'silver prices | XAG '))
                else:
                    print('Could not find price element.')
    except Exception as e:
        print('Error at scraping:', e)

@client.event
async def on_ready():
    print('Logged in as', client.user)
    get_prices.start()

if __name__ == '__main__':
    print('Starting bot.')  # Debug message
    client.run(TOKEN)
