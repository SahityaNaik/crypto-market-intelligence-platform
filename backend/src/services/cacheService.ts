interface PriceData {
  [coinId: string]: {
    usd: number;
    lastUpdated: string;
  }
}

class CacheService {
  private static instance: CacheService;
  private prices: PriceData = {};

  private constructor() {}

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public setPrices(data: any) {
    const timestamp = new Date().toISOString();
    Object.keys(data).forEach(coinId => {
      this.prices[coinId] = {
        usd: data[coinId].usd,
        lastUpdated: timestamp
      };
    });
  }

  public getPrices(): PriceData {
    return this.prices;
  }
}

export const cacheService = CacheService.getInstance();
