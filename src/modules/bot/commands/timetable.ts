import { VKApi } from 'node-vk-sdk';
import { Context } from 'grammy';
import { BotCommand } from '@/modules/bot/bot-command';

export default class TimetableCommand implements BotCommand {
    command = 'latest';
    description = 'Отправляет последнее расписание';

    constructor(
        private apiClient: VKApi,
    ) {}

    async action(ctx: Context) {
        const wall = await this.apiClient.wallGet({
            domain: 'ulg_timetable',
            // owner_id: '-222994531',
            count: 1,
        });

        const latestWall = wall.items.at(0);

        if (!latestWall) {
            return ctx.reply('Расписаний нет.');
        }

        // todo add checks

        if (latestWall.attachments && latestWall.attachments[0].photo &&
            latestWall.attachments[0].photo.sizes) {
            const sizes = latestWall.attachments[0].photo.sizes;
            const maxSize = sizes.sort((a, b) => a.width - b.width).
                reverse().
                at(0);
            await ctx.replyWithPhoto(maxSize!.url!);
        }
    }
}
