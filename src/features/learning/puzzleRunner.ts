/**
 * A deliberately small Python-like interpreter for the story puzzles.
 * It runs only a bounded set of expressions and statements; it never evaluates
 * JavaScript, accesses browser APIs, or executes arbitrary Python.
 */

export type PuzzleValue =
  | number
  | string
  | boolean
  | null
  | PuzzleValue[]
  | { [key: string]: PuzzleValue };

export interface PuzzleTestCase {
  label: string;
  input: PuzzleValue[];
  expected: PuzzleValue;
}

export interface PuzzleTestResult {
  label: string;
  input: PuzzleValue[];
  expected: PuzzleValue;
  actual: PuzzleValue;
  passed: boolean;
}

interface SourceLine {
  text: string;
  indent: number;
  number: number;
}

type Expression =
  | { kind: "literal"; value: PuzzleValue }
  | { kind: "name"; name: string }
  | { kind: "array"; values: Expression[] }
  | { kind: "tuple"; values: Expression[] }
  | { kind: "dictionary"; entries: Array<[Expression, Expression]> }
  | { kind: "unary"; operator: string; value: Expression }
  | { kind: "binary"; operator: string; left: Expression; right: Expression }
  | { kind: "member"; object: Expression; name: string }
  | { kind: "call"; callee: Expression; args: Expression[] }
  | { kind: "index"; object: Expression; index: Expression }
  | {
      kind: "slice";
      object: Expression;
      start?: Expression;
      end?: Expression;
      step?: Expression;
    }
  | {
      kind: "comprehension";
      value: Expression;
      clauses: Array<{
        name: string;
        source: Expression;
        condition?: Expression;
      }>;
    };

type Statement =
  | { kind: "function"; name: string; params: string[]; body: Statement[]; line: number }
  | { kind: "return"; value: Expression; line: number }
  | { kind: "assign"; names: string[]; value: Expression; line: number }
  | { kind: "augmentedAssign"; name: string; operator: string; value: Expression; line: number }
  | { kind: "for"; name: string; source: Expression; body: Statement[]; line: number }
  | {
      kind: "if";
      branches: Array<{ test?: Expression; body: Statement[] }>;
      line: number;
    }
  | { kind: "expression"; value: Expression; line: number };

interface Token {
  value: string;
  kind: "number" | "string" | "name" | "operator";
}

export class PuzzleCodeError extends Error {
  constructor(message: string, public readonly line: number) {
    super(message);
    this.name = "PuzzleCodeError";
  }
}

const isDictionary = (value: PuzzleValue): value is { [key: string]: PuzzleValue } =>
  value !== null && typeof value === "object" && !Array.isArray(value);

function stripComment(source: string): string {
  let quote = "";
  let escaped = false;
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (quote && char === "\\") {
      escaped = true;
      continue;
    }
    if (quote) {
      if (char === quote) quote = "";
      continue;
    }
    if (char === "'" || char === '"') quote = char;
    else if (char === "#") return source.slice(0, i);
  }
  return source;
}

function tokenize(source: string, line: number): Token[] {
  const tokens: Token[] = [];
  let cursor = 0;
  const pattern = /\s*(?:(\d+(?:\.\d+)?)|([A-Za-z_]\w*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\/\/|==|!=|<=|>=|\+=|\+|-|\*|\/|%|<|>|\(|\)|\[|\]|\{|\}|,|:|\.))/y;
  while (cursor < source.length) {
    pattern.lastIndex = cursor;
    const match = pattern.exec(source);
    if (!match) throw new PuzzleCodeError("This expression contains unsupported syntax.", line);
    cursor = pattern.lastIndex;
    if (match[1]) tokens.push({ value: match[1], kind: "number" });
    else if (match[2]) tokens.push({ value: match[2], kind: "name" });
    else if (match[3]) tokens.push({ value: match[3], kind: "string" });
    else if (match[4]) tokens.push({ value: match[4], kind: "operator" });
  }
  return tokens;
}

class ExpressionParser {
  private cursor = 0;
  private readonly tokens: Token[];

  constructor(source: string, private readonly line: number) {
    this.tokens = tokenize(source, line);
  }

  parse(): Expression {
    const result = this.parseOr();
    if (this.cursor !== this.tokens.length) this.fail("There is extra text after this expression.");
    return result;
  }

  private peek(value?: string): Token | undefined {
    const token = this.tokens[this.cursor];
    return value === undefined || token?.value === value ? token : undefined;
  }

  private take(value?: string): Token | undefined {
    if (!this.peek(value)) return undefined;
    return this.tokens[this.cursor++];
  }

  private expect(value: string): void {
    if (!this.take(value)) this.fail(`Expected '${value}'.`);
  }

  private fail(message: string): never {
    throw new PuzzleCodeError(message, this.line);
  }

  private parseOr(): Expression {
    let result = this.parseAnd();
    while (this.take("or")) result = { kind: "binary", operator: "or", left: result, right: this.parseAnd() };
    return result;
  }

  private parseAnd(): Expression {
    let result = this.parseNot();
    while (this.take("and")) result = { kind: "binary", operator: "and", left: result, right: this.parseNot() };
    return result;
  }

  private parseNot(): Expression {
    if (this.take("not")) return { kind: "unary", operator: "not", value: this.parseNot() };
    return this.parseComparison();
  }

  private parseComparison(): Expression {
    let result = this.parseAdd();
    while (["==", "!=", "<", "<=", ">", ">=", "in"].some((operator) => this.peek(operator))) {
      const operator = this.tokens[this.cursor++].value;
      result = { kind: "binary", operator, left: result, right: this.parseAdd() };
    }
    return result;
  }

  private parseAdd(): Expression {
    let result = this.parseMultiply();
    while (this.peek("+") || this.peek("-")) {
      const operator = this.tokens[this.cursor++].value;
      result = { kind: "binary", operator, left: result, right: this.parseMultiply() };
    }
    return result;
  }

  private parseMultiply(): Expression {
    let result = this.parseUnary();
    while (["*", "/", "//", "%"].some((operator) => this.peek(operator))) {
      const operator = this.tokens[this.cursor++].value;
      result = { kind: "binary", operator, left: result, right: this.parseUnary() };
    }
    return result;
  }

  private parseUnary(): Expression {
    if (this.peek("+") || this.peek("-")) {
      const operator = this.tokens[this.cursor++].value;
      return { kind: "unary", operator, value: this.parseUnary() };
    }
    return this.parsePostfix();
  }

  private parsePostfix(): Expression {
    let value = this.parsePrimary();
    while (true) {
      if (this.take(".")) {
        const member = this.tokens[this.cursor++];
        if (!member || member.kind !== "name") this.fail("A method name is missing after the dot.");
        value = { kind: "member", object: value, name: member.value };
      } else if (this.take("(")) {
        const args: Expression[] = [];
        if (!this.peek(")")) {
          do {
            args.push(this.parseOr());
          } while (this.take(",") && !this.peek(")"));
        }
        this.expect(")");
        value = { kind: "call", callee: value, args };
      } else if (this.take("[")) {
        let start: Expression | undefined;
        if (!this.peek(":") && !this.peek("]")) start = this.parseOr();
        if (this.take(":")) {
          let end: Expression | undefined;
          let step: Expression | undefined;
          if (!this.peek(":") && !this.peek("]")) end = this.parseOr();
          if (this.take(":")) {
            if (!this.peek("]")) step = this.parseOr();
          }
          this.expect("]");
          value = { kind: "slice", object: value, start, end, step };
        } else {
          if (!start) this.fail("Choose an item or slice inside the brackets.");
          this.expect("]");
          value = { kind: "index", object: value, index: start };
        }
      } else break;
    }
    return value;
  }

  private parsePrimary(): Expression {
    const token = this.tokens[this.cursor++];
    if (!token) this.fail("An expression is missing a value.");
    if (token.kind === "number") return { kind: "literal", value: Number(token.value) };
    if (token.kind === "string") return { kind: "literal", value: decodeString(token.value, this.line) };
    if (token.value === "True") return { kind: "literal", value: true };
    if (token.value === "False") return { kind: "literal", value: false };
    if (token.value === "None") return { kind: "literal", value: null };
    if (token.kind === "name") return { kind: "name", name: token.value };
    if (token.value === "(") {
      const first = this.parseOr();
      if (!this.take(",")) {
        this.expect(")");
        return first;
      }
      const values = [first];
      while (!this.peek(")")) {
        values.push(this.parseOr());
        if (!this.take(",")) break;
      }
      this.expect(")");
      return { kind: "tuple", values };
    }
    if (token.value === "[") {
      if (this.take("]")) return { kind: "array", values: [] };
      const first = this.parseOr();
      if (this.take("for")) {
        const clauses: Array<{ name: string; source: Expression; condition?: Expression }> = [];
        let nextName: Token | undefined = this.tokens[this.cursor++];
        while (true) {
          if (!nextName || nextName.kind !== "name") this.fail("Name the value in this comprehension.");
          if (!this.take("in")) this.fail("Use 'in' to provide the values to iterate over.");
          const source = this.parseOr();
          let condition: Expression | undefined;
          if (this.take("if")) condition = this.parseOr();
          clauses.push({ name: nextName.value, source, condition });
          if (!this.take("for")) break;
          nextName = this.tokens[this.cursor++];
        }
        this.expect("]");
        return { kind: "comprehension", value: first, clauses };
      }
      const values = [first];
      while (this.take(",")) {
        if (this.peek("]")) break;
        values.push(this.parseOr());
      }
      this.expect("]");
      return { kind: "array", values };
    }
    if (token.value === "{") {
      const entries: Array<[Expression, Expression]> = [];
      if (!this.peek("}")) {
        do {
          const key = this.parseOr();
          this.expect(":");
          const value = this.parseOr();
          entries.push([key, value]);
        } while (this.take(",") && !this.peek("}"));
      }
      this.expect("}");
      return { kind: "dictionary", entries };
    }
    this.fail("This value is not supported. Check the quest guide.");
  }
}

function decodeString(token: string, line: number): string {
  const body = token.slice(1, -1);
  return body.replace(/\\(\\|"|'|n|r|t)/g, (_match, code: string) => {
    if (code === "n") return "\n";
    if (code === "r") return "\r";
    if (code === "t") return "\t";
    return code;
  });
}

function parseExpression(source: string, line: number): Expression {
  return new ExpressionParser(source, line).parse();
}

class ProgramParser {
  private readonly lines: SourceLine[];

  constructor(code: string) {
    if (code.length > 12000) throw new PuzzleCodeError("Keep this spell under 12,000 characters.", 0);
    const raw = code.split("\n");
    if (raw.length > 240) throw new PuzzleCodeError("Keep this spell under 240 lines.", 0);
    this.lines = raw
      .map((source, number) => {
        const expanded = stripComment(source.replace(/\t/g, "    ")).replace(/\s+$/, "");
        const text = expanded.trimStart();
        const indent = expanded.length - text.length;
        if (indent % 4 !== 0) throw new PuzzleCodeError("Indent blocks with four spaces.", number);
        return { text, indent, number };
      })
      .filter((line) => line.text);
  }

  parse(): Statement[] {
    if (this.lines[0]?.indent !== undefined && this.lines[0].indent !== 0) {
      throw new PuzzleCodeError("Start your spell at the left edge.", this.lines[0].number);
    }
    const parsed = this.parseBlock(0, 0);
    if (parsed.index !== this.lines.length) {
      const line = this.lines[parsed.index];
      throw new PuzzleCodeError("Unexpected indentation or misplaced else block.", line.number);
    }
    return parsed.statements;
  }

  private parseBlock(start: number, indent: number): { statements: Statement[]; index: number } {
    const statements: Statement[] = [];
    let index = start;
    while (index < this.lines.length) {
      const line = this.lines[index];
      if (line.indent < indent || /^elif\b|^else\s*:/.test(line.text)) break;
      if (line.indent > indent) throw new PuzzleCodeError("Unexpected indentation. Use four spaces inside a block.", line.number);
      const fn = line.text.match(/^def\s+([A-Za-z_]\w*)\(([^()]*)\)\s*:\s*$/);
      const loop = line.text.match(/^for\s+([A-Za-z_]\w*)\s+in\s+(.+)\s*:\s*$/);
      const condition = line.text.match(/^if\s+(.+)\s*:\s*$/);
      if (fn) {
        if (indent !== 0) throw new PuzzleCodeError("Define helper functions at the left edge.", line.number);
        const params = fn[2].trim() ? fn[2].split(",").map((item) => item.trim()) : [];
        if (params.some((param) => !/^[A-Za-z_]\w*$/.test(param)) || new Set(params).size !== params.length) {
          throw new PuzzleCodeError("Use distinct names for function parameters.", line.number);
        }
        const body = this.parseChild(index, indent, line.number);
        statements.push({ kind: "function", name: fn[1], params, body: body.statements, line: line.number });
        index = body.index;
      } else if (loop) {
        const body = this.parseChild(index, indent, line.number);
        statements.push({ kind: "for", name: loop[1], source: parseExpression(loop[2], line.number), body: body.statements, line: line.number });
        index = body.index;
      } else if (condition) {
        const branches: Array<{ test?: Expression; body: Statement[] }> = [];
        let body = this.parseChild(index, indent, line.number);
        branches.push({ test: parseExpression(condition[1], line.number), body: body.statements });
        index = body.index;
        while (index < this.lines.length && this.lines[index].indent === indent) {
          const next = this.lines[index];
          const elif = next.text.match(/^elif\s+(.+)\s*:\s*$/);
          if (elif) {
            body = this.parseChild(index, indent, next.number);
            branches.push({ test: parseExpression(elif[1], next.number), body: body.statements });
            index = body.index;
          } else if (next.text === "else:") {
            body = this.parseChild(index, indent, next.number);
            branches.push({ body: body.statements });
            index = body.index;
            break;
          } else break;
        }
        statements.push({ kind: "if", branches, line: line.number });
      } else {
        const ret = line.text.match(/^return(?:\s+(.+))?$/);
        const append = line.text.match(/^([A-Za-z_]\w*)\s*(\+=|-=|\*=|\/\/=|\/=|%=)\s*(.+)$/);
        const assignment = line.text.match(/^([A-Za-z_]\w*(?:\s*,\s*[A-Za-z_]\w*)*)\s*=\s*(?!=)(.+)$/);
        if (ret) {
          if (!ret[1]) throw new PuzzleCodeError("Return a value from this puzzle function.", line.number);
          statements.push({ kind: "return", value: parseExpression(ret[1], line.number), line: line.number });
        } else if (append) {
          statements.push({ kind: "augmentedAssign", name: append[1], operator: append[2], value: parseExpression(append[3], line.number), line: line.number });
        } else if (assignment) {
          statements.push({ kind: "assign", names: assignment[1].split(",").map((name) => name.trim()), value: parseExpression(assignment[2], line.number), line: line.number });
        } else {
          statements.push({ kind: "expression", value: parseExpression(line.text, line.number), line: line.number });
        }
        index++;
      }
    }
    return { statements, index };
  }

  private parseChild(index: number, indent: number, line: number): { statements: Statement[]; index: number } {
    const next = index + 1;
    if (next >= this.lines.length || this.lines[next].indent <= indent) {
      throw new PuzzleCodeError("Add an indented instruction inside this block.", line);
    }
    return this.parseBlock(next, this.lines[next].indent);
  }
}

class Environment {
  private readonly values = new Map<string, PuzzleValue>();
  constructor(readonly parent?: Environment) {}

  get(name: string, line: number): PuzzleValue {
    if (this.values.has(name)) return this.values.get(name)!;
    if (this.parent) return this.parent.get(name, line);
    throw new PuzzleCodeError(`Define '${name}' before using it.`, line);
  }

  set(name: string, value: PuzzleValue): void {
    assertValue(value);
    this.values.set(name, value);
  }
}

interface FunctionDefinition {
  params: string[];
  body: Statement[];
  line: number;
}

interface Runtime {
  functions: Map<string, FunctionDefinition>;
  work: number;
}

const truthy = (value: PuzzleValue): boolean => {
  if (value === null || value === false || value === 0 || value === "") return false;
  return !Array.isArray(value) || value.length > 0;
};

function assertValue(value: PuzzleValue, line = 0): void {
  if (typeof value === "number" && (!Number.isFinite(value) || Math.abs(value) > 1000000)) {
    throw new PuzzleCodeError("Use a smaller, finite number.", line);
  }
  if (typeof value === "string" && value.length > 2000) throw new PuzzleCodeError("Keep text values under 2,000 characters.", line);
  if (Array.isArray(value)) {
    if (value.length > 500) throw new PuzzleCodeError("Keep each list under 500 values.", line);
    value.forEach((item) => assertValue(item, line));
  }
  if (isDictionary(value)) {
    const keys = Object.keys(value);
    if (keys.length > 200) throw new PuzzleCodeError("Keep each dictionary under 200 entries.", line);
    keys.forEach((key) => assertValue(value[key], line));
  }
}

function displayString(value: PuzzleValue): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return `[${value.map(displayString).join(", ")}]`;
  if (isDictionary(value)) return `{${Object.keys(value).map((key) => `${JSON.stringify(key)}: ${displayString(value[key])}`).join(", ")}}`;
  if (value === null) return "None";
  return String(value);
}

function equal(left: PuzzleValue, right: PuzzleValue): boolean {
  if (left === right) return true;
  if (Array.isArray(left) && Array.isArray(right)) {
    return left.length === right.length && left.every((value, index) => equal(value, right[index]));
  }
  if (isDictionary(left) && isDictionary(right)) {
    const leftKeys = Object.keys(left).sort();
    const rightKeys = Object.keys(right).sort();
    return leftKeys.length === rightKeys.length && leftKeys.every((key, index) => key === rightKeys[index] && equal(left[key], right[key]));
  }
  return false;
}

function numeric(value: PuzzleValue, line: number): number {
  if (typeof value !== "number") throw new PuzzleCodeError("This operation needs a number.", line);
  return value;
}

function iterable(value: PuzzleValue, line: number): PuzzleValue[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return Array.from(value);
  if (isDictionary(value)) return Object.keys(value);
  throw new PuzzleCodeError("Loop over a string, list, or dictionary.", line);
}

function indexed(value: PuzzleValue, index: PuzzleValue, line: number): PuzzleValue {
  const raw = numeric(index, line);
  if (Array.isArray(value) || typeof value === "string") {
    const values = typeof value === "string" ? Array.from(value) : value;
    const position = raw < 0 ? values.length + raw : raw;
    if (!Number.isInteger(raw) || position < 0 || position >= values.length) throw new PuzzleCodeError("That index is outside this value.", line);
    return values[position];
  }
  if (isDictionary(value)) {
    const key = displayString(index);
    if (!Object.prototype.hasOwnProperty.call(value, key)) throw new PuzzleCodeError(`There is no key named '${key}'.`, line);
    return value[key];
  }
  throw new PuzzleCodeError("Only a list, string, or dictionary can be indexed.", line);
}

function slice(value: PuzzleValue, start: PuzzleValue | undefined, end: PuzzleValue | undefined, step: PuzzleValue | undefined, line: number): PuzzleValue {
  const source = typeof value === "string" ? Array.from(value) : Array.isArray(value) ? value : undefined;
  if (!source) throw new PuzzleCodeError("Slices work on strings and lists.", line);
  const stride = step === undefined ? 1 : numeric(step, line);
  if (!Number.isInteger(stride) || stride === 0) throw new PuzzleCodeError("A slice step must be a non-zero whole number.", line);
  const normalize = (position: number, fallback: number) => {
    if (position < 0) return Math.max(-1, source.length + position);
    return Math.min(source.length, position);
  };
  const from = start === undefined ? (stride < 0 ? source.length - 1 : 0) : normalize(numeric(start, line), 0);
  const to = end === undefined ? (stride < 0 ? -1 : source.length) : normalize(numeric(end, line), 0);
  const output: PuzzleValue[] = [];
  for (let index = from; stride > 0 ? index < to : index > to; index += stride) {
    if (index >= 0 && index < source.length) output.push(source[index]);
    if (output.length > 500) throw new PuzzleCodeError("This slice is too large.", line);
  }
  return typeof value === "string" ? output.join("") : output;
}

function evalExpression(expression: Expression, env: Environment, runtime: Runtime, line: number, depth = 0): PuzzleValue {
  if (depth > 80) throw new PuzzleCodeError("This expression is nested too deeply.", line);
  switch (expression.kind) {
    case "literal": return expression.value;
    case "name": return env.get(expression.name, line);
    case "array": return expression.values.map((value) => evalExpression(value, env, runtime, line, depth + 1));
    case "tuple": return expression.values.map((value) => evalExpression(value, env, runtime, line, depth + 1));
    case "dictionary": {
      const result: { [key: string]: PuzzleValue } = Object.create(null);
      for (const [keyExpression, valueExpression] of expression.entries) {
        const key = evalExpression(keyExpression, env, runtime, line, depth + 1);
        if (typeof key !== "string" && typeof key !== "number") throw new PuzzleCodeError("Dictionary keys must be text or numbers.", line);
        result[String(key)] = evalExpression(valueExpression, env, runtime, line, depth + 1);
      }
      return result;
    }
    case "unary": {
      const value = evalExpression(expression.value, env, runtime, line, depth + 1);
      if (expression.operator === "not") return !truthy(value);
      return expression.operator === "-" ? -numeric(value, line) : numeric(value, line);
    }
    case "binary": {
      const left = evalExpression(expression.left, env, runtime, line, depth + 1);
      if (expression.operator === "and") return truthy(left) ? truthy(evalExpression(expression.right, env, runtime, line, depth + 1)) : false;
      if (expression.operator === "or") return truthy(left) || truthy(evalExpression(expression.right, env, runtime, line, depth + 1));
      const right = evalExpression(expression.right, env, runtime, line, depth + 1);
      let value: PuzzleValue;
      switch (expression.operator) {
        case "+":
          if (typeof left === "string" && typeof right === "string") value = left + right;
          else if (Array.isArray(left) && Array.isArray(right)) value = [...left, ...right];
          else value = numeric(left, line) + numeric(right, line);
          break;
        case "-": value = numeric(left, line) - numeric(right, line); break;
        case "*": value = numeric(left, line) * numeric(right, line); break;
        case "/":
          if (numeric(right, line) === 0) throw new PuzzleCodeError("You cannot divide by zero.", line);
          value = numeric(left, line) / numeric(right, line);
          break;
        case "//":
          if (numeric(right, line) === 0) throw new PuzzleCodeError("You cannot divide by zero.", line);
          value = Math.floor(numeric(left, line) / numeric(right, line));
          break;
        case "%":
          if (numeric(right, line) === 0) throw new PuzzleCodeError("You cannot divide by zero.", line);
          value = numeric(left, line) % numeric(right, line);
          break;
        case "==": value = equal(left, right); break;
        case "!=": value = !equal(left, right); break;
        case "<": value = compare(left, right, line) < 0; break;
        case "<=": value = compare(left, right, line) <= 0; break;
        case ">": value = compare(left, right, line) > 0; break;
        case ">=": value = compare(left, right, line) >= 0; break;
        case "in":
          value = Array.isArray(right)
            ? right.some((item) => equal(item, left))
            : typeof right === "string"
              ? right.includes(displayString(left))
              : isDictionary(right) && Object.prototype.hasOwnProperty.call(right, displayString(left));
          break;
        default: throw new PuzzleCodeError("This operator is not supported.", line);
      }
      assertValue(value, line);
      return value;
    }
    case "member": return { __puzzleBoundMethod: true, receiver: evalExpression(expression.object, env, runtime, line, depth + 1), name: expression.name } as unknown as PuzzleValue;
    case "call": {
      const args = expression.args.map((arg) => evalExpression(arg, env, runtime, line, depth + 1));
      if (expression.callee.kind === "name") return invoke(expression.callee.name, args, env, runtime, line, depth + 1);
      if (expression.callee.kind === "member") {
        const receiver = evalExpression(expression.callee.object, env, runtime, line, depth + 1);
        return invokeMethod(receiver, expression.callee.name, args, env, runtime, line, depth + 1);
      }
      throw new PuzzleCodeError("Only named functions and approved list or text methods can be called.", line);
    }
    case "index": return indexed(evalExpression(expression.object, env, runtime, line, depth + 1), evalExpression(expression.index, env, runtime, line, depth + 1), line);
    case "slice": return slice(
      evalExpression(expression.object, env, runtime, line, depth + 1),
      expression.start ? evalExpression(expression.start, env, runtime, line, depth + 1) : undefined,
      expression.end ? evalExpression(expression.end, env, runtime, line, depth + 1) : undefined,
      expression.step ? evalExpression(expression.step, env, runtime, line, depth + 1) : undefined,
      line,
    );
    case "comprehension": {
      const output: PuzzleValue[] = [];
      const visit = (index: number, scope: Environment) => {
        if (++runtime.work > 1000) throw new PuzzleCodeError("This spell did too much work. Shorten the loops.", line);
        if (index === expression.clauses.length) {
          output.push(evalExpression(expression.value, scope, runtime, line, depth + 1));
          if (output.length > 500) throw new PuzzleCodeError("This comprehension made too many values.", line);
          return;
        }
        const clause = expression.clauses[index];
        for (const item of iterable(evalExpression(clause.source, scope, runtime, line, depth + 1), line)) {
          const inner = new Environment(scope);
          inner.set(clause.name, item);
          if (!clause.condition || truthy(evalExpression(clause.condition, inner, runtime, line, depth + 1))) visit(index + 1, inner);
        }
      };
      visit(0, env);
      return output;
    }
  }
}

function compare(left: PuzzleValue, right: PuzzleValue, line: number): number {
  if (typeof left === "number" && typeof right === "number") return left - right;
  if (typeof left === "string" && typeof right === "string") return left < right ? -1 : left > right ? 1 : 0;
  throw new PuzzleCodeError("Compare values of the same simple type.", line);
}

function invoke(name: string, args: PuzzleValue[], env: Environment, runtime: Runtime, line: number, depth: number): PuzzleValue {
  if (depth > 12) throw new PuzzleCodeError("Function calls are nested too deeply.", line);
  const definition = runtime.functions.get(name);
  if (definition) {
    if (args.length !== definition.params.length) throw new PuzzleCodeError(`${name} needs ${definition.params.length} argument(s).`, line);
    const local = new Environment(env);
    definition.params.forEach((parameter, index) => local.set(parameter, args[index]));
    const result = execute(definition.body, local, runtime, depth + 1);
    if (!result.returned) throw new PuzzleCodeError(`${name} needs to return a value.`, definition.line);
    return result.value;
  }
  if (name === "len") {
    if (args.length !== 1) throw new PuzzleCodeError("len needs one argument.", line);
    const value = args[0];
    if (typeof value === "string") return Array.from(value).length;
    if (Array.isArray(value)) return value.length;
    if (isDictionary(value)) return Object.keys(value).length;
    throw new PuzzleCodeError("len works on text, lists, and dictionaries.", line);
  }
  if (name === "sum") {
    if (args.length !== 1 || !Array.isArray(args[0])) throw new PuzzleCodeError("sum needs one list of numbers.", line);
    return args[0].reduce<number>((total, value) => total + numeric(value, line), 0);
  }
  if (name === "sorted") {
    if (args.length !== 1 || !Array.isArray(args[0])) throw new PuzzleCodeError("sorted needs one list.", line);
    const values = [...args[0]];
    if (!values.every((value) => typeof value === "number" || typeof value === "string") || values.some((value) => typeof value !== typeof values[0])) {
      throw new PuzzleCodeError("Sort a list of numbers or a list of text values.", line);
    }
    return values.sort((left, right) => compare(left, right, line));
  }
  if (name === "ord") {
    if (args.length !== 1 || typeof args[0] !== "string" || Array.from(args[0]).length !== 1) throw new PuzzleCodeError("ord needs one character.", line);
    return args[0].codePointAt(0)!;
  }
  if (name === "chr") {
    if (args.length !== 1) throw new PuzzleCodeError("chr needs one number.", line);
    const point = numeric(args[0], line);
    if (!Number.isInteger(point) || point < 0 || point > 0x10ffff) throw new PuzzleCodeError("chr needs a valid character code.", line);
    return String.fromCodePoint(point);
  }
  if (name === "range") {
    if (args.length < 1 || args.length > 3 || args.some((value) => typeof value !== "number" || !Number.isInteger(value))) throw new PuzzleCodeError("range needs one, two, or three whole numbers.", line);
    const [start, stop, step] = args.length === 1 ? [0, args[0] as number, 1] : args.length === 2 ? [args[0] as number, args[1] as number, 1] : args as [number, number, number];
    if (step === 0) throw new PuzzleCodeError("range step cannot be zero.", line);
    const result: PuzzleValue[] = [];
    for (let value = start; step > 0 ? value < stop : value > stop; value += step) {
      result.push(value);
      if (result.length > 100) throw new PuzzleCodeError("Keep each range to 100 steps or fewer.", line);
    }
    return result;
  }
  throw new PuzzleCodeError(`Unknown function: ${name}. Check the quest guide.`, line);
}

function invokeMethod(receiver: PuzzleValue, name: string, args: PuzzleValue[], env: Environment, runtime: Runtime, line: number, depth: number): PuzzleValue {
  if (depth > 12) throw new PuzzleCodeError("Method calls are nested too deeply.", line);
  if (name === "count") {
    if (args.length !== 1) throw new PuzzleCodeError("count needs one value to search for.", line);
    if (Array.isArray(receiver)) return receiver.filter((value) => equal(value, args[0])).length;
    if (typeof receiver === "string" && typeof args[0] === "string") {
      if (!args[0]) return Array.from(receiver).length + 1;
      return receiver.split(args[0]).length - 1;
    }
  }
  if (name === "replace") {
    if (typeof receiver !== "string" || args.length !== 2 || typeof args[0] !== "string" || typeof args[1] !== "string") {
      throw new PuzzleCodeError("replace needs old text and new text.", line);
    }
    return args[0] ? receiver.split(args[0]).join(args[1]) : receiver;
  }
  if (name === "sort") {
    if (!Array.isArray(receiver) || args.length) throw new PuzzleCodeError("sort works on a list and takes no arguments here.", line);
    if (!receiver.every((value) => typeof value === "number" || typeof value === "string") || receiver.some((value) => typeof value !== typeof receiver[0])) {
      throw new PuzzleCodeError("Sort a list of numbers or a list of text values.", line);
    }
    receiver.sort((left, right) => compare(left, right, line));
    return null;
  }
  if (name === "update") {
    if (!isDictionary(receiver) || args.length !== 1 || !isDictionary(args[0])) throw new PuzzleCodeError("update needs one dictionary.", line);
    for (const key of Object.keys(args[0])) receiver[key] = args[0][key];
    return null;
  }
  throw new PuzzleCodeError(`The method '${name}' is not available in this sandbox.`, line);
}

interface ExecutionResult {
  returned: boolean;
  value: PuzzleValue;
}

function execute(statements: Statement[], env: Environment, runtime: Runtime, depth = 0): ExecutionResult {
  for (const statement of statements) {
    if (++runtime.work > 1000) throw new PuzzleCodeError("This spell did too much work. Shorten the loops.", statement.line);
    switch (statement.kind) {
      case "function":
        if (runtime.functions.has(statement.name)) throw new PuzzleCodeError(`Function '${statement.name}' is defined more than once.`, statement.line);
        runtime.functions.set(statement.name, { params: statement.params, body: statement.body, line: statement.line });
        break;
      case "return": return { returned: true, value: evalExpression(statement.value, env, runtime, statement.line) };
      case "assign": {
        const value = evalExpression(statement.value, env, runtime, statement.line);
        if (statement.names.length === 1) env.set(statement.names[0], value);
        else {
          if (!Array.isArray(value) || value.length !== statement.names.length) throw new PuzzleCodeError("Unpack the same number of values as variable names.", statement.line);
          statement.names.forEach((name, index) => env.set(name, value[index]));
        }
        break;
      }
      case "augmentedAssign": {
        const value = evalExpression({
          kind: "binary",
          operator: statement.operator.slice(0, -1),
          left: { kind: "name", name: statement.name },
          right: statement.value,
        }, env, runtime, statement.line);
        env.set(statement.name, value);
        break;
      }
      case "for": {
        const values = iterable(evalExpression(statement.source, env, runtime, statement.line), statement.line);
        if (values.length > 100) throw new PuzzleCodeError("Keep each loop to 100 values or fewer.", statement.line);
        for (const value of values) {
          env.set(statement.name, value);
          const result = execute(statement.body, env, runtime, depth);
          if (result.returned) return result;
        }
        break;
      }
      case "if": {
        for (const branch of statement.branches) {
          if (!branch.test || truthy(evalExpression(branch.test, env, runtime, statement.line))) {
            const result = execute(branch.body, env, runtime, depth);
            if (result.returned) return result;
            break;
          }
        }
        break;
      }
      case "expression":
        evalExpression(statement.value, env, runtime, statement.line);
        break;
    }
  }
  return { returned: false, value: null };
}

function cloneValue(value: PuzzleValue): PuzzleValue {
  if (Array.isArray(value)) return value.map(cloneValue);
  if (isDictionary(value)) {
    const copy: { [key: string]: PuzzleValue } = Object.create(null);
    for (const key of Object.keys(value)) copy[key] = cloneValue(value[key]);
    return copy;
  }
  return value;
}

export function formatPuzzleValue(value: PuzzleValue): string {
  return displayString(value);
}

export function runPuzzleTests(code: string, functionName: string, cases: PuzzleTestCase[]): PuzzleTestResult[] {
  if (cases.length < 1 || cases.length > 8) throw new PuzzleCodeError("This quest needs between one and eight checks.", 0);
  const program = new ProgramParser(code).parse();
  const functions = program.filter((statement): statement is Extract<Statement, { kind: "function" }> => statement.kind === "function");
  const target = functions.find((fn) => fn.name === functionName);
  if (!target) throw new PuzzleCodeError(`Define the ${functionName} function, then run your spell.`, 0);
  if (functions.filter((fn) => fn.name === functionName).length !== 1) throw new PuzzleCodeError(`Define ${functionName} exactly once.`, target.line);
  const results: PuzzleTestResult[] = [];
  for (const testCase of cases) {
    if (testCase.input.length !== target.params.length) throw new PuzzleCodeError(`${functionName} needs ${target.params.length} parameter(s).`, target.line);
    const runtime: Runtime = { functions: new Map(), work: 0 };
    const globals = new Environment();
    for (const statement of program) {
      if (statement.kind === "function") runtime.functions.set(statement.name, { params: statement.params, body: statement.body, line: statement.line });
      else execute([statement], globals, runtime);
    }
    const args = testCase.input.map(cloneValue);
    const actual = invoke(functionName, args, globals, runtime, target.line, 0);
    assertValue(actual, target.line);
    const expected = cloneValue(testCase.expected);
    results.push({ label: testCase.label, input: testCase.input.map(cloneValue), expected, actual, passed: equal(actual, expected) });
  }
  return results;
}
