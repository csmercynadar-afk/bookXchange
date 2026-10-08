# BookXchange

A MERN-stack marketplace for buying and selling second-hand books.

## Folder Structure
```
bookxchange/
├── backend/     Node.js + Express + MongoDB API
└── frontend/    React (Vite) app
```

## 1. Backend Setup

```
cd backend
npm install
```

Create a `.env` file in `backend/` (copy `.env.example` and fill in real values):
```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string_here
JWT_SECRET=any_long_random_secret_string_here
CLIENT_URL=http://localhost:5173
```

Get your `MONGO_URI` from MongoDB Atlas: create a free (M0) cluster, add a database user,
allow network access from your IP (or 0.0.0.0/0 for testing), then copy the connection string
and replace `<password>` with your database user's password.

Run the backend:
```
npm run dev
```
You should see: `MongoDB Connected: ...` and `Server running on port 5000`.

Test it's alive by opening http://localhost:5000 in a browser — you should see a JSON message.

## 2. Frontend Setup

Open a **new terminal window** (keep the backend running in the first one):

```
cd frontend
npm install
```

Create a `.env` file in `frontend/` (copy `.env.example`):
```
VITE_API_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset_here
```

### Setting up Cloudinary (for uploading cover photos from your device)

1. Go to https://cloudinary.com/users/register/free and sign up (free tier).
2. On your Dashboard, copy your **Cloud Name** at the top.
3. Go to Settings (gear icon) → **Upload** tab → scroll to "Upload presets" → **Add upload preset**.
4. Set **Signing Mode** to **Unsigned**, give it any name, and Save.
5. Put your Cloud Name and the preset name into `frontend/.env` as shown above.

Without this, the "Choose Photo" button on the Sell/Edit pages will show an error when you
try to upload — the rest of the site still works fine.

Run the frontend:
```
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

## 3. Adding banner/ad images (homepage slider)

Drop image files into `frontend/public/banner-images/`, named exactly:
`banner1.jpg`, `banner2.jpg`, `banner3.jpg`, `banner4.jpg`, `banner5.jpg`
(see the README.txt in that folder). Recommended size: **1600 x 500 px**
(ratio ~3.2:1). You can use anywhere from 2 to 5 images — any numbered
file that doesn't exist is just skipped. Restart `npm run dev` after
adding images if the server was already running.

## 4. Adding sample book listings (optional, for a fuller demo)

From the `backend/` folder, with your `.env` already set up and the
database connected, run:
```
npm run seed
```
This adds a demo seller account and ~12 sample books with real cover
images and prices, so the Home page doesn't look empty. Safe to run
more than once — it skips books that already exist.

## 5. Using the site

1. Go to Sign Up, create an account.
2. Click "Sell a Book" — click "Choose Photo" to upload a cover image directly from your device.
3. Go to Home — your book should appear.
4. Click into it to see the detail page and "Contact Seller" button.
5. Go to "My Listings" to edit, mark as sold, or delete your listings.

## 6. Deployment (once it works locally)

- **Database**: Already on MongoDB Atlas (cloud) — no extra step needed.
- **Backend**: Push `backend/` folder to GitHub, deploy on Render or Railway (free tier).
  Set the same environment variables there as in your local `.env`, but set
  `CLIENT_URL` to your deployed frontend URL once you have it.
- **Frontend**: Push `frontend/` folder to GitHub, deploy on Vercel or Netlify (free tier).
  Set `VITE_API_URL` to your deployed backend URL (e.g. `https://your-backend.onrender.com/api`).

## Troubleshooting

- **CORS error in browser console**: Make sure `CLIENT_URL` in backend `.env` matches
  your frontend's actual URL exactly (no trailing slash).
- **"Could not load listings"**: Check the backend terminal for errors, and make sure
  `VITE_API_URL` in frontend `.env` is correct and the backend is running.
- **Images not showing**: Make sure the cover image URL is a direct link to an image
  file (ends in .jpg/.png/etc.), not a webpage link.
- **"Image upload is not configured" error**: You haven't set up Cloudinary yet — see
  section 2 above.
- **Banner slider not showing on Home page**: Make sure your image files are named
  exactly `banner1.jpg`, `banner2.jpg`, etc. and are placed directly inside
  `frontend/public/banner-images/` (not a subfolder).
