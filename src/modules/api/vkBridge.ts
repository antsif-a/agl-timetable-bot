import {
    Application,
    ApplicationEvents,
    ApplicationModule,
} from '@/application';
import { BotsLongPollUpdatesProvider, VKApi } from 'node-vk-sdk';
import { EventHandler } from '@events';

export default class VkBridge implements ApplicationModule {
    private readonly api: VKApi;
    private readonly groupId: number;
    // TODO: Add strong types
    private onUpdate: (update: any) => void = () => {};
    private onStart: () => void = () => {};

    private constructor(vkApi: VKApi, groupId: number) {
        this.api = vkApi;
        this.groupId = groupId;
    }

    static create(accessToken: string, groupId: number) {
        const vkApi = new VKApi({
            token: accessToken,
            lang: 'ru',
        });

        return new VkBridge(vkApi, groupId);
    }

    init(events: EventHandler<ApplicationEvents>) {
        this.onUpdate = (update) => {
            if (update[0]) {
                events.emit('vk:post', update[0].object);
            }
        };

        this.onStart = () => events.emit('vk:start');
    }

    start() {
        // TODO: write own implementation of long poll api
        new BotsLongPollUpdatesProvider(this.api, this.groupId).getUpdates(
            this.onUpdate);
        this.onStart();
    }
}
