using System;

namespace API.HelperEntities;

public class MarketauxNewsResponse

    {

        public List<NewsArticle>? Data { get; set; }

    }



    public class NewsArticle

    {

        public string? Title { get; set; }

        public string? description { get; set; }

        public string? url { get; set; }

        public DateTime? published_at { get; set; }

        public string? source { get; set; }

    }
