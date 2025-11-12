let a = 1;
let b = 2;

a = a ^ b;
console.log(`a: ${a} b: ${b}`);
b = a ^ b;
console.log(`a: ${a} b: ${b}`);
a = a ^ b;
console.log(`a: ${a} b: ${b}`);
