import { HomeRepository } from './home.repository.js';
import { memoryCache } from '../../lib/cache.js';

export class HomeService {
  constructor(private repo = new HomeRepository()) {}

  async getHomeData() {
    const cached = memoryCache.get('home_aggregate');
    if (cached) return cached;

    const payload = await this.repo.getHomepagePayload();
    memoryCache.set('home_aggregate', payload, 60); // 60s TTL
    return payload;
  }
}
