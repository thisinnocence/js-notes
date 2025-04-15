const target = {
  msg: "Hello",
};

const handler = {
  get(obj, prop) {
    console.log(`Accessed property: ${prop}`);
    return obj[prop];
  },
};

const proxy = new Proxy(target, handler);

// output:
//   Accessing the property
//   Hello
console.log(proxy.msg);

function reactive(obj, onChange) {
  return new Proxy(obj, {
    set(target, prop, value) {
      const old = target[prop];
      const result = Reflect.set(target, prop, value);
      if (old !== value) {
        onChange(prop, value);
      }
      return result;
    },
  });
}

const state = reactive({ count: 0 }, (prop, val) => {
  console.log(`State changed: ${prop} -> ${val}`);
});

// output:
//   State changed: count -> 1
state.count++; 