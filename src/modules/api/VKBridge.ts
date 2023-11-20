import { BotsLongPollUpdatesProvider, VKApi } from 'node-vk-sdk';
import type { EventHandler } from '@events';

import type {
    ApplicationEvents,
    ApplicationModule,
} from '@/Application';

export default class VKBridge implements ApplicationModule {
    private readonly api: VKApi;
    private readonly groupId: number;
    // TODO: Add strong types
    private onUpdate: (update: any) => void = () => {};
    private onStart: () => Promise<void> | void = () => {};

    private constructor(vkApi: VKApi, groupId: number) {
        this.api = vkApi;
        this.groupId = groupId;
    }

    static create(accessToken: string, groupId: number) {
        const vkApi = new VKApi({
            token: accessToken,
            lang: 'ru',
        });

        return new VKBridge(vkApi, groupId);
    }

    init(events: EventHandler<ApplicationEvents>) {
        this.onUpdate = (update) => {
            if (update[0]) {
                events.emit('vk:post', update[0].object);
            }
        };

        this.onStart = async () => {
            await this.api.groupsGetById({
                group_id: this.groupId.toString(),
            }).then((groups) => {
                events.emit('vk:start', groups.at(0)!);
            });
        };
    }

    async start() {
        // TODO: write own implementation of long poll api
        new BotsLongPollUpdatesProvider(this.api, this.groupId).getUpdates(
            this.onUpdate);
        await this.onStart();
    }
}
