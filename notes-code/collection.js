// 1. Array（类似 Java 的 ArrayList/C++ 的 vector）
const arr = [1, 2, 3];
arr.push(4); // 添加元素
console.log(arr.at(-1)); // ES2022: 4，负索引访问
console.log();

// 2. Map（类似 Java 的 HashMap/C++ 的 std::map）
const map = new Map();
map.set('a', 1);
map.set('b', 2);
console.log(map.get('a')); // 1
for (const [k, v] of map) console.log(k, v); // 遍历
console.log();

// 3. Set（类似 Java 的 HashSet/C++ 的 std::set）
const set = new Set([1, 2, 3]);
set.add(4);
console.log(set.has(2)); // true
for (const v of set) console.log(v);
console.log();

// 4. Array grouping（ES2023+，类似 SQL 的 group by）
const users = [
  { name: 'Alice', group: 'A' },
  { name: 'Bob', group: 'B' },
  { name: 'Carol', group: 'A' }
];
const grouped = Object.groupBy(users, u => u.group);
console.log(grouped);
console.log();

// 5. Map/Set with Symbol.iterator and spread
const map2 = new Map([['x', 10], ['y', 20]]);
const objFromMap = Object.fromEntries(map2);
console.log(objFromMap);
console.log();

// 6. 新增方法：Array.prototype.toSorted/toReversed/toSpliced
const nums = [3, 1, 2];
console.log(nums.toSorted()); // [1,2,3]
console.log(nums.toReversed()); // [2,1,3]