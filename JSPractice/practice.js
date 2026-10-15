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