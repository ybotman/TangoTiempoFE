// models/masteredCities.js
// models/MasteredCities.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const masteredCitySchema = new Schema({
  // New
  appId: { type: String, required: true, default: "1" },

  cityName: { type: String, required: true },
  cityCode: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  location: {
    type: { type: String, enum: ["Point"], required: true, default: "Point" },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function (value) {
          return value.length === 2;
        },
        message: "Coordinates must be [longitude, latitude]",
      },
    },
  },
  isActive: { type: Boolean, default: true },
  masteredDivisionId: {
    type: Schema.Types.ObjectId,
    ref: "MasteredDivision",
    required: true,
  },
});

// 2dsphere index
masteredCitySchema.index({ location: "2dsphere" });

module.exports = mongoose.model("masteredCity", masteredCitySchema);

// models/categories.js
const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    appId: {
      type: String,
      required: true,
      // No default value - must be provided by frontend
    },
    categoryName: {
      type: String,
      required: true,
    },
    categoryCode: {
      type: String,
      required: true,
    },
    categoryNameAbbreviation: {
      type: String,
      required: false,
      default: function () {
        // Default abbreviation is first 4 characters of categoryName uppercase
        return this.categoryName
          ? this.categoryName.substring(0, 4).toUpperCase()
          : "";
      },
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
  },
);

// Add a unique compound index for `appId` and `categoryCode`
CategorySchema.index({ appId: 1, categoryCode: 1 }, { unique: true });

const Categories = mongoose.model("Categories", CategorySchema);

module.exports = Categories;

// models/events.js
// models/events.js
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  // App identifier - required from frontend
  appId: { type: String, required: true },

  title: { type: String, required: true },
  standardsTitle: { type: String, required: false },
  shortTitle: { type: String, required: false },
  description: { type: String, required: false },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  categoryFirst: { type: String, required: false },
  categorySecond: { type: String, required: false },
  categoryThird: { type: String, required: false },
  categoryFirstId: { type: mongoose.Schema.Types.ObjectId, required: false },
  categorySecondId: { type: mongoose.Schema.Types.ObjectId, required: false },
  categoryThirdId: { type: mongoose.Schema.Types.ObjectId, required: false },
  ownerOrganizerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organizers",
    required: true,
  },
  grantedOrganizerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organizers",
    required: false,
  },
  alternateOrganizerID: { // Used in the index
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organizers",
    required: false,
  },
  grantedOrganizerName: { type: String, required: false },
  alternateOrganizerName: { type: String, required: false },
  locationName: { type: String, required: false },
  ownerOrganizerName: { type: String, required: true },
  // Mastered location name fields (preserved for backward compatibility)
  masteredRegionName: { type: String, required: false },
  masteredDivisionName: { type: String, required: false },
  masteredCityName: { type: String, required: false },
  // New mastered location ObjectID reference fields
  masteredRegionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MasteredRegion",
    required: false,
  },
  masteredDivisionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MasteredDivision",
    required: false,
  },
  masteredCityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "masteredCity",
    required: false,
  },
  // New geolocation field for masteredCity
  masteredCityGeolocation: {
    type: { type: String, default: "Point", enum: ["Point"] },
    coordinates: { type: [Number] },
  },
  eventImage: { type: String, required: false },
  bannerImage: { type: String, required: false },
  featuredImage: { type: String, required: false },
  seriesImages: [{ type: String, required: false }],
  venueID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Venue",
    required: false,
  },
  venueGeolocation: {
    type: { type: String, default: "Point", enum: ["Point"] },
    coordinates: { type: [Number] },
  },
  recurrenceRule: { type: String, required: false },
  isDiscovered: { type: Boolean, required: true, default:false },
  isOwnerManaged: { type: Boolean, required: true, default: true },
  isActive: { type: Boolean, required: true, default: true },
  isFeatured: { type: Boolean, required: false, default: false },
  isCanceled: { type: Boolean, required: false, default: false },
  isRepeating: { type: Boolean, required: false, default: false },
  discoveredLastDate: { type: Date, required: false },
  discoveredFirstDate: { type: Date, required: false },
  discoveredComments: { type: String, required: false },
  cost: { type: String, required: false },
  expiresAt: { type: Date, required: true },
});

// Indexes for performance
eventSchema.index({ startDate: 1, endDate: 1 });
// Original string-based indexes (maintained for backward compatibility)
eventSchema.index({ masteredRegionName: 1 }); 
eventSchema.index({ masteredDivisionName: 1 });
eventSchema.index({ masteredCityName: 1 });
// New ObjectID-based indexes for mastered locations
eventSchema.index({ masteredRegionId: 1 });
eventSchema.index({ masteredDivisionId: 1 });
eventSchema.index({ masteredCityId: 1 });
// Combined indexes for efficient location queries
eventSchema.index({ masteredCityId: 1, startDate: 1 });
eventSchema.index({ masteredDivisionId: 1, startDate: 1 });
eventSchema.index({ masteredRegionId: 1, startDate: 1 });
// Organizer indexes
eventSchema.index({ ownerOrganizerID: 1 });
eventSchema.index({ grantedOrganizerID: 1 });
eventSchema.index({ alternateOrganizerID: 1 });
eventSchema.index({ venueID: 1 });

// Geospatial indexes for location-based queries
eventSchema.index({ venueGeolocation: '2dsphere' });
eventSchema.index({ masteredCityGeolocation: '2dsphere' });


// Pre-validate to ensure coordinates are set for masteredCityGeolocation
eventSchema.pre('validate', function(next) {
  // Boston coordinates as fallback
  const BOSTON_COORDINATES = [-71.0589, 42.3601];
  
  // If masteredCityGeolocation exists but has no coordinates, add default
  if (this.masteredCityGeolocation && 
      this.masteredCityGeolocation.type === 'Point' && 
      (!this.masteredCityGeolocation.coordinates || 
       this.masteredCityGeolocation.coordinates.length === 0)) {
    console.log(`Adding default Boston coordinates to event ${this._id || 'new'}`);
    this.masteredCityGeolocation.coordinates = BOSTON_COORDINATES;
  }
  next();
});
const Events = mongoose.model("Events", eventSchema);

module.exports = Events;

// models/masteredCountries.js
// models/MasteredCountry.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const masteredCountrySchema = new Schema({
  // New
  appId: { type: String, required: true, default: "1" },

  countryName: { type: String, required: true },
  countryCode: { type: String, required: true },
  continent: { type: String, required: true },
  active: { type: Boolean, default: true },
});

module.exports = mongoose.model("MasteredCountry", masteredCountrySchema);

// models/masteredDivisions.js
// models/MasteredDivisions.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const masteredDivisionSchema = new Schema({
  // New
  appId: { type: String, required: true, default: "1" },

  divisionName: { type: String, required: true },
  divisionCode: { type: String, required: true },
  active: { type: Boolean, default: true },
  masteredRegionId: {
    type: Schema.Types.ObjectId,
    ref: "MasteredRegion",
    required: true,
  },
  states: { type: [String], required: true },
});

module.exports = mongoose.model("MasteredDivision", masteredDivisionSchema);

// models/masteredRegions.js
// models/MasteredRegion.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const masteredRegionSchema = new Schema({
  // New
  appId: { type: String, required: true, default: "1" },

  regionName: { type: String, required: true },
  regionCode: { type: String, required: true },
  active: { type: Boolean, default: true },
  masteredCountryId: {
    type: Schema.Types.ObjectId,
    ref: "MasteredCountry",
    required: true,
  },
});

module.exports = mongoose.model("MasteredRegion", masteredRegionSchema);

// models/organizers.js
// models/organizers.js
const mongoose = require("mongoose");

const organizerSchema = new mongoose.Schema({
  // New
  appId: { type: String, required: true, default: "1" },

  linkedUserLogin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userLogins",
    required: false, // Made optional to allow creation without user
  },
  firebaseUserId: { 
    type: String, 
    required: false, // Made optional to allow creation without user
    unique: true,
    sparse: true // Only enforce uniqueness if the field exists
  },
  fullName: { type: String, required: true, default: "CHANGE" },
  shortName: { type: String, required: true, default: "CHANGE" },
  description: { type: String },
  publicContactInfo: {
    phone: { type: String },
    Email: { type: String },
    url: { type: String },
    address: {
      street1: { type: String },
      street2: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
    },
  },
  delegatedOrganizerIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organizers",
    },
  ],
  organizerPublicImageURL: { type: String },
  wantRender: { type: Boolean, default: false },
  isActive: { type: Boolean, default: false },
  isEnabled: { type: Boolean, default: false },
  isRendered: { type: Boolean, default: false },
  organizerBannerImage: { type: String, default: "/defaults/banner.png" },
  organizerProfileImage: { type: String, default: "/defaults/profile.png" },
  organizerLandscapeImage: { type: String, default: "/defaults/landscape.png" },
  organizerLogoImage: { type: String, default: "/defaults/logo.png" },
  images: [
    {
      originalUrl: { type: String },
      thumbnailUrl: { type: String },
      mediumUrl: { type: String },
      largeUrl: { type: String },
      imageType: {
        type: String,
        enum: ["thumbnail", "banner", "profile", "event"],
      },
      tags: [{ type: String }],
      uploadDate: { type: Date, default: Date.now },
      fileSize: { type: Number },
      resolution: { width: Number, height: Number },
      isApproved: { type: Boolean, default: true },
      isExternal: { type: Boolean, default: false },
      externalSource: { type: String },
      orientation: {
        type: String,
        enum: ["landscape", "portrait", "square"],
      },
      isMobileFriendly: { type: Boolean, default: true },
    },
  ],
  organizerRegion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Regions",
    required: true,
  },
  organizerDivision: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Divisions",
    required: false,
  },
  organizerCity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cities",
    required: false,
  },
  organizerTypes: {
    isEventOrganizer: { type: Boolean, required: true, default: true },
    isVenue: { type: Boolean, required: true, default: false },
    isTeacher: { type: Boolean, required: true, default: false },
    isMaestro: { type: Boolean, required: true, default: false },
    isDJ: { type: Boolean, required: true, default: false },
    isOrchestra: { type: Boolean, required: true, default: false },
  },

  updatedAt: { type: Date, default: Date.now },
  lastEventActivityAsOrganizer: { type: Date, default: Date.now },
  isActiveAsOrganizer: { type: Boolean, default: true },
  btcNiceName: { type: String, required: false },
});

// Middleware to update `updatedAt`
organizerSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  this.isActiveAsOrganizer = true;
  next();
});

const Organizers = mongoose.model("Organizers", organizerSchema);
module.exports = Organizers;

// models/roles.js
const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  roleName: { type: String, required: true },
  roleNameCode: { type: String, required: true },
  description: { type: String, required: true },
  appId: { type: String, required: true },
  permissions: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Add a unique compound index for appId and roleName
roleSchema.index({ appId: 1, roleName: 1 }, { unique: true });

const Roles = mongoose.model("Roles", roleSchema);
module.exports = Roles;

// models/userLogins.js
// models/userLogins.js
const mongoose = require("mongoose");

const notificationPreferencesSchema = new mongoose.Schema({
  new: { type: Boolean, default: false },
  updates: { type: Boolean, default: false },
});

const userCommunicationSettingsSchema = new mongoose.Schema({
  Favorites: {
    festivals: { type: notificationPreferencesSchema, default: {} },
    workshops: { type: notificationPreferencesSchema, default: {} },
    dayWorkshops: { type: notificationPreferencesSchema, default: {} },
    milongas: { type: notificationPreferencesSchema, default: {} },
    practices: { type: notificationPreferencesSchema, default: {} },
    classes: { type: notificationPreferencesSchema, default: {} },
    concerts: { type: notificationPreferencesSchema, default: {} },
  },
  DefaultRegion: {
    festivals: { type: notificationPreferencesSchema, default: {} },
    workshops: { type: notificationPreferencesSchema, default: {} },
    dayWorkshops: { type: notificationPreferencesSchema, default: {} },
    milongas: { type: notificationPreferencesSchema, default: {} },
    practices: { type: notificationPreferencesSchema, default: {} },
    classes: { type: notificationPreferencesSchema, default: {} },
    concerts: { type: notificationPreferencesSchema, default: {} },
  },
  ExternalRegions: {
    festivals: { type: notificationPreferencesSchema, default: {} },
    workshops: { type: notificationPreferencesSchema, default: {} },
    dayWorkshops: { type: notificationPreferencesSchema, default: {} },
    milongas: { type: notificationPreferencesSchema, default: {} },
    practices: { type: notificationPreferencesSchema, default: {} },
    classes: { type: notificationPreferencesSchema, default: {} },
    concerts: { type: notificationPreferencesSchema, default: {} },
  },
});

const userLoginSchema = new mongoose.Schema({
  // New: appId to differentiate per-application usage
  appId: { type: String, required: true, default: "1" },

  firebaseUserId: { type: String, required: true, unique: true },
  mfaEnabled: { type: Boolean, default: false },
  roleIds: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Roles" }],
    required: true,
    default: [],
  },
  firebaseUserInfo: {
    email: { type: String },
    displayName: { type: String },
    lastSyncedAt: { type: Date, default: Date.now }
  },
  localUserInfo: {
    isApproved: { type: Boolean, default: true },
    isEnabled: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    ApprovalDate: { type: Date },
    loginUserName: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    userDefaults: {
      region: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Regions",
        required: true,
        default: new mongoose.Types.ObjectId("66c4d99042ec462ea22484bd"),
      },
      division: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        default: {
          _id: new mongoose.Types.ObjectId("6715f5b7f5342510489a6418"),
        },
      },
      city: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        default: {
          _id: new mongoose.Types.ObjectId("6715f5b7f5342510489a6419"),
        },
      },
    },
    subscribedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Events" }],
    favoriteOrganizers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Organizers" },
    ],
    notificationPreference: {
      type: String,
      enum: ["Application", "Email", "Text"],
      default: "Application",
    },
    photo: { type: String },
    imageSharingLevel: {
      type: String,
      enum: ["none", "friends", "all"],
      default: "none",
    },
    messagePrimaryMethod: {
      type: String,
      enum: ["app", "text", "email", "facebook", "twitter"],
      default: "app",
    },
    userCommunicationSettings: {
      type: userCommunicationSettingsSchema,
      default: {},
    },
  },
  regionalOrganizerInfo: {
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: "Organizers" },
    isApproved: { type: Boolean, default: false },
    isEnabled: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    ApprovalDate: { type: Date },
    allowedCities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Cities" }],
    allowedDivisions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Divisions" },
    ],
    allowedRegions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Regions" }],
    organizerCommunicationSettingsAdmin: {
      messagePrimaryMethod: {
        type: String,
        enum: ["app", "text", "email", "social"],
        default: "app",
      },
    },
  },
  localAdminInfo: {
    isApproved: { type: Boolean, default: false },
    isEnabled: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    ApprovalDate: { type: Date },
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
      previousData: { type: mongoose.Schema.Types.Mixed },
    },
  ],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save middleware to log changes and ensure active flags are in sync
userLoginSchema.pre("save", async function (next) {
  if (!this.isNew) {
    const previousDoc = await this.constructor.findById(this._id).lean();
    if (previousDoc) {
      // Only store important fields, not the entire document
      // This prevents recursive growth of the document size
      const { 
        firebaseUserId, 
        roleIds, 
        active,
        regionalOrganizerInfo,
        localUserInfo,
        localAdminInfo
      } = previousDoc;
      
      // Create a reduced audit entry with just the relevant fields
      this.auditLog.push({
        eventType: "update",
        eventTimestamp: new Date(),
        ipAddress: this.ipAddress,
        platform: this.platform,
        // Store only essential previous data, not the entire document
        previousData: {
          firebaseUserId,
          roleIds,
          active,
          regionalOrganizerInfo: regionalOrganizerInfo ? {
            organizerId: regionalOrganizerInfo.organizerId,
            isActive: regionalOrganizerInfo.isActive,
            isEnabled: regionalOrganizerInfo.isEnabled,
            isApproved: regionalOrganizerInfo.isApproved
          } : null,
          localUserInfo: localUserInfo ? {
            firstName: localUserInfo.firstName,
            lastName: localUserInfo.lastName,
            isActive: localUserInfo.isActive,
            isEnabled: localUserInfo.isEnabled,
            isApproved: localUserInfo.isApproved
          } : null,
          localAdminInfo: localAdminInfo ? {
            isActive: localAdminInfo.isActive,
            isEnabled: localAdminInfo.isEnabled,
            isApproved: localAdminInfo.isApproved
          } : null
        }
      });
    }
  }
  
  // Ensure top-level active is true if user has active regionalOrganizerInfo
  if (this.regionalOrganizerInfo && 
      this.regionalOrganizerInfo.organizerId && 
      this.regionalOrganizerInfo.isActive === true && 
      this.regionalOrganizerInfo.isEnabled === true && 
      this.regionalOrganizerInfo.isApproved === true) {
    this.active = true;
  }
  
  // Ensure every user has the NamedUser role (NU) regardless of appId
  try {
    // Only run this check if roleIds exists and is an array
    if (this.roleIds && Array.isArray(this.roleIds)) {
      if (this.roleIds.length === 0) {
        // Need to find and add the NamedUser role for this appId
        const Roles = mongoose.model('Roles');
        // First try to find the NU role for this specific appId
        let namedUserRole = await Roles.findOne({ roleNameCode: 'NU', appId: this.appId });
        
        // If not found for this specific appId, try to find for appId "1" (default)
        if (!namedUserRole) {
          namedUserRole = await Roles.findOne({ roleNameCode: 'NU', appId: "1" });
        }
        
        // If found in either case, add it
        if (namedUserRole) {
          this.roleIds.push(namedUserRole._id);
        }
      }
    }
  } catch (error) {
    console.error('Error ensuring default NamedUser role:', error);
    // Continue with save even if role check fails
  }
  
  this.updatedAt = Date.now();
  next();
});

// Use exact collection name to match existing data
const UserLogins = mongoose.model("userlogins", userLoginSchema);

module.exports = UserLogins;

// models/venues.js
// models/Venue.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const venueSchema = new Schema({
  // New
  appId: { type: String, required: true, default: "1" },

  name: { type: String, required: true },
  shortName: { type: String, default: "" },
  address1: { type: String, required: true },
  address2: { type: String, default: "" },
  address3: { type: String, default: "" },
  city: { type: String, required: true },
  state: { type: String, default: "" },
  zip: { type: String, default: "" },
  phone: { type: String, default: "" },
  comments: { type: String, default: "" },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  isValidVenueGeolocation: { type: Boolean, default: false },
  geolocation: {
    type: { type: String, default: "Point", enum: ["Point"] },
    coordinates: { 
      type: [Number],
      required: true,
      validate: {
        validator: function (value) {
          return value.length === 2;
        },
        message: "Coordinates must be [longitude, latitude]",
      },
    },
  },
  masteredCityId: { type: Schema.Types.ObjectId, ref: "masteredCity" },
  masteredDivisionId: { type: Schema.Types.ObjectId, ref: "masteredDivision" },
  masteredRegionId: { type: Schema.Types.ObjectId, ref: "masteredRegion" },
  masteredCountryId: { type: Schema.Types.ObjectId, ref: "masteredCountry" },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
venueSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add indexes for common queries
venueSchema.index({ geolocation: "2dsphere" });
venueSchema.index({ appId: 1, isActive: 1 });
venueSchema.index({ masteredCityId: 1 });
venueSchema.index({ masteredDivisionId: 1 });
venueSchema.index({ masteredRegionId: 1 });
venueSchema.index({ name: 1 });
venueSchema.index({ name: 'text', address1: 'text', city: 'text' }); // Text search index
venueSchema.index({ appId: 1, masteredCityId: 1, isActive: 1 }); // Combined index for common query pattern

module.exports = mongoose.model("Venue", venueSchema);

