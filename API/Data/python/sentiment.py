from transformers import pipeline
import json
import sys

pipe = pipeline("text-classification", model="Sigma/financial-sentiment-analysis", top_k=None)

def analyze_sentiment(news_list, positive_threshold=0.2, negative_threshold=-0.2):
    """
    Analyze sentiment for a list of news articles using titles
    """
    if not news_list:
        return {"signal": "neutral", "score": 0, "article_count": 0}
    
    total_score = 0.0
    article_count = 0
    
    for article in news_list:
        try:
            # Just use the title for sentiment analysis
            text = article.get('title', '')
            
            if text and text.strip():
                result = pipe(text)
                article_count += 1
                
                neg_score = 0
                neu_score = 0 
                pos_score = 0
                
                for item in result[0]:
                    label = item['label']
                    score = item['score']

                    if label == 'LABEL_0':
                        neg_score = score
                    elif label == 'LABEL_1':
                        neu_score = score
                    elif label == 'LABEL_2':
                        pos_score = score

                # Calculate the weighted score
                weighted_score = (-1 * neg_score) + (0 * neu_score) + (1 * pos_score)
                total_score += weighted_score
                
        except Exception as error:
            print(f'Error analyzing sentiment for article: {error}', file=sys.stderr)

    if article_count == 0:
        return {"signal": "neutral", "score": 0, "article_count": 0}
    
    avg_score = total_score / article_count
    
    signal = "neutral"
    if avg_score > positive_threshold:
        signal = "positive"
    elif avg_score < negative_threshold:
        signal = "negative"

    return {"signal": signal, "score": round(avg_score, 4), "article_count": article_count}

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python sentiment.py <symbol> <news_file>", file=sys.stderr)
        sys.exit(1)
    
    symbol = sys.argv[1]
    news_file = sys.argv[2]
    
    try:
        with open(news_file, 'r', encoding='utf-8') as f:
            news_data = json.load(f)
        
        result = analyze_sentiment(news_data)
        print(json.dumps(result))
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)