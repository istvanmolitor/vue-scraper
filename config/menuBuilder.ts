import { MenuBuilder, type MenuItemConfig } from '@menu/index'
import { Bot, Link } from 'lucide-vue-next'

export class ScraperMenuBuilder extends MenuBuilder {
  build(menu: MenuItemConfig, menuName: string): MenuItemConfig {
    if (menuName === 'admin') {
      this.addMenuItem(menu, {
        id: 'scraper',
        title: 'Scraper',
        icon: Bot,
        order: 95,
        permission: 'scraper',
        children: [
          {
            id: 'scraper-list',
            title: 'Scraperek',
            path: '/admin/scraper',
            icon: Bot,
            order: 10,
            permission: 'scraper'
          },
          {
            id: 'scraper-url-list',
            title: 'Scraper URL-ek',
            path: '/admin/scraper-url',
            icon: Link,
            order: 20,
            permission: 'scraper'
          }
        ]
      })
    }

    return menu
  }
}

export const scraperMenuBuilder = new ScraperMenuBuilder()
