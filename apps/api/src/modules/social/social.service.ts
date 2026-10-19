import { SocialRepository } from './social.repository.js';
import { config } from '../../config/index.js';
import { logger } from '../../lib/logger.js';

export class SocialService {
  constructor(private repo = new SocialRepository()) {}

  async getFeed() {
    return this.repo.getFeed();
  }

  async getPhotos() {
    return this.repo.getPhotos();
  }

  async getEvents(upcoming?: boolean) {
    return this.repo.getEvents(upcoming);
  }

  async getStatus() {
    const fb = await this.repo.getSyncState('FACEBOOK');
    return {
      facebook: fb || { status: 'IDLE', hasToken: !!config.FB_PAGE_TOKEN },
      embedConfig: {
        pageUrl: `https://www.facebook.com/${config.FB_PAGE_ID || 'NirakarVidyalay'}/`,
        hasToken: !!config.FB_PAGE_TOKEN,
      },
    };
  }

  async syncFacebook(): Promise<{ synced: number; status: string }> {
    if (!config.FB_PAGE_TOKEN) {
      logger.info('No FB_PAGE_TOKEN configured; falling back to official Facebook Page Plugin embeds');
      await this.repo.updateSyncState('FACEBOOK', 'IDLE', 0, 'No page token configured, embeds active');
      return { synced: 0, status: 'token_missing_embed_active' };
    }

    try {
      await this.repo.updateSyncState('FACEBOOK', 'SYNCING');
      // Fetch Page feed from official Graph API
      const pageId = config.FB_PAGE_ID || 'NirakarVidyalay';
      const url = `https://graph.facebook.com/v19.0/${pageId}/posts?fields=id,message,created_time,permalink_url,full_picture&access_token=${config.FB_PAGE_TOKEN}&limit=25`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Graph API returned HTTP ${response.status}: ${await response.text()}`);
      }

      const json = await response.json();
      const posts = json.data || [];
      let count = 0;

      for (const p of posts) {
        await this.repo.upsertItem({
          source: 'FACEBOOK',
          externalId: p.id,
          type: 'POST',
          text: p.message || null,
          mediaUrl: p.full_picture || null,
          permalink: p.permalink_url,
          publishedAt: new Date(p.created_time),
        });
        count++;
      }

      await this.repo.updateSyncState('FACEBOOK', 'SUCCESS', count);
      return { synced: count, status: 'success' };
    } catch (err: any) {
      logger.error({ err }, 'Facebook Graph API sync failed');
      await this.repo.updateSyncState('FACEBOOK', 'ERROR', 0, err.message);
      throw err;
    }
  }
}
