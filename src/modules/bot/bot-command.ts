import { BotCommand as GrammyBotCommand } from '@grammyjs/types';
import { Context } from 'grammy';

export interface BotCommand extends GrammyBotCommand {
    action(context: Context): Promise<unknown> | void;
}
