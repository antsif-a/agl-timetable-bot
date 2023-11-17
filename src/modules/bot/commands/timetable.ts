import { VKApi } from 'node-vk-sdk';
import { Context, InputFile } from 'grammy';
import { BotCommand } from '@/modules/bot/bot-command';
import {
    PhotosPhoto,
    PhotosPhotoSizes,
} from 'node-vk-sdk/distr/src/generated/Models';
import axios from 'axios';
import { Buffer } from 'node:buffer';

function findLargestPhotoSize(photo: PhotosPhoto) {
    return photo.sizes
    .sort((a: PhotosPhotoSizes, b: PhotosPhotoSizes) => b.width - a.width)
    .at(0)!;
}

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

        for (const attachment of latestWall.attachments) {
            const photoUrl = findLargestPhotoSize(attachment.photo).url;
            const image = new InputFile(() =>
                axios.get(photoUrl, {
                    responseType: 'arraybuffer'
                }).then((res) => res.data as Buffer));
            await ctx.replyWithPhoto(image);
        }

        if (latestWall.text) {
            await ctx.reply(latestWall.text);
        }
    }
}
