import type { Buffer } from 'node:buffer';
import axios from 'axios';
import type { VKApi } from 'node-vk-sdk';
import { Context, InputFile } from 'grammy';
import type {
    PhotosPhoto,
    PhotosPhotoSizes,
} from '@vk';

import { BotCommand } from '@/modules/bot/BotCommand';

function findLargestPhotoSize(photo: PhotosPhoto) {
    return photo.sizes!
    .sort((a: PhotosPhotoSizes, b: PhotosPhotoSizes) => b.width - a.width)
    .at(0)!;
}

export default class TimetableCommand implements BotCommand {
    command = 'latest';
    description = 'Отправляет последнее расписание';

    readonly #apiClient: VKApi;

    constructor(apiClient: VKApi) {
        this.#apiClient = apiClient;
    }

    async action(ctx: Context) {
        const wall = await this.#apiClient.wallGet({
            domain: 'ulg_timetable',
            // owner_id: '-222994531',
            count: 1,
        });

        const latestWall = wall.items.at(0);

        if (!latestWall) {
            return ctx.reply('Расписаний нет.');
        }

        // TODO: add checks instead of !'s
        for (const attachment of latestWall.attachments) {
            const photoUrl = findLargestPhotoSize(attachment.photo as PhotosPhoto).url!;
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
