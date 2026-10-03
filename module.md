# KMR CRM — Modules & API Implementation Tracker

This document tracks the complete end-to-end implementation of all 14 CRM modules, their route paths, exact payload structures from the Postman collection (`kmr.postman_collection.json`), and step-by-step UI verification guides.

---

## 🔑 Test Credentials & API Configuration

- **Base URL:** `https://kmrlive.in/crmapi/public/api`
- **Username / Mobile:** `7892036268`
- **Password:** `123456`
- **Auth Scheme:** Bearer Token (retrieved dynamically from `loginResponse.UserInfo.token`)
- **Method Spoofing:** Multipart `FormData` updates use `POST` with `_method: "PUT"` and `_method: "PATCH"` for PHP Laravel compatibility.

---

## 📊 Modules Master Checklist (All 14 Modules)

| # | Module Name | Route Path | UI / View Status | API Client Status | Backend Live Health |
|---|-------------|------------|------------------|-------------------|---------------------|
| 1 | **Auth & Profile** | `/login`, `/forgot-password`, `/change-password`, `/profile` | ✅ Implemented | ✅ Implemented | 🟢 200 OK |
| 2 | **Category** | `/category` | ✅ Implemented | ✅ Implemented | ⚠️ 500 (`Class App\Models\Categories not found` on server) |
| 3 | **Vendor & Rates** | `/vendor` | ✅ Implemented | ✅ Implemented | 🟢 200 OK (`vendor`, `activeVendors`, `vendor-spot`) |
| 4 | **News & Bulletins** | `/news` | ✅ Implemented | ✅ Implemented | 🟢 200 OK (Live items) |
| 5 | **Slider / Banners** | `/slider` | ✅ Implemented | ✅ Implemented | 🟢 200 OK (Live items) |
| 6 | **Notifications** | `/notification` | ✅ Implemented | ✅ Implemented | 🟢 200 OK (Live items) |
| 7 | **Customer Enquiries** | `/enquiry` | ✅ Implemented | ✅ Implemented | ⚠️ 500 (`EnquiryController does not exist` on server) |
| 8 | **Newsletter Subscribers** | `/newsletter` | ✅ Implemented | ✅ Implemented | ⚠️ 500 (`NewsletterController does not exist` on server) |
| 9 | **Blogs & Articles** | `/blog` | ✅ Implemented | ✅ Implemented | 🟢 200 OK |
| 10 | **Site Pages (One & Two)** | `/pages` | ✅ Implemented | ✅ Implemented | 🟢 200 OK (`pageOne`, `pageTwo`) |
| 11 | **Media Gallery** | `/gallery` | ✅ Implemented | ✅ Implemented | 🟢 200 OK |
| 12 | **Clients & Partners** | `/client` | ✅ Implemented | ✅ Implemented | 🟢 200 OK |
| 13 | **Testimonials** | `/testimonial` | ✅ Implemented | ✅ Implemented | 🟢 200 OK |
| 14 | **FAQs & Subs** | `/faq` | ✅ Implemented | ✅ Implemented | 🟢 200 OK |

---

## 🧭 Step-by-Step UI Verification Guide (Kaise Recheck / Verify Karein)

Follow this guide to verify each module directly in your browser running at `http://localhost:5173`:

### 0. Dashboard Overview (`/`)
- **Where to go:** Click **Overview** in the sidebar or visit `http://localhost:5173/`.
- **What to verify:**
  - **Live System Metrics:** 9 live count tiles (Vendors, News, Blogs, Sliders, Notifications, Gallery, Clients, Testimonials, FAQ Topics) querying the real APIs.
  - **Company Status Card:** Shows live session company info (KMR Live, mobile numbers, address).
  - **Module Direct Access:** Quick-open cards linking to all modules.

---

### 1. Auth & Profile Module (`/login`, `/profile`)
- **Where to go:** Navigate to `/login` or click the user avatar menu at the bottom of the sidebar -> **Profile**.
- **How to verify Login:**
  - Enter mobile `7892036268` and password `123456`. Click **Sign In**.
  - Verified: Redirects to dashboard with active token stored in cookie/session.
- **How to verify Profile:**
  - Open `/profile`. Form pre-fills with User: `Surya`, Mobile: `7892036268`, Email: `surya@gmail.com`, City: `Bangalore`.
  - Edit name/email and click **Update Profile** (`PUT /panel-update-profile`).

---

### 2. Category Module (`/category`)
- **Where to go:** Sidebar -> **Catalog** -> **Categories** (`/category`).
- **What to verify:**
  - Backend shows an error notice explaining `Class "App\Models\Categories" not found`.
  - Click **Retry** to recheck server availability.
  - Click **Add Category** button in top right:
    - Form opens with `Category Name`, `URL Slug` (auto-generates), `Sort Order`, `Status` (Active/Inactive), `Category Image` upload.
    - Submit sends `POST /category` as multipart `FormData`.

---

### 3. Vendor & Rates Module (`/vendor`)
- **Where to go:** Sidebar -> **Catalog** -> **Vendors** (`/vendor`).
- **What to verify:**
  - **Metric Cards:** Total Vendors, Active Vendors, Inactive Vendors, and Vendor Spots count.
  - **Live Spot Highlights:** Live spot quote cards displayed with headings and details.
  - **Vendor List Table:** Displays vendors with image, name, mobile, email, city, trade, status badge.
  - **Add Vendor:** Click **+ Add Vendor** in header -> fill name, mobile, email, city, address -> click **Create Vendor** (`POST /vendor`).
  - **Edit Vendor:** Click the edit pencil icon on any row -> dialog opens pre-filled -> save updates (`PUT /vendor/{id}`).
  - **Toggle Status:** Click the power icon on any row to toggle between `Active` and `Inactive` (`PATCH /vendors/{id}/status`).

---

### 4. News & Bulletins Module (`/news`)
- **Where to go:** Sidebar -> **Catalog** -> **News** (`/news`).
- **What to verify:**
  - **GET List:** Displays live news item (*"EDIBLE OIL NEWS CPO MIDDAY MARKET UPDATE"*).
  - **Add News:** Click **+ Create Article** -> choose category, heading, body details, upload banner image or PDF bulletin -> submit (`POST /news`).
  - **Edit News:** Click edit pencil on row -> dialog opens with article content -> edit -> submit (`PUT /news/{id}`).
  - **Toggle Status:** Click power icon to flip status between `Active` and `Inactive` (`PATCH /newss/{id}/status`).

---

### 5. Slider & Hero Banners Module (`/slider`)
- **Where to go:** Sidebar -> **Catalog** -> **Sliders** (`/slider`).
- **What to verify:**
  - **GET List:** Displays live banner carousel records, type (Home vs Category), target link, and status.
  - **Add Banner:** Click **+ Upload Banner** -> choose Slider Type (`Home` or `Category`), sort order, target URL, file upload -> submit (`POST /slider`).
  - **Edit Banner:** Click edit pencil on row -> dialog opens -> submit (`PUT /slider/{id}`).
  - **Toggle Status:** Click power icon to toggle `Active` / `Inactive` (`PATCH /sliders/{id}/status`).

---

### 6. Push Notifications Module (`/notification`)
- **Where to go:** Sidebar -> **Engagement** -> **Notifications** (`/notification`).
- **What to verify:**
  - **GET List:** Displays live scheduled notifications (e.g. ID #1, #2, #3), heading, schedule date, and status.
  - **Add Notification:** Click **+ New Broadcast** -> fill Notification Title, Description, Schedule Date, Status, Image file -> submit (`POST /notification`).
  - **Edit Notification:** Click edit pencil on row -> dialog opens pre-filled -> save (`PUT /notification/{id}`).
  - **Toggle Status:** Click power icon to toggle `Active` / `Inactive` (`PATCH /notifications/{id}/status`).

---

### 7. Customer Enquiries Module (`/enquiry`)
- **Where to go:** Sidebar -> **Engagement** -> **Enquiries** (`/enquiry`).
- **What to verify:**
  - Shows server status notice (`EnquiryController does not exist` on live backend).
  - UI includes status filter (All, Pending, Completed, Cancelled) and search by name/email/subject.
  - Status change dropdown and delete button with confirmation dialog.

---

### 8. Newsletter Subscribers Module (`/newsletter`)
- **Where to go:** Sidebar -> **Engagement** -> **Newsletter** (`/newsletter`).
- **What to verify:**
  - Shows server status notice (`NewsletterController does not exist` on live backend).
  - UI includes search input, subscriber table, email list, and delete action button.

---

### 9. Blogs & Articles Module (`/blog`)
- **Where to go:** Sidebar -> **Catalog** -> **Blog** (`/blog`).
- **What to verify:**
  - **GET List:** Displays blog articles table, featured badges, homepage status, and category tags.
  - **Add Blog:** Click **+ Write Article** -> fill Title, Slug, Category IDs, Short Summary, Meta Keywords, Body content, Featured (Yes/No), Front (Show/Hide), Image upload -> submit (`POST /blog`).
  - **Edit Blog:** Click edit pencil on row -> dialog opens with full blog content -> save (`PUT /blog/{id}`).
  - **Toggle Status:** Click power icon to toggle `Active` / `Inactive` (`PATCH /blogs/{id}/status`).

---

### 10. Site Pages Module (`/pages`)
- **Where to go:** Sidebar -> **Engagement** -> **Site Pages** (`/pages`).
- **What to verify:**
  - **Primary Pages (pageOne):** Displays registered pages (`home`, `about-us`, `blogs`, `contacts`) used for Testimonial placements.
  - **Secondary Pages (pageTwo):** Displays registered pages (`home`, `about-us`, `blogs`, `contacts`) used for FAQ topics.
  - Click **Refresh** to re-query live endpoints.

---

### 11. Media Gallery Module (`/gallery`)
- **Where to go:** Sidebar -> **Catalog** -> **Gallery** (`/gallery`).
- **What to verify:**
  - **Metric Cards:** Total Images, Active Images, Inactive Images.
  - **Table:** Displays thumbnail previews, filename, ID, status badge, created date.
  - **Add Image:** Click **+ Upload Image** -> select image file, status -> submit (`POST /gallery`).
  - **Edit Image:** Click edit pencil -> replace image file or change status -> submit (`PUT /gallery/{id}`).
  - **Toggle Status:** Click power icon to toggle `Active` / `Inactive` (`PATCH /gallerys/{id}/status`).

---

### 12. Clients & Partners Module (`/client`)
- **Where to go:** Sidebar -> **Engagement** -> **Clients** (`/client`).
- **What to verify:**
  - **Metric Cards:** Total Clients, Active Clients, Inactive Clients.
  - **Table:** Displays client logo avatar, client name, ID, status badge, created date.
  - **Add Client:** Click **+ Add Client** -> enter Client Name, Status, upload logo -> submit (`POST /client`).
  - **Edit Client:** Click edit pencil on row -> update name or logo -> submit (`PUT /client/{id}`).
  - **Toggle Status:** Click power icon to toggle `Active` / `Inactive` (`PATCH /clients/{id}/status`).

---

### 13. Testimonials Module (`/testimonial`)
- **Where to go:** Sidebar -> **Engagement** -> **Testimonials** (`/testimonial`).
- **What to verify:**
  - **Metric Cards:** Total Testimonials, Active Testimonials, Inactive Testimonials.
  - **Table:** Client name, page placement badge (`home`, `about-us`, etc.), star rating (1-5 stars), review snippet, status.
  - **Add Testimonial:** Click **+ Add Testimonial** -> select Page Placement (fetched dynamically from `pageOne`), Client Name, Rating dropdown (1 to 5 stars), Status, Review text -> submit (`POST /testimonial`).
  - **Edit Testimonial:** Click edit pencil on row -> form opens with review and rating -> submit (`PUT /testimonial/{id}`).
  - **Toggle Status:** Click power icon to toggle `Active` / `Inactive` (`PATCH /testimonials/{id}/status`).

---

### 14. FAQs Module (`/faq`)
- **Where to go:** Sidebar -> **Engagement** -> **FAQs** (`/faq`).
- **What to verify:**
  - **Metric Cards:** Total FAQ Groups, Total Questions, Active Groups, Inactive Groups.
  - **Table:** Page placement badge (`home`, `about-us`, etc.), questions count badge, sample question previews, status.
  - **Create FAQ Group:** Click **+ Create FAQ Group** -> select Page Placement (fetched dynamically from `pageTwo`), Status, and add one or more questions & answers using **+ Add Question** button -> submit (`POST /faq`).
  - **Edit FAQ Group:** Click edit pencil on row -> edit heading, questions, answers -> submit (`PUT /faq/{id}`).
  - **Toggle Status:** Click power icon to toggle `Active` / `Inactive` (`PATCH /faqs/{id}/status`).
  - **Delete FAQ:** Click trash icon on row -> confirmation dialog -> submit (`DELETE /faq/{id}`).

---

## 🧪 Live Backend Endpoint Verification (cURL Script)

To verify the live backend yourself from terminal using `curl`:

```bash
# 1. Login and obtain UserInfo token
TOKEN=$(curl -s -X POST "https://kmrlive.in/crmapi/public/api/panel-login" \
  -F "username=7892036268" \
  -F "password=123456" | jq -r '.UserInfo.token')

echo "Token: $TOKEN"

# 2. Test GET Endpoints
curl -s -H "Authorization: Bearer $TOKEN" "https://kmrlive.in/crmapi/public/api/vendor" | jq .
curl -s -H "Authorization: Bearer $TOKEN" "https://kmrlive.in/crmapi/public/api/news" | jq .
curl -s -H "Authorization: Bearer $TOKEN" "https://kmrlive.in/crmapi/public/api/slider" | jq .
curl -s -H "Authorization: Bearer $TOKEN" "https://kmrlive.in/crmapi/public/api/notification" | jq .
curl -s -H "Authorization: Bearer $TOKEN" "https://kmrlive.in/crmapi/public/api/pageOne" | jq .
curl -s -H "Authorization: Bearer $TOKEN" "https://kmrlive.in/crmapi/public/api/pageTwo" | jq .
curl -s -H "Authorization: Bearer $TOKEN" "https://kmrlive.in/crmapi/public/api/gallery" | jq .
curl -s -H "Authorization: Bearer $TOKEN" "https://kmrlive.in/crmapi/public/api/client" | jq .
curl -s -H "Authorization: Bearer $TOKEN" "https://kmrlive.in/crmapi/public/api/testimonial" | jq .
curl -s -H "Authorization: Bearer $TOKEN" "https://kmrlive.in/crmapi/public/api/faq" | jq .
```
