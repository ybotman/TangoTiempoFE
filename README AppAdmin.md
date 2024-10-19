---

## Your Role and Your Responiblities with My role/responsibiles

---

you will be assisting me with an application development. In this role you are an MIT graduate expert in node 20, Next.js 14+, Firebase, VSCod, JavaScript and MongoDB. The project is deployed in Azure infrastructure, with GitHub, GitHub actions.

You provider clear concise answer and do not ramble on. When you are not completely sure of what you are being asked to do you ask a clarifying question.
I am nearly always on a Mac. You assume this, and you do not provide windows keystrokes or suggestions.
When you are unsure about something, you adjust your tone accordingly. When you are sure of a course of action, and positive of a a factual or accurate response, you present as such.
You can sense when to switch between advisor and architect and code development with ease. When you do so, you tell me the role you are in.
important, When you many not have enough information, you ask for more information.
We I give you code as a an example, Your returned code does not drop any features of presented code and only fixes the known and descipbed issues.

OUR GOAL is to build an ADMINISTRATION APP for TangoTeimpo. An app that is in production (only just now).

- Is will be supporting admin on my TangoTempo site.
- This does not need to be visionary. It is just a tactical step as we go to production on the regular site.
- I will promote the FE code to the AZURE frame work (on a small server) that will go to admin.tangotiempo.com
- This app once live operates in prod and changes the back end mongo data.
- It will admin the USERS and the ORGIZNERS.
- This is just in support our current POC/MVP of the system. Testing added chechin scripts sec
- you will write the app in REACT 14 (imporata does use pre react 13 code!).
- you will write the hooks / handles
- you will tell me the API that are needed and whats expected of them
- i will build the API on the BACK to support this
- we will resuse the current backend node (you will no need to do anything here, but tell me the api)
- The collects in mongo are stable and provided. You will do no changes there.

---

REQUIRMENTS GUI : I will have a GUI Desicoved Blow

-----------Requieremtn for the GUI
The app will need to have
PAGE or TAB 1) ORGANIZER ADMIN.
A) SUB Tab “list”

- scrolling List of all orginzer (just the primary attributes, region ). The abilty to MUI switch activate or deactivate (no save needed)
- Name is a link to Tab “Details” (to do an edit on that row)B) Tab “Details”\* Shows all the attributes of the Selected organizer Vertically
- Each attribute has editable field next to the primary field. This si where we put in the new data to save\* If the attributes is an ID then the appropriate collection si looked up and the name field is the drop down for the Details Edit
- Save, Delete, Cancel (dont save). Button on the bottom

PAGE or TAB 2) USER ADMIN
A) Tab “list”

- A scrolling list of all the users with thier name and and role.
- The abilty to MUI switch activate or deactivate (no save needed)
- The abilitly to select the ROLES (check one or all) from a drop down. (no save needed)
- The name is a link to goes to the Details tab. (to do an edit on that row)
- Will show a page ofAdd organizers in MongodbModify any attribute in the Databse. If the attribute is a \_ID it will need to be looked up on the collectiosn primary attribute, usually a ?\_Name
- Save, Delete, Cancel (dont save). Button on the bottom

REQUIRMENTS SECURITY : As the devloper and access to the API and MONGO database this is currenrlty not needed

SECUIRTY and access the Data
We will imput the admin in role and sign in feature to this app via firebase. But for now all
YOU will have to write all the hooks to the ORAGNZINER and the USERS.  
we wil env. and github secrets in palce already

An example fo the current @hooks place.

// @/hooks/useOrganizers.js
import { useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { RegionsContext } from '@/contexts/RegionsContext';

export const useOrganizers = () => {
const { selectedRegionID } = useContext(RegionsContext);
const [organizers, setOrganizers] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

const fetchOrganizers = useCallback(async () => {
const endpoint = selectedRegionID
? `${process.env.NEXT_PUBLIC_BE_URL}/api/organizers?regionID=${selectedRegionID}`
: `${process.env.NEXT_PUBLIC_BE_URL}/api/organizers`;

    try {
      setLoading(true);
      const response = await axios.get(endpoint);
      setOrganizers(response.data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }

}, [selectedRegionID]); // Re-fetch when selectedRegionID changes

useEffect(() => {
fetchOrganizers();
}, [fetchOrganizers]); // Trigger the fetch operation when fetchOrganizers changes

return { organizers, loading, error };
};

---

REQUIRMENTS Appliction : already exist

---

src/app is root of new Repsity of code call TangoTIempAdmin
(Note we are react 14+ so no ./pages folder)
./.env, ect.
./organizer/page
./users/page
./compoents/Modals (if needed)
./compoents/ UI (if needed)
./hooks (you have to author all of these)
./page (not authored may need a the TOP page?

api you list the apis that i need to author.

\*\*\*\* little bit about our lifecycle and team## We are a team of 2 or 3 part time developers. All free services accept for the the Azure infrastructure.
We have local (vscode on Mac) development
The TEST, INTG and PRODCTION servers We are moving to TEST, then ‘stage <——> Prod with a swap. But notGitHub is repo. Pull Sync requests to go GitHub web.GItHub Actions are the Git hub ENVIROMENTS (matches above) with variables and secrets.
Want this code to run as a variable (Boolean “ImportBTCOrganizers”) for each inv (pulls the data in and loads)
Local I Will add ImportBTCOrganizers to .env Set to true.
When a build occurs this should run at build time.

        1. Create a Node.js script that will login and run at build time
        2. Fetch the organizer data from the BTC REST API. (Rest call provided)
        3. Map and Transform the fetched data to fit your MongoDB schema. (Both provided below)
        4. Insert the transformed data into MongoDB Atlas.  Use update many (or whatever works) based not the name of the orgaizners,  Slug should match to shortname

---

## Tech Stack

### Frontend

- **React.js**: The primary library used for building the user interface.
- **Next.js**: Used for server-side rendering and static site generation, optimizing performance and SEO.
- **MUI (Material-UI)**: Heavily reliant on the React UI framework used for implementing the design and layout with Material Design components.
- **FullCalendar**: A powerful and customizable JavaScript library used for displaying the calendar view and managing event scheduling. Leverage with MUI.
- **Axios/Fetch API**: For making HTTP requests to the backend API.
- **PropTypes** is widily used from 'prop-types'. This is necessary for our proper standards
- **eslint** is widely used

### Backend

- **Node.js**: The runtime environment used for running the server-side JavaScript code. Run on azure web app code base Node 20+
- **Express.js**: A fast and minimalist web framework for Node.js, used for building the RESTful API.
- **MongoDB**: storing the application's data in atlas.
- **Firebase**: Used for user authentication, real-time database, and role-based access control.

### Deployment and CI/CD

- **GitHub Actions**: Used for Continuous Integration (CI) and Continuous Deployment (CD) pipelines.
  -- well deplyoed for Dev to Test to Integration and Productio
  -- we have not integrated the test framework

### Testing

- **Jest**: A JavaScript testing framework used for unit and integration tests.
- **React Testing Library**: For testing React components with a focus on user interactions.
  -- CURRENTY NONE ARE DEPLOYED

### State Management

- **React Context API**: Used for managing global state across the application. Currently it is
  -- import PropTypes from 'prop-types';
  -- import { AuthProvider } from '@/contexts/AuthContext';
  -- import { RegionsProvider } from '@/contexts/RegionsContext';
  -- import { CalendarProvider } from '@/contexts/CalendarContext';
  -- import { PostFilterProvider } from '@/contexts/PostFilterContext';
  -- import { RoleProvider } from '@/contexts/RoleContext';
  --- <AuthProvider>
  --- <RegionsProvider>
  --- <RoleProvider>

### Version Control

- **Git**: Version control system used to track changes in the codebase.
- **GitHub**: Hosting service for Git repositories, facilitating collaboration and code review.

—> The ROLES. (Managed in Mongo db)

1. Anonymous

   • Description: Users who can view events but have no interaction capabilities beyond that.
   • Permissions:
   • View events (read_events).

2. NamedUser

   • Description: Users who can view events and set up their personal preferences.
   • Permissions:
   • View events (read_events).
   • Set personal preferences (set_preferences).

3. RegionalOrganizer

   • Description: Organizers who manage their own events, locations, and advertisements within their specific region. They are also responsible for processing payments related to their activities.
   • Permissions:
   • Create, read, update, and delete their events (crud_own_events).
   • Manage locations within their region (manage_locations).
   • Create advertisements for BasicUsers (create_ads).
   • Make payments within their region (make_payments).

4. RegionalAdmin

   • Description: Administrators who oversee RegionalOrganizers. They can manage all events and locations within their region, including appointing new RegionalOrganizers.
   • Permissions:
   • Create and manage RegionalOrganizers (create_regional_organizers).
   • Manage all locations within the region (manage_regional_locations).
   • Full CRUD operations on all events in their region (crud_all_regional_events).

5. SystemAdmin

   • Description: High-level administrators with system-wide control. They manage all regions, locations, and events across the system.
   • Permissions:
   • Add and manage regions (add_regions).
   • Merge locations and manage all event pointers (merge_locations).
   • Full CRUD operations on all events system-wide (crud_all_events).

6. SystemOwner

   • Description: The highest authority in the system, with full access to all system functionalities, including all the permissions of a SystemAdmin.
   • Permissions:
   • Full access to all features and functionalities (full_access).

—————— MONGO TARGET
const mongoose = require("mongoose");

const organizerSchema = new mongoose.Schema({
name: { type: String, required: true },
shortName: { type: String, required: true },
btcNiceName: { type: String, required: false },
organizerRegion: {
type: mongoose.Schema.Types.ObjectId,
ref: "Regions",
required: true,
},
organizerDivision: {
type: mongoose.Schema.Types.ObjectId,
ref: "Divisions",
required: true,
},
organizerCity: {
type: mongoose.Schema.Types.ObjectId,
ref: "Cities",
required: true,
},
firebaseUserId: { type: String, required: true, unique: true },
url: { type: String },
description: { type: String },
images: [{ imageUrl: { type: String }, imageType: { type: String } }],
phone: { type: String },
publicEmail: { type: String },
loginId: { type: String },
activeFlag: { type: Boolean, required: true, default: true },
updatedAt: { type: Date, default: Date.now },
lastActivity: { type: Date, default: Date.now }, // Last activity timestamp
paymentTier: {
type: String,
enum: ["free", "basic", "premium"], // Payment tier options
required: true,
default: "free",
}, // Payment tier for advertising
paidBool: { type: Boolean, default: false }, // Whether the organizer has paid for services
});

// Middleware to update the `updatedAt` field
organizerSchema.pre("save", function (next) {
this.updatedAt = Date.now();
next();
});

const Organizers = mongoose.model("Organizers", organizerSchema);
module.exports = Organizers;

const mongoose = require("mongoose");

const regionsSchema = new mongoose.Schema({
regionName: { type: String, required: true },
regionCode: { type: String, required: true },
active: { type: Boolean, default: true },
divisions: [
{
divisionName: { type: String, required: true },
active: { type: Boolean, default: true },
states: { type: [String], required: true },
majorCities: [
{
cityName: { type: String, required: true },
latitude: { type: Number, required: true },
longitude: { type: Number, required: true },
active: { type: Boolean, default: true },
},
],
},
],
});

module.exports = mongoose.model("Regions", regionsSchema);

const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
roleName: {
type: String,
unique: true,
required: true,
},
description: {
type: String,
required: true,
},
permissions: [
{
type: String,
ref: "Permission",
},
],
createdAt: {
type: Date,
default: Date.now,
},
updatedAt: {
type: Date,
default: Date.now,
},
});

// Middleware to update the `updatedAt` field
roleSchema.pre("save", function (next) {
this.updatedAt = Date.now();
next();
});

const Roles = mongoose.model("Roles", roleSchema);
module.exports = Roles;

const mongoose = require("mongoose");

const userLoginSchema = new mongoose.Schema({
firebaseUserId: { type: String, required: true, unique: true },
mfaEnabled: { type: Boolean, default: false },
roleIds: {
type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Roles" }],
required: true,
default: [],
},
localUserInfo: {
loginUserName: { type: String },
firstName: { type: String },
lastName: { type: String },
icon: { type: String },
defaultedCity: { type: mongoose.Schema.Types.ObjectId, ref: "Cities" },
favoriteOrganizers: [
{ type: mongoose.Schema.Types.ObjectId, ref: "Organizers" },
],
favoriteLocations: [
{ type: mongoose.Schema.Types.ObjectId, ref: "Locations" },
],
userCommunicationSettings: {
wantFestivalMessages: { type: Boolean, default: false },
wantWorkshopMessages: { type: Boolean, default: false },
messagePrimaryMethod: {
type: String,
enum: ["app", "text", "email", "social"],
default: "app",
},
},
},
localOrganizerInfo: {
organizerId: { type: mongoose.Schema.Types.ObjectId, ref: "Organizers" },
allowedCities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Cities" }],
allowedDivisions: [
{ type: mongoose.Schema.Types.ObjectId, ref: "Divisions" },
],
allowedRegions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Regions" }],
organizerCommunicationSettings: {
messagePrimaryMethod: {
type: String,
enum: ["app", "text", "email", "social"],
default: "app",
},
},
},
localAdminInfo: {
adminRegions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Regions" }],
adminDivisions: [
{ type: mongoose.Schema.Types.ObjectId, ref: "Divisions" },
],
adminCities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Cities" }],
userCommunicationSettings: {
wantFestivalMessages: { type: Boolean, default: false },
wantWorkshopMessages: { type: Boolean, default: false },
messagePrimaryMethod: {
type: String,
enum: ["app", "text", "email", "social"],
default: "app",
},
},
},
auditLog: [
{
eventType: { type: String, required: false, default: "update" },
eventTimestamp: { type: Date, required: false, default: Date.now },
ipAddress: { type: String },
platform: { type: String, required: false },
details: { type: String },
previousData: { type: mongoose.Schema.Types.Mixed }, // Store the full previous state here
},
],
active: { type: Boolean, default: true },
createdAt: { type: Date, default: Date.now },
updatedAt: { type: Date, default: Date.now },
});

// Pre-save middleware to log changes
userLoginSchema.pre("save", async function (next) {
if (!this.isNew) {
// If it's not a new document
const previousDoc = await this.constructor.findById(this.\_id).lean(); // Get the previous state of the document
if (previousDoc) {
this.auditLog.push({
previousData: previousDoc,
ipAddress: this.ipAddress, // Assuming you set these in the request context
platform: this.platform,
});
}
}
this.updatedAt = Date.now();
next();
});

const UserLogins = mongoose.model("UserLogins", userLoginSchema);

module.exports = UserLogins;
