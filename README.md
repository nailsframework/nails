
[![Build Status](https://travis-ci.org/nailsframework/nailsjs.svg?branch=master)](https://travis-ci.org/nailsframework/nailsjs)

  

# NailsFramework

  

NailsFramework or short NailsJS is a new Javascript library.

  

```I'm proud to announce that NailsJS enters the first stable state. You can safely use it. Please take a look at our branches to see, what version best suits you```

  

To see whats possible, take a look into the index.html.

  

# Why should i use NailsTS?

  

Nails has been created out of one reason. Frustration.

Mostly every JS Framework doesn't really scale down for small size project, instead they are horribly

slow and space intensive. I don't want to use 300MB disk space for a hello world program just because
those nasty dependencies.

  

And exactly here comes nailsJS into place. It just nails it for small size projects but also perfectly scales up to enterprise solutions,

although it's still in development. The Codebase is about 50KB and thats all. We try our best to keep the amount of dependencies down to a minimum. All dependencies we use are used to provide a solid runtime. 

  

Also there is no learning curve, because to create a wonderful, reactive WebApp you don't need to learn some complicated stuff.

NailsTS is designed to be intuitive and easy.

  

Thats it.

  

# Features

- Reusable Components

- Dependency Injection

- Reactive DOM. Change values in the console and see the magic happen.

- String interpolation

- Directives

- Intelligent DOM Rendering, does not re-render whole DOM but only the parts, which
have changed. This improves stability and performance.

- Build from Ground up for Reactivity. No setState or other method calls required

- Components run in their own context

### Installation

  

Please refer to the documentation in the wiki pages.

  

### Branches

  
  
  
  
|Branch|What to expect  |
|--|--|
|  master | The most stable version |
|  develop | Not really unstable, but bugs may occur. |
|  feature/ | For your own safety, and for the safety of your project, don't touch any of these. |




  
  

### Development

  

Want to contribute? Great!

  

To create new directives simply add your function definition in ```directiveDefinitions.js``` and make sure

that you added your definition in the ```directives``` array as well.

  

Do not prefix your function and your array entry with an n, as this is done by the NailsJS Library.

  

Below is a sample function body.

```

sample(element: HTMLElement, statement: String, state: State){

  

}

```

```element```: The HTML element, which has added your directive.

```statement```: The code in the directive. For example, if the directive declaration on the element is

```n-if="formIsActive"``` then statement would be ```formIsActive```

```state```: This is the current state, which represents NailsJS. To access user Data, you need to query

```state.data```. Do not store Data outside of this object, as it's not actively monitored and a change in this data will not result in any DOM changes.

### License

  

MIT

  
  

**Free Software, Hell Yeah!**

  

* Author: Dominic Järmann