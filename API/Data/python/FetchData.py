import yfinance as yf
import json
import sys

def fetch_etf_data(symbol):
    ticker = yf.Ticker(symbol)
    info = ticker.info

    data = {
        "symbol": symbol,
        "name": info.get("longName"),
        "info": {
            "assetClass": info.get("category"),
            "expenseRatio": get_valid_number(info.get("netExpenseRatio")),
            "sector": info.get("sector"),
            "region": info.get("region"),
            "peRatio": get_valid_number(info.get("trailingPE")),
            "fundFamily": info.get("fundFamily"),
            "exchange": info.get("fullExchangeName"),
            "summary": info.get("longBusinessSummary")
        },
        "financials": {
            "currentAssets": get_valid_number(info.get("totalCurrentAssets")),
            "currentLiabilities": get_valid_number(info.get("totalCurrentLiabilities")),
            "totalDebt": get_valid_number(info.get("totalDebt")),
            "marketCap": get_valid_number(info.get("marketCap")),
            "sharePrice": get_valid_number(info.get("regularMarketPrice")),
            "ROE": get_valid_number(info.get("returnOnEquity")),
            "ROA": get_valid_number(info.get("returnOnAssets")),
            "PriceToBook": get_valid_number(info.get("priceToBook")),
            "BookValue": get_valid_number(info.get("bookValue")),
            "dividendYield": get_valid_number(info.get("dividendYield")),
            "dividendRate": get_valid_number(info.get("dividendRate")),
            "fiftyTwoWeekHigh": get_valid_number(info.get("fiftyTwoWeekHigh")),
            "fiftyTwoWeekLow": get_valid_number(info.get("fiftyTwoWeekLow")),
            "regularMarketChange": get_valid_number(info.get("regularMarketChange")),
        
        },
        "historicalPrices": [],
        "dividends": [],
        "news": []
    }

    # Historical Prices
    try:
        hist = ticker.history(period="ytd")
        for date, row in hist.iterrows():
            # Only add entries where we have valid price data
            open_price = get_valid_number(row["Open"])
            high_price = get_valid_number(row["High"])
            low_price = get_valid_number(row["Low"])
            close_price = get_valid_number(row["Close"])
            volume = get_valid_number(row["Volume"])
            
            # Skip entries where all price data is None/NaN
            if all(price is None for price in [open_price, high_price, low_price, close_price]):
                continue
                
            data["historicalPrices"].append({
                "date": str(date.date()),
                "open": open_price,
                "high": high_price,
                "low": low_price,
                "close": close_price,
                "volume": int(volume) if volume is not None else None
            })
    except Exception as e:
        print(f"Error fetching historical data: {e}", file=sys.stderr)

    # Dividends
    try:
        dividends = ticker.dividends
        for date, val in dividends.items():
            dividend_value = get_valid_number(val)
            if dividend_value is not None:
                data["dividends"].append({
                    "date": str(date.date()),
                    "dividend": dividend_value
                })
    except Exception as e:
        print(f"Error fetching dividends: {e}", file=sys.stderr)

    # News
    try:
        news = ticker.get_news()
        if news:  # Ensure news is not empty or None
            for article in news:
                if article and "content" in article:  # Ensure 'content' exists in the article
                    content = article["content"]
                    title = content.get("title")
                    link = content.get("canonicalUrl", {}).get("url")
                    published = content.get("pubDate")
                    
                    if title and link and published:  # Ensure all required fields are present
                        data["news"].append({
                            "title": title,
                            "link": link,
                            "published": published,
                        })
    except Exception as e:
        print(f"Error fetching news: {e}", file=sys.stderr)

    return data

def get_valid_number(value):
    """
    Returns the value if it is a valid number (int or float), otherwise returns None.
    Handles Infinity and NaN values by returning None.
    """
    try:
        # Check if the value is None
        if value is None:
            return None
            
        # Check if the value is a valid number
        if isinstance(value, (int, float)):
            # Check for Infinity and NaN using string comparison and != comparison
            if str(value).lower() in ['inf', '-inf', 'infinity', '-infinity', 'nan'] or value != value:
                return None
            return value
            
        # Attempt to convert strings to numbers
        converted = float(value)
        # Check for Infinity and NaN after conversion
        if str(converted).lower() in ['inf', '-inf', 'infinity', '-infinity', 'nan'] or converted != converted:
            return None
        return converted
        
    except (ValueError, TypeError):
        return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python FetchData.py <symbol>")
        sys.exit(1)

    symbol = sys.argv[1]
    result = fetch_etf_data(symbol)
    print(json.dumps(result, indent=2))