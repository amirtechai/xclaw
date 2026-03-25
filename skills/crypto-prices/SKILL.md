---
name: crypto-prices
description: "Get real-time cryptocurrency prices, market data, and portfolio tracking. Use when: user asks about crypto prices, BTC/ETH/altcoin prices, market cap, price changes, portfolio value. No API key needed for basic queries."
homepage: https://api.coingecko.com/api/v3
metadata:
  {
    "xclaw":
      {
        "emoji": "₿",
        "requires": { "bins": ["curl", "jq"] },
      },
  }
---

# Crypto Prices Skill

Real-time crypto market data using free public APIs.

## When to Use

✅ **USE this skill when:**
- "What's the Bitcoin price?"
- "How is ETH doing?"
- "Show me top 10 cryptos"
- "What's the market cap of Solana?"
- "BTC price in EUR"
- "Is crypto pumping or dumping?"

## Commands

### Single Coin Price
```bash
# Bitcoin price in USD
curl -s "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,try&include_24hr_change=true&include_market_cap=true" | jq '.'

# Multiple coins at once
curl -s "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,cardano&vs_currencies=usd&include_24hr_change=true" | jq '.'
```

### Top Coins by Market Cap
```bash
curl -s "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false" | jq '.[] | {rank: .market_cap_rank, name: .name, symbol: .symbol, price: .current_price, change_24h: .price_change_percentage_24h, market_cap: .market_cap}'
```

### Coin ID Lookup
```bash
# Find coin ID by name/symbol
curl -s "https://api.coingecko.com/api/v3/search?query=<NAME>" | jq '.coins[:5] | .[] | {id: .id, name: .name, symbol: .symbol}'
```

### Price History
```bash
# 7-day price history
curl -s "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7" | jq '.prices[-1]'
```

## Common Coin IDs
| Coin | API ID |
|------|--------|
| Bitcoin | bitcoin |
| Ethereum | ethereum |
| BNB | binancecoin |
| Solana | solana |
| XRP | ripple |
| USDC | usd-coin |
| DOGE | dogecoin |
| ADA | cardano |
| AVAX | avalanche-2 |
| MATIC | matic-network |

## Response Format

Always show:
- Current price in requested currency (default: USD)
- 24h change % with 📈/📉 emoji
- Market cap if requested

Format prices cleanly: $42,350 not 42350.23456789
