// n:Numeral
// i:Identifier
// uop: UnaryOp = ! | -
// bop: BinaryOp = < | <= | == | != | >= | >
// e:Expression=n|i|true|false| uop e| e1 bop e2| ie∗|e ? e1:e2 | [e*] | e[e]
// s: Statement = let i = e | func i i* = e | i = e | print e | while e b
// b: Blocl = block s*
// p = Program = program b 
//type Memory = Map<string, Value>;
let memory = new Map();
memory.set("sqrt", Math.sqrt);
memory.set("hypot", Math.hypot);
class Program {
    block;
    constructor(block) {
        this.block = block;
    }
    interpret(memory) {
        return this.block.interpret(memory);
    }
}
class Block {
    statements;
    constructor(statements) {
        this.statements = statements;
    }
    interpret(memory) {
        for (let statement of this.statements) {
            statement.interpret(memory);
        }
    }
}
class VariableDeclaration {
    id;
    expression;
    constructor(id, expression) {
        this.id = id;
        this.expression = expression;
    }
    interpret(memory) {
        if (memory.has(this.id.name)) {
            throw new Error("Variable already declared");
        }
        memory.set(this.id.name, this.expression.interpret(memory));
    }
}
class FunctionDeclaration {
    name;
    parameters;
    expression;
    constructor(name, parameters, expression) {
        this.name = name;
        this.parameters = parameters;
        this.expression = expression;
    }
    interpret(memory) {
        memory[this.name.name] = {
            parameters: this.parameters,
            body: this.expression,
        };
    }
}
class Assignment {
    id;
    expression;
    constructor(id, expression) {
        this.id = id;
        this.expression = expression;
    }
    interpret(memory) {
        if (!memory.has(this.id.name)) {
            throw new Error(`unkown variable: ${this.id.name}`);
        }
        memory.set(this.id.name, this.expression.interpret(memory));
    }
}
class PrintStatement {
    expression;
    constructor(expression) {
        this.expression = expression;
    }
    interpret(memory) {
        console.log(this.expression.interpret(memory));
    }
}
class WhileStatement {
    expression;
    block;
    constructor(expression, block) {
        this.expression = expression;
        this.block = block;
    }
    interpret(memory) {
        while (this.expression.interpret(memory)) {
            this.block.interpret(memory);
        }
    }
}
class Numeral {
    value;
    constructor(value) {
        this.value = value;
    }
    interpret(memory) {
        // console.log("this.value ", this.value)
        return this.value;
    }
}
class Identifier {
    name;
    constructor(name) {
        this.name = name;
    }
    interpret(memory) {
        // const value = memory[this.name];
        const value = memory.get(this.name);
        if (value === undefined) {
            throw new Error(`Unknown variable: ${this.name}`);
        }
        else if (typeof value != "number") {
            throw new Error(`Variable is not a number: ${this.name}`);
        }
        return value;
    }
}
class BooleanLiteral {
    value;
    constructor(value) {
        this.value = value;
    }
    interpret(memory) {
        return this.value;
    }
}
class UnaryExpression {
    operator;
    expression;
    constructor(operator, expression) {
        this.operator = operator;
        this.expression = expression;
    }
    interpret(memory) {
        switch (this.operator) {
            case "-":
                return -this.expression.interpret(memory);
            case "!":
                if (!this.expression.interpret(memory)) {
                    return 1;
                }
                else {
                    return 0;
                }
            default:
                throw new Error(`Unknown operator: ${this.operator}`);
        }
    }
}
class BinaryExpression {
    operator;
    left;
    right;
    constructor(operator, left, right) {
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
    interpret(memory) {
        const leftValue = this.left.interpret(memory);
        const rightValue = this.right.interpret(memory);
        if (typeof leftValue !== 'number' || typeof rightValue !== 'number') {
            throw new Error('Invalid operands for the operator');
        }
        switch (this.operator) {
            case "+":
                return this.left.interpret(memory) + this.right.interpret(memory);
            case "-":
                return this.left.interpret(memory) - this.right.interpret(memory);
            case "*":
                return this.left.interpret(memory) * this.right.interpret(memory);
            case "/":
                return this.left.interpret(memory) / this.right.interpret(memory);
            case "%":
                return this.left.interpret(memory) % this.right.interpret(memory);
            case "**":
                return this.left.interpret(memory) ** this.right.interpret(memory);
            case "<":
                if (this.left.interpret(memory) < this.right.interpret(memory)) {
                    return true;
                }
                else {
                    return false;
                }
            case "<=":
                if (this.left.interpret(memory) < this.right.interpret(memory) || this.left.interpret(memory) == this.right.interpret(memory)) {
                    return true;
                }
                else {
                    return false;
                }
            case ">":
                if (this.left.interpret(memory) > this.right.interpret(memory)) {
                    return true;
                }
                else {
                    return false;
                }
            case "<=":
                if (this.left.interpret(memory) < this.right.interpret(memory) || this.left.interpret(memory) == this.right.interpret(memory)) {
                    return true;
                }
                else {
                    return false;
                }
            case "==":
                if (this.left.interpret(memory) == this.right.interpret(memory)) {
                    return true;
                }
                else {
                    return false;
                }
            case "!=":
                if (this.left.interpret(memory) != this.right.interpret(memory)) {
                    return true;
                }
                else {
                    return false;
                }
            default:
                throw new Error(`Unknown operator: ${this.operator}`);
        }
    }
}
class CallExpression {
    name;
    args;
    constructor(name, args) {
        this.name = name;
        this.args = args;
    }
    interpret(memory) {
        const fn = memory.get(this.name.name);
        if (typeof fn !== "function") {
            throw new Error(`Unknown function: ${this.name.name}`);
        }
        return fn(...this.args.map((arg) => arg.interpret(memory)));
    }
}
class ConditionalExpression {
    condition;
    consequent;
    alternate;
    constructor(condition, consequent, alternate) {
        this.condition = condition;
        this.consequent = consequent;
        this.alternate = alternate;
    }
    interpret(memory) {
        return this.condition.interpret(memory)
            ? this.consequent.interpret(memory)
            : this.alternate.interpret(memory);
    }
}
class ArrayLiteral {
    elements;
    constructor(elements) {
        this.elements = elements;
    }
    interpret(memory) {
        return this.elements.map((e) => e.interpret(memory));
    }
}
class SubscriptExpression {
    array;
    subscript;
    constructor(array, subscript) {
        this.array = array;
        this.subscript = subscript;
    }
    interpret(memory) {
        const arrayValue = this.array.interpret(memory);
        const subscriptValue = this.subscript.interpret(memory);
        if (typeof subscriptValue !== "number") {
            throw new Error("Subscript must be a number");
        }
        else if (Array.isArray(arrayValue)) {
            throw new Error("subscripted value must be an array");
        }
        else {
            return 0;
            // return this.arrayValue[subscriptValue];
        }
    }
}
//run the interpreter here
const sample = new Program(new Block([
    new PrintStatement(new UnaryExpression("-", new Numeral(11))),
    new PrintStatement(new BinaryExpression("*", new Numeral(8), new Numeral(100))),
    new PrintStatement(new BinaryExpression("<", new Numeral(5), new Numeral(7))),
    new PrintStatement(new CallExpression(new Identifier("sqrt"), [new Numeral(100)])),
    new VariableDeclaration(new Identifier("x"), new Numeral(100)),
]));
const hello = new Program(new Block([new PrintStatement(new Numeral(0x07734))]));
export function interpret(p) {
    return p.interpret(memory);
}
interpret(sample);
