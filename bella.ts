// n:Numeral
// i:Identifier
// uop: UnaryOp = ! | -
// bop: BinaryOp = < | <= | == | != | >= | >
// e:Expression=n|i|true|false| uop e| e1 bop e2| ie∗|e ? e1:e2 | [e*] | e[e]
// s: Statement = let i = e | func i i* = e | i = e | print e | while e b
// b: Blocl = block s*
// p = Program = program b 

import { get } from "http";
import util from "util";
import { measureMemory } from "vm";

type Value = 
    | number
    | boolean
    | Value[]
    | ((...args: number[]) => Value)
    | [Identifier[], Expression];

type Memory = { [key: string]: any };
//type Memory = Map<string, Value>;

let memory = new Map<string, any>();
memory.set("sqrt", Math.sqrt);
memory.set("hypot", Math.hypot)


class Program{
    constructor(public block: Block) {}
    interpret(memory: Memory) {
        return this.block.interpret(memory);
    }
}

class Block{
    constructor(public statements: Statement[]) {}
    interpret(memory: Memory){
        for (let statement of this.statements){
            statement.interpret(memory)
        }
    }
}

interface Statement {
    interpret(memory: Memory): void;
}

class VariableDeclaration implements Statement{
    constructor(public id: Identifier, public expression: Expression){}
    interpret(memory: Memory): void {
        if (memory.has(this.id.name)){
            throw new Error("Variable already declared")
        }
        memory.set(this.id.name, this.expression.interpret(memory));
    }
}


class FunctionDeclaration implements Statement{
    constructor(
        public name: Identifier, 
        public parameters: Identifier[], 
        public expression: Expression
        ) {}
        interpret(memory: Memory): void {
            memory[this.name.name] = {
                parameters: this.parameters,
                body: this.expression,
              };
        }
}

class Assignment implements Statement {
    constructor(
        public id: Identifier, 
        public expression: Expression
        ) {}
        interpret(memory: Memory): void {
            if (!memory.has(this.id.name)){
            throw new Error(`unkown variable: ${this.id.name}`);
        }
        memory.set(this.id.name, this.expression.interpret(memory))
    }
}

class PrintStatement implements Statement {
    constructor(
        public expression: Expression
        ) {}
        interpret(memory: Memory): void {
            console.log(this.expression.interpret(memory));
        }
}

class WhileStatement implements Statement{
    constructor(
        public expression: Expression,
        public block: Block
        ){}
        interpret(memory: Memory): void {
            while (this.expression.interpret(memory)){
                this.block.interpret(memory);
            }
        }
}

interface Expression{
    interpret(memory: Memory): number | boolean | (number | boolean)[];
}

class Numeral implements Expression{
    constructor(public value: number[]) {}
    interpret(memory: Memory): number[] {
        // console.log("this.value ", this.value)
        return this.value;
    }
}

class Identifier implements Expression{
    constructor(public name: string) {}
    interpret(memory: Memory): number {
        // const value = memory[this.name];
        const value = memory.get(this.name);
        if (value === undefined){
            throw new Error(`Unknown variable: ${this.name}`);
        } else if (typeof value != "number"){
            throw new Error(`Variable is not a number: ${this.name}`);
        }
        return value;
    }
}

class BooleanLiteral implements Expression{
    constructor(public value: boolean) {}
    interpret(memory: Memory): boolean {
        return this.value;
    }
}

class UnaryExpression implements Expression {
    constructor(public operator: string, public expression: Expression) {}
    interpret(memory: Memory): number {
        switch (this.operator) {
            case "-":
              return -this.expression.interpret(memory);
            case "!":
                if(!this.expression.interpret(memory)){
                    return 1;
                }
                else{
                    return 0;
                }
            default:
              throw new Error(`Unknown operator: ${this.operator}`);
          }
    }
}

class BinaryExpression implements Expression {
    constructor(
        public operator: string, 
        public left: Expression,
        public right: Expression
        ) {}
        interpret(memory : Memory): number | boolean{
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
                    if(this.left.interpret(memory) < this.right.interpret(memory)){
                        return true;
                    } else {
                        return false;
                    }
                case "<=":
                    if(this.left.interpret(memory) < this.right.interpret(memory) ||  this.left.interpret(memory) == this.right.interpret(memory)){
                        return true;
                    } else {
                        return false;
                    }
                case ">":
                    if(this.left.interpret(memory) > this.right.interpret(memory)){
                        return true;
                    } else {
                        return false;
                    }
                case "<=":
                    if(this.left.interpret(memory) < this.right.interpret(memory) ||  this.left.interpret(memory) == this.right.interpret(memory)){
                        return true;
                    } else {
                        return false;
                    }
                case "==":
                    if(this.left.interpret(memory) == this.right.interpret(memory)){
                        return true;
                    } else {
                        return false;
                    }
                case "!=":
                    if(this.left.interpret(memory) != this.right.interpret(memory)){
                        return true;
                    } else {
                        return false;
                    }
                default:
                  throw new Error(`Unknown operator: ${this.operator}`);
              }
        }
}

class CallExpression implements Expression {
    constructor(
        public name: Identifier, 
        public args: Expression[]
        ) {}
        interpret(memory: Memory): number | boolean {
            const fn = memory.get(this.name.name);
        if (typeof fn !== "function") {
            throw new Error(`Unknown function: ${this.name.name}`);
        }
        return fn(...this.args.map((arg) => arg.interpret(memory)));
    }
}


class ConditionalExpression implements Expression {
    constructor(
        public condition: Expression, 
        public consequent: Expression,
        public alternate: Expression
        ) {}
    interpret(memory: Memory): number | boolean | (number | boolean)[] {
        return this.condition.interpret(memory)
        ? this.consequent.interpret(memory)
        : this.alternate.interpret(memory);
    }
}

class ArrayLiteral implements Expression {
    constructor(public elements: Expression[]){}

    interpret(memory: Memory): number | boolean | (number | boolean)[] {
        return this.elements.map((e) => e.interpret(memory));
    }
}

class SubscriptExpression implements Expression {
    constructor(
        public array: Expression,
        public subscript: Expression
        ){}
    interpret(memory: Memory): number {
        const arrayValue = this.array.interpret(memory);
        const subscriptValue = this.subscript.interpret(memory);
        if (typeof subscriptValue !== "number"){
            throw new Error("Subscript must be a number");
        }
        else if (Array.isArray(arrayValue)) {
            throw new Error("subscripted value must be an array");
        } else{
            return 0;
            // return this.arrayValue[subscriptValue];
        }
    }
}

//run the interpreter here
const sample: Program = new Program(
    new Block([
        new PrintStatement(new UnaryExpression("-", new Numeral(11))),
        new PrintStatement(
            new BinaryExpression("*", new Numeral(8), new Numeral(100))
        ),
        new PrintStatement(
            new BinaryExpression("<", new Numeral(5), new Numeral(7))
        ),
        new PrintStatement(new CallExpression(new Identifier("sqrt"), [new Numeral(100)])),
        new VariableDeclaration(new Identifier("x"), new Numeral(100)),
    ])
)

const hello: Program = new Program(
    new Block([ new PrintStatement(new Numeral(0x07734))])
);

export function interpret(p : Program){
    return p.interpret(memory);
}

interpret(sample)

