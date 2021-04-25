Pepper was the first serious app that we worked on, and this was the very first iteration of it that our users didn't like. We tried to build a web app that would actually rely on another free service to route your calls, and put together an MVP. The final version of pepper that was more widely used can be found in the other repo (https://github.com/buzzwordlabs/pepper-mobile). We only shipped this version to a few friends that helped us realize this wasn't good enough for launching more widely.

We also ended up moving our codebase to TypeScript and PostgreSQL in our final project (from MongoDB and JavaScript), as you can see here.

Project is composed of:

client/ - contains a Create React App app
server/ - contains a node.js server with MongoDB
