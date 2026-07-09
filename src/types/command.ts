export interface Command {
  name: string;
  args: string[];
  fd: number
}

export interface RedisCommands extends Array<Command> {};