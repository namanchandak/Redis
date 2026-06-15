export interface Command {
  name: string;
  args: string[];
}

export interface RedisCommands extends Array<Command> {};