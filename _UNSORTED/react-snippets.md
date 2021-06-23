<p>Renders an accordion menu with multiple collapsible content elements.</p>
<ul>
<li>Define an <code>AccordionItem</code> component, that renders a <code>&lt;button&gt;</code> which is used to update the component and notify its parent via the <code>handleClick</code> callback.</li>
<li>Use the <code>isCollapsed</code> prop in <code>AccordionItem</code> to determine its appearance and set an appropriate <code>className</code>.</li>
<li>Define an <code>Accordion</code> component that uses the <code>useState()</code> hook to initialize the value of the <code>bindIndex</code> state variable to <code>defaultIndex</code>.</li>
<li>Filter <code>children</code> to remove unnecessary nodes except for <code>AccordionItem</code> by identifying the function’s name.</li>
<li>Use <code>Array.prototype.map()</code> on the collected nodes to render the individual collapsible elements.</li>
<li>Define <code>changeItem</code>, which will be executed when clicking an <code>AccordionItem</code>’s <code>&lt;button&gt;</code>.</li>
<li><code>changeItem</code> executes the passed callback, <code>onItemClick</code>, and updates <code>bindIndex</code> based on the clicked element.</li>
</ul>
<div class="sourceCode" id="cb1"><pre class="sourceCode css"><code class="sourceCode css"><a class="sourceLine" id="cb1-1" title="1"><span class="fu">.accordion-item.collapsed</span> {</a>
<a class="sourceLine" id="cb1-2" title="2">  <span class="kw">display</span>: <span class="dv">none</span><span class="op">;</span></a>
<a class="sourceLine" id="cb1-3" title="3">}</a>
<a class="sourceLine" id="cb1-4" title="4"></a>
<a class="sourceLine" id="cb1-5" title="5"><span class="fu">.accordion-item.expanded</span> {</a>
<a class="sourceLine" id="cb1-6" title="6">  <span class="kw">display</span>: <span class="dv">block</span><span class="op">;</span></a>
<a class="sourceLine" id="cb1-7" title="7">}</a>
<a class="sourceLine" id="cb1-8" title="8"></a>
<a class="sourceLine" id="cb1-9" title="9"><span class="fu">.accordion-button</span> {</a>
<a class="sourceLine" id="cb1-10" title="10">  <span class="kw">display</span>: <span class="dv">block</span><span class="op">;</span></a>
<a class="sourceLine" id="cb1-11" title="11">  <span class="kw">width</span>: <span class="dv">100</span><span class="dt">%</span><span class="op">;</span></a>
<a class="sourceLine" id="cb1-12" title="12">}</a>



</div>


```js

const AccordionItem = ({ label, isCollapsed, handleClick, children }) =&gt; {
  return (
    &lt;&gt;
      &lt;button className=&quot;accordion-button&quot; onClick={handleClick}&gt;
        {label}
      &lt;/button&gt;
      &lt;div
        className={`accordion-item ${isCollapsed ? &quot;collapsed&quot; : &quot;expanded&quot;}`}
        aria-expanded={isCollapsed}
      &gt;
        {children}
      &lt;/div&gt;
    &lt;/&gt;
  );
};

const Accordion = ({ defaultIndex, onItemClick, children }) =&gt; {
const [bindIndex, setBindIndex] = React.useState(defaultIndex);

const changeItem = (itemIndex) =&gt; {
if (typeof onItemClick === &quot;function&quot;) onItemClick(itemIndex);
if (itemIndex !== bindIndex) setBindIndex(itemIndex);
};
const items = children.filter((item) =&gt; item.type.name === &quot;AccordionItem&quot;);

return (
&lt;&gt;
{items.map(({ props }) =&gt; (
&lt;AccordionItem
isCollapsed={bindIndex !== props.index}
label={props.label}
handleClick={() =&gt; changeItem(props.index)}
children={props.children}
/&gt;
))}
&lt;/&gt;
);
};



<hr />

```js

ReactDOM.render(
  &lt;Accordion defaultIndex=&quot;1&quot; onItemClick={console.log}&gt;
    &lt;AccordionItem label=&quot;A&quot; index=&quot;1&quot;&gt;
      Lorem ipsum
    &lt;/AccordionItem&gt;
    &lt;AccordionItem label=&quot;B&quot; index=&quot;2&quot;&gt;
      Dolor sit amet
    &lt;/AccordionItem&gt;
  &lt;/Accordion&gt;,
  document.getElementById(&quot;root&quot;)
);

```

<hr />
<p>Renders an alert component with <code>type</code> prop.</p>
<ul>
<li>Use the <code>useState()</code> hook to create the <code>isShown</code> and <code>isLeaving</code> state variables and set both to <code>false</code> initially.</li>
<li>Define <code>timeoutId</code> to keep the timer instance for clearing on component unmount.</li>
<li>Use the <code>useEffect()</code> hook to update the value of <code>isShown</code> to <code>true</code> and clear the interval by using <code>timeoutId</code> when the component is unmounted.</li>
<li>Define a <code>closeAlert</code> function to set the component as removed from the DOM by displaying a fading out animation and set <code>isShown</code> to <code>false</code> via <code>setTimeout()</code>.</li>
</ul>
<div class="sourceCode" id="cb4"><pre class="sourceCode css"><code class="sourceCode css"><a class="sourceLine" id="cb4-1" title="1"><span class="im">@keyframes</span> leave {</a>
<a class="sourceLine" id="cb4-2" title="2">  <span class="dv">0%</span> {</a>
<a class="sourceLine" id="cb4-3" title="3">    <span class="kw">opacity</span>: <span class="dv">1</span><span class="op">;</span></a>
<a class="sourceLine" id="cb4-4" title="4">  }</a>
<a class="sourceLine" id="cb4-5" title="5">  <span class="dv">100%</span> {</a>
<a class="sourceLine" id="cb4-6" title="6">    <span class="kw">opacity</span>: <span class="dv">0</span><span class="op">;</span></a>
<a class="sourceLine" id="cb4-7" title="7">  }</a>
<a class="sourceLine" id="cb4-8" title="8">}</a>
<a class="sourceLine" id="cb4-9" title="9"></a>
<a class="sourceLine" id="cb4-10" title="10"><span class="fu">.alert</span> {</a>
<a class="sourceLine" id="cb4-11" title="11">  <span class="kw">padding</span>: <span class="dv">0.75</span><span class="dt">rem</span> <span class="dv">0.5</span><span class="dt">rem</span><span class="op">;</span></a>
<a class="sourceLine" id="cb4-12" title="12">  <span class="kw">margin-bottom</span>: <span class="dv">0.5</span><span class="dt">rem</span><span class="op">;</span></a>
<a class="sourceLine" id="cb4-13" title="13">  <span class="kw">text-align</span>: <span class="dv">left</span><span class="op">;</span></a>
<a class="sourceLine" id="cb4-14" title="14">  <span class="kw">padding-right</span>: <span class="dv">40</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb4-15" title="15">  <span class="kw">border-radius</span>: <span class="dv">4</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb4-16" title="16">  <span class="kw">font-size</span>: <span class="dv">16</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb4-17" title="17">  <span class="kw">position</span>: <span class="dv">relative</span><span class="op">;</span></a>
<a class="sourceLine" id="cb4-18" title="18">}</a>
<a class="sourceLine" id="cb4-19" title="19"></a>
<a class="sourceLine" id="cb4-20" title="20"><span class="fu">.alert.warning</span> {</a>
<a class="sourceLine" id="cb4-21" title="21">  <span class="kw">color</span>: <span class="cn">#856404</span><span class="op">;</span></a>
<a class="sourceLine" id="cb4-22" title="22">  <span class="kw">background-color</span>: <span class="cn">#fff3cd</span><span class="op">;</span></a>
<a class="sourceLine" id="cb4-23" title="23">  <span class="kw">border-color</span>: <span class="cn">#ffeeba</span><span class="op">;</span></a>
<a class="sourceLine" id="cb4-24" title="24">}</a>
<a class="sourceLine" id="cb4-25" title="25"></a>
<a class="sourceLine" id="cb4-26" title="26"><span class="fu">.alert.error</span> {</a>
<a class="sourceLine" id="cb4-27" title="27">  <span class="kw">color</span>: <span class="cn">#721c24</span><span class="op">;</span></a>
<a class="sourceLine" id="cb4-28" title="28">  <span class="kw">background-color</span>: <span class="cn">#f8d7da</span><span class="op">;</span></a>
<a class="sourceLine" id="cb4-29" title="29">  <span class="kw">border-color</span>: <span class="cn">#f5c6cb</span><span class="op">;</span></a>
<a class="sourceLine" id="cb4-30" title="30">}</a>
<a class="sourceLine" id="cb4-31" title="31"></a>
<a class="sourceLine" id="cb4-32" title="32"><span class="fu">.alert.leaving</span> {</a>
<a class="sourceLine" id="cb4-33" title="33">  <span class="kw">animation</span>: leave <span class="dv">0.5</span><span class="dt">s</span> <span class="dv">forwards</span><span class="op">;</span></a>
<a class="sourceLine" id="cb4-34" title="34">}</a>
<a class="sourceLine" id="cb4-35" title="35"></a>
<a class="sourceLine" id="cb4-36" title="36"><span class="fu">.alert</span> <span class="fu">.close</span> {</a>
<a class="sourceLine" id="cb4-37" title="37">  <span class="kw">position</span>: <span class="dv">absolute</span><span class="op">;</span></a>
<a class="sourceLine" id="cb4-38" title="38">  <span class="kw">top</span>: <span class="dv">0</span><span class="op">;</span></a>
<a class="sourceLine" id="cb4-39" title="39">  <span class="kw">right</span>: <span class="dv">0</span><span class="op">;</span></a>
<a class="sourceLine" id="cb4-40" title="40">  <span class="kw">padding</span>: <span class="dv">0</span> <span class="dv">0.75</span><span class="dt">rem</span><span class="op">;</span></a>
<a class="sourceLine" id="cb4-41" title="41">  <span class="kw">color</span>: <span class="cn">#333</span><span class="op">;</span></a>
<a class="sourceLine" id="cb4-42" title="42">  <span class="kw">border</span>: <span class="dv">0</span><span class="op">;</span></a>
<a class="sourceLine" id="cb4-43" title="43">  <span class="kw">height</span>: <span class="dv">100</span><span class="dt">%</span><span class="op">;</span></a>
<a class="sourceLine" id="cb4-44" title="44">  <span class="kw">cursor</span>: <span class="dv">pointer</span><span class="op">;</span></a>
<a class="sourceLine" id="cb4-45" title="45">  <span class="kw">background</span>: <span class="dv">none</span><span class="op">;</span></a>
<a class="sourceLine" id="cb4-46" title="46">  <span class="kw">font-weight</span>: <span class="dv">600</span><span class="op">;</span></a>
<a class="sourceLine" id="cb4-47" title="47">  <span class="kw">font-size</span>: <span class="dv">16</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb4-48" title="48">}</a>
<a class="sourceLine" id="cb4-49" title="49"></a>
<a class="sourceLine" id="cb4-50" title="50"><span class="fu">.alert</span> <span class="fu">.close</span><span class="in">:after</span> {</a>
<a class="sourceLine" id="cb4-51" title="51">  <span class="kw">content</span>: <span class="st">&quot;x&quot;</span><span class="op">;</span></a>
<a class="sourceLine" id="cb4-52" title="52">}</a>



</div>


```js

const Alert = ({ isDefaultShown = false, timeout = 250, type, message }) =&gt; {
  const [isShown, setIsShown] = React.useState(isDefaultShown);
  const [isLeaving, setIsLeaving] = React.useState(false);

let timeoutId = null;

React.useEffect(() =&gt; {
setIsShown(true);
return () =&gt; {
clearTimeout(timeoutId);
};
}, [isDefaultShown, timeout, timeoutId]);

const closeAlert = () =&gt; {
setIsLeaving(true);
timeoutId = setTimeout(() =&gt; {
setIsLeaving(false);
setIsShown(false);
}, timeout);
};

return (
isShown &amp;&amp; (
&lt;div
className={`alert ${type} ${isLeaving ? &quot;leaving&quot; : &quot;&quot;}`}
role=&quot;alert&quot;
&gt;
&lt;button className=&quot;close&quot; onClick={closeAlert} /&gt;
{message}
&lt;/div&gt;
)
);
};



<hr />

```js

ReactDOM.render(
  &lt;Alert type=&quot;info&quot; message=&quot;This is info&quot; /&gt;,
  document.getElementById(&quot;root&quot;)
);

```

<hr />
<p>Renders a string as plaintext, with URLs converted to appropriate link elements.</p>
<ul>
<li>Use <code>String.prototype.split()</code> and <code>String.prototype.match()</code> with a regular expression to find URLs in a string.</li>
<li>Return matched URLs rendered as <code>&lt;a&gt;</code> elements, dealing with missing protocol prefixes if necessary.</li>
<li>Render the rest of the string as plaintext.</li>
</ul>

```js

const AutoLink = ({ text }) =&gt; {
  const delimiter =
    /((?:https?:\/\/)?(?:(?:[a-z0-9]?(?:[a-z0-9\-]{1,61}[a-z0-9])?\.[^\.|\s])+[a-z\.]*[a-z]+|(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3})(?::\d{1,5})*[a-z0-9.,_\/~#&amp;=;%+?\-\\(\\)]*)/gi;

return (
&lt;&gt;
{text.split(delimiter).map((word) =&gt; {
const match = word.match(delimiter);
if (match) {
const url = match[0];
return (
&lt;a href={url.startsWith(&quot;http&quot;) ? url : `http://${url}`}&gt;{url}&lt;/a&gt;
);
}
return word;
})}
&lt;/&gt;
);
};

```

<hr />

```js

ReactDOM.render(
  &lt;AutoLink text=&quot;foo bar baz http://example.org bar&quot; /&gt;,
  document.getElementById(&quot;root&quot;)
);

```

<hr />
<p>Renders a link formatted to call a phone number (<code>tel:</code> link).</p>
<ul>
<li>Use <code>phone</code> to create a <code>&lt;a&gt;</code> element with an appropriate <code>href</code> attribute.</li>
<li>Render the link with <code>children</code> as its content.</li>
</ul>

```js

const Callto = ({ phone, children }) =&gt; {
  return &lt;a href={`tel:${phone}`}&gt;{children}&lt;/a&gt;;
};

```

<hr />

```js

ReactDOM.render(
  &lt;Callto phone=&quot;+302101234567&quot;&gt;Call me!&lt;/Callto&gt;,
  document.getElementById(&quot;root&quot;)
);

```

<hr />
<p>Renders a carousel component.</p>
<ul>
<li>Use the <code>useState()</code> hook to create the <code>active</code> state variable and give it a value of <code>0</code> (index of the first item).</li>
<li>Use the <code>useEffect()</code> hook to update the value of <code>active</code> to the index of the next item, using <code>setTimeout</code>.</li>
<li>Compute the <code>className</code> for each carousel item while mapping over them and applying it accordingly.</li>
<li>Render the carousel items using <code>React.cloneElement()</code> and pass down <code>...rest</code> along with the computed <code>className</code>.</li>
</ul>
<div class="sourceCode" id="cb11"><pre class="sourceCode css"><code class="sourceCode css"><a class="sourceLine" id="cb11-1" title="1"><span class="fu">.carousel</span> {</a>
<a class="sourceLine" id="cb11-2" title="2">  <span class="kw">position</span>: <span class="dv">relative</span><span class="op">;</span></a>
<a class="sourceLine" id="cb11-3" title="3">}</a>
<a class="sourceLine" id="cb11-4" title="4"></a>
<a class="sourceLine" id="cb11-5" title="5"><span class="fu">.carousel-item</span> {</a>
<a class="sourceLine" id="cb11-6" title="6">  <span class="kw">position</span>: <span class="dv">absolute</span><span class="op">;</span></a>
<a class="sourceLine" id="cb11-7" title="7">  <span class="kw">visibility</span>: <span class="dv">hidden</span><span class="op">;</span></a>
<a class="sourceLine" id="cb11-8" title="8">}</a>
<a class="sourceLine" id="cb11-9" title="9"></a>
<a class="sourceLine" id="cb11-10" title="10"><span class="fu">.carousel-item.visible</span> {</a>
<a class="sourceLine" id="cb11-11" title="11">  <span class="kw">visibility</span>: <span class="dv">visible</span><span class="op">;</span></a>
<a class="sourceLine" id="cb11-12" title="12">}</a>



</div>


```js

const Carousel = ({ carouselItems, ...rest }) =&gt; {
  const [active, setActive] = React.useState(0);
  let scrollInterval = null;

React.useEffect(() =&gt; {
scrollInterval = setTimeout(() =&gt; {
setActive((active + 1) % carouselItems.length);
}, 2000);
return () =&gt; clearTimeout(scrollInterval);
});

return (
&lt;div className=&quot;carousel&quot;&gt;
{carouselItems.map((item, index) =&gt; {
const activeClass = active === index ? &quot; visible&quot; : &quot;&quot;;
return React.cloneElement(item, {
...rest,
className: `carousel-item${activeClass}`,
});
})}
&lt;/div&gt;
);
};



<hr />

```js

ReactDOM.render(
  &lt;Carousel
    carouselItems={[
      &lt;div&gt;carousel item 1&lt;/div&gt;,
      &lt;div&gt;carousel item 2&lt;/div&gt;,
      &lt;div&gt;carousel item 3&lt;/div&gt;,
    ]}
  /&gt;,
  document.getElementById(&quot;root&quot;)
);

```

<hr />
<p>Renders a component with collapsible content.</p>
<ul>
<li>Use the <code>useState()</code> hook to create the <code>isCollapsed</code> state variable with an initial value of <code>collapsed</code>.</li>
<li>Use the <code>&lt;button&gt;</code> to change the component’s <code>isCollapsed</code> state and the content of the component, passed down via <code>children</code>.</li>
<li>Determine the appearance of the content, based on <code>isCollapsed</code> and apply the appropriate <code>className</code>.</li>
<li>Update the value of the <code>aria-expanded</code> attribute based on <code>isCollapsed</code> to make the component accessible.</li>
</ul>
<div class="sourceCode" id="cb14"><pre class="sourceCode css"><code class="sourceCode css"><a class="sourceLine" id="cb14-1" title="1"><span class="fu">.collapse-button</span> {</a>
<a class="sourceLine" id="cb14-2" title="2">  <span class="kw">display</span>: <span class="dv">block</span><span class="op">;</span></a>
<a class="sourceLine" id="cb14-3" title="3">  <span class="kw">width</span>: <span class="dv">100</span><span class="dt">%</span><span class="op">;</span></a>
<a class="sourceLine" id="cb14-4" title="4">}</a>
<a class="sourceLine" id="cb14-5" title="5"></a>
<a class="sourceLine" id="cb14-6" title="6"><span class="fu">.collapse-content.collapsed</span> {</a>
<a class="sourceLine" id="cb14-7" title="7">  <span class="kw">display</span>: <span class="dv">none</span><span class="op">;</span></a>
<a class="sourceLine" id="cb14-8" title="8">}</a>
<a class="sourceLine" id="cb14-9" title="9"></a>
<a class="sourceLine" id="cb14-10" title="10"><span class="fu">.collapsed-content.expanded</span> {</a>
<a class="sourceLine" id="cb14-11" title="11">  <span class="kw">display</span>: <span class="dv">block</span><span class="op">;</span></a>
<a class="sourceLine" id="cb14-12" title="12">}</a>



</div>


```js

const Collapse = ({ collapsed, children }) =&gt; {
  const [isCollapsed, setIsCollapsed] = React.useState(collapsed);

return (
&lt;&gt;
&lt;button
className=&quot;collapse-button&quot;
onClick={() =&gt; setIsCollapsed(!isCollapsed)}
&gt;
{isCollapsed ? &quot;Show&quot; : &quot;Hide&quot;} content
&lt;/button&gt;
&lt;div
className={`collapse-content ${isCollapsed ? &quot;collapsed&quot; : &quot;expanded&quot;}`}
aria-expanded={isCollapsed}
&gt;
{children}
&lt;/div&gt;
&lt;/&gt;
);
};



<hr />

```js

ReactDOM.render(
  &lt;Collapse&gt;
    &lt;h1&gt;This is a collapse&lt;/h1&gt;
    &lt;p&gt;Hello world!&lt;/p&gt;
  &lt;/Collapse&gt;,
  document.getElementById(&quot;root&quot;)
);

```

<hr />
<p>Renders a controlled <code>&lt;input&gt;</code> element that uses a callback function to inform its parent about value updates.</p>
<ul>
<li>Use the <code>value</code> passed down from the parent as the controlled input field’s value.</li>
<li>Use the <code>onChange</code> event to fire the <code>onValueChange</code> callback and send the new value to the parent.</li>
<li>The parent must update the input field’s <code>value</code> prop in order for its value to change on user input.</li>
</ul>

```js

const ControlledInput = ({ value, onValueChange, ...rest }) =&gt; {
  return (
    &lt;input
      value={value}
      onChange={({ target: { value } }) =&gt; onValueChange(value)}
      {...rest}
    /&gt;
  );
};

```

<hr />

```js

const Form = () =&gt; {
  const [value, setValue] = React.useState(&quot;&quot;);

return (
&lt;ControlledInput
type=&quot;text&quot;
placeholder=&quot;Insert some text here...&quot;
value={value}
onValueChange={setValue}
/&gt;
);
};

ReactDOM.render(&lt;Form /&gt;, document.getElementById(&quot;root&quot;));

```

<hr />
<p>Renders a countdown timer that prints a message when it reaches zero.</p>
<ul>
<li>Use the <code>useState()</code> hook to create a state variable to hold the time value, initialize it from the props and destructure it into its components.</li>
<li>Use the <code>useState()</code> hook to create the <code>paused</code> and <code>over</code> state variables, used to prevent the timer from ticking if it’s paused or the time has run out.</li>
<li>Create a method <code>tick</code>, that updates the time values based on the current value (i.e. decreasing the time by one second).</li>
<li>Create a method <code>reset</code>, that resets all state variables to their initial states.</li>
<li>Use the the <code>useEffect()</code> hook to call the <code>tick</code> method every second via the use of <code>setInterval()</code> and use <code>clearInterval()</code> to clean up when the component is unmounted.</li>
<li>Use <code>String.prototype.padStart()</code> to pad each part of the time array to two characters to create the visual representation of the timer.</li>
</ul>

```js

const CountDown = ({ hours = 0, minutes = 0, seconds = 0 }) =&gt; {
  const [paused, setPaused] = React.useState(false);
  const [over, setOver] = React.useState(false);
  const [[h, m, s], setTime] = React.useState([hours, minutes, seconds]);

const tick = () =&gt; {
if (paused || over) return;
if (h === 0 &amp;&amp; m === 0 &amp;&amp; s === 0) setOver(true);
else if (m === 0 &amp;&amp; s === 0) {
setTime([h - 1, 59, 59]);
} else if (s == 0) {
setTime([h, m - 1, 59]);
} else {
setTime([h, m, s - 1]);
}
};

const reset = () =&gt; {
setTime([parseInt(hours), parseInt(minutes), parseInt(seconds)]);
setPaused(false);
setOver(false);
};

React.useEffect(() =&gt; {
const timerID = setInterval(() =&gt; tick(), 1000);
return () =&gt; clearInterval(timerID);
});

return (
&lt;div&gt;
&lt;p&gt;{`${h.toString().padStart(2, &quot;0&quot;)}:${m.toString().padStart(2, &quot;0&quot;)}:${s .toString() .padStart(2, &quot;0&quot;)}`}&lt;/p&gt;
&lt;div&gt;{over ? &quot;Time&#39;s up!&quot; : &quot;&quot;}&lt;/div&gt;
&lt;button onClick={() =&gt; setPaused(!paused)}&gt;
{paused ? &quot;Resume&quot; : &quot;Pause&quot;}
&lt;/button&gt;
&lt;button onClick={() =&gt; reset()}&gt;Restart&lt;/button&gt;
&lt;/div&gt;
);
};

```

<hr />

```js

ReactDOM.render(
  &lt;CountDown hours={1} minutes={45} /&gt;,
  document.getElementById(&quot;root&quot;)
);

```

<hr />
<p>Renders a list of elements from an array of primitives.</p>
<ul>
<li>Use the value of the <code>isOrdered</code> prop to conditionally render an <code>&lt;ol&gt;</code> or a <code>&lt;ul&gt;</code> list.</li>
<li>Use <code>Array.prototype.map()</code> to render every item in <code>data</code> as a <code>&lt;li&gt;</code> element with an appropriate <code>key</code>.</li>
</ul>

```js

const DataList = ({ isOrdered = false, data }) =&gt; {
  const list = data.map((val, i) =&gt; &lt;li key={`${i}_${val}`}&gt;{val}&lt;/li&gt;);
  return isOrdered ? &lt;ol&gt;{list}&lt;/ol&gt; : &lt;ul&gt;{list}&lt;/ul&gt;;
};

```

<hr />

```js

const names = [&quot;John&quot;, &quot;Paul&quot;, &quot;Mary&quot;];
ReactDOM.render(&lt;DataList data={names} /&gt;, document.getElementById(&quot;root&quot;));
ReactDOM.render(
  &lt;DataList data={names} isOrdered /&gt;,
  document.getElementById(&quot;root&quot;)
);

```

<hr />
<p>Renders a table with rows dynamically created from an array of primitives.</p>
<ul>
<li>Render a <code>&lt;table&gt;</code> element with two columns (<code>ID</code> and <code>Value</code>).</li>
<li>Use <code>Array.prototype.map()</code> to render every item in <code>data</code> as a <code>&lt;tr&gt;</code> element with an appropriate <code>key</code>.</li>
</ul>

```js

const DataTable = ({ data }) =&gt; {
  return (
    &lt;table&gt;
      &lt;thead&gt;
        &lt;tr&gt;
          &lt;th&gt;ID&lt;/th&gt;
          &lt;th&gt;Value&lt;/th&gt;
        &lt;/tr&gt;
      &lt;/thead&gt;
      &lt;tbody&gt;
        {data.map((val, i) =&gt; (
          &lt;tr key={`${i}_${val}`}&gt;
            &lt;td&gt;{i}&lt;/td&gt;
            &lt;td&gt;{val}&lt;/td&gt;
          &lt;/tr&gt;
        ))}
      &lt;/tbody&gt;
    &lt;/table&gt;
  );
};

```

<hr />

```js

const people = [&quot;John&quot;, &quot;Jesse&quot;];
ReactDOM.render(&lt;DataTable data={people} /&gt;, document.getElementById(&quot;root&quot;));

```

<hr />
<p>Renders a file drag and drop component for a single file.</p>
<ul>
<li>Create a ref, called <code>dropRef</code> and bind it to the component’s wrapper.</li>
<li>Use the <code>useState()</code> hook to create the <code>drag</code> and <code>filename</code> variables, initialized to <code>false</code> and <code>''</code> respectively.</li>
<li>The variables <code>dragCounter</code> and <code>drag</code> are used to determine if a file is being dragged, while <code>filename</code> is used to store the dropped file’s name.</li>
<li>Create the <code>handleDrag</code>, <code>handleDragIn</code>, <code>handleDragOut</code> and <code>handleDrop</code> methods to handle drag and drop functionality.</li>
<li><code>handleDrag</code> prevents the browser from opening the dragged file, <code>handleDragIn</code> and <code>handleDragOut</code> handle the dragged file entering and exiting the component, while <code>handleDrop</code> handles the file being dropped and passes it to <code>onDrop</code>.</li>
<li>Use the <code>useEffect()</code> hook to handle each of the drag and drop events using the previously created methods.</li>
</ul>
<div class="sourceCode" id="cb25"><pre class="sourceCode css"><code class="sourceCode css"><a class="sourceLine" id="cb25-1" title="1"><span class="fu">.filedrop</span> {</a>
<a class="sourceLine" id="cb25-2" title="2">  <span class="kw">min-height</span>: <span class="dv">120</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb25-3" title="3">  <span class="kw">border</span>: <span class="dv">3</span><span class="dt">px</span> <span class="dv">solid</span> <span class="cn">#d3d3d3</span><span class="op">;</span></a>
<a class="sourceLine" id="cb25-4" title="4">  <span class="kw">text-align</span>: <span class="dv">center</span><span class="op">;</span></a>
<a class="sourceLine" id="cb25-5" title="5">  <span class="kw">font-size</span>: <span class="dv">24</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb25-6" title="6">  <span class="kw">padding</span>: <span class="dv">32</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb25-7" title="7">  <span class="kw">border-radius</span>: <span class="dv">4</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb25-8" title="8">}</a>
<a class="sourceLine" id="cb25-9" title="9"></a>
<a class="sourceLine" id="cb25-10" title="10"><span class="fu">.filedrop.drag</span> {</a>
<a class="sourceLine" id="cb25-11" title="11">  <span class="kw">border</span>: <span class="dv">3</span><span class="dt">px</span> <span class="dv">dashed</span> <span class="cn">#1e90ff</span><span class="op">;</span></a>
<a class="sourceLine" id="cb25-12" title="12">}</a>
<a class="sourceLine" id="cb25-13" title="13"></a>
<a class="sourceLine" id="cb25-14" title="14"><span class="fu">.filedrop.ready</span> {</a>
<a class="sourceLine" id="cb25-15" title="15">  <span class="kw">border</span>: <span class="dv">3</span><span class="dt">px</span> <span class="dv">solid</span> <span class="cn">#32cd32</span><span class="op">;</span></a>
<a class="sourceLine" id="cb25-16" title="16">}</a>



</div>


```js

const FileDrop = ({ onDrop }) =&gt; {
  const [drag, setDrag] = React.useState(false);
  const [filename, setFilename] = React.useState(&quot;&quot;);
  let dropRef = React.createRef();
  let dragCounter = 0;

const handleDrag = (e) =&gt; {
e.preventDefault();
e.stopPropagation();
};

const handleDragIn = (e) =&gt; {
e.preventDefault();
e.stopPropagation();
dragCounter++;
if (e.dataTransfer.items &amp;&amp; e.dataTransfer.items.length &gt; 0) setDrag(true);
};

const handleDragOut = (e) =&gt; {
e.preventDefault();
e.stopPropagation();
dragCounter--;
if (dragCounter === 0) setDrag(false);
};

const handleDrop = (e) =&gt; {
e.preventDefault();
e.stopPropagation();
setDrag(false);
if (e.dataTransfer.files &amp;&amp; e.dataTransfer.files.length &gt; 0) {
onDrop(e.dataTransfer.files[0]);
setFilename(e.dataTransfer.files[0].name);
e.dataTransfer.clearData();
dragCounter = 0;
}
};

React.useEffect(() =&gt; {
let div = dropRef.current;
div.addEventListener(&quot;dragenter&quot;, handleDragIn);
div.addEventListener(&quot;dragleave&quot;, handleDragOut);
div.addEventListener(&quot;dragover&quot;, handleDrag);
div.addEventListener(&quot;drop&quot;, handleDrop);
return () =&gt; {
div.removeEventListener(&quot;dragenter&quot;, handleDragIn);
div.removeEventListener(&quot;dragleave&quot;, handleDragOut);
div.removeEventListener(&quot;dragover&quot;, handleDrag);
div.removeEventListener(&quot;drop&quot;, handleDrop);
};
});

return (
&lt;div
ref={dropRef}
className={
drag ? &quot;filedrop drag&quot; : filename ? &quot;filedrop ready&quot; : &quot;filedrop&quot;
}
&gt;
{filename &amp;&amp; !drag ? &lt;div&gt;{filename}&lt;/div&gt; : &lt;div&gt;Drop a file here!&lt;/div&gt;}
&lt;/div&gt;
);
};



<hr />

```js

ReactDOM.render(
  &lt;FileDrop onDrop={console.log} /&gt;,
  document.getElementById(&quot;root&quot;)
);

```

<hr />
<p>Renders a textarea component with a character limit.</p>
<ul>
<li>Use the <code>useState()</code> hook to create the <code>content</code> state variable and set its value to that of <code>value</code> prop, trimmed down to <code>limit</code> characters.</li>
<li>Create a method <code>setFormattedContent</code>, which trims the content down to <code>limit</code> characters and memoize it, using the <code>useCallback()</code> hook.</li>
<li>Bind the <code>onChange</code> event of the <code>&lt;textarea&gt;</code> to call <code>setFormattedContent</code> with the value of the fired event.</li>
</ul>

```js

const LimitedTextarea = ({ rows, cols, value, limit }) =&gt; {
  const [content, setContent] = React.useState(value.slice(0, limit));

const setFormattedContent = React.useCallback(
(text) =&gt; {
setContent(text.slice(0, limit));
},
[limit, setContent]
);

return (
&lt;&gt;
&lt;textarea
rows={rows}
cols={cols}
onChange={(event) =&gt; setFormattedContent(event.target.value)}
value={content}
/&gt;
&lt;p&gt;
{content.length}/{limit}
&lt;/p&gt;
&lt;/&gt;
);
};

```

<hr />

```js

ReactDOM.render(
  &lt;LimitedTextarea limit={32} value=&quot;Hello!&quot; /&gt;,
  document.getElementById(&quot;root&quot;)
);

```

<hr />
<p>Renders a textarea component with a word limit.</p>
<ul>
<li>Use the <code>useState()</code> hook to create a state variable, containing <code>content</code> and <code>wordCount</code>, using the <code>value</code> prop and <code>0</code> as the initial values respectively.</li>
<li>Use the <code>useCallback()</code> hooks to create a memoized function, <code>setFormattedContent</code>, that uses <code>String.prototype.split()</code> to turn the input into an array of words.</li>
<li>Check if the result of applying <code>Array.prototype.filter()</code> combined with <code>Boolean</code> has a <code>length</code> longer than <code>limit</code> and, if so, trim the input, otherwise return the raw input, updating state accordingly in both cases.</li>
<li>Use the <code>useEffect()</code> hook to call the <code>setFormattedContent</code> method on the value of the <code>content</code> state variable during the initial render.</li>
<li>Bind the <code>onChange</code> event of the <code>&lt;textarea&gt;</code> to call <code>setFormattedContent</code> with the value of <code>event.target.value</code>.</li>
</ul>

```js

const LimitedWordTextarea = ({ rows, cols, value, limit }) =&gt; {
  const [{ content, wordCount }, setContent] = React.useState({
    content: value,
    wordCount: 0,
  });

const setFormattedContent = React.useCallback(
(text) =&gt; {
let words = text.split(&quot; &quot;).filter(Boolean);
if (words.length &gt; limit) {
setContent({
content: words.slice(0, limit).join(&quot; &quot;),
wordCount: limit,
});
} else {
setContent({ content: text, wordCount: words.length });
}
},
[limit, setContent]
);

React.useEffect(() =&gt; {
setFormattedContent(content);
}, []);

return (
&lt;&gt;
&lt;textarea
rows={rows}
cols={cols}
onChange={(event) =&gt; setFormattedContent(event.target.value)}
value={content}
/&gt;
&lt;p&gt;
{wordCount}/{limit}
&lt;/p&gt;
&lt;/&gt;
);
};

```

<hr />

```js

ReactDOM.render(
  &lt;LimitedWordTextarea limit={5} value=&quot;Hello there!&quot; /&gt;,
  document.getElementById(&quot;root&quot;)
);

```

<hr />
<p>Renders a spinning loader component.</p>
<ul>
<li>Render an SVG, whose <code>height</code> and <code>width</code> are determined by the <code>size</code> prop.</li>
<li>Use CSS to animate the SVG, creating a spinning animation.</li>
</ul>
<div class="sourceCode" id="cb32"><pre class="sourceCode css"><code class="sourceCode css"><a class="sourceLine" id="cb32-1" title="1"><span class="fu">.loader</span> {</a>
<a class="sourceLine" id="cb32-2" title="2">  <span class="kw">animation</span>: rotate <span class="dv">2</span><span class="dt">s</span> <span class="dv">linear</span> <span class="dv">infinite</span><span class="op">;</span></a>
<a class="sourceLine" id="cb32-3" title="3">}</a>
<a class="sourceLine" id="cb32-4" title="4"></a>
<a class="sourceLine" id="cb32-5" title="5"><span class="im">@keyframes</span> rotate {</a>
<a class="sourceLine" id="cb32-6" title="6">  <span class="dv">100%</span> {</a>
<a class="sourceLine" id="cb32-7" title="7">    <span class="kw">transform</span>: <span class="fu">rotate(</span><span class="dv">360</span><span class="dt">deg</span><span class="fu">)</span><span class="op">;</span></a>
<a class="sourceLine" id="cb32-8" title="8">  }</a>
<a class="sourceLine" id="cb32-9" title="9">}</a>
<a class="sourceLine" id="cb32-10" title="10"></a>
<a class="sourceLine" id="cb32-11" title="11"><span class="fu">.loader</span> circle {</a>
<a class="sourceLine" id="cb32-12" title="12">  <span class="kw">animation</span>: dash <span class="dv">1.5</span><span class="dt">s</span> <span class="dv">ease-in-out</span> <span class="dv">infinite</span><span class="op">;</span></a>
<a class="sourceLine" id="cb32-13" title="13">}</a>
<a class="sourceLine" id="cb32-14" title="14"></a>
<a class="sourceLine" id="cb32-15" title="15"><span class="im">@keyframes</span> dash {</a>
<a class="sourceLine" id="cb32-16" title="16">  <span class="dv">0%</span> {</a>
<a class="sourceLine" id="cb32-17" title="17">    stroke-dasharray: <span class="dv">1</span><span class="op">,</span> <span class="dv">150</span><span class="op">;</span></a>
<a class="sourceLine" id="cb32-18" title="18">    stroke-dashoffset: <span class="dv">0</span><span class="op">;</span></a>
<a class="sourceLine" id="cb32-19" title="19">  }</a>
<a class="sourceLine" id="cb32-20" title="20">  <span class="dv">50%</span> {</a>
<a class="sourceLine" id="cb32-21" title="21">    stroke-dasharray: <span class="dv">90</span><span class="op">,</span> <span class="dv">150</span><span class="op">;</span></a>
<a class="sourceLine" id="cb32-22" title="22">    stroke-dashoffset: <span class="dv">-35</span><span class="op">;</span></a>
<a class="sourceLine" id="cb32-23" title="23">  }</a>
<a class="sourceLine" id="cb32-24" title="24">  <span class="dv">100%</span> {</a>
<a class="sourceLine" id="cb32-25" title="25">    stroke-dasharray: <span class="dv">90</span><span class="op">,</span> <span class="dv">150</span><span class="op">;</span></a>
<a class="sourceLine" id="cb32-26" title="26">    stroke-dashoffset: <span class="dv">-124</span><span class="op">;</span></a>
<a class="sourceLine" id="cb32-27" title="27">  }</a>
<a class="sourceLine" id="cb32-28" title="28">}</a>



</div>


```js

const Loader = ({ size }) =&gt; {
  return (
    &lt;svg
      className=&quot;loader&quot;
      xmlns=&quot;http://www.w3.org/2000/svg&quot;
      width={size}
      height={size}
      viewBox=&quot;0 0 24 24&quot;
      fill=&quot;none&quot;
      stroke=&quot;currentColor&quot;
      strokeWidth=&quot;2&quot;
      strokeLinecap=&quot;round&quot;
      strokeLinejoin=&quot;round&quot;
    &gt;
      &lt;circle cx=&quot;12&quot; cy=&quot;12&quot; r=&quot;10&quot; /&gt;
    &lt;/svg&gt;
  );
};



<hr />

```js

ReactDOM.render(&lt;Loader size={24} /&gt;, document.getElementById(&quot;root&quot;));

```

<hr />
<p>Renders a link formatted to send an email (<code>mailto:</code> link).</p>
<ul>
<li>Use the <code>email</code>, <code>subject</code> and <code>body</code> props to create a <code>&lt;a&gt;</code> element with an appropriate <code>href</code> attribute.</li>
<li>Use <code>encodeURIcomponent</code> to safely encode the <code>subject</code> and <code>body</code> into the link URL.</li>
<li>Render the link with <code>children</code> as its content.</li>
</ul>

```js

const Mailto = ({ email, subject = &quot;&quot;, body = &quot;&quot;, children }) =&gt; {
  let params = subject || body ? &quot;?&quot; : &quot;&quot;;
  if (subject) params += `subject=${encodeURIComponent(subject)}`;
  if (body) params += `${subject ? &quot;&amp;&quot; : &quot;&quot;}body=${encodeURIComponent(body)}`;

return &lt;a href={`mailto:${email}${params}`}&gt;{children}&lt;/a&gt;;
};

```

<hr />

```js

ReactDOM.render(
  &lt;Mailto email=&quot;foo@bar.baz&quot; subject=&quot;Hello &amp; Welcome&quot; body=&quot;Hello world!&quot;&gt;
    Mail me!
  &lt;/Mailto&gt;,
  document.getElementById(&quot;root&quot;)
);

```

<hr />
<p>Renders a table with rows dynamically created from an array of objects and a list of property names.</p>
<ul>
<li>Use <code>Object.keys()</code>, <code>Array.prototype.filter()</code>, <code>Array.prototype.includes()</code> and <code>Array.prototype.reduce()</code> to produce a <code>filteredData</code> array, containing all objects with the keys specified in <code>propertyNames</code>.</li>
<li>Render a <code>&lt;table&gt;</code> element with a set of columns equal to the amount of values in <code>propertyNames</code>.</li>
<li>Use <code>Array.prototype.map()</code> to render each value in the <code>propertyNames</code> array as a <code>&lt;th&gt;</code> element.</li>
<li>Use <code>Array.prototype.map()</code> to render each object in the <code>filteredData</code> array as a <code>&lt;tr&gt;</code> element, containing a <code>&lt;td&gt;</code> for each key in the object.</li>
</ul>
<p><em>This component does not work with nested objects and will break if there are nested objects inside any of the properties specified in <code>propertyNames</code></em></p>

```js

const MappedTable = ({ data, propertyNames }) =&gt; {
  let filteredData = data.map((v) =&gt;
    Object.keys(v)
      .filter((k) =&gt; propertyNames.includes(k))
      .reduce((acc, key) =&gt; ((acc[key] = v[key]), acc), {})
  );
  return (
    &lt;table&gt;
      &lt;thead&gt;
        &lt;tr&gt;
          {propertyNames.map((val) =&gt; (
            &lt;th key={`h_${val}`}&gt;{val}&lt;/th&gt;
          ))}
        &lt;/tr&gt;
      &lt;/thead&gt;
      &lt;tbody&gt;
        {filteredData.map((val, i) =&gt; (
          &lt;tr key={`i_${i}`}&gt;
            {propertyNames.map((p) =&gt; (
              &lt;td key={`i_${i}_${p}`}&gt;{val[p]}&lt;/td&gt;
            ))}
          &lt;/tr&gt;
        ))}
      &lt;/tbody&gt;
    &lt;/table&gt;
  );
};

```

<hr />

```js

const people = [
  { name: &quot;John&quot;, surname: &quot;Smith&quot;, age: 42 },
  { name: &quot;Adam&quot;, surname: &quot;Smith&quot;, gender: &quot;male&quot; },
];
const propertyNames = [&quot;name&quot;, &quot;surname&quot;, &quot;age&quot;];
ReactDOM.render(
  &lt;MappedTable data={people} propertyNames={propertyNames} /&gt;,
  document.getElementById(&quot;root&quot;)
);

```

<hr />
<p>Renders a Modal component, controllable through events.</p>
<ul>
<li>Define <code>keydownHandler</code>, a method which handles all keyboard events and is used to call <code>onClose</code> when the <code>Esc</code> key is pressed.</li>
<li>Use the <code>useEffect()</code> hook to add or remove the <code>keydown</code> event listener to the <code>document</code>, calling <code>keydownHandler</code> for every event.</li>
<li>Add a styled <code>&lt;span&gt;</code> element that acts as a close button, calling <code>onClose</code> when clicked.</li>
<li>Use the <code>isVisible</code> prop passed down from the parent to determine if the modal should be displayed or not.</li>
<li>To use the component, import <code>Modal</code> only once and then display it by passing a boolean value to the <code>isVisible</code> attribute.</li>
</ul>
<div class="sourceCode" id="cb39"><pre class="sourceCode css"><code class="sourceCode css"><a class="sourceLine" id="cb39-1" title="1"><span class="fu">.modal</span> {</a>
<a class="sourceLine" id="cb39-2" title="2">  <span class="kw">position</span>: <span class="dv">fixed</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-3" title="3">  <span class="kw">top</span>: <span class="dv">0</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-4" title="4">  <span class="kw">bottom</span>: <span class="dv">0</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-5" title="5">  <span class="kw">left</span>: <span class="dv">0</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-6" title="6">  <span class="kw">right</span>: <span class="dv">0</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-7" title="7">  <span class="kw">width</span>: <span class="dv">100</span><span class="dt">%</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-8" title="8">  <span class="kw">z-index</span>: <span class="dv">9999</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-9" title="9">  <span class="kw">display</span>: flex<span class="op">;</span></a>
<a class="sourceLine" id="cb39-10" title="10">  <span class="kw">align-items</span>: <span class="dv">center</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-11" title="11">  <span class="kw">justify-content</span>: <span class="dv">center</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-12" title="12">  <span class="kw">background-color</span>: <span class="fu">rgba(</span><span class="dv">0</span><span class="op">,</span> <span class="dv">0</span><span class="op">,</span> <span class="dv">0</span><span class="op">,</span> <span class="dv">0.25</span><span class="fu">)</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-13" title="13">  <span class="kw">animation-name</span>: appear<span class="op">;</span></a>
<a class="sourceLine" id="cb39-14" title="14">  <span class="kw">animation-duration</span>: <span class="dv">300</span><span class="dt">ms</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-15" title="15">}</a>
<a class="sourceLine" id="cb39-16" title="16"></a>
<a class="sourceLine" id="cb39-17" title="17"><span class="fu">.modal-dialog</span> {</a>
<a class="sourceLine" id="cb39-18" title="18">  <span class="kw">width</span>: <span class="dv">100</span><span class="dt">%</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-19" title="19">  <span class="kw">max-width</span>: <span class="dv">550</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-20" title="20">  <span class="kw">background</span>: <span class="cn">white</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-21" title="21">  <span class="kw">position</span>: <span class="dv">relative</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-22" title="22">  <span class="kw">margin</span>: <span class="dv">0</span> <span class="dv">20</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-23" title="23">  <span class="kw">max-height</span>: <span class="fu">calc(</span><span class="dv">100</span><span class="dt">vh</span> <span class="op">-</span> <span class="dv">40</span><span class="dt">px</span><span class="fu">)</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-24" title="24">  <span class="kw">text-align</span>: <span class="dv">left</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-25" title="25">  <span class="kw">display</span>: flex<span class="op">;</span></a>
<a class="sourceLine" id="cb39-26" title="26">  <span class="kw">flex-direction</span>: column<span class="op">;</span></a>
<a class="sourceLine" id="cb39-27" title="27">  <span class="kw">overflow</span>: <span class="dv">hidden</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-28" title="28">  <span class="kw">box-shadow</span>: <span class="dv">0</span> <span class="dv">4</span><span class="dt">px</span> <span class="dv">8</span><span class="dt">px</span> <span class="dv">0</span> <span class="fu">rgba(</span><span class="dv">0</span><span class="op">,</span> <span class="dv">0</span><span class="op">,</span> <span class="dv">0</span><span class="op">,</span> <span class="dv">0.2</span><span class="fu">)</span><span class="op">,</span> <span class="dv">0</span> <span class="dv">6</span><span class="dt">px</span> <span class="dv">20</span><span class="dt">px</span> <span class="dv">0</span> <span class="fu">rgba(</span><span class="dv">0</span><span class="op">,</span> <span class="dv">0</span><span class="op">,</span> <span class="dv">0</span><span class="op">,</span> <span class="dv">0.19</span><span class="fu">)</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-29" title="29">  <span class="kw">-webkit-animation-name</span>: animatetop<span class="op">;</span></a>
<a class="sourceLine" id="cb39-30" title="30">  <span class="kw">-webkit-animation-duration</span>: <span class="dv">0.4</span><span class="dt">s</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-31" title="31">  <span class="kw">animation-name</span>: slide-in<span class="op">;</span></a>
<a class="sourceLine" id="cb39-32" title="32">  <span class="kw">animation-duration</span>: <span class="dv">0.5</span><span class="dt">s</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-33" title="33">}</a>
<a class="sourceLine" id="cb39-34" title="34"></a>
<a class="sourceLine" id="cb39-35" title="35"><span class="fu">.modal-header</span><span class="op">,</span></a>
<a class="sourceLine" id="cb39-36" title="36"><span class="fu">.modal-footer</span> {</a>
<a class="sourceLine" id="cb39-37" title="37">  <span class="kw">display</span>: flex<span class="op">;</span></a>
<a class="sourceLine" id="cb39-38" title="38">  <span class="kw">align-items</span>: <span class="dv">center</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-39" title="39">  <span class="kw">padding</span>: <span class="dv">1</span><span class="dt">rem</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-40" title="40">}</a>
<a class="sourceLine" id="cb39-41" title="41"></a>
<a class="sourceLine" id="cb39-42" title="42"><span class="fu">.modal-header</span> {</a>
<a class="sourceLine" id="cb39-43" title="43">  <span class="kw">border-bottom</span>: <span class="dv">1</span><span class="dt">px</span> <span class="dv">solid</span> <span class="cn">#dbdbdb</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-44" title="44">  <span class="kw">justify-content</span>: space-between<span class="op">;</span></a>
<a class="sourceLine" id="cb39-45" title="45">}</a>
<a class="sourceLine" id="cb39-46" title="46"></a>
<a class="sourceLine" id="cb39-47" title="47"><span class="fu">.modal-footer</span> {</a>
<a class="sourceLine" id="cb39-48" title="48">  <span class="kw">border-top</span>: <span class="dv">1</span><span class="dt">px</span> <span class="dv">solid</span> <span class="cn">#dbdbdb</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-49" title="49">  <span class="kw">justify-content</span>: flex-end<span class="op">;</span></a>
<a class="sourceLine" id="cb39-50" title="50">}</a>
<a class="sourceLine" id="cb39-51" title="51"></a>
<a class="sourceLine" id="cb39-52" title="52"><span class="fu">.modal-close</span> {</a>
<a class="sourceLine" id="cb39-53" title="53">  <span class="kw">cursor</span>: <span class="dv">pointer</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-54" title="54">  <span class="kw">padding</span>: <span class="dv">1</span><span class="dt">rem</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-55" title="55">  <span class="kw">margin</span>: <span class="dv">-1</span><span class="dt">rem</span> <span class="dv">-1</span><span class="dt">rem</span> <span class="dv">-1</span><span class="dt">rem</span> <span class="bu">auto</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-56" title="56">}</a>
<a class="sourceLine" id="cb39-57" title="57"></a>
<a class="sourceLine" id="cb39-58" title="58"><span class="fu">.modal-body</span> {</a>
<a class="sourceLine" id="cb39-59" title="59">  <span class="kw">overflow</span>: <span class="bu">auto</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-60" title="60">}</a>
<a class="sourceLine" id="cb39-61" title="61"></a>
<a class="sourceLine" id="cb39-62" title="62"><span class="fu">.modal-content</span> {</a>
<a class="sourceLine" id="cb39-63" title="63">  <span class="kw">padding</span>: <span class="dv">1</span><span class="dt">rem</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-64" title="64">}</a>
<a class="sourceLine" id="cb39-65" title="65"></a>
<a class="sourceLine" id="cb39-66" title="66"><span class="im">@keyframes</span> appear {</a>
<a class="sourceLine" id="cb39-67" title="67">  <span class="dv">from</span> {</a>
<a class="sourceLine" id="cb39-68" title="68">    <span class="kw">opacity</span>: <span class="dv">0</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-69" title="69">  }</a>
<a class="sourceLine" id="cb39-70" title="70">  <span class="dv">to</span> {</a>
<a class="sourceLine" id="cb39-71" title="71">    <span class="kw">opacity</span>: <span class="dv">1</span><span class="op">;</span></a>
<a class="sourceLine" id="cb39-72" title="72">  }</a>
<a class="sourceLine" id="cb39-73" title="73">}</a>
<a class="sourceLine" id="cb39-74" title="74"></a>
<a class="sourceLine" id="cb39-75" title="75"><span class="im">@keyframes</span> slide-in {</a>
<a class="sourceLine" id="cb39-76" title="76">  <span class="dv">from</span> {</a>
<a class="sourceLine" id="cb39-77" title="77">    <span class="kw">transform</span>: translateY(<span class="dv">-150</span><span class="dt">px</span>)<span class="op">;</span></a>
<a class="sourceLine" id="cb39-78" title="78">  }</a>
<a class="sourceLine" id="cb39-79" title="79">  <span class="dv">to</span> {</a>
<a class="sourceLine" id="cb39-80" title="80">    <span class="kw">transform</span>: translateY(<span class="dv">0</span>)<span class="op">;</span></a>
<a class="sourceLine" id="cb39-81" title="81">  }</a>
<a class="sourceLine" id="cb39-82" title="82">}</a>



</div>


```js

const Modal = ({ isVisible = false, title, content, footer, onClose }) =&gt; {
  const keydownHandler = ({ key }) =&gt; {
    switch (key) {
      case &quot;Escape&quot;:
        onClose();
        break;
      default:
    }
  };

React.useEffect(() =&gt; {
document.addEventListener(&quot;keydown&quot;, keydownHandler);
return () =&gt; document.removeEventListener(&quot;keydown&quot;, keydownHandler);
});

return !isVisible ? null : (
&lt;div className=&quot;modal&quot; onClick={onClose}&gt;
&lt;div className=&quot;modal-dialog&quot; onClick={(e) =&gt; e.stopPropagation()}&gt;
&lt;div className=&quot;modal-header&quot;&gt;
&lt;h3 className=&quot;modal-title&quot;&gt;{title}&lt;/h3&gt;
&lt;span className=&quot;modal-close&quot; onClick={onClose}&gt;
&amp;times;
&lt;/span&gt;
&lt;/div&gt;
&lt;div className=&quot;modal-body&quot;&gt;
&lt;div className=&quot;modal-content&quot;&gt;{content}&lt;/div&gt;
&lt;/div&gt;
{footer &amp;&amp; &lt;div className=&quot;modal-footer&quot;&gt;{footer}&lt;/div&gt;}
&lt;/div&gt;
&lt;/div&gt;
);
};



<hr />

```js

const App = () =&gt; {
  const [isModal, setModal] = React.useState(false);
  return (
    &lt;&gt;
      &lt;button onClick={() =&gt; setModal(true)}&gt;Click Here&lt;/button&gt;
      &lt;Modal
        isVisible={isModal}
        title=&quot;Modal Title&quot;
        content={&lt;p&gt;Add your content here&lt;/p&gt;}
        footer={&lt;button&gt;Cancel&lt;/button&gt;}
        onClose={() =&gt; setModal(false)}
      /&gt;
    &lt;/&gt;
  );
};

ReactDOM.render(&lt;App /&gt;, document.getElementById(&quot;root&quot;));

```

<hr />
<p>Renders a checkbox list that uses a callback function to pass its selected value/values to the parent component.</p>
<ul>
<li>Use the <code>useState()</code> hook to create the <code>data</code> state variable and use the <code>options</code> prop to initialize its value.</li>
<li>Create a <code>toggle</code> function that uses the spread operator (<code>...</code>) and <code>Array.prototype.splice()</code> to update the <code>data</code> state variable and call the <code>onChange</code> callback with any <code>checked</code> options.</li>
<li>Use <code>Array.prototype.map()</code> to map the <code>data</code> state variable to individual <code>&lt;input type="checkbox"&gt;</code> elements, each one wrapped in a <code>&lt;label&gt;</code>, binding the <code>onClick</code> handler to the <code>toggle</code> function.</li>
</ul>

```js

const MultiselectCheckbox = ({ options, onChange }) =&gt; {
  const [data, setData] = React.useState(options);

const toggle = (index) =&gt; {
const newData = [...data];
newData.splice(index, 1, {
label: data[index].label,
checked: !data[index].checked,
});
setData(newData);
onChange(newData.filter((x) =&gt; x.checked));
};

return (
&lt;&gt;
{data.map((item, index) =&gt; (
&lt;label key={item.label}&gt;
&lt;input
readOnly
type=&quot;checkbox&quot;
checked={item.checked || false}
onClick={() =&gt; toggle(index)}
/&gt;
{item.label}
&lt;/label&gt;
))}
&lt;/&gt;
);
};

```

<hr />

```js

const options = [{ label: &quot;Item One&quot; }, { label: &quot;Item Two&quot; }];

ReactDOM.render(
&lt;MultiselectCheckbox
options={options}
onChange={(data) =&gt; {
console.log(data);
}}
/&gt;,
document.getElementById(&quot;root&quot;)
);

```

<hr />
<p>Renders a password input field with a reveal button.</p>
<ul>
<li>Use the <code>useState()</code> hook to create the <code>shown</code> state variable and set its value to <code>false</code>.</li>
<li>When the <code>&lt;button&gt;</code> is clicked, execute <code>setShown</code>, toggling the <code>type</code> of the <code>&lt;input&gt;</code> between <code>"text"</code> and <code>"password"</code>.</li>
</ul>

```js

const PasswordRevealer = ({ value }) =&gt; {
  const [shown, setShown] = React.useState(false);
  return (
    &lt;&gt;
      &lt;input type={shown ? &quot;text&quot; : &quot;password&quot;} value={value} /&gt;
      &lt;button onClick={() =&gt; setShown(!shown)}&gt;Show/Hide&lt;/button&gt;
    &lt;/&gt;
  );
};

```

<hr />

```js

ReactDOM.render(&lt;PasswordRevealer /&gt;, document.getElementById(&quot;root&quot;));

```

<hr />
<p>Renders a button that animates a ripple effect when clicked.</p>
<ul>
<li>Use the <code>useState()</code> hook to create the <code>coords</code> and <code>isRippling</code> state variables for the pointer’s coordinates and the animation state of the button respectively.</li>
<li>Use a <code>useEffect()</code> hook to change the value of <code>isRippling</code> every time the <code>coords</code> state variable changes, starting the animation.</li>
<li>Use <code>setTimeout()</code> in the previous hook to clear the animation after it’s done playing.</li>
<li>Use a <code>useEffect()</code> hook to reset <code>coords</code> whenever the <code>isRippling</code> state variable is <code>false.</code></li>
<li>Handle the <code>onClick</code> event by updating the <code>coords</code> state variable and calling the passed callback.</li>
</ul>
<div class="sourceCode" id="cb46"><pre class="sourceCode css"><code class="sourceCode css"><a class="sourceLine" id="cb46-1" title="1"><span class="fu">.ripple-button</span> {</a>
<a class="sourceLine" id="cb46-2" title="2">  <span class="kw">border-radius</span>: <span class="dv">4</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb46-3" title="3">  <span class="kw">border</span>: <span class="dv">none</span><span class="op">;</span></a>
<a class="sourceLine" id="cb46-4" title="4">  <span class="kw">margin</span>: <span class="dv">8</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb46-5" title="5">  <span class="kw">padding</span>: <span class="dv">14</span><span class="dt">px</span> <span class="dv">24</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb46-6" title="6">  <span class="kw">background</span>: <span class="cn">#1976d2</span><span class="op">;</span></a>
<a class="sourceLine" id="cb46-7" title="7">  <span class="kw">color</span>: <span class="cn">#fff</span><span class="op">;</span></a>
<a class="sourceLine" id="cb46-8" title="8">  <span class="kw">overflow</span>: <span class="dv">hidden</span><span class="op">;</span></a>
<a class="sourceLine" id="cb46-9" title="9">  <span class="kw">position</span>: <span class="dv">relative</span><span class="op">;</span></a>
<a class="sourceLine" id="cb46-10" title="10">  <span class="kw">cursor</span>: <span class="dv">pointer</span><span class="op">;</span></a>
<a class="sourceLine" id="cb46-11" title="11">}</a>
<a class="sourceLine" id="cb46-12" title="12"></a>
<a class="sourceLine" id="cb46-13" title="13"><span class="fu">.ripple-button</span> <span class="op">&gt;</span> <span class="fu">.ripple</span> {</a>
<a class="sourceLine" id="cb46-14" title="14">  <span class="kw">width</span>: <span class="dv">20</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb46-15" title="15">  <span class="kw">height</span>: <span class="dv">20</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb46-16" title="16">  <span class="kw">position</span>: <span class="dv">absolute</span><span class="op">;</span></a>
<a class="sourceLine" id="cb46-17" title="17">  <span class="kw">background</span>: <span class="cn">#63a4ff</span><span class="op">;</span></a>
<a class="sourceLine" id="cb46-18" title="18">  <span class="kw">display</span>: <span class="dv">block</span><span class="op">;</span></a>
<a class="sourceLine" id="cb46-19" title="19">  <span class="kw">content</span>: <span class="st">&quot;&quot;</span><span class="op">;</span></a>
<a class="sourceLine" id="cb46-20" title="20">  <span class="kw">border-radius</span>: <span class="dv">9999</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb46-21" title="21">  <span class="kw">opacity</span>: <span class="dv">1</span><span class="op">;</span></a>
<a class="sourceLine" id="cb46-22" title="22">  <span class="kw">animation</span>: <span class="dv">0.9</span><span class="dt">s</span> <span class="dv">ease</span> <span class="dv">1</span> <span class="dv">forwards</span> ripple-effect<span class="op">;</span></a>
<a class="sourceLine" id="cb46-23" title="23">}</a>
<a class="sourceLine" id="cb46-24" title="24"></a>
<a class="sourceLine" id="cb46-25" title="25"><span class="im">@keyframes</span> ripple-effect {</a>
<a class="sourceLine" id="cb46-26" title="26">  <span class="dv">0%</span> {</a>
<a class="sourceLine" id="cb46-27" title="27">    <span class="kw">transform</span>: <span class="fu">scale(</span><span class="dv">1</span><span class="fu">)</span><span class="op">;</span></a>
<a class="sourceLine" id="cb46-28" title="28">    <span class="kw">opacity</span>: <span class="dv">1</span><span class="op">;</span></a>
<a class="sourceLine" id="cb46-29" title="29">  }</a>
<a class="sourceLine" id="cb46-30" title="30">  <span class="dv">50%</span> {</a>
<a class="sourceLine" id="cb46-31" title="31">    <span class="kw">transform</span>: <span class="fu">scale(</span><span class="dv">10</span><span class="fu">)</span><span class="op">;</span></a>
<a class="sourceLine" id="cb46-32" title="32">    <span class="kw">opacity</span>: <span class="dv">0.375</span><span class="op">;</span></a>
<a class="sourceLine" id="cb46-33" title="33">  }</a>
<a class="sourceLine" id="cb46-34" title="34">  <span class="dv">100%</span> {</a>
<a class="sourceLine" id="cb46-35" title="35">    <span class="kw">transform</span>: <span class="fu">scale(</span><span class="dv">35</span><span class="fu">)</span><span class="op">;</span></a>
<a class="sourceLine" id="cb46-36" title="36">    <span class="kw">opacity</span>: <span class="dv">0</span><span class="op">;</span></a>
<a class="sourceLine" id="cb46-37" title="37">  }</a>
<a class="sourceLine" id="cb46-38" title="38">}</a>
<a class="sourceLine" id="cb46-39" title="39"></a>
<a class="sourceLine" id="cb46-40" title="40"><span class="fu">.ripple-button</span> <span class="op">&gt;</span> <span class="fu">.content</span> {</a>
<a class="sourceLine" id="cb46-41" title="41">  <span class="kw">position</span>: <span class="dv">relative</span><span class="op">;</span></a>
<a class="sourceLine" id="cb46-42" title="42">  <span class="kw">z-index</span>: <span class="dv">2</span><span class="op">;</span></a>
<a class="sourceLine" id="cb46-43" title="43">}</a>



</div>


```js

const RippleButton = ({ children, onClick }) =&gt; {
  const [coords, setCoords] = React.useState({ x: -1, y: -1 });
  const [isRippling, setIsRippling] = React.useState(false);

React.useEffect(() =&gt; {
if (coords.x !== -1 &amp;&amp; coords.y !== -1) {
setIsRippling(true);
setTimeout(() =&gt; setIsRippling(false), 300);
} else setIsRippling(false);
}, [coords]);

React.useEffect(() =&gt; {
if (!isRippling) setCoords({ x: -1, y: -1 });
}, [isRippling]);

return (
&lt;button
className=&quot;ripple-button&quot;
onClick={(e) =&gt; {
const rect = e.target.getBoundingClientRect();
setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
onClick &amp;&amp; onClick(e);
}}
&gt;
{isRippling ? (
&lt;span
className=&quot;ripple&quot;
style={{
            left: coords.x,
            top: coords.y,
          }}
/&gt;
) : (
&quot;&quot;
)}
&lt;span className=&quot;content&quot;&gt;{children}&lt;/span&gt;
&lt;/button&gt;
);
};



<hr />

```js

ReactDOM.render(
  &lt;RippleButton onClick={(e) =&gt; console.log(e)}&gt;Click me&lt;/RippleButton&gt;,
  document.getElementById(&quot;root&quot;)
);

```

<hr />
<p>Renders an uncontrolled <code>&lt;select&gt;</code> element that uses a callback function to pass its value to the parent component.</p>
<ul>
<li>Use the the <code>selectedValue</code> prop as the <code>defaultValue</code> of the <code>&lt;select&gt;</code> element to set its initial value..</li>
<li>Use the <code>onChange</code> event to fire the <code>onValueChange</code> callback and send the new value to the parent.</li>
<li>Use <code>Array.prototype.map()</code> on the <code>values</code> array to create an <code>&lt;option&gt;</code> element for each passed value.</li>
<li>Each item in <code>values</code> must be a 2-element array, where the first element is the <code>value</code> of the item and the second one is the displayed text for it.</li>
</ul>

```js

const Select = ({ values, onValueChange, selectedValue, ...rest }) =&gt; {
  return (
    &lt;select
      defaultValue={selectedValue}
      onChange={({ target: { value } }) =&gt; onValueChange(value)}
      {...rest}
    &gt;
      {values.map(([value, text]) =&gt; (
        &lt;option key={value} value={value}&gt;
          {text}
        &lt;/option&gt;
      ))}
    &lt;/select&gt;
  );
};

```

<hr />

```js

const choices = [
  [&quot;grapefruit&quot;, &quot;Grapefruit&quot;],
  [&quot;lime&quot;, &quot;Lime&quot;],
  [&quot;coconut&quot;, &quot;Coconut&quot;],
  [&quot;mango&quot;, &quot;Mango&quot;],
];
ReactDOM.render(
  &lt;Select
    values={choices}
    selectedValue=&quot;lime&quot;
    onValueChange={(val) =&gt; console.log(val)}
  /&gt;,
  document.getElementById(&quot;root&quot;)
);

```

<hr />
<p>Renders an uncontrolled range input element that uses a callback function to pass its value to the parent component.</p>
<ul>
<li>Set the <code>type</code> of the <code>&lt;input&gt;</code> element to <code>"range"</code> to create a slider.</li>
<li>Use the <code>defaultValue</code> passed down from the parent as the uncontrolled input field’s initial value.</li>
<li>Use the <code>onChange</code> event to fire the <code>onValueChange</code> callback and send the new value to the parent.</li>
</ul>

```js

const Slider = ({
  min = 0,
  max = 100,
  defaultValue,
  onValueChange,
  ...rest
}) =&gt; {
  return (
    &lt;input
      type=&quot;range&quot;
      min={min}
      max={max}
      defaultValue={defaultValue}
      onChange={({ target: { value } }) =&gt; onValueChange(value)}
      {...rest}
    /&gt;
  );
};

```

<hr />

```js

ReactDOM.render(
  &lt;Slider onValueChange={(val) =&gt; console.log(val)} /&gt;,
  document.getElementById(&quot;root&quot;)
);

```

<hr />
<p>Renders a star rating component.</p>
<ul>
<li>Define a component, called <code>Star</code> that will render each individual star with the appropriate appearance, based on the parent component’s state.</li>
<li>In the <code>StarRating</code> component, use the <code>useState()</code> hook to define the <code>rating</code> and <code>selection</code> state variables with the appropriate initial values.</li>
<li>Create a method, <code>hoverOver</code>, that updates <code>selected</code> according to the provided <code>event</code>, using the .<code>data-star-id</code> attribute of the event’s target or resets it to <code>0</code> if called with a <code>null</code> argument.</li>
<li>Use <code>Array.from()</code> to create an array of <code>5</code> elements and <code>Array.prototype.map()</code> to create individual <code>&lt;Star&gt;</code> components.</li>
<li>Handle the <code>onMouseOver</code> and <code>onMouseLeave</code> events of the wrapping element using <code>hoverOver</code> and the <code>onClick</code> event using <code>setRating</code>.</li>
</ul>
<div class="sourceCode" id="cb53"><pre class="sourceCode css"><code class="sourceCode css"><a class="sourceLine" id="cb53-1" title="1"><span class="fu">.star</span> {</a>
<a class="sourceLine" id="cb53-2" title="2">  <span class="kw">color</span>: <span class="cn">#ff9933</span><span class="op">;</span></a>
<a class="sourceLine" id="cb53-3" title="3">  <span class="kw">cursor</span>: <span class="dv">pointer</span><span class="op">;</span></a>
<a class="sourceLine" id="cb53-4" title="4">}</a>



</div>


```js

const Star = ({ marked, starId }) =&gt; {
  return (
    &lt;span data-star-id={starId} className=&quot;star&quot; role=&quot;button&quot;&gt;
      {marked ? &quot;\u2605&quot; : &quot;\u2606&quot;}
    &lt;/span&gt;
  );
};

const StarRating = ({ value }) =&gt; {
const [rating, setRating] = React.useState(parseInt(value) || 0);
const [selection, setSelection] = React.useState(0);

const hoverOver = (event) =&gt; {
let val = 0;
if (event &amp;&amp; event.target &amp;&amp; event.target.getAttribute(&quot;data-star-id&quot;))
val = event.target.getAttribute(&quot;data-star-id&quot;);
setSelection(val);
};
return (
&lt;div
onMouseOut={() =&gt; hoverOver(null)}
onClick={(e) =&gt;
setRating(e.target.getAttribute(&quot;data-star-id&quot;) || rating)
}
onMouseOver={hoverOver}
&gt;
{Array.from({ length: 5 }, (v, i) =&gt; (
&lt;Star
starId={i + 1}
key={`star_${i + 1}`}
marked={selection ? selection &gt;= i + 1 : rating &gt;= i + 1}
/&gt;
))}
&lt;/div&gt;
);
};



<hr />

```js

ReactDOM.render(&lt;StarRating value={2} /&gt;, document.getElementById(&quot;root&quot;));

```

<hr />
<p>Renders a tabbed menu and view component.</p>
<ul>
<li>Define a <code>Tabs</code> component that uses the <code>useState()</code> hook to initialize the value of the <code>bindIndex</code> state variable to <code>defaultIndex</code>.</li>
<li>Define a <code>TabItem</code> component and filter <code>children</code> passed to the <code>Tabs</code> component to remove unnecessary nodes except for <code>TabItem</code> by identifying the function’s name.</li>
<li>Define <code>changeTab</code>, which will be executed when clicking a <code>&lt;button&gt;</code> from the menu.</li>
<li><code>changeTab</code> executes the passed callback, <code>onTabClick</code>, and updates <code>bindIndex</code> based on the clicked element.</li>
<li>Use <code>Array.prototype.map()</code> on the collected nodes to render the menu and view of the tabs, using the value of <code>binIndex</code> to determine the active tab and apply the correct <code>className</code>.</li>
</ul>
<div class="sourceCode" id="cb56"><pre class="sourceCode css"><code class="sourceCode css"><a class="sourceLine" id="cb56-1" title="1"><span class="fu">.tab-menu</span> <span class="op">&gt;</span> button {</a>
<a class="sourceLine" id="cb56-2" title="2">  <span class="kw">cursor</span>: <span class="dv">pointer</span><span class="op">;</span></a>
<a class="sourceLine" id="cb56-3" title="3">  <span class="kw">padding</span>: <span class="dv">8</span><span class="dt">px</span> <span class="dv">16</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb56-4" title="4">  <span class="kw">border</span>: <span class="dv">0</span><span class="op">;</span></a>
<a class="sourceLine" id="cb56-5" title="5">  <span class="kw">border-bottom</span>: <span class="dv">2</span><span class="dt">px</span> <span class="dv">solid</span> <span class="dv">transparent</span><span class="op">;</span></a>
<a class="sourceLine" id="cb56-6" title="6">  <span class="kw">background</span>: <span class="dv">none</span><span class="op">;</span></a>
<a class="sourceLine" id="cb56-7" title="7">}</a>
<a class="sourceLine" id="cb56-8" title="8"></a>
<a class="sourceLine" id="cb56-9" title="9"><span class="fu">.tab-menu</span> <span class="op">&gt;</span> button<span class="fu">.focus</span> {</a>
<a class="sourceLine" id="cb56-10" title="10">  <span class="kw">border-bottom</span>: <span class="dv">2</span><span class="dt">px</span> <span class="dv">solid</span> <span class="cn">#007bef</span><span class="op">;</span></a>
<a class="sourceLine" id="cb56-11" title="11">}</a>
<a class="sourceLine" id="cb56-12" title="12"></a>
<a class="sourceLine" id="cb56-13" title="13"><span class="fu">.tab-menu</span> <span class="op">&gt;</span> button<span class="in">:hover</span> {</a>
<a class="sourceLine" id="cb56-14" title="14">  <span class="kw">border-bottom</span>: <span class="dv">2</span><span class="dt">px</span> <span class="dv">solid</span> <span class="cn">#007bef</span><span class="op">;</span></a>
<a class="sourceLine" id="cb56-15" title="15">}</a>
<a class="sourceLine" id="cb56-16" title="16"></a>
<a class="sourceLine" id="cb56-17" title="17"><span class="fu">.tab-content</span> {</a>
<a class="sourceLine" id="cb56-18" title="18">  <span class="kw">display</span>: <span class="dv">none</span><span class="op">;</span></a>
<a class="sourceLine" id="cb56-19" title="19">}</a>
<a class="sourceLine" id="cb56-20" title="20"></a>
<a class="sourceLine" id="cb56-21" title="21"><span class="fu">.tab-content.selected</span> {</a>
<a class="sourceLine" id="cb56-22" title="22">  <span class="kw">display</span>: <span class="dv">block</span><span class="op">;</span></a>
<a class="sourceLine" id="cb56-23" title="23">}</a>



</div>


```js

const TabItem = (props) =&gt; &lt;div {...props} /&gt;;

const Tabs = ({ defaultIndex = 0, onTabClick, children }) =&gt; {
const [bindIndex, setBindIndex] = React.useState(defaultIndex);
const changeTab = (newIndex) =&gt; {
if (typeof onItemClick === &quot;function&quot;) onItemClick(itemIndex);
setBindIndex(newIndex);
};
const items = children.filter((item) =&gt; item.type.name === &quot;TabItem&quot;);

return (
&lt;div className=&quot;wrapper&quot;&gt;
&lt;div className=&quot;tab-menu&quot;&gt;
{items.map(({ props: { index, label } }) =&gt; (
&lt;button
key={`tab-btn-${index}`}
onClick={() =&gt; changeTab(index)}
className={bindIndex === index ? &quot;focus&quot; : &quot;&quot;}
&gt;
{label}
&lt;/button&gt;
))}
&lt;/div&gt;
&lt;div className=&quot;tab-view&quot;&gt;
{items.map(({ props }) =&gt; (
&lt;div
{...props}
className={`tab-content ${ bindIndex === props.index ? &quot;selected&quot; : &quot;&quot; }`}
key={`tab-content-${props.index}`}
/&gt;
))}
&lt;/div&gt;
&lt;/div&gt;
);
};



<hr />

```js

ReactDOM.render(
  &lt;Tabs defaultIndex=&quot;1&quot; onTabClick={console.log}&gt;
    &lt;TabItem label=&quot;A&quot; index=&quot;1&quot;&gt;
      Lorem ipsum
    &lt;/TabItem&gt;
    &lt;TabItem label=&quot;B&quot; index=&quot;2&quot;&gt;
      Dolor sit amet
    &lt;/TabItem&gt;
  &lt;/Tabs&gt;,
  document.getElementById(&quot;root&quot;)
);

```

<hr />
<p>Renders a tag input field.</p>
<ul>
<li>Define a <code>TagInput</code> component and use the <code>useState()</code> hook to initialize an array from <code>tags</code>.</li>
<li>Use <code>Array.prototype.map()</code> on the collected nodes to render the list of tags.</li>
<li>Define the <code>addTagData</code> method, which will be executed when pressing the <code>Enter</code> key.</li>
<li>The <code>addTagData</code> method calls <code>setTagData</code> to add the new tag using the spread (<code>...</code>) operator to prepend the existing tags and add the new tag at the end of the <code>tagData</code> array.</li>
<li>Define the <code>removeTagData</code> method, which will be executed on clicking the delete icon in the tag.</li>
<li>Use <code>Array.prototype.filter()</code> in the <code>removeTagData</code> method to remove the tag using its <code>index</code> to filter it out from the <code>tagData</code> array.</li>
</ul>
<div class="sourceCode" id="cb59"><pre class="sourceCode css"><code class="sourceCode css"><a class="sourceLine" id="cb59-1" title="1"><span class="fu">.tag-input</span> {</a>
<a class="sourceLine" id="cb59-2" title="2">  <span class="kw">display</span>: flex<span class="op">;</span></a>
<a class="sourceLine" id="cb59-3" title="3">  <span class="kw">flex-wrap</span>: wrap<span class="op">;</span></a>
<a class="sourceLine" id="cb59-4" title="4">  <span class="kw">min-height</span>: <span class="dv">48</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-5" title="5">  <span class="kw">padding</span>: <span class="dv">0</span> <span class="dv">8</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-6" title="6">  <span class="kw">border</span>: <span class="dv">1</span><span class="dt">px</span> <span class="dv">solid</span> <span class="cn">#d6d8da</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-7" title="7">  <span class="kw">border-radius</span>: <span class="dv">6</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-8" title="8">}</a>
<a class="sourceLine" id="cb59-9" title="9"></a>
<a class="sourceLine" id="cb59-10" title="10"><span class="fu">.tag-input</span> input {</a>
<a class="sourceLine" id="cb59-11" title="11">  <span class="kw">flex</span>: <span class="dv">1</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-12" title="12">  <span class="kw">border</span>: <span class="dv">none</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-13" title="13">  <span class="kw">height</span>: <span class="dv">46</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-14" title="14">  <span class="kw">font-size</span>: <span class="dv">14</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-15" title="15">  <span class="kw">padding</span>: <span class="dv">4</span><span class="dt">px</span> <span class="dv">0</span> <span class="dv">0</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-16" title="16">}</a>
<a class="sourceLine" id="cb59-17" title="17"></a>
<a class="sourceLine" id="cb59-18" title="18"><span class="fu">.tag-input</span> input<span class="in">:focus</span> {</a>
<a class="sourceLine" id="cb59-19" title="19">  <span class="kw">outline</span>: <span class="dv">transparent</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-20" title="20">}</a>
<a class="sourceLine" id="cb59-21" title="21"></a>
<a class="sourceLine" id="cb59-22" title="22"><span class="fu">.tags</span> {</a>
<a class="sourceLine" id="cb59-23" title="23">  <span class="kw">display</span>: flex<span class="op">;</span></a>
<a class="sourceLine" id="cb59-24" title="24">  <span class="kw">flex-wrap</span>: wrap<span class="op">;</span></a>
<a class="sourceLine" id="cb59-25" title="25">  <span class="kw">padding</span>: <span class="dv">0</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-26" title="26">  <span class="kw">margin</span>: <span class="dv">8</span><span class="dt">px</span> <span class="dv">0</span> <span class="dv">0</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-27" title="27">}</a>
<a class="sourceLine" id="cb59-28" title="28"></a>
<a class="sourceLine" id="cb59-29" title="29"><span class="fu">.tag</span> {</a>
<a class="sourceLine" id="cb59-30" title="30">  <span class="kw">width</span>: <span class="bu">auto</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-31" title="31">  <span class="kw">height</span>: <span class="dv">32</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-32" title="32">  <span class="kw">display</span>: flex<span class="op">;</span></a>
<a class="sourceLine" id="cb59-33" title="33">  <span class="kw">align-items</span>: <span class="dv">center</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-34" title="34">  <span class="kw">justify-content</span>: <span class="dv">center</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-35" title="35">  <span class="kw">color</span>: <span class="cn">#fff</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-36" title="36">  <span class="kw">padding</span>: <span class="dv">0</span> <span class="dv">8</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-37" title="37">  <span class="kw">font-size</span>: <span class="dv">14</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-38" title="38">  <span class="kw">list-style</span>: <span class="dv">none</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-39" title="39">  <span class="kw">border-radius</span>: <span class="dv">6</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-40" title="40">  <span class="kw">margin</span>: <span class="dv">0</span> <span class="dv">8</span><span class="dt">px</span> <span class="dv">8</span><span class="dt">px</span> <span class="dv">0</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-41" title="41">  <span class="kw">background</span>: <span class="cn">#0052cc</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-42" title="42">}</a>
<a class="sourceLine" id="cb59-43" title="43"></a>
<a class="sourceLine" id="cb59-44" title="44"><span class="fu">.tag-title</span> {</a>
<a class="sourceLine" id="cb59-45" title="45">  <span class="kw">margin-top</span>: <span class="dv">3</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-46" title="46">}</a>
<a class="sourceLine" id="cb59-47" title="47"></a>
<a class="sourceLine" id="cb59-48" title="48"><span class="fu">.tag-close-icon</span> {</a>
<a class="sourceLine" id="cb59-49" title="49">  <span class="kw">display</span>: <span class="dv">block</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-50" title="50">  <span class="kw">width</span>: <span class="dv">16</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-51" title="51">  <span class="kw">height</span>: <span class="dv">16</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-52" title="52">  <span class="kw">line-height</span>: <span class="dv">16</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-53" title="53">  <span class="kw">text-align</span>: <span class="dv">center</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-54" title="54">  <span class="kw">font-size</span>: <span class="dv">14</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-55" title="55">  <span class="kw">margin-left</span>: <span class="dv">8</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-56" title="56">  <span class="kw">color</span>: <span class="cn">#0052cc</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-57" title="57">  <span class="kw">border-radius</span>: <span class="dv">50</span><span class="dt">%</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-58" title="58">  <span class="kw">background</span>: <span class="cn">#fff</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-59" title="59">  <span class="kw">cursor</span>: <span class="dv">pointer</span><span class="op">;</span></a>
<a class="sourceLine" id="cb59-60" title="60">}</a>



</div>


```js

const TagInput = ({ tags }) =&gt; {
  const [tagData, setTagData] = React.useState(tags);
  const removeTagData = (indexToRemove) =&gt; {
    setTagData([...tagData.filter((_, index) =&gt; index !== indexToRemove)]);
  };
  const addTagData = (event) =&gt; {
    if (event.target.value !== &quot;&quot;) {
      setTagData([...tagData, event.target.value]);
      event.target.value = &quot;&quot;;
    }
  };
  return (
    &lt;div className=&quot;tag-input&quot;&gt;
      &lt;ul className=&quot;tags&quot;&gt;
        {tagData.map((tag, index) =&gt; (
          &lt;li key={index} className=&quot;tag&quot;&gt;
            &lt;span className=&quot;tag-title&quot;&gt;{tag}&lt;/span&gt;
            &lt;span
              className=&quot;tag-close-icon&quot;
              onClick={() =&gt; removeTagData(index)}
            &gt;
              x
            &lt;/span&gt;
          &lt;/li&gt;
        ))}
      &lt;/ul&gt;
      &lt;input
        type=&quot;text&quot;
        onKeyUp={(event) =&gt; (event.key === &quot;Enter&quot; ? addTagData(event) : null)}
        placeholder=&quot;Press enter to add a tag&quot;
      /&gt;
    &lt;/div&gt;
  );
};



<hr />

```js

ReactDOM.render(
  &lt;TagInput tags={[&quot;Nodejs&quot;, &quot;MongoDB&quot;]} /&gt;,
  document.getElementById(&quot;root&quot;)
);

```

<hr />
<p>Renders an uncontrolled <code>&lt;textarea&gt;</code> element that uses a callback function to pass its value to the parent component.</p>
<ul>
<li>Use the <code>defaultValue</code> passed down from the parent as the uncontrolled input field’s initial value.</li>
<li>Use the <code>onChange</code> event to fire the <code>onValueChange</code> callback and send the new value to the parent.</li>
</ul>

```js

const TextArea = ({
  cols = 20,
  rows = 2,
  defaultValue,
  onValueChange,
  ...rest
}) =&gt; {
  return (
    &lt;textarea
      cols={cols}
      rows={rows}
      defaultValue={defaultValue}
      onChange={({ target: { value } }) =&gt; onValueChange(value)}
      {...rest}
    /&gt;
  );
};

```

<hr />

```js

ReactDOM.render(
  &lt;TextArea
    placeholder=&quot;Insert some text here...&quot;
    onValueChange={(val) =&gt; console.log(val)}
  /&gt;,
  document.getElementById(&quot;root&quot;)
);

```

<hr />
<p>Renders a toggle component.</p>
<ul>
<li>Use the <code>useState()</code> hook to initialize the <code>isToggleOn</code> state variable to <code>defaultToggled</code>.</li>
<li>Render an <code>&lt;input&gt;</code> and bind its <code>onClick</code> event to update the <code>isToggledOn</code> state variable, applying the appropriate <code>className</code> to the wrapping <code>&lt;label&gt;</code>.</li>
</ul>
<div class="sourceCode" id="cb64"><pre class="sourceCode css"><code class="sourceCode css"><a class="sourceLine" id="cb64-1" title="1"><span class="fu">.toggle</span> input<span class="ex">[type</span><span class="op">=</span><span class="st">&quot;checkbox&quot;</span><span class="ex">]</span> {</a>
<a class="sourceLine" id="cb64-2" title="2">  <span class="kw">display</span>: <span class="dv">none</span><span class="op">;</span></a>
<a class="sourceLine" id="cb64-3" title="3">}</a>
<a class="sourceLine" id="cb64-4" title="4"></a>
<a class="sourceLine" id="cb64-5" title="5"><span class="fu">.toggle.on</span> {</a>
<a class="sourceLine" id="cb64-6" title="6">  <span class="kw">background-color</span>: <span class="cn">green</span><span class="op">;</span></a>
<a class="sourceLine" id="cb64-7" title="7">}</a>
<a class="sourceLine" id="cb64-8" title="8"></a>
<a class="sourceLine" id="cb64-9" title="9"><span class="fu">.toggle.off</span> {</a>
<a class="sourceLine" id="cb64-10" title="10">  <span class="kw">background-color</span>: <span class="cn">red</span><span class="op">;</span></a>
<a class="sourceLine" id="cb64-11" title="11">}</a>



</div>


```js

const Toggle = ({ defaultToggled = false }) =&gt; {
  const [isToggleOn, setIsToggleOn] = React.useState(defaultToggled);

return (
&lt;label className={isToggleOn ? &quot;toggle on&quot; : &quot;toggle off&quot;}&gt;
&lt;input
type=&quot;checkbox&quot;
checked={isToggleOn}
onChange={() =&gt; setIsToggleOn(!isToggleOn)}
/&gt;
{isToggleOn ? &quot;ON&quot; : &quot;OFF&quot;}
&lt;/label&gt;
);
};



<hr />

```js

ReactDOM.render(&lt;Toggle /&gt;, document.getElementById(&quot;root&quot;));

```

<hr />
<p>Renders a tooltip component.</p>
<ul>
<li>Use the <code>useState()</code> hook to create the <code>show</code> variable and initialize it to <code>false</code>.</li>
<li>Render a container element that contains the tooltip element and the <code>children</code> passed to the component.</li>
<li>Handle the <code>onMouseEnter</code> and <code>onMouseLeave</code> methods, by altering the value of the <code>show</code> variable, toggling the <code>className</code> of the tooltip.</li>
</ul>
<div class="sourceCode" id="cb67"><pre class="sourceCode css"><code class="sourceCode css"><a class="sourceLine" id="cb67-1" title="1"><span class="fu">.tooltip-container</span> {</a>
<a class="sourceLine" id="cb67-2" title="2">  <span class="kw">position</span>: <span class="dv">relative</span><span class="op">;</span></a>
<a class="sourceLine" id="cb67-3" title="3">}</a>
<a class="sourceLine" id="cb67-4" title="4"></a>
<a class="sourceLine" id="cb67-5" title="5"><span class="fu">.tooltip-box</span> {</a>
<a class="sourceLine" id="cb67-6" title="6">  <span class="kw">position</span>: <span class="dv">absolute</span><span class="op">;</span></a>
<a class="sourceLine" id="cb67-7" title="7">  <span class="kw">background</span>: <span class="fu">rgba(</span><span class="dv">0</span><span class="op">,</span> <span class="dv">0</span><span class="op">,</span> <span class="dv">0</span><span class="op">,</span> <span class="dv">0.7</span><span class="fu">)</span><span class="op">;</span></a>
<a class="sourceLine" id="cb67-8" title="8">  <span class="kw">color</span>: <span class="cn">#fff</span><span class="op">;</span></a>
<a class="sourceLine" id="cb67-9" title="9">  <span class="kw">padding</span>: <span class="dv">5</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb67-10" title="10">  <span class="kw">border-radius</span>: <span class="dv">5</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb67-11" title="11">  <span class="kw">top</span>: <span class="fu">calc(</span><span class="dv">100</span><span class="dt">%</span> <span class="op">+</span> <span class="dv">5</span><span class="dt">px</span><span class="fu">)</span><span class="op">;</span></a>
<a class="sourceLine" id="cb67-12" title="12">  <span class="kw">display</span>: <span class="dv">none</span><span class="op">;</span></a>
<a class="sourceLine" id="cb67-13" title="13">}</a>
<a class="sourceLine" id="cb67-14" title="14"></a>
<a class="sourceLine" id="cb67-15" title="15"><span class="fu">.tooltip-box.visible</span> {</a>
<a class="sourceLine" id="cb67-16" title="16">  <span class="kw">display</span>: <span class="dv">block</span><span class="op">;</span></a>
<a class="sourceLine" id="cb67-17" title="17">}</a>
<a class="sourceLine" id="cb67-18" title="18"></a>
<a class="sourceLine" id="cb67-19" title="19"><span class="fu">.tooltip-arrow</span> {</a>
<a class="sourceLine" id="cb67-20" title="20">  <span class="kw">position</span>: <span class="dv">absolute</span><span class="op">;</span></a>
<a class="sourceLine" id="cb67-21" title="21">  <span class="kw">top</span>: <span class="dv">-10</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb67-22" title="22">  <span class="kw">left</span>: <span class="dv">50</span><span class="dt">%</span><span class="op">;</span></a>
<a class="sourceLine" id="cb67-23" title="23">  <span class="kw">border-width</span>: <span class="dv">5</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb67-24" title="24">  <span class="kw">border-style</span>: <span class="dv">solid</span><span class="op">;</span></a>
<a class="sourceLine" id="cb67-25" title="25">  <span class="kw">border-color</span>: <span class="dv">transparent</span> <span class="dv">transparent</span> <span class="fu">rgba(</span><span class="dv">0</span><span class="op">,</span> <span class="dv">0</span><span class="op">,</span> <span class="dv">0</span><span class="op">,</span> <span class="dv">0.7</span><span class="fu">)</span> <span class="dv">transparent</span><span class="op">;</span></a>
<a class="sourceLine" id="cb67-26" title="26">}</a>



</div>


```js

const Tooltip = ({ children, text, ...rest }) =&gt; {
  const [show, setShow] = React.useState(false);

return (
&lt;div className=&quot;tooltip-container&quot;&gt;
&lt;div className={show ? &quot;tooltip-box visible&quot; : &quot;tooltip-box&quot;}&gt;
{text}
&lt;span className=&quot;tooltip-arrow&quot; /&gt;
&lt;/div&gt;
&lt;div
onMouseEnter={() =&gt; setShow(true)}
onMouseLeave={() =&gt; setShow(false)}
{...rest}
&gt;
{children}
&lt;/div&gt;
&lt;/div&gt;
);
};



<hr />

```js

ReactDOM.render(
  &lt;Tooltip text=&quot;Simple tooltip&quot;&gt;
    &lt;button&gt;Hover me!&lt;/button&gt;
  &lt;/Tooltip&gt;,
  document.getElementById(&quot;root&quot;)
);

```

<hr />
<p>Renders a tree view of a JSON object or array with collapsible content.</p>
<ul>
<li>Use the value of the <code>toggled</code> prop to determine the initial state of the content (collapsed/expanded).</li>
<li>Use the <code>useState()</code> hook to create the <code>isToggled</code> state variable and give it the value of the <code>toggled</code> prop initially.</li>
<li>Render a <code>&lt;span&gt;</code> element and bind its <code>onClick</code> event to alter the component’s <code>isToggled</code> state.</li>
<li>Determine the appearance of the component, based on <code>isParentToggled</code>, <code>isToggled</code>, <code>name</code> and checking for <code>Array.isArray()</code> on <code>data</code>.</li>
<li>For each child in <code>data</code>, determine if it is an object or array and recursively render a sub-tree or a text element with the appropriate style.</li>
</ul>
<div class="sourceCode" id="cb70"><pre class="sourceCode css"><code class="sourceCode css"><a class="sourceLine" id="cb70-1" title="1"><span class="fu">.tree-element</span> {</a>
<a class="sourceLine" id="cb70-2" title="2">  <span class="kw">margin</span>: <span class="dv">0</span> <span class="dv">0</span> <span class="dv">0</span> <span class="dv">4</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb70-3" title="3">  <span class="kw">position</span>: <span class="dv">relative</span><span class="op">;</span></a>
<a class="sourceLine" id="cb70-4" title="4">}</a>
<a class="sourceLine" id="cb70-5" title="5"></a>
<a class="sourceLine" id="cb70-6" title="6"><span class="fu">.tree-element.is-child</span> {</a>
<a class="sourceLine" id="cb70-7" title="7">  <span class="kw">margin-left</span>: <span class="dv">16</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb70-8" title="8">}</a>
<a class="sourceLine" id="cb70-9" title="9"></a>
<a class="sourceLine" id="cb70-10" title="10">div<span class="fu">.tree-element</span><span class="in">:before</span> {</a>
<a class="sourceLine" id="cb70-11" title="11">  <span class="kw">content</span>: <span class="st">&quot;&quot;</span><span class="op">;</span></a>
<a class="sourceLine" id="cb70-12" title="12">  <span class="kw">position</span>: <span class="dv">absolute</span><span class="op">;</span></a>
<a class="sourceLine" id="cb70-13" title="13">  <span class="kw">top</span>: <span class="dv">24</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb70-14" title="14">  <span class="kw">left</span>: <span class="dv">1</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb70-15" title="15">  <span class="kw">height</span>: <span class="fu">calc(</span><span class="dv">100</span><span class="dt">%</span> <span class="op">-</span> <span class="dv">48</span><span class="dt">px</span><span class="fu">)</span><span class="op">;</span></a>
<a class="sourceLine" id="cb70-16" title="16">  <span class="kw">border-left</span>: <span class="dv">1</span><span class="dt">px</span> <span class="dv">solid</span> <span class="cn">gray</span><span class="op">;</span></a>
<a class="sourceLine" id="cb70-17" title="17">}</a>
<a class="sourceLine" id="cb70-18" title="18"></a>
<a class="sourceLine" id="cb70-19" title="19">p<span class="fu">.tree-element</span> {</a>
<a class="sourceLine" id="cb70-20" title="20">  <span class="kw">margin-left</span>: <span class="dv">16</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb70-21" title="21">}</a>
<a class="sourceLine" id="cb70-22" title="22"></a>
<a class="sourceLine" id="cb70-23" title="23"><span class="fu">.toggler</span> {</a>
<a class="sourceLine" id="cb70-24" title="24">  <span class="kw">position</span>: <span class="dv">absolute</span><span class="op">;</span></a>
<a class="sourceLine" id="cb70-25" title="25">  <span class="kw">top</span>: <span class="dv">10</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb70-26" title="26">  <span class="kw">left</span>: <span class="dv">0</span><span class="dt">px</span><span class="op">;</span></a>
<a class="sourceLine" id="cb70-27" title="27">  <span class="kw">width</span>: <span class="dv">0</span><span class="op">;</span></a>
<a class="sourceLine" id="cb70-28" title="28">  <span class="kw">height</span>: <span class="dv">0</span><span class="op">;</span></a>
<a class="sourceLine" id="cb70-29" title="29">  <span class="kw">border-top</span>: <span class="dv">4</span><span class="dt">px</span> <span class="dv">solid</span> <span class="dv">transparent</span><span class="op">;</span></a>
<a class="sourceLine" id="cb70-30" title="30">  <span class="kw">border-bottom</span>: <span class="dv">4</span><span class="dt">px</span> <span class="dv">solid</span> <span class="dv">transparent</span><span class="op">;</span></a>
<a class="sourceLine" id="cb70-31" title="31">  <span class="kw">border-left</span>: <span class="dv">5</span><span class="dt">px</span> <span class="dv">solid</span> <span class="cn">gray</span><span class="op">;</span></a>
<a class="sourceLine" id="cb70-32" title="32">  <span class="kw">cursor</span>: <span class="dv">pointer</span><span class="op">;</span></a>
<a class="sourceLine" id="cb70-33" title="33">}</a>
<a class="sourceLine" id="cb70-34" title="34"></a>
<a class="sourceLine" id="cb70-35" title="35"><span class="fu">.toggler.closed</span> {</a>
<a class="sourceLine" id="cb70-36" title="36">  <span class="kw">transform</span>: <span class="fu">rotate(</span><span class="dv">90</span><span class="dt">deg</span><span class="fu">)</span><span class="op">;</span></a>
<a class="sourceLine" id="cb70-37" title="37">}</a>
<a class="sourceLine" id="cb70-38" title="38"></a>
<a class="sourceLine" id="cb70-39" title="39"><span class="fu">.collapsed</span> {</a>
<a class="sourceLine" id="cb70-40" title="40">  <span class="kw">display</span>: <span class="dv">none</span><span class="op">;</span></a>
<a class="sourceLine" id="cb70-41" title="41">}</a>



</div>


```js

const TreeView = ({
  data,
  toggled = true,
  name = null,
  isLast = true,
  isChildElement = false,
  isParentToggled = true,
}) =&gt; {
  const [isToggled, setIsToggled] = React.useState(toggled);
  const isDataArray = Array.isArray(data);

return (
&lt;div
className={`tree-element ${isParentToggled &amp;&amp; &quot;collapsed&quot;} ${ isChildElement &amp;&amp; &quot;is-child&quot; }`}
&gt;
&lt;span
className={isToggled ? &quot;toggler&quot; : &quot;toggler closed&quot;}
onClick={() =&gt; setIsToggled(!isToggled)}
/&gt;
{name ? &lt;strong&gt;&amp;nbsp;&amp;nbsp;{name}: &lt;/strong&gt; : &lt;span&gt;&amp;nbsp;&amp;nbsp;&lt;/span&gt;}
{isDataArray ? &quot;[&quot; : &quot;{&quot;}
{!isToggled &amp;&amp; &quot;...&quot;}
{Object.keys(data).map((v, i, a) =&gt;
typeof data[v] === &quot;object&quot; ? (
&lt;TreeView
key={`${name}-${v}-${i}`}
data={data[v]}
isLast={i === a.length - 1}
name={isDataArray ? null : v}
isChildElement
isParentToggled={isParentToggled &amp;&amp; isToggled}
/&gt;
) : (
&lt;p
key={`${name}-${v}-${i}`}
className={isToggled ? &quot;tree-element&quot; : &quot;tree-element collapsed&quot;}
&gt;
{isDataArray ? &quot;&quot; : &lt;strong&gt;{v}: &lt;/strong&gt;}
{data[v]}
{i === a.length - 1 ? &quot;&quot; : &quot;,&quot;}
&lt;/p&gt;
)
)}
{isDataArray ? &quot;]&quot; : &quot;}&quot;}
{!isLast ? &quot;,&quot; : &quot;&quot;}
&lt;/div&gt;
);
};



<hr />

```js

const data = {
  lorem: {
    ipsum: &quot;dolor sit&quot;,
    amet: {
      consectetur: &quot;adipiscing&quot;,
      elit: [
        &quot;duis&quot;,
        &quot;vitae&quot;,
        {
          semper: &quot;orci&quot;,
        },
        {
          est: &quot;sed ornare&quot;,
        },
        &quot;etiam&quot;,
        [&quot;laoreet&quot;, &quot;tincidunt&quot;],
        [&quot;vestibulum&quot;, &quot;ante&quot;],
      ],
    },
    ipsum: &quot;primis&quot;,
  },
};
ReactDOM.render(
  &lt;TreeView data={data} name=&quot;data&quot; /&gt;,
  document.getElementById(&quot;root&quot;)
);

```

<hr />
<p>Renders an uncontrolled <code>&lt;input&gt;</code> element that uses a callback function to inform its parent about value updates.</p>
<ul>
<li>Use the <code>defaultValue</code> passed down from the parent as the uncontrolled input field’s initial value.</li>
<li>Use the <code>onChange</code> event to fire the <code>onValueChange</code> callback and send the new value to the parent.</li>
</ul>

```js

const UncontrolledInput = ({ defaultValue, onValueChange, ...rest }) =&gt; {
  return (
    &lt;input
      defaultValue={defaultValue}
      onChange={({ target: { value } }) =&gt; onValueChange(value)}
      {...rest}
    /&gt;
  );
};

```

<hr />

```js

ReactDOM.render(
  &lt;UncontrolledInput
    type=&quot;text&quot;
    placeholder=&quot;Insert some text here...&quot;
    onValueChange={console.log}
  /&gt;,
  document.getElementById(&quot;root&quot;)
);

```

<hr />
<p>Handles asynchronous calls.</p>
<ul>
<li>Create a custom hook that takes a handler function, <code>fn</code>.</li>
<li>Define a reducer function and an initial state for the custom hook’s state.</li>
<li>Use the <code>useReducer()</code> hook to initialize the <code>state</code> variable and the <code>dispatch</code> function.</li>
<li>Define an asynchronous <code>run</code> function that will run the provided callback, <code>fn</code>, while using <code>dispatch</code> to update <code>state</code> as necessary.</li>
<li>Return an object containing the properties of <code>state</code> (<code>value</code>, <code>error</code> and <code>loading</code>) and the <code>run</code> function.</li>
</ul>

```js

const useAsync = (fn) =&gt; {
  const initialState = { loading: false, error: null, value: null };
  const stateReducer = (_, action) =&gt; {
    switch (action.type) {
      case &quot;start&quot;:
        return { loading: true, error: null, value: null };
      case &quot;finish&quot;:
        return { loading: false, error: null, value: action.value };
      case &quot;error&quot;:
        return { loading: false, error: action.error, value: null };
    }
  };

const [state, dispatch] = React.useReducer(stateReducer, initialState);

const run = async (args = null) =&gt; {
try {
dispatch({ type: &quot;start&quot; });
const value = await fn(args);
dispatch({ type: &quot;finish&quot;, value });
} catch (error) {
dispatch({ type: &quot;error&quot;, error });
}
};

return { ...state, run };
};

```

<hr />

```js

const RandomImage = (props) =&gt; {
  const imgFetch = useAsync((url) =&gt;
    fetch(url).then((response) =&gt; response.json())
  );

return (
&lt;div&gt;
&lt;button
onClick={() =&gt; imgFetch.run(&quot;https://dog.ceo/api/breeds/image/random&quot;)}
disabled={imgFetch.isLoading}
&gt;
Load image
&lt;/button&gt;
&lt;br /&gt;
{imgFetch.loading &amp;&amp; &lt;div&gt;Loading...&lt;/div&gt;}
{imgFetch.error &amp;&amp; &lt;div&gt;Error {imgFetch.error}&lt;/div&gt;}
{imgFetch.value &amp;&amp; (
&lt;img
src={imgFetch.value.message}
alt=&quot;avatar&quot;
width={400}
height=&quot;auto&quot;
/&gt;
)}
&lt;/div&gt;
);
};

ReactDOM.render(&lt;RandomImage /&gt;, document.getElementById(&quot;root&quot;));

```

<hr />
<p>Handles the event of clicking inside the wrapped component.</p>
<ul>
<li>Create a custom hook that takes a <code>ref</code> and a <code>callback</code> to handle the <code>'click'</code> event.</li>
<li>Use the <code>useEffect()</code> hook to append and clean up the <code>click</code> event.</li>
<li>Use the <code>useRef()</code> hook to create a <code>ref</code> for your click component and pass it to the <code>useClickInside</code> hook.</li>
</ul>

```js

const useClickInside = (ref, callback) =&gt; {
  const handleClick = (e) =&gt; {
    if (ref.current &amp;&amp; ref.current.contains(e.target)) {
      callback();
    }
  };
  React.useEffect(() =&gt; {
    document.addEventListener(&quot;click&quot;, handleClick);
    return () =&gt; {
      document.removeEventListener(&quot;click&quot;, handleClick);
    };
  });
};

```

<hr />

```js

const ClickBox = ({ onClickInside }) =&gt; {
  const clickRef = React.useRef();
  useClickInside(clickRef, onClickInside);
  return (
    &lt;div
      className=&quot;click-box&quot;
      ref={clickRef}
      style={{
        border: &quot;2px dashed orangered&quot;,
        height: 200,
        width: 400,
        display: &quot;flex&quot;,
        justifyContent: &quot;center&quot;,
        alignItems: &quot;center&quot;,
      }}
    &gt;
      &lt;p&gt;Click inside this element&lt;/p&gt;
    &lt;/div&gt;
  );
};

ReactDOM.render(
&lt;ClickBox onClickInside={() =&gt; alert(&quot;click inside&quot;)} /&gt;,
document.getElementById(&quot;root&quot;)
);

```

<hr />
<p>Handles the event of clicking outside of the wrapped component.</p>
<ul>
<li>Create a custom hook that takes a <code>ref</code> and a <code>callback</code> to handle the <code>click</code> event.</li>
<li>Use the <code>useEffect()</code> hook to append and clean up the <code>click</code> event.</li>
<li>Use the <code>useRef()</code> hook to create a <code>ref</code> for your click component and pass it to the <code>useClickOutside</code> hook.</li>
</ul>

```js

const useClickOutside = (ref, callback) =&gt; {
  const handleClick = (e) =&gt; {
    if (ref.current &amp;&amp; !ref.current.contains(e.target)) {
      callback();
    }
  };
  React.useEffect(() =&gt; {
    document.addEventListener(&quot;click&quot;, handleClick);
    return () =&gt; {
      document.removeEventListener(&quot;click&quot;, handleClick);
    };
  });
};

```

<hr />

```js

const ClickBox = ({ onClickOutside }) =&gt; {
  const clickRef = React.useRef();
  useClickOutside(clickRef, onClickOutside);
  return (
    &lt;div
      className=&quot;click-box&quot;
      ref={clickRef}
      style={{
        border: &quot;2px dashed orangered&quot;,
        height: 200,
        width: 400,
        display: &quot;flex&quot;,
        justifyContent: &quot;center&quot;,
        alignItems: &quot;center&quot;,
      }}
    &gt;
      &lt;p&gt;Click out of this element&lt;/p&gt;
    &lt;/div&gt;
  );
};

ReactDOM.render(
&lt;ClickBox onClickOutside={() =&gt; alert(&quot;click outside&quot;)} /&gt;,
document.getElementById(&quot;root&quot;)
);

```

<hr />
<p>Executes a callback immediately after a component is mounted.</p>
<ul>
<li>Use <code>useEffect()</code> with an empty array as the second argument to execute the provided callback only once when the component is mounted.</li>
<li>Behaves like the <code>componentDidMount()</code> lifecycle method of class components.</li>
</ul>

```js

const useComponentDidMount = (onMountHandler) =&gt; {
  React.useEffect(() =&gt; {
    onMountHandler();
  }, []);
};

```

<hr />

```js

const Mounter = () =&gt; {
  useComponentDidMount(() =&gt; console.log(&quot;Component did mount&quot;));

return &lt;div&gt;Check the console!&lt;/div&gt;;
};

ReactDOM.render(&lt;Mounter /&gt;, document.getElementById(&quot;root&quot;));

```

<hr />
<p>Executes a callback immediately before a component is unmounted and destroyed.</p>
<ul>
<li>Use <code>useEffect()</code> with an empty array as the second argument and return the provided callback to be executed only once before cleanup.</li>
<li>Behaves like the <code>componentWillUnmount()</code> lifecycle method of class components.</li>
</ul>

```js

const useComponentWillUnmount = (onUnmountHandler) =&gt; {
  React.useEffect(
    () =&gt; () =&gt; {
      onUnmountHandler();
    },
    []
  );
};

```

<hr />

```js

const Unmounter = () =&gt; {
  useComponentWillUnmount(() =&gt; console.log(&quot;Component will unmount&quot;));

return &lt;div&gt;Check the console!&lt;/div&gt;;
};

ReactDOM.render(&lt;Unmounter /&gt;, document.getElementById(&quot;root&quot;));

```

<hr />
<p>Copies the given text to the clipboard.</p>
<ul>
<li>Use the <a href="/js/s/copy-to-clipboard/">copyToClipboard</a> snippet to copy the text to clipboard.</li>
<li>Use the <code>useState()</code> hook to initialize the <code>copied</code> variable.</li>
<li>Use the <code>useCallback()</code> hook to create a callback for the <code>copyToClipboard</code> method.</li>
<li>Use the <code>useEffect()</code> hook to reset the <code>copied</code> state variable if the <code>text</code> changes.</li>
<li>Return the <code>copied</code> state variable and the <code>copy</code> callback.</li>
</ul>

```js

const useCopyToClipboard = (text) =&gt; {
  const copyToClipboard = (str) =&gt; {
    const el = document.createElement(&quot;textarea&quot;);
    el.value = str;
    el.setAttribute(&quot;readonly&quot;, &quot;&quot;);
    el.style.position = &quot;absolute&quot;;
    el.style.left = &quot;-9999px&quot;;
    document.body.appendChild(el);
    const selected =
      document.getSelection().rangeCount &gt; 0
        ? document.getSelection().getRangeAt(0)
        : false;
    el.select();
    const success = document.execCommand(&quot;copy&quot;);
    document.body.removeChild(el);
    if (selected) {
      document.getSelection().removeAllRanges();
      document.getSelection().addRange(selected);
    }
    return success;
  };

const [copied, setCopied] = React.useState(false);

const copy = React.useCallback(() =&gt; {
if (!copied) setCopied(copyToClipboard(text));
}, [text]);
React.useEffect(() =&gt; () =&gt; setCopied(false), [text]);

return [copied, copy];
};

```

<hr />

```js

const TextCopy = (props) =&gt; {
  const [copied, copy] = useCopyToClipboard(&quot;Lorem ipsum&quot;);
  return (
    &lt;div&gt;
      &lt;button onClick={copy}&gt;Click to copy&lt;/button&gt;
      &lt;span&gt;{copied &amp;&amp; &quot;Copied!&quot;}&lt;/span&gt;
    &lt;/div&gt;
  );
};

ReactDOM.render(&lt;TextCopy /&gt;, document.getElementById(&quot;root&quot;));

```

<hr />
<p>Debounces the given value.</p>
<ul>
<li>Create a custom hook that takes a <code>value</code> and a <code>delay</code>.</li>
<li>Use the <code>useState()</code> hook to store the debounced value.</li>
<li>Use the <code>useEffect()</code> hook to update the debounced value every time <code>value</code> is updated.</li>
<li>Use <code>setTimeout()</code> to create a timeout that delays invoking the setter of the previous state variable by <code>delay</code> ms.</li>
<li>Use <code>clearTimeout()</code> to clean up when dismounting the component.</li>
<li>This is particularly useful when dealing with user input.</li>
</ul>

```js

const useDebounce = (value, delay) =&gt; {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

React.useEffect(() =&gt; {
const handler = setTimeout(() =&gt; {
setDebouncedValue(value);
}, delay);

    return () =&gt; {
      clearTimeout(handler);
    };

}, [value]);

return debouncedValue;
};

```

<hr />

```js

const Counter = () =&gt; {
  const [value, setValue] = React.useState(0);
  const lastValue = useDebounce(value, 500);

return (
&lt;div&gt;
&lt;p&gt;
Current: {value} - Debounced: {lastValue}
&lt;/p&gt;
&lt;button onClick={() =&gt; setValue(value + 1)}&gt;Increment&lt;/button&gt;
&lt;/div&gt;
);
};

ReactDOM.render(&lt;Counter /&gt;, document.getElementById(&quot;root&quot;));

```

<hr />
<p>Implements <code>fetch</code> in a declarative manner.</p>
<ul>
<li>Create a custom hook that takes a <code>url</code> and <code>options</code>.</li>
<li>Use the <code>useState()</code> hook to initialize the <code>response</code> and <code>error</code> state variables.</li>
<li>Use the <code>useEffect()</code> hook to asynchronously call <code>fetch()</code> and update the state variables accordingly.</li>
<li>Return an object containing the <code>response</code> and <code>error</code> state variables.</li>
</ul>

```js

const useFetch = (url, options) =&gt; {
  const [response, setResponse] = React.useState(null);
  const [error, setError] = React.useState(null);

React.useEffect(() =&gt; {
const fetchData = async () =&gt; {
try {
const res = await fetch(url, options);
const json = await res.json();
setResponse(json);
} catch (error) {
setError(error);
}
};
fetchData();
}, []);

return { response, error };
};

```

<hr />

```js

const ImageFetch = (props) =&gt; {
  const res = useFetch(&quot;https://dog.ceo/api/breeds/image/random&quot;, {});
  if (!res.response) {
    return &lt;div&gt;Loading...&lt;/div&gt;;
  }
  const imageUrl = res.response.message;
  return (
    &lt;div&gt;
      &lt;img src={imageUrl} alt=&quot;avatar&quot; width={400} height=&quot;auto&quot; /&gt;
    &lt;/div&gt;
  );
};

ReactDOM.render(&lt;ImageFetch /&gt;, document.getElementById(&quot;root&quot;));

```

<hr />
<p>Implements <code>setInterval</code> in a declarative manner.</p>
<ul>
<li>Create a custom hook that takes a <code>callback</code> and a <code>delay</code>.</li>
<li>Use the <code>useRef()</code> hook to create a <code>ref</code> for the callback function.</li>
<li>Use a <code>useEffect()</code> hook to remember the latest <code>callback</code> whenever it changes.</li>
<li>Use a <code>useEffect()</code> hook dependent on <code>delay</code> to set up the interval and clean up.</li>
</ul>

```js

const useInterval = (callback, delay) =&gt; {
  const savedCallback = React.useRef();

React.useEffect(() =&gt; {
savedCallback.current = callback;
}, [callback]);

React.useEffect(() =&gt; {
function tick() {
savedCallback.current();
}
if (delay !== null) {
let id = setInterval(tick, delay);
return () =&gt; clearInterval(id);
}
}, [delay]);
};

```

<hr />

```js

const Timer = (props) =&gt; {
  const [seconds, setSeconds] = React.useState(0);
  useInterval(() =&gt; {
    setSeconds(seconds + 1);
  }, 1000);

return &lt;p&gt;{seconds}&lt;/p&gt;;
};

ReactDOM.render(&lt;Timer /&gt;, document.getElementById(&quot;root&quot;));

```

<hr />
<p>Checks if the current environment matches a given media query and returns the appropriate value.</p>
<ul>
<li>Check if <code>window</code> and <code>window.matchMedia</code> exist, return <code>whenFalse</code> if not (e.g. SSR environment or unsupported browser).</li>
<li>Use <code>window.matchMedia()</code> to match the given <code>query</code>, cast its <code>matches</code> property to a boolean and store in a state variable, <code>match</code>, using the <code>useState()</code> hook.</li>
<li>Use the <code>useEffect()</code> hook to add a listener for changes and to clean up the listeners after the hook is destroyed.</li>
<li>Return either <code>whenTrue</code> or <code>whenFalse</code> based on the value of <code>match</code>.</li>
</ul>

```js

const useMediaQuery = (query, whenTrue, whenFalse) =&gt; {
  if (typeof window === &quot;undefined&quot; || typeof window.matchMedia === &quot;undefined&quot;)
    return whenFalse;

const mediaQuery = window.matchMedia(query);
const [match, setMatch] = React.useState(!!mediaQuery.matches);

React.useEffect(() =&gt; {
const handler = () =&gt; setMatch(!!mediaQuery.matches);
mediaQuery.addListener(handler);
return () =&gt; mediaQuery.removeListener(handler);
}, []);

return match ? whenTrue : whenFalse;
};

```

<hr />

```js

const ResponsiveText = () =&gt; {
  const text = useMediaQuery(
    &quot;(max-width: 400px)&quot;,
    &quot;Less than 400px wide&quot;,
    &quot;More than 400px wide&quot;
  );

return &lt;span&gt;{text}&lt;/span&gt;;
};

ReactDOM.render(&lt;ResponsiveText /&gt;, document.getElementById(&quot;root&quot;));

```

<hr />
<p>Checks if the client is online or offline.</p>
<ul>
<li>Create a function, <code>getOnLineStatus</code>, that uses the <code>NavigatorOnLine</code> web API to get the online status of the client.</li>
<li>Use the <code>useState()</code> hook to create an appropriate state variable, <code>status</code>, and setter.</li>
<li>Use the <code>useEffect()</code> hook to add listeners for appropriate events, updating state, and cleanup those listeners when unmounting.</li>
<li>Finally return the <code>status</code> state variable.</li>
</ul>

```js

const getOnLineStatus = () =&gt;
  typeof navigator !== &quot;undefined&quot; &amp;&amp; typeof navigator.onLine === &quot;boolean&quot;
    ? navigator.onLine
    : true;

const useNavigatorOnLine = () =&gt; {
const [status, setStatus] = React.useState(getOnLineStatus());

const setOnline = () =&gt; setStatus(true);
const setOffline = () =&gt; setStatus(false);

React.useEffect(() =&gt; {
window.addEventListener(&quot;online&quot;, setOnline);
window.addEventListener(&quot;offline&quot;, setOffline);

    return () =&gt; {
      window.removeEventListener(&quot;online&quot;, setOnline);
      window.removeEventListener(&quot;offline&quot;, setOffline);
    };

}, []);

return status;
};

```

<hr />

```js

const StatusIndicator = () =&gt; {
  const isOnline = useNavigatorOnLine();

return &lt;span&gt;You are {isOnline ? &quot;online&quot; : &quot;offline&quot;}.&lt;/span&gt;;
};

ReactDOM.render(&lt;StatusIndicator /&gt;, document.getElementById(&quot;root&quot;));

```

<hr />
<p>Returns a stateful value, persisted in <code>localStorage</code>, and a function to update it.</p>
<ul>
<li>Use the <code>useState()</code> hook to initialize the <code>value</code> to <code>defaultValue</code>.</li>
<li>Use the <code>useRef()</code> hook to create a ref that will hold the <code>name</code> of the value in <code>localStorage</code>.</li>
<li>Use 3 instances of the <code>useEffect()</code> hook for initialization, <code>value</code> change and <code>name</code> change respectively.</li>
<li>When the component is first mounted, use <code>Storage.getItem()</code> to update <code>value</code> if there’s a stored value or <code>Storage.setItem()</code> to persist the current value.</li>
<li>When <code>value</code> is updated, use <code>Storage.setItem()</code> to store the new value.</li>
<li>When <code>name</code> is updated, use <code>Storage.setItem()</code> to create the new key, update the <code>nameRef</code> and use <code>Storage.removeItem()</code> to remove the previous key from <code>localStorage</code>.</li>
<li><strong>NOTE:</strong> The hook is meant for use with primitive values (i.e. not objects) and doesn’t account for changes to <code>localStorage</code> due to other code. Both of these issues can be easily handled (e.g. JSON serialization and handling the <code>'storage'</code> event).</li>
</ul>

```js

const usePersistedState = (name, defaultValue) =&gt; {
  const [value, setValue] = React.useState(defaultValue);
  const nameRef = React.useRef(name);

React.useEffect(() =&gt; {
try {
const storedValue = localStorage.getItem(name);
if (storedValue !== null) setValue(storedValue);
else localStorage.setItem(name, defaultValue);
} catch {
setValue(defaultValue);
}
}, []);

React.useEffect(() =&gt; {
try {
localStorage.setItem(nameRef.current, value);
} catch {}
}, [value]);

React.useEffect(() =&gt; {
const lastName = nameRef.current;
if (name !== lastName) {
try {
localStorage.setItem(name, value);
nameRef.current = name;
localStorage.removeItem(lastName);
} catch {}
}
}, [name]);

return [value, setValue];
};

```

<hr />

```js

const MyComponent = ({ name }) =&gt; {
  const [val, setVal] = usePersistedState(name, 10);
  return (
    &lt;input
      value={val}
      onChange={(e) =&gt; {
        setVal(e.target.value);
      }}
    /&gt;
  );
};

const MyApp = () =&gt; {
const [name, setName] = React.useState(&quot;my-value&quot;);
return (
&lt;&gt;
&lt;MyComponent name={name} /&gt;
&lt;input
value={name}
onChange={(e) =&gt; {
setName(e.target.value);
}}
/&gt;
&lt;/&gt;
);
};

ReactDOM.render(&lt;MyApp /&gt;, document.getElementById(&quot;root&quot;));

```

<hr />
<p>Stores the previous state or props.</p>
<ul>
<li>Create a custom hook that takes a <code>value</code>.</li>
<li>Use the <code>useRef()</code> hook to create a <code>ref</code> for the <code>value</code>.</li>
<li>Use the <code>useEffect()</code> hook to remember the latest <code>value</code>.</li>
</ul>

```js

const usePrevious = (value) =&gt; {
  const ref = React.useRef();
  React.useEffect(() =&gt; {
    ref.current = value;
  });
  return ref.current;
};

```

<hr />

```js

const Counter = () =&gt; {
  const [value, setValue] = React.useState(0);
  const lastValue = usePrevious(value);

return (
&lt;div&gt;
&lt;p&gt;
Current: {value} - Previous: {lastValue}
&lt;/p&gt;
&lt;button onClick={() =&gt; setValue(value + 1)}&gt;Increment&lt;/button&gt;
&lt;/div&gt;
);
};

ReactDOM.render(&lt;Counter /&gt;, document.getElementById(&quot;root&quot;));

```

<hr />
<p>Checks if the code is running on the browser or the server.</p>
<ul>
<li>Create a custom hook that returns an appropriate object.</li>
<li>Use <code>typeof window</code>, <code>window.document</code> and <code>Document.createElement()</code> to check if the code is running on the browser.</li>
<li>Use the <code>useState()</code> hook to define the <code>inBrowser</code> state variable.</li>
<li>Use the <code>useEffect()</code> hook to update the <code>inBrowser</code> state variable and clean up at the end.</li>
<li>Use the <code>useMemo()</code> hook to memoize the return values of the custom hook.</li>
</ul>

```js

const isDOMavailable = !!(
  typeof window !== &quot;undefined&quot; &amp;&amp;
  window.document &amp;&amp;
  window.document.createElement
);

const useSSR = () =&gt; {
const [inBrowser, setInBrowser] = React.useState(isDOMavailable);

React.useEffect(() =&gt; {
setInBrowser(isDOMavailable);
return () =&gt; {
setInBrowser(false);
};
}, []);

const useSSRObject = React.useMemo(
() =&gt; ({
isBrowser: inBrowser,
isServer: !inBrowser,
canUseWorkers: typeof Worker !== &quot;undefined&quot;,
canUseEventListeners: inBrowser &amp;&amp; !!window.addEventListener,
canUseViewport: inBrowser &amp;&amp; !!window.screen,
}),
[inBrowser]
);

return React.useMemo(
() =&gt; Object.assign(Object.values(useSSRObject), useSSRObject),
[inBrowser]
);
};

```

<hr />

```js

const SSRChecker = (props) =&gt; {
  let { isBrowser, isServer } = useSSR();

return &lt;p&gt;{isBrowser ? &quot;Running on browser&quot; : &quot;Running on server&quot;}&lt;/p&gt;;
};

ReactDOM.render(&lt;SSRChecker /&gt;, document.getElementById(&quot;root&quot;));

```

<hr />
<p>Implements <code>setTimeout</code> in a declarative manner.</p>
<ul>
<li>Create a custom hook that takes a <code>callback</code> and a <code>delay</code>.</li>
<li>Use the <code>useRef()</code> hook to create a <code>ref</code> for the callback function.</li>
<li>Use the <code>useEffect()</code> hook to remember the latest callback.</li>
<li>Use the <code>useEffect()</code> hook to set up the timeout and clean up.</li>
</ul>

```js

const useTimeout = (callback, delay) =&gt; {
  const savedCallback = React.useRef();

React.useEffect(() =&gt; {
savedCallback.current = callback;
}, [callback]);

React.useEffect(() =&gt; {
function tick() {
savedCallback.current();
}
if (delay !== null) {
let id = setTimeout(tick, delay);
return () =&gt; clearTimeout(id);
}
}, [delay]);
};

```

<hr />

```js

const OneSecondTimer = (props) =&gt; {
  const [seconds, setSeconds] = React.useState(0);
  useTimeout(() =&gt; {
    setSeconds(seconds + 1);
  }, 1000);

return &lt;p&gt;{seconds}&lt;/p&gt;;
};

ReactDOM.render(&lt;OneSecondTimer /&gt;, document.getElementById(&quot;root&quot;));

```

<hr />
<p>Provides a boolean state variable that can be toggled between its two states.</p>
<ul>
<li>Use the <code>useState()</code> hook to create the <code>value</code> state variable and its setter.</li>
<li>Create a function that toggles the value of the <code>value</code> state variable and memoize it, using the <code>useCallback()</code> hook.</li>
<li>Return the <code>value</code> state variable and the memoized toggler function.</li>
</ul>

```js

const useToggler = (initialState) =&gt; {
  const [value, setValue] = React.useState(initialState);

const toggleValue = React.useCallback(() =&gt; setValue((prev) =&gt; !prev), []);

return [value, toggleValue];
};

```

<hr />

```js

const Switch = () =&gt; {
  const [val, toggleVal] = useToggler(false);
  return &lt;button onClick={toggleVal}&gt;{val ? &quot;ON&quot; : &quot;OFF&quot;}&lt;/button&gt;;
};
ReactDOM.render(&lt;Switch /&gt;, document.getElementById(&quot;root&quot;));

```

<hr />
<p>Handles the <code>beforeunload</code> window event.</p>
<ul>
<li>Use the <code>useRef()</code> hook to create a ref for the callback function, <code>fn</code>.</li>
<li>Use the <code>useEffect()</code> hook and <code>EventTarget.addEventListener()</code> to handle the <code>'beforeunload'</code> (when the user is about to close the window).</li>
<li>Use <code>EventTarget.removeEventListener()</code> to perform cleanup after the component is unmounted.</li>
</ul>

```js

const useUnload = (fn) =&gt; {
  const cb = React.useRef(fn);

React.useEffect(() =&gt; {
const onUnload = cb.current;
window.addEventListener(&quot;beforeunload&quot;, onUnload);
return () =&gt; {
window.removeEventListener(&quot;beforeunload&quot;, onUnload);
};
}, [cb]);
};

```

<hr />

```js

const App = () =&gt; {
  useUnload((e) =&gt; {
    e.preventDefault();
    const exit = confirm(&quot;Are you sure you want to leave?&quot;);
    if (exit) window.close();
  });
  return &lt;div&gt;Try closing the window.&lt;/div&gt;;
};
ReactDOM.render(&lt;App /&gt;, document.getElementById(&quot;root&quot;));

```

<hr />