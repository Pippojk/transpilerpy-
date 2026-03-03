export class Program{
    constructor(body){
        this.type = "Program";
        this.body = body;
    }
}

export class Assign{
    constructor(target, value){
        this.type = "Assign";
        this.target = target;
        this.value = value;
    }
}

export class Change{
    constructor(target, op, index, value){
        this.type = "change";
        this.target = target;
        this.op = op;
        this.value = value;
        this.index = index;
    }
}

export class Name{
    constructor(value){
        this.type = "name";
        this.value = value;
    }
}

export class String{
    constructor(value){
        this.type = "string";
        this.value = value;
    }
}

export class List{
    constructor(args){
        this.type = "list";
        this.args = args;
    }
}

export class Index{
    constructor(object, index){
        this.type = "index";
        this.object = object;
        this.index = index;
    }
}

export class Print{
    constructor(value, argEnd){
        this.type = "print";
        this.value = value;
        this.argEnd = argEnd;
    }
}

export class Binary{
    constructor(op, left, right){
        this.type = "binary";
        this.left = left;
        this.op = op;
        this.right = right;
    }
}

export class If{
    constructor(condition, body, elseBody){
        this.type = "if";
        this.condition = condition; //Binary
        this.body = body;
        this.elseBody = elseBody;
    }
}

export class Number{
    constructor(argument){
        this.type = "number";
        this.argument = argument;
    }
}

export class Exp{
    constructor(value){
        this.type = "exp";
        this.value = value;
    }
}

export class For{
    constructor(locVar, start, end, body){
        this.type = "for";
        this.locVar = locVar;
        this.start = start;
        this.end = end;
        this.body = body;
    }
}

export class While{
    constructor(condition, body){
        this.type = "while";
        this.condition = condition;
        this.body = body;
    }
}

export class Break{
    constructor(){
        this.type = "break";
    }
}

export class Continue{
    constructor(){
        this.type = "continue";
    }
}

export class Len{
    constructor(arg){
        this.type = "len";
        this.arg = arg;
    }
}

export class Function{
    constructor(name, par, body){
        this.type = "function";
        this.name = name;
        this.par = par;
        this.body = body;
    }
}

export class Call{
    constructor(callee, args){
        this.type = "call";
        this.callee = callee;
        this.args = args;
    }
}

export class Return{
    constructor(arg){
        this.type = "return";
        this.arg = arg;
    }
}

export class Input{
    constructor(arg){
        this.type = "input";
        this.arg = arg;
    }
}