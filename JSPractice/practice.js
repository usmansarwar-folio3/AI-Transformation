console.log("Hello, World!");
console.log("Node.js is working!");
console.log("10"+5); // 105
console.log("10"-5); // 5
console.log("10"*5); // 50
console.log("10"/5); // 2
console.log("10"%5); // 0
console.log("10"**5); // 100000
console.log("10"**5); // 100000
console.log(5+"10"); // 510

const userName = "Usman";
const userAge = 32;
console.log(`Hello, my name is ${userName}-type ${typeof userName} and I am ${userAge}-type ${typeof userAge} years old.`);

const isEven = (number) => {
  return number % 2 === 0;
}
console.log(isEven(10)); // true
console.log(isEven(11)); // false

const cartItems = 3;
console.log(`${userName} has ${cartItems} items in their cart`);

// JavaScript Practice: 10 Output Prediction Exercises
//=========Topics: Types, Conditions, Functions, Arrays, and Scope =====

console.log(typeof '42'); // string

console.log(5 + '2'); // 52

console.log(Boolean('')); // false

const x = 8;

if (x > 10) {
  console.log('A');
} else {
  console.log('B');
} // B


function add(a, b = 2) {
  return a + b;
}

console.log(add(3)); // 5

const double = n => n * 2;

console.log(double(4)); // 8

const nums = [2, 4, 6];

console.log(nums[1]); // 4

const fruits = ['apple', 'banana'];

for (const f of fruits) {
  if (f === 'apple') continue;

  console.log(f);
} // banana

let xy = 10;

{
  let xy = 20;
}

console.log(xy); // 10

function test() {
  var z = 5;
}

console.log(typeof z); // undefined

