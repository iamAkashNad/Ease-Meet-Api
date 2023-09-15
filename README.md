## EaseMeet API
An API which makes easy the work of schedule and manage the appointments of a person based on his/her availability.

### Purpose
In today's world it is hard to track person's availability and when it comes to scheduling appointment which heavily relays on availability, then it is a huge headache.

### Features
- We can signup and login with their credentials in the API and can also do different actions regarding authentication.
- In this API, We can set ***off hours***, based on the times when we don't need any kind of work. And also we can delete ***off hours*** if we want.
- We can ***schedule*** appointments with other persons if we both have time [Means we both don't have any off hour or any kind of uncanceled appointment at that time], also we have an option to ***cancel*** it, if we don't want to attend.
- And also for both scheduling and canceling appointments, the person will gets an informative automated email about the action.
- Later we will take a brief look on every actions which we can do in the API.

### API Guide
Let's walk through to the use of the API together. Let's go!

First think first, let's have a brief intro to the API, As it is written completely in JavaScript so it uses [Node.js](https://nodejs.org) runtime and for request routing, processing and all that, [Express.js](https://expressjs.com) framework is used which is a middleware framework for Node.js. For ***Databases***, which is a very important part for the API as users, off hours and appointments needs to store somewhere, [MongoDB](https://mongodb.com) (which is NoSQL Database Solution) is used and for defining schemes and making queries and very important to establish connection channel between the API server and the MongoDB database, [Mongoose](https://mongoosejs.com/) is used. And also there are some more depedencies used in the API to which we will take a look later in this guide.

But before that, let's understand the type of data we will get back from the API,
 In success case:
 ```js
 {
	 success: true,
	 message: "Some Success Message",
	 //...other data based on different actions
 }
 ```
 In failure case:
 ```js
 {
	 success: false, // Only this fields value differs b/w success & failure.
	 message: "Some Error Message",
	 fields: String[] // This field will present for only validation errors.
 }
 ```
 
Now let's take a deep dive in different endpoints:

#### User Signup
```
POST /auth/signup
```
This is an endpoint which handles `user signup`. 
And it's respective route is
```js
router.post("/signup", signupValidation(), signup);
```
The ```POST``` request will have a ```body``` which will be in ```json``` format and it looks like this.
```json
{
    "name": "John Doe",
	"email": "johndoe@gmail.com",
	"password": "somepassword"
}
```
Also the data which we send via the request will be validate by that ```signupValidation()``` function with the help of a dependency called [Express Validator](https://express-validator.github.io/docs/) which is used throughout the API for validation purpose. If the validation fails then we will get ```422 (Unprocessable Entity)``` error from the server (It is applicable for all the validation error occurs throughout the API).

Also for hash the password, [Bcrypt.js Library](https://www.npmjs.com/package/bcrypt) is used, because again storing actual password in database  is not a good idea at all.

As a result, this request simply creates an ***unverified*** user. 

You can see the user schema for know the structure of the user which will be created, in ```user.model.js```.

#### User Login
```
POST /auth/login
```
This is an endpoint for handling ``user login``
And it's respective route is,
```js
router.post("/login", loginValidation(), login);
```
The request body looks like this,
```json
{
	"email": "johndoe@gmail.com",
	"password": "somepassword"
}
```
Again, ```loginValidation()``` does the validation thing.
In login, for comparing passwords again [Bcrypt.js Library](https://www.npmjs.com/package/bcrypt) is used.
As a result, a token will be generated signed by a secret with the help another dependency [jsonwebtoken](https://jwt.io).
The ```response``` will look like this,
```js
{
	success: true,
	message: "Login Successful!",
	token: "<token>",
	userId: "<user id>" // This is the id of that user whose email & password we send.
}
```
Also the ```token payload``` will be looks like this,
```js
{
	userId: "<user id>", // <user id> is of that user who has that email & password which we send via reqeust.
	expiresIn: "<Expiration Time in Millis>",
	iat: "<Issued at Time in Millis>"
}
```
Now the token we will get back from the API is important for next authenticated routes.
And also the token will be expires within 2 hours.

#### Send Verification Code (Email Verification)
```
GET /auth/signup/verify?email=johndoe@gmail.com
```
This endpoint needs an query string named ```email``` where we need to specify the email (to which we have ***already*** an account in the app) for sending a mail which contains a code regarding ***verifying*** that email, so the account/user also.
The respective route of this request is:
```js
router.get("/signup/verify", sendVerificationCode);
```
As a result, it will send an automated mail to that ***email*** which was present in the ```query parameter``` of our ```request```. The mail will contain a ```code``` which will be valid for next 30 minutes. Now the next route/request will come into the play.

#### Email Verification
```
POST /auth/signup/verify
```
This request endpoint does the actual email verification.
The respective route for that request is:
```js
router.post("/signup/verify", verifyEmail);
```
The request contains a body which will be again in ```json``` format & looks like this,
```json
{
	"code":  "<code>", // The code we get in mail.
	"email":  "johndoe@gmail.com" //same email which was used in the previous request.
}
```
Here, the code we will send to the backend will be checked and also it's expiration. And if everything goes correct, the ```verified``` field in user will be assigned as ```true```, which was initialized as ```false``` when we create an account (And that's why I said previously that in signup, an unverified user was created).
So, the ```verified``` is assigned as ```true```, we as an user are now ***verified***.

#### Get Profile
```
GET /user
```
This endpoint will gives us the currently logged in user data.
This respective route for that request is:
```js
router.get("/", authMiddleware, getProfile);
```
The request will need to have a ```Authorization``` header, which contains the ```token``` we get after ***login***, in a format of ```Authorization: Bearer <token>```. Otherwise we will get ```401 (Unauthorized)``` error from the server (applicable for all authenticated routes like this) by ```authMiddleware```.

Now, the ```authMiddleware``` function will be verifying the token (which we send through the request) by it's signature with the help of again [jsonwebtoken](https://jwt.io) and also extract the ```userId``` from ```token payload``` and attach that to the ```request``` object as that will be taken as authenticated user's ```id```.

And if our token is valid then we cross the ```authMiddleware``` function and reach the actual controller action ```getProfile```, in that route handler the user data will be fetched based on that ```userId``` in ```request```.

And as a result, We will get that logged in user data from response.
And the response will looks like,
```js
{
	success: true,
	message: "User fetched Successfully!",
	user: User,
}
```

#### Update User Name
```
PATCH /user/update
```
This endpoint is simply update the user name of the authenticated user.
The respective route for that request is:
```js
router.patch("/update", authMiddleware, validName(), updateProfileName);
```
Again authentication requires in this route as we can't go and update anyone's username. So that's why ```authMiddleware``` function was there as we know previously. And also ```Authorization``` header will needed in the ```request```.

And also for validate the ```name```, there is ```validName()``` function in the route.

The ```request body``` will be in ```json``` format and it's looks like this,
```json
{
	"name": "John Henry Doe",
	"password": "somepassword"
}
```
If the password, we send through the ```request``` is correct, then the ```name``` we send via ```request``` will be taken as the new name for the authenticated user, otherwise not.

#### Send Verification Code (Forgot Password)
```
GET /user/password/forgot?email=johndoe@gmail.com
```
In this endpoint, we need to pass a query string ```email``` which contains the user's email (which is the email of that user whose password we want to change) to where we want to send the ```verification code``` just like ```Send verify code for email verification``` route.

The respective route for that request endpoint is,
```js
router.get("/password/forgot", sendVerificationCodeForForgotPassword);
```
By show the route, we might guess that in that route we doesn't need any authentication as ```authMiddleware``` function isn't present here, well that's correct.

This route simply checks the existence of the ```email``` (we send through the ```query string``` of the request) in the database and than it will send an automated mail which contains a ```code``` to that email and the code will be valid for 10 minutes and that ```code``` will need in the next ```request```, So let's jump into it.

#### Forgot Password
```
PATCH /user/password/forgot
```
This endpoint will handles the forgot password action/request.
The respective route for that request endpoint is,
```js
router.patch("/password/forgot", validPassword(), updatePassword);
```
The ```request body``` will be looks like this,
```json
{
	 "email":  "johndoe@gmail.com", // Same email which we use in the previous request.
	 "code":  "<code>",
	 "password":  "somenewpassword"
}
```
First of all the ```password```, we send via ```request``` will be validate by ```validPassword()``` function and then if the ```password``` is valid and the ```code``` is matched and not expires then the ```password``` will be updated with the new one. And again for hash the new password, [Bcrypt.js Library](https://www.npmjs.com/package/bcrypt) is used.

#### Get Off Hours
```
GET /user/off-hours
```
This endpoint gives us all the ```off hours``` for the authenticated user.
The respective route for that request is,
```js
router.get("/off-hours", authMiddleware, getOffHours);
```
Again, ```authMiddleware``` function will be needed for getting the ```userId``` of the authenticated user for a particular ```request``` as well as checking the ```authentication status``` of us.

The ```request``` will have ```Authorization``` header as this route/endpoint needs ```authentication```.

By that, we will get all the ```off hours``` for the authenticated user which we will get through response. And the response will looks like,
```js
{
	success: true,
	message: "Off hours fetched Successfully!",
	offHours: offHour[],
}
```
#### Add Off Hour
```
POST /user/off-hours/add
```
This endpoint is adding ```off hours``` for the ```authenticated user```.
The respective route for that request is,
```js
router.post("/off-hours/add", authMiddleware, addOffHours);
```
The ```request body``` will looks like,
```json
{
	"start": "Some Date",
	"end": "Some Date"
}
```
In the route, If we are authenticated and also the ```start``` and ```end``` time passed by us through the ```request``` is valid date, and also if the off hour isn't in past and under 15 minutes from present time, also doesn't overlap with any other existing ```off hour``` and ```appointment``` of us, then the ```off hour``` will be created with the ```userId``` which is passed in the ```token payload``` through the ```request```. And then save into the database.

You can see the ```off hour``` schema from the ```offHour.model.js``` file, if you want.

#### Delete Off Hour
```
DELETE /user/off-hours/<off-hour-id>
```
This endpoint is simply delete ```off hour``` of the authenticated user.
The respective route for that request is,
```js
router.delete("/off-hours/:offHourId", authMiddleware, deleteOffHour);
```
If we are authenticated and the ```off hour``` (which associated with that ```offHourId```) contains the ```userId``` which is matched with the ```userId``` which is in our ```token payload``` (Means the ``off hour`` is belong to us), then the route will delete that ```off hour``` and gives us a success response, Otherwise if the 2nd condition was not met then we will get ```403 (Forbidden)``` error from the server.

#### Get All (verified) Users
```
GET /
```
This endpoint will gives all the (verified) user data except our user data to whom we are authenticated.
The respective route for that request is,
```js
router.get("/", authMiddleware, getAllUsers);
```
Again ```authentication``` will be require in this route.

The response data will looks like,
```js
{
	success: true,
	message: "All users fetched Successfully!",
	users: user[],
}
```

#### Get Upcoming Appointments
```
GET /appointments
```
This endpoint will gives us all the upcoming ```appointments``` of the ```authenticated user```.
The respective route for that request is,
```js
router.get("/appointments", authMiddleware, getUpcomingAppoinments);
```
Obviously, This route will need ```authentication``` as we are going to fetch upcoming appointments for the authenticated user and not for all users.

> [NOTE]: An appointment is belong to an user if the user is either the **admin** or **guest** of that appointment.

The response will looks like this,
```js
{
	success: true,
	message: "Upcoming Appoinments",
	appointments: appointment[],
}
```
#### Schedule Appointment
```
POST /appointments/schedule
```
This endpoint will handle the scheduling of appointment between two users, initiated by the authenticated user. **Again appointments can only be scheduled by and with verified users.**
The respective route for that request is,
```js
router.post("/appointments/schedule", authMiddleware, meetValidation(), scheduleAppointment);
```
The ```request body``` will be looks like this,
```json
{
	"title":  "Test Meet",
	"agenda":  "Test Meet on Ease Meet!",
	"start":  "Some Start Date",
	"duration":  "2", // As per the API there are 3 options 1 or 2 or 3 hours.
	"guest":  "<guest-user-id>" // To whom we want to schedule the appointment.
}
```
In this route as it shows, we might guess first of all our authentication will be checked, then the ```appointment``` data in the ```body``` will be validate and if all goes in a right way, then the route will check that is there any ```off hours``` or ```appointments``` at that particular time where we want to schedule the current ```appointment``` for both the users and if it is not the case then it will simply schedule that ```appointment``` for us with that guest user and that guest user will receives an automated mail to his/her verified email.

You can see the ```appointment.model.js``` file, if you want to know the structure of ```appointment```.

#### Cancel Appointment
```
PATCH /appointments/<appointment-id>/cancel
```
This endpoint is simply cancel an appointment which have that ```<appointment-id>``` for a particular ```authenticated user```.
The respective route for that request is,
```js
router.patch("/appointments/:meetId/cancel", authMiddleware, cancelAppointment);
```
In this route first our authentication will be checked and then it checks if we are belong to that ```appointment``` or not. And if all the conditions are met then the appointment will be canceled.  And the other user who is also belong to that ```appointment``` will receives an automated mail to his/her verified email about the cancellation.

But if the 2nd condition isn't met, then we will get a ```403 (Forbidden)``` error from the server.

And Yes, That's it!


### Round Up
Thank you so much for reading this ```README.md``` and if you find this API and it's explanation helpful you may reach out to me via [LinkedIn](https://www.linkedin.com/in/akash-nad-b4398222b/).

And again Thank you❤️