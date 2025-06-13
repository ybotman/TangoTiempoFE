# 🔐 Using `NEXT_PUBLIC_FIREBASE_JSON` in Your Vercel Environment

This app uses a single base64-encoded environment variable to store the entire Firebase configuration object required by the frontend. This is helpful for keeping your `.env` files and Vercel dashboard clean, especially when multiple Firebase keys are involved.

---

## 📦 Why Use Base64-Encoded JSON?

Instead of storing each key separately like this:

```env
NEXT_PUBLIC_FIREBASE_APIKEY=...
NEXT_PUBLIC_FIREBASE_AUTHDOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECTID=...
```

We use a single environment variable:

```env
NEXT_PUBLIC_FIREBASE_JSON=ewogICAgImFwaUtleSI6ICJBSXphU3lCYnlKdXh1Q0lZLUJ3e... (truncated)
```

This base64 string represents a full Firebase config object.

---

## 🔓 Decoding the Variable

The `NEXT_PUBLIC_FIREBASE_JSON` value is base64-encoded. When decoded, it returns the following JSON:

```json
{
  "apiKey": "AIzaSyBbyJuxuCIY-BwxLPItpQbtegAkAMo755o",
  "authDomain": "tangotiempo-257ff.firebaseapp.com",
  "projectId": "tangotiempo-257ff",
  "storageBucket": "tangotiempo-257ff.appspot.com",
  "messagingSenderId": "685681979859",
  "appId": "1:685681979859:web:6609aa591ea8917166bf26",
  "measurementId": "G-8DED6NXCJ8"
}
```

---

## 🔧 How to Decode Locally

### In Node.js:

```js
const firebaseConfig = JSON.parse(
  Buffer.from(process.env.NEXT_PUBLIC_FIREBASE_JSON, 'base64').toString('utf-8')
);
```

### In Bash:

```bash
echo $NEXT_PUBLIC_FIREBASE_JSON | base64 -d
```

---

## 🚨 Security Notes

* This method is **not secure** — it's only obfuscation, not encryption.
* Do not put private Firebase Admin SDK keys in the frontend.
* Only include the public Firebase web config (safe to expose).

---

## ✅ When to Use

Use this method when:

* You want to reduce clutter in your Vercel or local `.env` files
* You need to pass the full Firebase web config to your frontend
* You're deploying on platforms (like Vercel) that have better support for single-string vars

---

## 🧪 Testing It

To validate your Firebase config in the browser or console:

```js
const config = JSON.parse(atob(process.env.NEXT_PUBLIC_FIREBASE_JSON));
console.log(config);
```

You should see the full object printed in your dev tools.

---

This approach keeps your env clean and centralizes all config data while preserving compatibility with Firebase Web SDK initialization.
