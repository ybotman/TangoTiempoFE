

const mongoose =const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
    },
    categoryCode: {
        type: String,
        required: true,
    },
});

const Categories = mongoose.model('Categories', CategorySchema);

----

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    standardsTitle: { type: String, required: false },
    description: { type: String, required: false },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    categoryFirst: { type: String, required: true },
    categorySecond: { type: String, required: false },
    categoryThird: { type: String, required: false },
    regionName: { type: String, required: true },
    regionID: { type: mongoose.Schema.Types.ObjectId, ref: 'Regions', required: true },
    ownerOrganizerID: { type: mongoose.Schema.Types.ObjectId, ref: 'Organizers', required: true },
    grantedOrganizerID: { type: mongoose.Schema.Types.ObjectId, ref: 'Organizers', required: false },
    alternateOrganizerID: { type: mongoose.Schema.Types.ObjectId, ref: 'Organizers', required: false },
    ownerOrganizerName: { type: String, required: true },
    calculatedRegionName: { type: String, required: false },
    calculatedDivisionName: { type: String, required: false },
    calculatedCityName: { type: String, required: false },
    eventImage: { type: String, required: false },
    locationID: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    locationName: { type: String, required: false },
    recurrenceRule: { type: String, required: false },
    active: { type: Boolean, required: true, default: true },
    featured: { type: Boolean, required: false, default: false },
    canceled: { type: Boolean, required: false, default: false },
    cost: { type: String, required: false },
    expiresAt: { type: Date, required: true }
});


// Add indexes for performance optimization
eventSchema.index({ startDate: 1, endDate: 1 });
eventSchema.index({ regionName: 1 });
eventSchema.index({ ownerOrganizerID: 1 });
eventSchema.index({ grantedOrganizerID: 1 });
eventSchema.index({ alternateOrganizerID: 1 });

const Events = mongoose.model('Events', eventSchema);

module.exports = Events;

---------

const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address_1: { type: String, required: true },
    address_2: { type: String },
    address_3: { type: String },
    state: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, default: 'USA' },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    image: { imageUrl: { type: String } },
    geolocation: {
        type: { type: String, default: 'Point' }, // GeoJSON type
        coordinates: [Number] // Array to store [longitude, latitude]
    },
    activeFlag: { type: Boolean, default: true }, // New active flag field
    lastUsed: { type: Date }, // New last used date field
    calculatedRegion: { type: mongoose.Schema.Types.ObjectId, ref: 'Regions', required: true }, // New calculated region field
    calculatedDivision: { type: mongoose.Schema.Types.ObjectId, ref: 'Divisions', required: true }, // New calculated division field
    calculatedCity: { type: mongoose.Schema.Types.ObjectId, ref: 'Cities', required: true } // New calculated city field
});

// Creating a 2dsphere index to support geospatial queries
locationSchema.index({ geolocation: '2dsphere' });

const Locations = mongoose.model('Locations', locationSchema);
module.exports = Locations;


------


const mongoose = require('mongoose');

const organizerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    shortName: { type: String, required: true },
    organizerRegion: { type: mongoose.Schema.Types.ObjectId, ref: 'Regions', required: true },
    organizerDivision: { type: mongoose.Schema.Types.ObjectId, ref: 'Divisions', required: true },
    organizerCity: { type: mongoose.Schema.Types.ObjectId, ref: 'Cities', required: true },
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
        enum: ['free', 'basic', 'premium'], // Payment tier options
        required: true,
        default: 'free'
    }, // Payment tier for advertising
    paidBool: { type: Boolean, default: false } // Whether the organizer has paid for services
});

// Middleware to update the `updatedAt` field
organizerSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});


const Organizers = mongoose.model('Organizers', organizerSchema);
module.exports = Organizers;


--------
const mongoose = require('mongoose');

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
                    active: { type: Boolean, default: true }
                }
            ]
        }
    ]
});

module.exports = mongoose.model('Regions', regionsSchema);





---------
const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    roleName: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    permissions: [{
        type: String,
        ref: 'Permission'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to update the `updatedAt` field
roleSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Roles = mongoose.model('Roles', roleSchema);
module.exports = Roles;



-------
const mongoose = require('mongoose');

const userLoginSchema = new mongoose.Schema({
    firebaseUserId: { type: String, required: true, unique: true },
    mfaEnabled: { type: Boolean, default: false },
    roleIds: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Roles' }],
        required: true,
        default: []
    },
    localUserInfo: {
        loginUserName: { type: String },
        firstName: { type: String },
        lastName: { type: String },
        icon: { type: String },
        defaultedCity: { type: mongoose.Schema.Types.ObjectId, ref: 'Cities' },
        favoriteOrganizers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Organizers' }],
        favoriteLocations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Locations' }],
        userCommunicationSettings: {
            wantFestivalMessages: { type: Boolean, default: false },
            wantWorkshopMessages: { type: Boolean, default: false },
            messagePrimaryMethod: { type: String, enum: ['app', 'text', 'email', 'social'], default: 'app' }
        }
    },
    localOrganizerInfo: {
        organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organizers' },
        allowedCities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cities' }],
        allowedDivisions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Divisions' }],
        allowedRegions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Regions' }],
        organizerCommunicationSettings: {
            messagePrimaryMethod: { type: String, enum: ['app', 'text', 'email', 'social'], default: 'app' }
        }
    },
    localAdminInfo: {
        adminRegions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Regions' }],
        adminDivisions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Divisions' }],
        adminCities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cities' }],
        userCommunicationSettings: {
            wantFestivalMessages: { type: Boolean, default: false },
            wantWorkshopMessages: { type: Boolean, default: false },
            messagePrimaryMethod: { type: String, enum: ['app', 'text', 'email', 'social'], default: 'app' }
        }
    },
    auditLog: [
        {
            eventType: { type: String, required: false, default: 'update' },
            eventTimestamp: { type: Date, required: false, default: Date.now },
            ipAddress: { type: String },
            platform: { type: String, required: false },
            details: { type: String },
            previousData: { type: mongoose.Schema.Types.Mixed } // Store the full previous state here
        }
    ],
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to log changes
userLoginSchema.pre('save', async function (next) {
    if (!this.isNew) { // If it's not a new document
        const previousDoc = await this.constructor.findById(this._id).lean(); // Get the previous state of the document
        if (previousDoc) {
            this.auditLog.push({
                previousData: previousDoc,
                ipAddress: this.ipAddress, // Assuming you set these in the request context
                platform: this.platform
            });
        }
    }
    this.updatedAt = Date.now();
    next();
});

const UserLogins = mongoose.model('UserLogins', userLoginSchema);

module.exports = UserLogins;




----


important : use these attibutes when you code.
important : alert me if the terms changes.
important : when you have read this file, please summarise the objects.
