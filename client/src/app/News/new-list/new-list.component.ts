import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface NewsItem {
  id: number;
  title: string;
  summary?: string;
  description?: string;
  imageUrl?: string;
  source: string;
  publishedAt: Date;
  category?: string;
  isBookmarked?: boolean;
  url?: string;
}

@Component({
  selector: 'app-new-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './new-list.component.html',
  styleUrls: ['./new-list.component.css']
})
export class NewListComponent implements OnInit {
  newsList: NewsItem[] = [];
  hasMoreNews = true;
  isLoading = false;

  ngOnInit(): void {
    this.loadSampleData();
  }

  loadSampleData(): void {
    this.newsList = [
      {
        id: 1,
        title: "Federal Reserve Signals Potential Rate Cut Amid Economic Uncertainty",
        summary: "The Federal Reserve hints at possible interest rate reductions following mixed economic indicators and persistent inflation concerns. Market analysts predict significant impact on tech stocks and banking sector.",
        description: "Federal Reserve officials are considering a strategic shift in monetary policy as economic data presents a complex picture of recovery and persistent challenges.",
        imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop",
        source: "Reuters",
        publishedAt: new Date('2024-01-15T10:30:00'),
        category: "Federal Reserve",
        isBookmarked: false
      },
      {
        id: 2,
        title: "Tesla Stock Surges 12% on Q4 Delivery Numbers Beat",
        summary: "Tesla exceeded analyst expectations with record quarterly deliveries, pushing the stock to its highest level in six months. Strong performance in China and Europe markets drives growth.",
        description: "Tesla's fourth-quarter delivery numbers have exceeded Wall Street expectations, leading to a significant surge in after-hours trading.",
        imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=400&fit=crop",
        source: "Bloomberg",
        publishedAt: new Date('2024-01-15T08:45:00'),
        category: "Earnings",
        isBookmarked: true
      },
      {
        id: 3,
        title: "Cryptocurrency Market Sees Major Recovery as Bitcoin Breaks $45K",
        summary: "Bitcoin and major altcoins rally following institutional adoption news and regulatory clarity from major economies. Ethereum also gains 8% in 24-hour trading.",
        description: "The cryptocurrency market is experiencing a significant recovery phase with Bitcoin leading the charge above the $45,000 resistance level.",
        imageUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&h=400&fit=crop",
        source: "CoinDesk",
        publishedAt: new Date('2024-01-15T07:15:00'),
        category: "Crypto",
        isBookmarked: false
      }
    ];
  }

  openNewsDetail(news: NewsItem): void {
    console.log('Opening news detail for:', news.title);
    // Navigate to news detail page or open modal
  }

  toggleBookmark(news: NewsItem, event: Event): void {
    event.stopPropagation(); // Prevent card click
    news.isBookmarked = !news.isBookmarked;
    console.log('Bookmark toggled for:', news.title);
  }

  shareNews(news: NewsItem, event: Event): void {
    event.stopPropagation(); // Prevent card click
    console.log('Sharing news:', news.title);
    
    if (navigator.share) {
      navigator.share({
        title: news.title,
        text: news.summary,
        url: window.location.href
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(`${news.title} - ${window.location.href}`);
    }
  }

  loadMoreNews(): void {
    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      const moreNews: NewsItem[] = [
        {
          id: 4,
          title: "Apple Reports Record Services Revenue Despite iPhone Sales Decline",
          summary: "Apple's services division continues to show strong growth while hardware sales face headwinds in key markets.",
          imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=400&fit=crop",
          source: "CNBC",
          publishedAt: new Date('2024-01-14T16:20:00'),
          category: "Earnings",
          isBookmarked: false
        },
        {
          id: 5,
          title: "Oil Prices Climb on Middle East Tensions and Supply Concerns",
          summary: "Crude oil futures rise as geopolitical tensions escalate and OPEC+ maintains production cuts.",
          imageUrl: "https://images.unsplash.com/photo-1566228015668-4c45dbc4e2f5?w=800&h=400&fit=crop",
          source: "Wall Street Journal",
          publishedAt: new Date('2024-01-14T14:10:00'),
          category: "Commodities",
          isBookmarked: false
        }
      ];

      this.newsList = [...this.newsList, ...moreNews];
      this.isLoading = false;
      
      // Simulate no more news after this load
      this.hasMoreNews = false;
    }, 1500);
  }
}
