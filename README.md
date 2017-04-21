# React Redux CRUD Blogger App

#Running on Heroku
1. install Node.js and Mongo DB
2. `git clone https://github.com/Frosty21/blogger`
4. cd blogger
5. npm install
6. Create free <a href="https://postmarkapp.com" target="_blank">PostMark</a> account for sending (confirm email, forgot pwd) emails. use forward.cat to create a temp email for use instead of gmail or hotmail.
  * can export Postmark credentials into .env file `POSTMARK_API_TOKEN` = 'token number'
  * alternatively can run on heroku, with Postmark addon( which adds a free account and sets `POSTMARK_API_TOKEN` to app running on heroku )

#Running Locally
*You need two terminal windows open*, one for client and the other for server.

####Development
1. In terminal 1, 
	1. `export JWT_SECRET=somesecretstring` <-- This is used to generate JWT tokens.
	2. `export POSTMARK_API_TOKEN=<getApiTokenFromWInPostmark>` <-- Email
	3. `export FROM_EMAIL=<yourFromEmailThatIsRegisteredInPostMark> <-- "From"-Email Address that you verified w/ PostMark
	4. run `npm start`. This runs the app server (Express). 
2. In terminal 2, run: `npm run dev`. This runs the development server(webpack-dev-server).
3. Open browser and go to: `localhost:8080`

```
export JWT_SECRET=somesecret
export POSTMARK_API_TOKEN=bla-bla-bla-9619-a6d1185548cd
export FROM_EMAIL=yourcompanyemail@company.com
export NODE_ENV=development
```


####Note: If you open `localhost:3000` in browser, you'll see a "stale" production app, so while in development, **always go to `localhost:8080`**

####Production
In production, we need to compile the **latest** client js and place it to `public` folder. This allows the main app server(Express) to also show the final app.

1. Generate latest React app: `npm run build`.
2. In terminal 1, run `npm start`. It will be running both the server and the client.
3. Open browser and go to : `localhost:3000`.



#Cloning Locally And Pushing To Heroku
Running your own instance on <a href="https://heroku.com">Heroku</a>.

1. `git clone https://github.com/rajaraodv/react-redux-blog.git`
2. `cd react-redux-blog`
3. `heroku login` (enter heroku credentials)
4. `heroku init`
5. `heroku create` 
6. `heroku addons:create mongolab`  <-- Add Mongolab test DB (free tier)
7. `heroku addons:create postmark:10k` <-- Postmark Email (free tier)
8. `git push heroku master`


###Making changes to your app and pushing it to Heroku
Everytime you make changes to the front end, you need to build it, and do git commit before pushing it to Heroku test server.

1. `npm run build` #build new React app JS
2. `git add .` #Add change to git
3. `git commit -m "<your comment>" 
4. `git push heroku master`
5. `heroku open`

I usually have something like below that combines all the steps. I just change the commit message everytime.

`npm run build && git add . && git commit -m "made changes" && git push heroku master && heroku open`

`refernce to rajaraodv https://github.com/rajaraodv/react-redux-blog`

