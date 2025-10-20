import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-fin-ed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fin-ed.component.html',
  styleUrl: './fin-ed.component.css'
})
export class FinEdComponent {

  financialRatios = [
    {
      category: 'Core Financial Health Metrics',
      ratios: [
        {
          name: 'Return on Equity (ROE)',
          description: 'Measures how efficiently a company uses shareholders\' equity to generate profits.',
          formula: 'Net Income / Shareholders\' Equity × 100%',
          interpretation: 'Higher ROE (typically >15%) indicates better efficiency in using investors\' capital. However, extremely high values may suggest excessive leverage or unsustainable practices.',
          scoringLogic: 'Scores up to 20 points, with higher scores for ROE values above 15%.',
          example: 'If a company has $100M in net income and $500M in equity, ROE = 20%, which is considered excellent.'
        },
        {
          name: 'Return on Assets (ROA)',
          description: 'Shows how efficiently a company uses its total assets to generate earnings.',
          formula: 'Net Income / Total Assets × 100%',
          interpretation: 'Higher ROA (typically >5%) indicates better asset utilization. Varies significantly by industry - capital-intensive industries typically have lower ROA.',
          scoringLogic: 'Scores up to 15 points, with higher scores for ROA values above 5%.',
          example: 'If a company has $50M in net income and $1B in assets, ROA = 5%, which is generally good.'
        },
        {
          name: 'Debt-to-Equity Ratio',
          description: 'Compares a company\'s total debt to its shareholders\' equity, showing financial leverage.',
          formula: 'Total Debt / Shareholders\' Equity',
          interpretation: 'Lower ratios (<1.0) generally indicate less financial risk. However, too little debt might mean missed growth opportunities.',
          scoringLogic: 'Scores up to 10 points, with higher scores for lower debt-to-equity ratios.',
          example: 'A ratio of 0.5 means the company has $0.50 in debt for every $1 of equity - typically considered conservative.'
        },
        {
          name: 'Current Ratio',
          description: 'Measures a company\'s ability to pay short-term obligations within one year.',
          formula: 'Current Assets / Current Liabilities',
          interpretation: 'A ratio between 1.5-3.0 typically indicates good short-term financial strength. Values below 1.0 suggest potential liquidity problems.',
          scoringLogic: 'Scores up to 10 points, with higher scores for current ratios between 1.5-3.0.',
          example: 'A current ratio of 2.0 means the company has $2 in current assets for every $1 in short-term liabilities.'
        },
        {
          name: 'Positive Equity',
          description: 'Indicates whether a company has more assets than liabilities.',
          formula: 'Shareholders\' Equity > 0',
          interpretation: 'Positive equity is fundamental to financial health. Negative equity may signal serious financial distress.',
          scoringLogic: 'Scores 10 points for positive equity, 0 for negative equity.',
          example: 'Companies with negative equity have more liabilities than assets, which is typically a major red flag.'
        }
      ]
    },
    {
      category: 'Valuation Metrics',
      ratios: [
        {
          name: 'Price-to-Book Ratio (P/B)',
          description: 'Compares a company\'s market value to its book value.',
          formula: 'Market Price per Share / Book Value per Share',
          interpretation: 'Lower values (<1.5) may indicate undervaluation, while higher values might suggest overvaluation or exceptional growth expectations.',
          scoringLogic: 'Scores up to 14 points, with higher scores for lower P/B ratios.',
          example: 'A P/B of 0.8 means the company trades at 80% of its book value, potentially signaling undervaluation.'
        },
        {
          name: 'Earnings Yield',
          description: 'The inverse of the P/E ratio, showing earnings as a percentage of price.',
          formula: 'Earnings Per Share / Share Price × 100%',
          interpretation: 'Higher values (>4%) generally indicate better value. Comparable to bond yields as an investment return metric.',
          scoringLogic: 'Scores up to 13 points, with higher scores for higher earnings yields.',
          example: 'If a stock costs $100 and earns $8 per share, the earnings yield is 8%, which is attractive compared to many fixed-income investments.'
        }
      ]
    },
    {
      category: 'Quality Metrics',
      ratios: [
        {
          name: 'Market Capitalization',
          description: 'The total market value of a company\'s outstanding shares.',
          formula: 'Share Price × Total Outstanding Shares',
          interpretation: 'Larger companies (>$10B) typically offer more stability but potentially lower growth. Small caps (<$2B) may offer higher growth but with increased volatility.',
          scoringLogic: 'Scores up to 8 points, with higher scores for larger market caps.',
          example: 'A company with 1 billion shares at $50 each has a market cap of $50 billion, considered a large-cap stock.'
        }
      ]
    },
    {
      category: 'Additional Key Ratios',
      ratios: [
        {
          name: 'Price-to-Earnings Ratio (P/E)',
          description: 'Compares a company\'s share price to its earnings per share.',
          formula: 'Share Price / Earnings Per Share',
          interpretation: 'Lower values may indicate better value, though interpretation varies widely by industry, growth rate, and market conditions.',
          example: 'A P/E of 15 means investors are willing to pay $15 for $1 of current earnings.'
        },
        {
          name: 'Book Value per Share',
          description: 'The net asset value of a company on a per-share basis.',
          formula: '(Total Assets - Total Liabilities) / Outstanding Shares',
          interpretation: 'Represents the minimum value of a company\'s equity. Comparing to market price helps assess valuation.',
          example: 'If a company has $1B in assets, $400M in liabilities, and 100M shares, the book value is $6 per share.'
        }
      ]
    }
  ];
}
