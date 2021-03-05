## React functional components cheatsheet

### Table of Contents

**[JSX](#jsx)**<br>
**[State Vs Props](#state-vs-props)**<br>
**[Event Handling](#event-handling)**<br>
**[Form Handling](#form-handling)**<br>
**[React Router](#react-router)**<br>
**[Context](#react-context)**<br>

### Focus on Desired User Interface, not how to get there

To quote from the react documentation

> In our experience, thinking about how the UI should look at any given moment,
> rather than how to change it over time, eliminates a whole class of bugs.

So, instead of thinking in terms of changes

```js
function updateClock() {
  const clockEl = document.getElementById("clock");
  clockEl.innerHTML = new Date().toLocaleTimeString();
}
```

You just describe the clock:

```js
function tick() {
  const element = <span id="clock">{new Date().toLocaleTimeString()}.</span>;
  ReactDOM.render(element, document.getElementById("root"));
}

setInterval(tick, 1000);
```

### Everything is nested Components

In React, everything that appears on screen is a Component.

Components are composed of other components. [A good
example](https://reactjs.org/docs/components-and-props.html#extracting-components).

Each component should be stand-alone. That is to say, a component knows about
the DOM elements and components that make it up, but it doesn't know anything
about the context in which it is being rendered.

Components always return JSX.

## JSX

### Multi-line JSX Expressions should be wrapped in `()`'s

Though optional in some specific cases, it's best to always include these
parenthesis

```js
const element = (
  <h1>Hello, world!</h1>
  <p>I'd like to welcome you to the world of React</p>
);
```

### Inside JSX, `{}`'s can take any JavaScript expression

From the simple

```js
const name = "Ian";
const element = <h1>Hello, {name}</h1>;
```

To the complex

```js
const firstName = "Ian";
const lastName = "Bentley";

const element = (
  <h1>
    Hello, {firstName} {lastName === undefined ? "Smith" : lastName}
  </h1>
);
```

### Gotchas

- Don’t put quotes around curly braces when embedding a JavaScript expression in
  an attribute. You should either use quotes (for string values) or curly braces
  (for expressions), but not both in the same attribute.

```js
// Yes!
const element = <div tabIndex="0"></div>;

// Yes!
const element = <img src={user.avatarUrl}></img>;

// No!
const element = <img src="{user.avatarUrl}"></img>;
```

- By default, React DOM escapes any values embedded in JSX before rendering them

## Components

## State vs Props

To pass down props into a component you define the prop wherever the component
is being rendered. In this example, `name` is a prop with the value of `James`.

```js
function App() {
  return <Welcome name="James" />;
}
```

To access the props, you have to pass them
into the component as a parameter - the simplest function components are defined
as:

```js
function Welcome(props) {
  return <h1> Hello, {props.name}</h1>;
}
```

props is an object that can be destructured. It is good practice to destructure
the props in the parameter. Here is 3 ways of getting the name key from props.

```js
const Welcome = (props) => {
  return <h1> Hello, {props.name}</h1>;
};

const Welcome = (props) => {
  const { name } = props;
  return <h1> Hello, {name}</h1>;
};

const Welcome = ({ name }) => {
  return <h1> Hello, {name}</h1>;
};
```

> State is similar to props, but it is private and fully controlled by the
> component. `props` don't change over time, but `state` does.

In order to use state in function components, you need to import
[useState](https://reactjs.org/docs/hooks-state.html) from 'react'.

```js
import { useState } from "react";

// Notice you are not using props in this component so you don't have to add it as a parameter if you don't need it.
const Clock = () => {
  const [date, setDate] = useState(new Date());
  return <h2>It is {date.toLocaleTimeString()}.</h2>;
};
```

While props are _immutable_, state changes over time. With _every_ change to
state, react will re-render the component.

### State Gotchas

#### Never modify state directly

You should never modify `state` directly. Doing so will not result in a render,
and it is bad practice. Instead use the updater function given from `useState`.

To learn more about the updater function and what is returned from useState,
[click
here](https://reactjs.org/docs/hooks-state.html#tip-what-do-square-brackets-mean)

```js
import { useState } from "react";

const Person = () => {
  const [age, setAge] = useState(27);

  const increaseAge = () => setAge(age + 1)

  return (
      <div> I am {age} years old <div>
      <button onClick={increaseAge}> Increase Age </button>
  )
};
```

In the above example, calling setAge updates the age slice of state.

You can do it this way but if the new state is computed using the previous
state, you should pass a function to setState that accepts the previous states
value as the parameter to the function to prevent any potential bugs. The
function will receive the previous value, and return an updated value.

```js
// Never!!
age = age + 1;

// better
setAge(age + 1);

// best
setAge((previousAge) => previousAge + 1);
```

### Only the current component can see it's state

Other instances of the same component will have isolated state's, the parent of
a component don't have access to a child component's state, etc.

## Components that render a list

Utilize `map` in order to create an array of elements, which you can then
reference in the full JSX.

Make sure that you assign a key to each element in the list. Keys help React
identify which items have changed, are added, or are removed. Keys should be
given to the elements inside the array to give the elements a stable identity.

```js
function NumberList(props) {
  const numbers = props.numbers;
  const listItems = numbers.map((number) => (
    <li key={number.toString()}>
          {number}
    </li>
    );
  );
  return (
    <ul>{listItems}</ul>
  );
}
```

The best way to pick a key is to use a string that uniquely identifies a list
item among its siblings. Most often you would use IDs from your data as keys:

```js
const todoItems = todos.map((todo) => <li key={todo.id}>{todo.text}</li>);
```

When you don’t have stable IDs for rendered items, you may use the item index as a key as a last resort. Do not use index for the keys if the order of items may change. This can negatively impact performance and may cause issues with component state.

```js
const todoItems = todos.map((todo, index) => <li key={index}>{todo.text}</li>);
```

### Gotchas

1. Keys only make sense in the context of the surrounding array. For example, if
   you extract a `ListItem` component, you should keep the key on the `<ListItem />` elements in the array rather than on the `<li>` element in the ListItem
   itself. For example:

```js
const listItems = numbers.map(number => (
    <ListItem key={number.toString()} number={number}>
))
```

2. Keys must be unique among their siblings, but do not need to be globally
   unique.

## UseEffect Hook

The `useEffect` hook lets you perform side effects in your function components.
To learn more about useEffect I encourage you to read [this
page](https://reactjs.org/docs/hooks-effect.html) on the react docs.

I also encourage you to read over all the React docs when you can find the time.
As of the writing of this markdown file, the react core team is currently
rewriting the entire docs to focus on function components rather than class
components. The [hooks](https://reactjs.org/docs/hooks-intro.html) section of
the docs will be very useful to you!

## Event handling

In react, you generally don't use `addEventListener`, instead just provide an
inline listener in your JSX.

In vanilla JavaScript, you might do:

```js
const button = document.getElementById("button");
button.addEventListener("click", handleClick);
```

While in react you would do:

```js
function MyComponent() {
  const handleClick = () => {
    console.log("button was clicked!");
  };

  return (
    <button id="button" onClick={handleClick}>
      myButton
    </button>
  );
}
```

or

```js
return (
  <button id="button" onClick={() => console.log("button was clicked!")}>
    myButton
  </button>
);
```

## Form Handling

### Some form elements don't work the same in JSX and in HTML

In HTML a `textarea` element specifies it's value by populating it's
`innerText`:

```html
<textarea>
  This child content is equivalent to the _value_ attribute of a normal input.
</textarea>
```

In another exception, `select` elements specify their value by setting the
`selected` attribute on an `option` element:

```html
<select>
  <option value="visa">Visa</option>
  <option value="mc" selected>MasterCard</option>
  <option value="amex">AmericanExpress</option>
</select>
```

React makes this behaviour more consistent, by supporting a `value` attribute on
`select` and `textarea` fields, so:

```js
import { useState } from "react";

const EssayForm = () => {
  const [value, setValue] = useState("Please write an essay");

  return (
    <form>
      <label>
        Essay:
        <textarea value={value} onChange={(e) => setValue(e.target.value)} />
      </label>
    </form>
  );
};
```

and

```js
import { useState } from "react";

function PaymentForm() {
  const [value, setValue] = useState("amex");

  return (
    <select value={value} onChange={(e) => setValue(e.target.value)}>
      <option value="visa">Visa</option>
      <option value="mc">MasterCard</option>
      <option value="amex">AmericanExpress</option>
    </select>
  );
}
```

## React Router

You will use `react-router-dom` as your routing library. This will allow you to
control what components to display using the browser location.

### react-router-dom main components

```js
import {
  BrowserRouter
  Switch,
  Route,
  NavLink
} from "react-router-dom";
```

`<BrowserRouter></BrowserRouter>` enables the use of the other react-router-dom
components and passes routing information to all its descendant components. All
other Browser related components must be children of the `BrowserRouter`
component.

`<Switch></Switch>` wraps several `<Route .../>` components, rendering just the
first matched Route, and no others.

`<Route path="/about"> <About/> </Route` connects specific URLs to specific
components to render.

`<NavLink to="/about" activeClassName="selected">About</NavLink>` works like an
anchor tag, updating the URL in the browser. It adds an additional styling
attribute when the current URL matches the path. If you do not define an
activeClassName, then `.active` is the default.

### A simple example

```js
import { BrowserRouter, Route, Switch, NavLink } from "react-router-dom";

const Routes = () => {
  return (
    <BrowserRouter>
      <div>
        <nav>
          <ul>
            <li>
              <NavLink to="/about">About</NavLink>
            </li>
            <li>
              <NavLink to="/blog">Blog</NavLink>
            </li>
          </ul>
          <Switch>
            <Route path="/about">
              <About />
            </Route>
            <Route path="/blog">
              <Blog />
            </Route>
          </Switch>
        </nav>
      </div>
    </BrowserRouter>
  );
};
```

### Routes with url parameters

```js
<Route path="/users/:userId">
  <UserShow />
</Route>
```

When a route is matched, the values passed through the url parameters (`:userId`
for example) are accessible through the `useParams` hook from
`react-router-dom`.

```js

import {useParams} from 'react-router-dom'

const UserShow = () = {
    const {userId} = useParams()
    return (
    <h1>Hello User {userId}</h1>
    );
}
```

## React Context

### Context Providers, Consumers, and useContext

React Contexts act like `topic` queues, in that any component can hook into the
context to receive its value. That is to say, anything passed to the Provider's
`value` will be available to any component that uses the `useContext` hook for a
particular context. It is common to have the value be an object containing what
you want to be accessible by your consumers.

### Defining a Provider

This will create a Context wrapper. You are using state in this component to
store your user object that is then passed into your context providers value so
that your other components can have access to both the user and the updater
function to update the user object.

`/src/context/UserContext.js`

```js
import { useState, createContext } from "react";

export const UserContext = createContext();

function UserContextWrapper({ children }) {
  const [user, setUser] = useState({ name: "James", age: 27 });
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContextWrapper;
```

### Defining a Consumer

In order to allow your component to utilize the properties passed through the
context all you have to do is use the `useContext` hook from `react`, passing in
the context you want to use. Make sure that the components that need access to
to a particular context are children of the `UserContextWrapper` component. Like
so:

```js
import UserContextWrapper from "./context/UserContext";

const App = () => (
  // By wrapping Consumer inside of the UserContextWrapper component, Consumer now has access to the user object!
  <UserContextWrapper>
    <Consumer />
  </UserContextWrapper>
);
```

So now the Consumer component can hook into the context to receive the user
object!

`Consumer.js`

```js
import { useContext } from "react";
import { UserContext } from "./UserContext";

const Consumer = () => {
  const { user, setUser } = useContext(UserContext);

  const updateUserAge = () => {
      const newAge = user.age + 1
      // Notice here that you are creating a new object (Never mutate state), spreading out the user keys,
      // and then changing the age key value to be newAge. This will overwrite the previous age from the spread operation.
      setUser({...user, age: newAge})
  }

  return (
    <div>
      Hello my name is {user.name} and I am {user.age} years old.{" "}
    </div>
    <button onClick={updateUserAge}> Update Age </button>
  );
};
```
