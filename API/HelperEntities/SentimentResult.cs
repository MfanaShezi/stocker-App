using System;

namespace API.HelperEntities;

public class SentimentResult
{
    public required string Signal { get; set; }
    public double Score { get; set; }
    public int ArticleCount { get; set; }
}
