import type { Context } from 'grammy';
import type { BotCommand as GrammyBotCommand } from '@grammyjs/types';

export interface BotCommand extends GrammyBotCommand {
    action(context: Context): Promise<unknown> | void;
}
