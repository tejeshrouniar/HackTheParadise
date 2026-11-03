/** A bounded teaching language, never eval/Function or arbitrary Python execution. */
type Value = number | number[];
type Environment = Record<string, Value>;
interface Line {
  text: string;
  indent: number;
  number: number;
}
interface Definition {
  params: string[];
  body: Line[];
}
export interface QuestInstruction {
  line: number;
  name: string;
  args: Value[];
}
export class QuestCodeError extends Error {
  line: number;
  constructor(message: string, line: number) {
    super(message);
    this.line = line;
    this.name = "QuestCodeError";
  }
}
const actions: Record<string, number> = {
  "dragon.move_forward": 0,
  "dragon.turn_right": 0,
  "dragon.turn_left": 0,
  "dragon.collect_crystal": 0,
  "cauldron.brew_elixir": 0,
  grow_flower: 0,
  place_starlight_tile: 0,
  purify_rune: 1,
  align_gate_rings: 0,
  charge_stargate: 1,
  "crystals.sort": 0,
  stabilize_vortex: 1,
  cast_starlight_bolt: 0,
  holy_smite: 0,
};
export function compileQuestCode(code: string): QuestInstruction[] {
  if (code.length > 20000)
    throw new QuestCodeError(
      "Keep this experiment under 20,000 characters.",
      0,
    );
  const raw = code.split("\n");
  if (raw.length > 300)
    throw new QuestCodeError("Keep this experiment under 300 lines.", 0);
  const lines: Line[] = raw
    .map((raw, number) => {
      const expanded = raw.replace(/\t/g, "    ");
      const trimmed = expanded.replace(/#.*$/, "").trimEnd();
      return {
        text: trimmed.trimStart(),
        indent: trimmed.length - trimmed.trimStart().length,
        number,
      };
    })
    .filter((l) => l.text);
  const definitions = new Map<string, Definition>();
  const instructions: QuestInstruction[] = [];
  let work = 0;
  const fail = (message: string, line: Line): never => {
    throw new QuestCodeError(message, line.number);
  };
  const emit = (instruction: QuestInstruction) => {
    if (instructions.length >= 200)
      throw new QuestCodeError(
        "This run is too long. Use at most 200 actions.",
        instruction.line,
      );
    instructions.push(instruction);
  };
  function expression(
    source: string,
    env: Environment,
    line: Line,
    depth: number,
  ): Value {
    const tokens = source.match(/[a-zA-Z_]\w*|\d+|[+*\-/(),\[\]]/g) ?? [];
    if (tokens.join("") !== source.replace(/\s/g, ""))
      fail(
        "Use numbers, lists, variables and simple arithmetic in this sandbox.",
        line,
      );
    let cursor = 0;
    function number(value: Value): number {
      if (typeof value !== "number")
        fail("This arithmetic needs a number.", line);
      return value as number;
    }
    function primary(): Value {
      const token = tokens[cursor++];
      if (!token) fail("An expression is missing a value.", line);
      if (token === "-") return -number(primary());
      if (token === "(") {
        const result = add();
        if (tokens[cursor++] !== ")") fail("Close the parentheses.", line);
        return result;
      }
      if (token === "[") {
        const list: number[] = [];
        if (tokens[cursor] !== "]")
          do {
            list.push(number(add()));
            if (tokens[cursor] !== ",") break;
            cursor++;
          } while (cursor < tokens.length);
        if (tokens[cursor++] !== "]") fail("Close the list with ].", line);
        return list;
      }
      if (/^\d+$/.test(token)) return Number(token);
      if (/^[a-zA-Z_]\w*$/.test(token)) {
        if (tokens[cursor] === "(") {
          cursor++;
          const args: Value[] = [];
          if (tokens[cursor] !== ")")
            do {
              args.push(add());
              if (tokens[cursor] !== ",") break;
              cursor++;
            } while (cursor < tokens.length);
          if (tokens[cursor++] !== ")") fail("Close the function call.", line);
          const result = invoke(token, args, env, line, depth + 1);
          if (result === undefined)
            fail(`${token} does not return a value.`, line);
          return result!;
        }
        if (!Object.prototype.hasOwnProperty.call(env, token))
          fail(`Define ${token} before using it.`, line);
        return env[token];
      }
      return fail(
        "This expression is not supported. Check the example for this quest.",
        line,
      );
    }
    function multiply(): Value {
      let result = primary();
      while (["*", "/"].includes(tokens[cursor])) {
        const op = tokens[cursor++];
        const right = number(primary());
        if (op === "/" && right === 0) fail("You cannot divide by zero.", line);
        result = op === "*" ? number(result) * right : number(result) / right;
      }
      return result;
    }
    function add(): Value {
      let result = multiply();
      while (["+", "-"].includes(tokens[cursor])) {
        const op = tokens[cursor++];
        const right = number(multiply());
        result = op === "+" ? number(result) + right : number(result) - right;
      }
      return result;
    }
    const value = add();
    if (cursor !== tokens.length)
      fail("There is extra text after this expression.", line);
    if (
      typeof value === "number" &&
      (!Number.isFinite(value) || Math.abs(value) > 1000000)
    )
      fail("Use a smaller, finite number.", line);
    return value;
  }
  function argumentsFor(
    source: string,
    env: Environment,
    line: Line,
    depth: number,
  ): Value[] {
    if (!source.trim()) return [];
    const chunks: string[] = [];
    let start = 0,
      nesting = 0;
    for (let i = 0; i < source.length; i++) {
      if ("([".includes(source[i])) nesting++;
      if (")]".includes(source[i])) nesting--;
      if (source[i] === "," && nesting === 0) {
        chunks.push(source.slice(start, i));
        start = i + 1;
      }
    }
    chunks.push(source.slice(start));
    return chunks.map((s) => expression(s, env, line, depth));
  }
  function invoke(
    name: string,
    args: Value[],
    env: Environment,
    line: Line,
    depth: number,
  ): Value | undefined {
    if (depth > 10)
      fail(
        "Too many nested function calls. Check for a function calling itself.",
        line,
      );
    const definition = definitions.get(name);
    if (definition) {
      if (args.length !== definition.params.length)
        fail(`${name} needs ${definition.params.length} argument(s).`, line);
      const local = Object.assign(Object.create(null), env);
      definition.params.forEach((p, i) => {
        local[p] = args[i];
      });
      return execute(definition.body, local, depth, true);
    }
    if (!Object.prototype.hasOwnProperty.call(actions, name))
      fail(`Unknown command: ${name}. Check the quest guide.`, line);
    if (args.length !== actions[name])
      fail(`${name} needs ${actions[name]} argument(s).`, line);
    if (name === "crystals.sort") {
      if (!Array.isArray(env.crystals))
        fail("Define the crystals list before sorting it.", line);
      env.crystals = [...(env.crystals as number[])].sort((a, b) => a - b);
      emit({ line: line.number, name, args: [env.crystals] });
    } else emit({ line: line.number, name, args });
    return undefined;
  }
  function execute(
    block: Line[],
    env: Environment,
    depth = 0,
    inFunction = false,
  ): Value | undefined {
    if (!block.length) return;
    const indent = block[0].indent;
    for (let i = 0; i < block.length; i++) {
      if (++work > 1000)
        fail("This run is too long. Reduce the loop count.", block[i]);
      const line = block[i];
      if (line.indent !== indent)
        fail(
          "Unexpected indentation. Use four spaces inside a loop or function.",
          line,
        );
      const definition = line.text.match(/^def ([a-zA-Z_]\w*)\(([^()]*)\):$/);
      const loop = line.text.match(/^for ([a-zA-Z_]\w*) in range\((.*)\):$/);
      if (definition || loop) {
        let end = i + 1;
        while (end < block.length && block[end].indent > indent) end++;
        const body = block.slice(i + 1, end);
        if (!body.length || body[0].indent !== indent + 4)
          fail("Add an indented body using four spaces.", line);
        if (definition) {
          const params = definition[2]
            ? definition[2].split(",").map((s) => s.trim())
            : [];
          if (
            params.some((p) => !/^\w+$/.test(p)) ||
            new Set(params).size !== params.length
          )
            fail("Use distinct parameter names.", line);
          definitions.set(definition[1], { params, body });
        } else if (loop) {
          const count = expression(loop[2], env, line, depth);
          if (
            typeof count !== "number" ||
            !Number.isInteger(count) ||
            count < 0 ||
            count > 100
          )
            fail("Use a whole-number loop count from 0 to 100.", line);
          for (let step = 0; step < (count as number); step++) {
            env[loop[1]] = step;
            const result = execute(body, env, depth, inFunction);
            if (result !== undefined) return result;
          }
        }
        i = end - 1;
        continue;
      }
      if (line.text.startsWith("return ")) {
        if (!inFunction) fail("Return belongs inside a function.", line);
        return expression(line.text.slice(7), env, line, depth);
      }
      const assignment = line.text.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
      if (assignment) {
        const value = expression(assignment[2], env, line, depth);
        env[assignment[1]] = value;
        emit({
          line: line.number,
          name: "assign:" + assignment[1],
          args: [value],
        });
        continue;
      }
      const call = line.text.match(
        /^([a-zA-Z_]\w*(?:\.[a-zA-Z_]\w*)?)\((.*)\)$/,
      );
      if (call) {
        invoke(
          call[1],
          argumentsFor(call[2], env, line, depth),
          env,
          line,
          depth,
        );
        continue;
      }
      fail(
        "This sandbox does not recognize that line. Follow the syntax in the quest guide.",
        line,
      );
    }
  }
  if (lines[0]?.indent)
    fail("Start your first instruction at the left edge.", lines[0]);
  execute(lines, Object.create(null));
  return instructions;
}
