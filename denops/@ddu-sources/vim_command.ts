import {
  BaseSource,
  Item,
  SourceOptions,
} from "https://deno.land/x/ddu_vim@v2.8.3/types.ts";
import { Denops, fn } from "https://deno.land/x/ddu_vim@v2.8.3/deps.ts";

type Params = Record<never, never>;

export class Source extends BaseSource<Params> {
  override kind = "vim_type";

  override gather(args: {
    denops: Denops;
    sourceOptions: SourceOptions;
    sourceParams: Params;
  }): ReadableStream<Item[]> {
    return new ReadableStream<Item[]>({
      async start(controller) {
        controller.enqueue(await getCommand(args.denops));
        controller.close();
      },
    });
  }

  override params(): Params {
    return {};
  }
}

async function getCommand(denops: Denops) {
  const items: Item[] = [];
  for (
    const item of (await fn.getcompletion(
      denops,
      "",
      "command",
    ) as Array<string>)
  ) {
    items.push({
      word: item,
      action: {
        value: "\n",
        type: "command",
      },
    });
  }

  return items;
}
