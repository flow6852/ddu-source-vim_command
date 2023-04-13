import {
  BaseSource,
  Item,
  SourceOptions,
} from "https://deno.land/x/ddu_vim@v2.7.0/types.ts";
import { Denops, fn, vars } from "https://deno.land/x/ddu_vim@v2.7.0/deps.ts";

type Params = {
  bufnr: number;
};

export class Source extends BaseSource<Params> {
  override kind = "vim_type";

  override gather(args: {
    denops: Denops;
    sourceOptions: SourceOptions;
    sourceParams: Params;
  }): ReadableStream<Item[]> {
    return new ReadableStream<Item[]>({
      async start(controller) {
        let bufnr = args.sourceParams.bufnr;
        if (bufnr < 1) {
          bufnr = await fn.bufnr(args.denops, "%") as number;
        }
        controller.enqueue(await getCommand(args.denops, args.sourceParams.bufnr))
        controller.close();
      },
    });
  }

  override params(): Params {
    return {
      bufnr: 1,
    };
  }
}

async function getCommand(denops: Denops, bufnr: number) {
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
        type: "command",
      },
    });
  }

  return items;
}
