**Describe the bug**
This bug was noticed while programming in TypeScript.
`daa` and `dia` should delete object literal attributes like if they were function arguments (including or excluding the commas, respectively)
However, it it doesn't work with object attributes.

**To Reproduce**
<c> means the cursor is on top of c

1a. Setup
```typescript
const o = {attr1: "something", a<t>tr2: "something else"}
```
2a. Press daa


--- 
1b. Setup
```typescript
const o = {attr1: "something", a<t>tr2: "something else"}
```
2b. Press dia


```typescript

export type TExpression = {
    left: TExpression,
    operator: "-" | "+",
    right :TExpression,
} | TTerm

export type TTerm  = {
    left: TTerm ,
    operator: "*" | "/",
    right: TTerm
} | TFactor

export type TFactor = Value | TUnaryOperation|TExpression;

```



**Expected behavior**
After 2a, expected is:
```typescript
const o = {attr1: "something"}
```

But we got:
```typescript
const o = {attr1: "something", a<t>tr2: "something else"}
```
(Nothing happened)



After 2b, expected is:
```typescript
const o = {attr1: "something",}
```

But we got:
```typescript
const o = {attr1: "something", a<t>tr2: "something else"}
```
(Nothing happened)


**Aditional Context**
This situation is also observed with `cia` and `caa`
I know the original vim-target plugin does not target things like typescript object attributes.
I wouldn't have "slkfjalskfjalskdfjl laskfjaldfjksdkl flaskdfj" this issue, if not for the fact that this `daa`and `dia` actually work on object attributes in some circumstances eg. when the object is an argument to a function.
Example
<d> means the cursor is on top of d 


```typescript
someFunc({as<d>f1:10,asdf2:15});
```
Pressing `daa` in the situation will result in 
```typescript
someFunc(sdf2:15});
```
Either `dia` and `daa` should not work at all on object attributes (which I would not want, since I think it is a very useful feature)
This behaviour is, however, not correct: it is deleting everything (backwards) until the `(`, which does not make sense in this context.
I will open another issue for this, as I think it is a bug.
