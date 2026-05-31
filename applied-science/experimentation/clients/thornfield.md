# Thornfield & Co

Mid-market apparel retailer, ~$40M annual online revenue. Sells across the US and Canada. The main drop-off is between the product page and checkout.

```json
{
  "company": "Thornfield & Co",
  "industry": "e-commerce",
  "pages": [
    {
      "name": "Homepage",
      "dau": 18000,
      "baseline_conversion_rate": 0.031,
      "revenue_per_conversion": 0,
      "target_lift": 0.08
    },
    {
      "name": "Product page",
      "dau": 9400,
      "baseline_conversion_rate": 0.042,
      "revenue_per_conversion": 0,
      "target_lift": 0.10
    },
    {
      "name": "Checkout",
      "dau": 2800,
      "baseline_conversion_rate": 0.69,
      "revenue_per_conversion": 185,
      "target_lift": 0.05
    }
  ],
  "assumptions": {
    "win_rate": 0.25,
    "significance_threshold": 0.95,
    "statistical_power": 0.80
  }
}
```
