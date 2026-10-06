# KMR CRM — Complete Modules & 82 Postman APIs Verification Manual

> **Last Updated & Verified:** October 2026  
> **Backend Base URL:** `https://kmrlive.in/crmapi/public/api`  
> **Frontend App:** `http://localhost:5173`  
> **Total Endpoints in Postman Collection:** **82 Endpoints (100% Audited & Mapped)**  
> **Test Credentials:** Mobile/Username: `7892036268` | Password: `123456`

---

## 📑 Table of Contents

1. [🔑 Credentials & Authentication Architecture](#1--credentials--authentication-architecture)
2. [📊 All 14 Modules Overview & Status Matrix](#2--all-14-modules-overview--status-matrix)
3. [🧭 Module-by-Module Verification Guide (Kaha Jana Hai & Kaise Verify Karna Hai)](#3--module-by-module-verification-guide)
   - [Module 0: Dashboard Overview (`/`)](#module-0-dashboard-overview-)
   - [Module 1: Authentication & User Profile (`/login`, `/profile`, `/change-password`, `/forgot-password`)](#module-1-authentication--user-profile)
   - [Module 2: Categories Catalog (`/category`)](#module-2-categories-catalog-category)
   - [Module 3: Vendors, Rates & Spot Quotes (`/vendor`)](#module-3-vendors-rates--spot-quotes-vendor)
   - [Module 4: News & PDF Bulletins (`/news`)](#module-4-news--pdf-bulletins-news)
   - [Module 5: Slider & Hero Banners (`/slider`)](#module-5-slider--hero-banners-slider)
   - [Module 6: Push Notifications Broadcast (`/notification`)](#module-6-push-notifications-broadcast-notification)
   - [Module 7: Customer Enquiries (`/enquiry`)](#module-7-customer-enquiries-enquiry)
   - [Module 8: Newsletter Subscribers (`/newsletter`)](#module-8-newsletter-subscribers-newsletter)
   - [Module 9: Blogs & Editorial Articles (`/blog`)](#module-9-blogs--editorial-articles-blog)
   - [Module 10: Site Pages Master (`/pages`)](#module-10-site-pages-master-pages)
   - [Module 11: Media Gallery (`/gallery`)](#module-11-media-gallery-gallery)
   - [Module 12: Clients & Brand Partners (`/client`)](#module-12-clients--brand-partners-client)
   - [Module 13: Customer Testimonials (`/testimonial`)](#module-13-customer-testimonials-testimonial)
   - [Module 14: FAQs & Question Sub-Items (`/faq`)](#module-14-faqs--question-sub-items-faq)
4. [📋 Exhaustive 82-Endpoint Postman Master Audit Table](#4--exhaustive-82-endpoint-postman-master-audit-table)
5. [🧪 Automated Terminal cURL Verification Suite](#5--automated-terminal-curl-verification-suite)

---

## 1. 🔑 Credentials & Authentication Architecture

- **Login Endpoint:** `POST https://kmrlive.in/crmapi/public/api/panel-login`
- **Request Format:** `multipart/form-data` or `application/x-www-form-urlencoded`
- **Payload:**
  ```json
  {
    "username": "7892036268",
    "password": "123456"
  }
  ```
- **Token Location in Response:**
  ```json
  {
    "code": 200,
    "UserInfo": {
      "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
      "user": {
        "id": 2,
        "name": "Surya",
        "mobile": "7892036268",
        "email": "surya@gmail.com"
      }
    },
    "company_detils": {
      "company_name": "KMR Live",
      "company_mobile": "9092346999"
    }
  }
  ```
  > **Note on Token Extraction:** The Bearer token is strictly extracted from `response.UserInfo.token` (not `response.data.token`). All authenticated requests attach the header `Authorization: Bearer <token>`.
- **PHP Laravel Method Spoofing:**
  PHP native `PUT` and `PATCH` do not parse multipart `FormData`. All file and status update operations submit via `POST` with `_method: "PUT"` or `_method: "PATCH"`.

---

## 2. 📊 All 14 Modules Overview & Status Matrix

| #   | Module                    | Route                                                        | UI Screens & Dialogs                                                        | API Integration | Backend Live Health                                                                       |
| --- | ------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------- |
| 1   | **Auth & Profile**        | `/login`, `/profile`, `/change-password`, `/forgot-password` | Login, Forgot Pwd, Change Pwd, Profile view/edit                            | ✅ Complete     | 🟢 200 OK                                                                                 |
| 2   | **Category**              | `/category`                                                  | Category table, slug generator, Add/Edit dialog, toggle                     | ✅ Complete     | ⚠️ 500 (`Class App\Models\Categories not found` on server)                                |
| 3   | **Vendor, Rates & Spots** | `/vendor`                                                    | 4 Tabs: Vendors Directory, Spot Quotes, Live Rates, Standard Rates          | ✅ Complete     | 🟢 200 OK (`vendor`, `activeVendors`, `vendor-spot`) / ⚠️ 500 on live/rate empty relation |
| 4   | **News & Bulletins**      | `/news`                                                      | News table, PDF bulletin indicator, Add/Edit dialog, toggle                 | ✅ Complete     | 🟢 200 OK (Live items)                                                                    |
| 5   | **Slider & Banners**      | `/slider`                                                    | Banner preview table, Home/Category type, Add/Edit dialog, toggle           | ✅ Complete     | 🟢 200 OK (Live items)                                                                    |
| 6   | **Notifications**         | `/notification`                                              | Broadcast table, Date scheduler, Add/Edit dialog, toggle                    | ✅ Complete     | 🟢 200 OK (Live items)                                                                    |
| 7   | **Customer Enquiries**    | `/enquiry`                                                   | Status filter tabs, search, status updater, delete confirm                  | ✅ Complete     | ⚠️ 500 (`EnquiryController does not exist` on server)                                     |
| 8   | **Newsletter**            | `/newsletter`                                                | Subscriber search, email table, single delete confirm                       | ✅ Complete     | ⚠️ 500 (`NewsletterController does not exist` on server)                                  |
| 9   | **Blogs & Editorial**     | `/blog`                                                      | Blog table, multi-category selector, WYSIWYG/Markdown body, Add/Edit dialog | ✅ Complete     | 🟢 200 OK (Ready for articles)                                                            |
| 10  | **Site Pages**            | `/pages`                                                     | Two-column grid showing registered `pageOne` & `pageTwo` slugs              | ✅ Complete     | 🟢 200 OK (4 items each)                                                                  |
| 11  | **Media Gallery**         | `/gallery`                                                   | Image thumbnail grid/table, upload dialog, status toggle                    | ✅ Complete     | 🟢 200 OK                                                                                 |
| 12  | **Clients & Partners**    | `/client`                                                    | Logo avatar table, client name, Add/Edit dialog, status toggle              | ✅ Complete     | 🟢 200 OK                                                                                 |
| 13  | **Testimonials**          | `/testimonial`                                               | Star rating display, page placement selector (`pageOne`), Add/Edit dialog   | ✅ Complete     | 🟢 200 OK                                                                                 |
| 14  | **FAQs & Subs**           | `/faq`                                                       | Nested Q&A manager, page placement (`pageTwo`), Add/Edit dialog, Delete     | ✅ Complete     | 🟢 200 OK                                                                                 |

---

## 3. 🧭 Module-by-Module Verification Guide

Follow this guide step-by-step in the browser (`http://localhost:5173`) and in the terminal.

---

### Module 0: Dashboard Overview (`/`)

- **Kaha Jana Hai:** Open `http://localhost:5173/` or click Sidebar -> **Main** -> **Overview**.
- **Kya Verify Karna Hai (GET & Metrics):**
  1. **9 Live System Metrics Cards:** Real-time counts fetched live from the API for Vendors, News, Blogs, Sliders, Notifications, Gallery, Clients, Testimonials, FAQs.
  2. **Active Session Card:** Displays logged-in user _"Surya"_, Mobile `7892036268`, and company details _"KMR Live"_.
  3. **Module Quick Access:** 6 quick-navigation cards linking to Catalog, Vendors, News, Banners, Notifications, and FAQs.
- **Kaise Recheck Karein:** Click **Refresh** at the top right; all metric queries re-fetch without full page reload.

---

### Module 1: Authentication & User Profile

- **Routes:**
  - Login: `/login`
  - Forgot Password: `/forgot-password`
  - Change Password: `/change-password`
  - Profile: `/profile`
- **1. Login Verification:**
  - **Kaha Jana Hai:** Open `/login`.
  - **Kya Fill Karna Hai:** Mobile `7892036268`, Password `123456`.
  - **Submit Action:** Sends `POST /panel-login`.
  - **Expected Behavior:** Toast shows _"Login successful"_, token saved, redirected to `/`.
- **2. Profile Verification:**
  - **Kaha Jana Hai:** Navigate to `/profile` (or click user avatar in sidebar bottom).
  - **GET Data Verification:** Name (`Surya`), Mobile (`7892036268`), Email (`surya@gmail.com`), City (`Bangalore`) auto-loaded from `GET /panel-fetch-profile`.
  - **Form Update Verification:** Edit name or email, click **Save Changes**. Submits `PUT /panel-update-profile` with fields `name`, `mobile`, `email`, `city`, `address`.
- **3. Change Password Verification:**
  - **Kaha Jana Hai:** Navigate to `/change-password`.
  - **Form Fields:** `username` (pre-filled `7892036268`), `old_password` (`123456`), `new_password`, `cpassword`.
  - **Submit Action:** Submits `POST /panel-change-password` with `username`, `old_password`, `new_password`.
- **4. Forgot Password Verification:**
  - **Kaha Jana Hai:** Navigate to `/forgot-password`.
  - **Form Fields:** Enter `username` and `email` -> Submit sends `POST /panel-send-password`.

---

### Module 2: Categories Catalog (`/category`)

- **Kaha Jana Hai:** Sidebar -> **Catalog** -> **Categories** (`/category`).
- **GET List Verification:**
  - Calls `GET /category`.
  - **Current Server Status:** Backend returns 500 error (`Class "App\Models\Categories" not found` on server).
  - **UI Verification:** Defensive alert box is displayed with the exact server message and a working **Retry** button so the UI never crashes.
- **Form Verification (Add Category):**
  - Click **+ Add Category** button.
  - **Dialog Fields (Postman Match):**
    - `categories_name`: e.g. _"Palm Oil"_
    - `categories_slug`: auto-slugified (e.g. `palm-oil`)
    - `categories_sort_order`: e.g. `1`
    - `categories_status`: dropdown (`Active` / `Inactive`)
    - `categories_image`: image file input
  - **Submit Action:** Sends `POST /category` as multipart `FormData`.
- **Edit & Status Toggle Verification:**
  - Edit row opens dialog submitting `PUT /category/{id}` with `_method: "PUT"`.
  - Power icon toggles `PATCH /categorys/{id}/status` with `categories_status` and `_method: "PATCH"`.

---

### Module 3: Vendors, Rates & Spot Quotes (`/vendor`)

- **Kaha Jana Hai:** Sidebar -> **Catalog** -> **Vendors** (`/vendor`).
- **4 Tabbed Views:**
  1. **Tab 1: Vendors Directory (`/vendor`, `/activeVendors`):**
     - **GET List:** Displays live vendor: _"HALDIYA PORT RATE"_, mobile `9830000000`, trade types `1,2,3` (_Live, Rate, Spot_), Active badge.
     - **Add Vendor Form:** Click **+ Add Vendor**.
       - Fields: `vendor_name`, `vendor_mobile`, `vendor_email`, `vendor_city`, `vendor_trade` (multi-select: Live, Rate, Spot), `vendor_address`, `vendor_image`.
       - Submits: `POST /vendor`.
     - **Edit Vendor:** Click pencil icon on row -> pre-fills data -> submits `PUT /vendor/{id}` with `_method: "PUT"`.
     - **Status Toggle:** Click power icon -> submits `PATCH /vendors/{id}/status`.
  2. **Tab 2: Spot Quotes (`/vendor-spot`):**
     - **GET List:** Displays live spot quotes (e.g. _"EDIBLE OIL - Khopoli Seller Option"_).
     - **Spot Rate Form:** Click **+ Spot Rate**.
       - Fields: Vendor Select, Category ID, Sub-Category ID, Spot Heading, Spot Details.
       - Submits payload: `{ products: [{ vendor_id, category_id, sub_category_id, vendor_spot_heading, vendor_spot_details }] }` to `POST /vendor-spot`.
     - **Status Toggle:** Click power icon -> submits `PATCH /vendor-spots/{id}/status`.
  3. **Tab 3: Live Rates (`/vendor-live`):**
     - **GET List:** Calls `GET /vendor-live`. Shows commodity rate table (Product, Size, Rate, Vendor, Status).
     - **Add Live Rate Form:** Click **+ Add Live Rate**.
       - Fields: Vendor, Category ID, Sub-Cat ID, Product Name, Size / Unit, Rate (₹).
       - Submits: `{ products: [{ vendor_id, category_id, sub_category_id, vendor_product, vendor_product_size, vendor_product_rate }] }` to `POST /vendor-live`.
  4. **Tab 4: Standard Rates (`/vendor-rate`):**
     - **GET List:** Calls `GET /vendor-rate`.
     - **Add Standard Rate Form:** Click **+ Add Standard Rate**. Submits exact Postman payload to `POST /vendor-rate`.

---

### Module 4: News & PDF Bulletins (`/news`)

- **Kaha Jana Hai:** Sidebar -> **Catalog** -> **News** (`/news`).
- **GET List Verification:**
  - Displays live article: _"EDIBLE OIL NEWS CPO MIDDAY MARKET UPDATE — 21 SEPTEMBER 2026"_, Category _Edible Oil_, PDF bulletin badge (`govind.pdf`), Status `Active`.
- **Form Verification (Add Article):**
  - Click **+ Create Article**.
  - **Dialog Fields (Postman Match):**
    - `category_id`: Category selection
    - `news_heading`: Article headline
    - `news_details`: Full news body / description
    - `news_image`: Cover banner image file
    - `news_other_image`: Attachment / PDF bulletin file (`govind.pdf`)
  - **Submit Action:** Sends `POST /news` as multipart `FormData`.
- **Edit & Status Toggle:**
  - Edit: Pre-fills and submits `PUT /news/{id}` with `_method: "PUT"`.
  - Status Toggle: Power icon triggers `PATCH /newss/{id}/status` with `news_status: "Active" | "Inactive"`.

---

### Module 5: Slider & Hero Banners (`/slider`)

- **Kaha Jana Hai:** Sidebar -> **Catalog** -> **Sliders** (`/slider`).
- **GET List Verification:**
  - Displays live banner images, Type badge (`Home` vs `Category`), Target URL, Sort Order, Status.
- **Form Verification (Upload Banner):**
  - Click **+ Upload Banner**.
  - **Dialog Fields (Postman Match):**
    - `slider_type`: `Home` or `Category`
    - `category_id`: Required if type is `Category`
    - `slider_url`: Click-through destination URL
    - `slider_sort_order`: Display sequence integer
    - `slider_image`: Banner image file
  - **Submit Action:** Sends `POST /slider` as multipart `FormData`.
- **Edit & Status Toggle:**
  - Edit submits `PUT /slider/{id}` with `_method: "PUT"`.
  - Toggle triggers `PATCH /sliders/{id}/status` with `slider_status`.

---

### Module 6: Push Notifications Broadcast (`/notification`)

- **Kaha Jana Hai:** Sidebar -> **Engagement** -> **Notifications** (`/notification`).
- **GET List Verification:**
  - Displays live notifications (IDs #1, #2, #3), Title, Description, Schedule Date, and Status badge.
- **Form Verification (Create Broadcast):**
  - Click **+ New Broadcast**.
  - **Dialog Fields (Postman Match):**
    - `notification_heading`: Broadcast title
    - `notification_description`: Push body message
    - `notification_date`: Date picker (`YYYY-MM-DD`)
    - `notification_image`: Notification graphic file
  - **Submit Action:** Sends `POST /notification` as multipart `FormData`.
- **Edit & Status Toggle:**
  - Edit submits `PUT /notification/{id}`.
  - Toggle triggers `PATCH /notifications/{id}/status`.

---

### Module 7: Customer Enquiries (`/enquiry`)

- **Kaha Jana Hai:** Sidebar -> **Engagement** -> **Enquiries** (`/enquiry`).
- **GET List Verification:**
  - Calls `GET /enquiry`.
  - **Current Server Status:** Backend returns 500 error (`Target class [EnquiryController] does not exist` on server).
  - **UI Verification:** Defensive banner informs user gracefully with retry button.
- **Row Actions:**
  - Status updater: Select dropdown (`Pending`, `Cancel`, `Complete`) -> submits `PUT /enquiry/{id}` with `enquiryStatus`.
  - Delete: Trash icon -> confirmation dialog -> submits `DELETE /enquiry/{id}`.

---

### Module 8: Newsletter Subscribers (`/newsletter`)

- **Kaha Jana Hai:** Sidebar -> **Engagement** -> **Newsletter** (`/newsletter`).
- **GET List Verification:**
  - Calls `GET /newsletter`.
  - **Current Server Status:** Backend returns 500 error (`Target class [NewsletterController] does not exist` on server).
  - **UI Verification:** Defensive banner with retry button.
- **Delete Action:** Trash icon -> confirmation dialog -> submits `DELETE /newsletter/{id}`.

---

### Module 9: Blogs & Editorial Articles (`/blog`)

- **Kaha Jana Hai:** Sidebar -> **Catalog** -> **Blog** (`/blog`).
- **GET List Verification:**
  - Displays blog title, slug, categories, featured badge, front badge, and status. Currently 0 items in backend database (ready for new articles).
- **Form Verification (Write Article):**
  - Click **+ Write Article**.
  - **Dialog Fields (Postman Match):**
    - `blog_title`: Article Title
    - `blog_slug`: Auto-generated slug
    - `blog_categories_ids`: Multi-category IDs
    - `blog_short_description`: Summary snippet
    - `blog_meta_keywords`: SEO meta tags
    - `blog_description`: Rich editorial body
    - `blog_featured`: Boolean (`Yes` / `No`)
    - `blog_front`: Boolean (`Show` / `Hide`)
    - `blog_banner_image`: Cover graphic file
    - `blog_banner_image_alt`: Alt description
  - **Submit Action:** Sends `POST /blog` as multipart `FormData`.
- **Edit & Status Toggle:**
  - Edit submits `PUT /blog/{id}` with `_method: "PUT"`.
  - Status toggle triggers `PATCH /blogs/{id}/status`.

---

### Module 10: Site Pages Master (`/pages`)

- **Kaha Jana Hai:** Sidebar -> **Engagement** -> **Site Pages** (`/pages`).
- **GET List Verification:**
  - **Primary Pages (`GET /pageOne`):** Displays 4 items (`home`, `about-us`, `blogs`, `contacts`). These slug identifiers populate the Testimonials placement dropdown.
  - **Secondary Pages (`GET /pageTwo`):** Displays 4 items (`home`, `about-us`, `blogs`, `contacts`). These slug identifiers populate the FAQs placement dropdown.
- **Kaise Recheck Karein:** Click **Refresh Both** to verify both endpoints return 200 OK.

---

### Module 11: Media Gallery (`/gallery`)

- **Kaha Jana Hai:** Sidebar -> **Catalog** -> **Gallery** (`/gallery`).
- **GET List Verification:**
  - Calls `GET /gallery`. Displays image cards / table with thumbnails and status.
- **Form Verification (Upload Image):**
  - Click **+ Upload Image**.
  - **Dialog Fields:** `gallery_image` (file upload), `gallery_status` (`Active` / `Inactive`).
  - **Submit Action:** Sends `POST /gallery` as multipart `FormData`.
- **Edit & Status Toggle:**
  - Edit submits `PUT /gallery/{id}` with `_method: "PUT"`.
  - Status toggle triggers `PATCH /gallerys/{id}/status` with `gallery_status`.

---

### Module 12: Clients & Brand Partners (`/client`)

- **Kaha Jana Hai:** Sidebar -> **Engagement** -> **Clients** (`/client`).
- **GET List Verification:**
  - Calls `GET /client`. Displays client logo, company name, ID, status.
- **Form Verification (Add Client):**
  - Click **+ Add Client**.
  - **Dialog Fields:** `clients_name` (Text input), `clients_image` (Logo file upload).
  - **Submit Action:** Sends `POST /client` as multipart `FormData`.
- **Edit & Status Toggle:**
  - Edit submits `PUT /client/{id}` with `_method: "PUT"`.
  - Status toggle triggers `PATCH /clients/{id}/status` with `clients_status`.

---

### Module 13: Customer Testimonials (`/testimonial`)

- **Kaha Jana Hai:** Sidebar -> **Engagement** -> **Testimonials** (`/testimonial`).
- **GET List Verification:**
  - Calls `GET /testimonial`. Displays client name, page placement badge, star rating (1-5 stars), description snippet, status.
- **Form Verification (Add Testimonial):**
  - Click **+ Add Testimonial**.
  - **Dialog Fields (Postman Match):**
    - `testimonial_for`: Page Placement (dynamically fetched from `GET /pageOne`: `home`, `about-us`, `blogs`, `contacts`)
    - `testimonial_client_name`: Customer/Client name
    - `testimonial_rating`: Rating select (1 to 5 stars)
    - `testimonial_description`: Review content
  - **Submit Action:** Sends `POST /testimonial` as multipart `FormData`.
- **Edit & Status Toggle:**
  - Edit submits `PUT /testimonial/{id}` with `_method: "PUT"`.
  - Status toggle triggers `PATCH /testimonials/{id}/status` with `testimonial_status`.

---

### Module 14: FAQs & Question Sub-Items (`/faq`)

- **Kaha Jana Hai:** Sidebar -> **Engagement** -> **FAQs** (`/faq`).
- **GET List Verification:**
  - Calls `GET /faq` ✅.
  - Strictly renders live API response fields: **ID** (`#id`), **Page Placement** (`faq_for`), **Status** (`faq_status`), and **Row Actions**.
  - No mock questions or empty dates rendered.
- **Form Verification (Create FAQ Group):**
  - Click **+ Create FAQ Group**.
  - **Dialog Fields (Postman Match):**
    - `faq_for`: Page Placement (dynamically fetched from `GET /pageTwo`: `home`, `about-us`, `blogs`, `contacts`)
    - `subs`: Dynamic list of Q&A pairs (click **+ Add Question** to add more pairs). Each item has:
      - `faq_sort`: Sort order integer
      - `faq_heading`: Subheading / topic
      - `faq_que`: Question text
      - `faq_ans`: Answer text
  - **Submit Action:** Sends `POST /faq` with JSON payload `{ faq_for, subs: [...] }` ✅.
- **Edit, Status Toggle & Delete:**
  - **Edit:** Clicking the pencil icon queries `GET /faq/{id}` ✅ to load the complete saved question & answer entries (`subs`) from the server into the dialog, allowing updates via `PUT /faq/{id} ✅`.
  - **Status Toggle:** Click power icon -> triggers `PATCH /faqs/{id}/status` ✅.
  - **Delete Group:** Click trash icon -> triggers `DELETE /faq/{id}` ✅.
  - **Delete Individual Sub-Question:** `DELETE /faq-sub/{subId}` supported via API.

---

## 4. 📋 Exhaustive 82-Endpoint Postman Master Audit Table

Below is the verified audit of all 82 endpoints from `kmr.postman_collection.json`:

| #   | Postman Request Name    | Method | Live Endpoint                | Body Mode  | Exact Payload Keys (Postman Spec)                                                                                                                                                                               | Code Implementation File                                                   |
| --- | ----------------------- | ------ | ---------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1   | `fetch-dotenv`          | GET    | `/panel-fetch-dotenv`        | none       | None                                                                                                                                                                                                            | `src/modules/auth/login/api/auth.api.ts`                                   |
| 2   | `forgot-password`       | POST   | `/panel-send-password`       | formdata   | `username`, `email`                                                                                                                                                                                             | `src/modules/auth/login/components/ForgotPasswordForm.tsx`                 |
| 3   | `change-password`       | POST   | `/panel-change-password`     | formdata   | `username`, `old_password`, `new_password`                                                                                                                                                                      | `src/modules/auth/login/components/ChangePasswordForm.tsx`                 |
| 4   | `fetch-profile`         | GET    | `/panel-fetch-profile`       | none       | None                                                                                                                                                                                                            | `src/modules/auth/profile/hook/useProfile.ts`                              |
| 5   | `update-profile`        | PUT    | `/panel-update-profile`      | formdata   | `name`, `mobile`, `email`, `city`, `address`                                                                                                                                                                    | `src/modules/auth/profile/components/ProfileForm.tsx`                      |
| 6   | `category list`         | GET    | `/category`                  | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/category/api/category.api.ts`                       |
| 7   | `category` (Create)     | POST   | `/category`                  | formdata   | `parent_id`, `categories_sort_order`, `categories_name`, `categories_slug`, `categories_image`, `categories_status`                                                                                             | `src/modules/dashboard/category/components/CategoryFormDialog.tsx`         |
| 8   | `category by id`        | GET    | `/category/{id}`             | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/category/api/category.api.ts`                       |
| 9   | `category` (Update)     | PUT    | `/category/{id}`             | formdata   | same fields + `_method: "PUT"`                                                                                                                                                                                  | `src/modules/dashboard/category/components/CategoryFormDialog.tsx`         |
| 10  | `category status`       | PATCH  | `/categorys/{id}/status`     | formdata   | `categories_status`, `_method: "PATCH"`                                                                                                                                                                         | `src/modules/dashboard/category/components/CategoryTable.tsx`              |
| 11  | `active Categories`     | GET    | `/activeCategories`          | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/category/api/category.api.ts`                       |
| 12  | `vendor` (Create)       | POST   | `/vendor`                    | raw JSON   | `vendor_name`, `vendor_mobile`, `vendor_email`, `vendor_city`, `vendor_trade`, `vendor_address`, `vendor_image`                                                                                                 | `src/modules/dashboard/vendor/components/VendorFormDialog.tsx`             |
| 13  | `vendor list`           | GET    | `/vendor`                    | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/vendor/components/VendorTable.tsx`                  |
| 14  | `vendor by id`          | GET    | `/vendor/{id}`               | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/vendor/api/vendor.api.ts`                           |
| 15  | `vendor` (Update)       | PUT    | `/vendor/{id}`               | raw JSON   | same fields + `vendor_status`, `_method: "PUT"`                                                                                                                                                                 | `src/modules/dashboard/vendor/components/VendorFormDialog.tsx`             |
| 16  | `vendors status`        | PATCH  | `/vendors/{id}/status`       | formdata   | `vendor_status`, `_method: "PATCH"`                                                                                                                                                                             | `src/modules/dashboard/vendor/components/VendorTable.tsx`                  |
| 17  | `activeVendors`         | GET    | `/activeVendors`             | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/vendor/api/vendor.api.ts`                           |
| 18  | `vendor-live` (Create)  | POST   | `/vendor-live`               | raw JSON   | `products: [{ vendor_id, category_id, sub_category_id, vendor_product, vendor_product_size, vendor_product_rate }]`                                                                                             | `src/modules/dashboard/vendor/components/VendorRateFormDialog.tsx`         |
| 19  | `vendor-live list`      | GET    | `/vendor-live`               | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/vendor/components/VendorRateTable.tsx`              |
| 20  | `vendor-live by id`     | GET    | `/vendor-live/{id}`          | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/vendor/api/vendor.api.ts`                           |
| 21  | `vendor-live` (Update)  | PUT    | `/vendor-live/{id}`          | raw JSON   | `category_id`, `sub_category_id`, `vendor_product`, `vendor_product_size`, `vendor_product_rate`, `vendor_product_status`                                                                                       | `src/modules/dashboard/vendor/api/vendor.api.ts`                           |
| 22  | `vendor-lives status`   | PATCH  | `/vendor-lives/{id}/status`  | raw JSON   | `vendor_product_status`                                                                                                                                                                                         | `src/modules/dashboard/vendor/api/vendor.api.ts`                           |
| 23  | `vendor-rate` (Create)  | POST   | `/vendor-rate`               | raw JSON   | `products: [{ vendor_id, category_id, sub_category_id, vendor_product, vendor_product_size, vendor_product_rate }]`                                                                                             | `src/modules/dashboard/vendor/components/VendorRateFormDialog.tsx`         |
| 24  | `vendor-rate list`      | GET    | `/vendor-rate`               | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/vendor/components/VendorRateTable.tsx`              |
| 25  | `vendor-rate by id`     | GET    | `/vendor-rate/{id}`          | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/vendor/api/vendor.api.ts`                           |
| 26  | `vendor-rate` (Update)  | PUT    | `/vendor-rate/{id}`          | raw JSON   | `category_id`, `sub_category_id`, `vendor_product`, `vendor_product_size`, `vendor_product_rate`, `vendor_product_status`                                                                                       | `src/modules/dashboard/vendor/api/vendor.api.ts`                           |
| 27  | `vendor-rates status`   | PATCH  | `/vendor-rates/{id}/status`  | raw JSON   | `vendor_product_status`                                                                                                                                                                                         | `src/modules/dashboard/vendor/api/vendor.api.ts`                           |
| 28  | `vendor-spot` (Create)  | POST   | `/vendor-spot`               | raw JSON   | `products: [{ vendor_id, category_id, sub_category_id, vendor_spot_heading, vendor_spot_details }]`                                                                                                             | `src/modules/dashboard/vendor/components/VendorSpotFormDialog.tsx`         |
| 29  | `vendor-spot list`      | GET    | `/vendor-spot`               | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/vendor/components/VendorSpotTable.tsx`              |
| 30  | `vendor-spot by id`     | GET    | `/vendor-spot/{id}`          | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/vendor/api/vendor.api.ts`                           |
| 31  | `vendor-spot` (Update)  | PUT    | `/vendor-spot/{id}`          | raw JSON   | `category_id`, `sub_category_id`, `vendor_spot_heading`, `vendor_spot_details`, `vendor_spot_status`                                                                                                            | `src/modules/dashboard/vendor/api/vendor.api.ts`                           |
| 32  | `vendor-spots status`   | PATCH  | `/vendor-spots/{id}/status`  | raw JSON   | `vendor_spot_status`                                                                                                                                                                                            | `src/modules/dashboard/vendor/components/VendorSpotTable.tsx`              |
| 33  | `news` (Create)         | POST   | `/news`                      | raw / form | `category_id`, `news_heading`, `news_details`, `news_image`, `news_other_image`                                                                                                                                 | `src/modules/dashboard/news/components/NewsFormDialog.tsx`                 |
| 34  | `news list`             | GET    | `/news`                      | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/news/components/NewsTable.tsx`                      |
| 35  | `news by id`            | GET    | `/news/{id}`                 | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/news/api/news.api.ts`                               |
| 36  | `news` (Update)         | PUT    | `/news/{id}`                 | raw / form | same fields + `news_status`, `_method: "PUT"`                                                                                                                                                                   | `src/modules/dashboard/news/components/NewsFormDialog.tsx`                 |
| 37  | `newss status`          | PATCH  | `/newss/{id}/status`         | raw JSON   | `news_status`                                                                                                                                                                                                   | `src/modules/dashboard/news/components/NewsTable.tsx`                      |
| 38  | `slider` (Create)       | POST   | `/slider`                    | formdata   | `slider_type`, `category_id`, `slider_image`, `slider_url`, `slider_sort_order`                                                                                                                                 | `src/modules/dashboard/slider/components/SliderFormDialog.tsx`             |
| 39  | `slider list`           | GET    | `/slider`                    | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/slider/components/SliderTable.tsx`                  |
| 40  | `slider by id`          | GET    | `/slider/{id}`               | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/slider/api/slider.api.ts`                           |
| 41  | `slider` (Update)       | PUT    | `/slider/{id}`               | formdata   | same fields + `slider_status`, `_method: "PUT"`                                                                                                                                                                 | `src/modules/dashboard/slider/components/SliderFormDialog.tsx`             |
| 42  | `sliders status`        | PATCH  | `/sliders/{id}/status`       | raw JSON   | `slider_status`                                                                                                                                                                                                 | `src/modules/dashboard/slider/components/SliderTable.tsx`                  |
| 43  | `notification` (Create) | POST   | `/notification`              | formdata   | `notification_date`, `notification_heading`, `notification_description`, `notification_image`                                                                                                                   | `src/modules/dashboard/notification/components/NotificationFormDialog.tsx` |
| 44  | `notification list`     | GET    | `/notification`              | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/notification/components/NotificationTable.tsx`      |
| 45  | `notification by id`    | GET    | `/notification/{id}`         | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/notification/api/notification.api.ts`               |
| 46  | `notification` (Update) | PUT    | `/notification/{id}`         | formdata   | same fields + `notification_status`, `_method: "PUT"`                                                                                                                                                           | `src/modules/dashboard/notification/components/NotificationFormDialog.tsx` |
| 47  | `notifications status`  | PATCH  | `/notifications/{id}/status` | formdata   | `notification_status`, `_method: "PATCH"`                                                                                                                                                                       | `src/modules/dashboard/notification/components/NotificationTable.tsx`      |
| 48  | `enquiry list`          | GET    | `/enquiry`                   | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/enquiry/components/EnquiryTable.tsx`                |
| 49  | `enquiry by id`         | GET    | `/enquiry/{id}`              | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/enquiry/api/enquiry.api.ts`                         |
| 50  | `enquiry` (Update)      | PUT    | `/enquiry/{id}`              | formdata   | `enquiryStatus` (`Pending`, `Cancel`, `Complete`)                                                                                                                                                               | `src/modules/dashboard/enquiry/components/EnquiryTable.tsx`                |
| 51  | `enquiry` (Delete)      | DELETE | `/enquiry/{id}`              | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/enquiry/components/EnquiryTable.tsx`                |
| 52  | `newsletter list`       | GET    | `/newsletter`                | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/newsletter/components/NewsletterTable.tsx`          |
| 53  | `newsletter` (Delete)   | DELETE | `/newsletter/{id}`           | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/newsletter/components/NewsletterTable.tsx`          |
| 54  | `blog list`             | GET    | `/blog`                      | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/blog/components/BlogTable.tsx`                      |
| 55  | `blog` (Create)         | POST   | `/blog`                      | formdata   | `blog_slug`, `blog_index`, `blog_title`, `blog_short_description`, `blog_meta_keywords`, `blog_description`, `blog_banner_image`, `blog_banner_image_alt`, `blog_categories_ids`, `blog_front`, `blog_featured` | `src/modules/dashboard/blog/components/BlogFormDialog.tsx`                 |
| 56  | `blog by id`            | GET    | `/blog/{id}`                 | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/blog/api/blog.api.ts`                               |
| 57  | `blog` (Update)         | PUT    | `/blog/{id}`                 | formdata   | same fields + `blog_status`, `_method: "PUT"`                                                                                                                                                                   | `src/modules/dashboard/blog/components/BlogFormDialog.tsx`                 |
| 58  | `blogs status`          | PATCH  | `/blogs/{id}/status`         | formdata   | `blog_status`, `_method: "PATCH"`                                                                                                                                                                               | `src/modules/dashboard/blog/components/BlogTable.tsx`                      |
| 59  | `pageTwo`               | GET    | `/pageTwo`                   | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/pages/pages/PagesPage.tsx`                          |
| 60  | `pageOne`               | GET    | `/pageOne`                   | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/pages/pages/PagesPage.tsx`                          |
| 61  | `gallery list`          | GET    | `/gallery`                   | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/gallery/components/GalleryTable.tsx`                |
| 62  | `gallery` (Create)      | POST   | `/gallery`                   | formdata   | `gallery_image`                                                                                                                                                                                                 | `src/modules/dashboard/gallery/components/GalleryFormDialog.tsx`           |
| 63  | `gallery by id`         | GET    | `/gallery/{id}`              | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/gallery/api/gallery.api.ts`                         |
| 64  | `gallery` (Update)      | PUT    | `/gallery/{id}`              | formdata   | `gallery_image`, `gallery_status`, `_method: "PUT"`                                                                                                                                                             | `src/modules/dashboard/gallery/components/GalleryFormDialog.tsx`           |
| 65  | `gallerys status`       | PATCH  | `/gallerys/{id}/status`      | formdata   | `gallery_status`, `_method: "PATCH"`                                                                                                                                                                            | `src/modules/dashboard/gallery/components/GalleryTable.tsx`                |
| 66  | `client list`           | GET    | `/client`                    | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/client/components/ClientTable.tsx`                  |
| 67  | `client` (Create)       | POST   | `/client`                    | formdata   | `clients_name`, `clients_image`                                                                                                                                                                                 | `src/modules/dashboard/client/components/ClientFormDialog.tsx`             |
| 68  | `client by id`          | GET    | `/client/{id}`               | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/client/api/client.api.ts`                           |
| 69  | `client` (Update)       | PUT    | `/client/{id}`               | formdata   | `clients_name`, `clients_image`, `clients_status`, `_method: "PUT"`                                                                                                                                             | `src/modules/dashboard/client/components/ClientFormDialog.tsx`             |
| 70  | `clients status`        | PATCH  | `/clients/{id}/status`       | formdata   | `clients_status`, `_method: "PATCH"`                                                                                                                                                                            | `src/modules/dashboard/client/components/ClientTable.tsx`                  |
| 71  | `testimonial list`      | GET    | `/testimonial`               | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/testimonial/components/TestimonialTable.tsx`        |
| 72  | `testimonial` (Create)  | POST   | `/testimonial`               | formdata   | `testimonial_for`, `testimonial_client_name`, `testimonial_description`, `testimonial_rating`                                                                                                                   | `src/modules/dashboard/testimonial/components/TestimonialFormDialog.tsx`   |
| 73  | `testimonial by id`     | GET    | `/testimonial/{id}`          | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/testimonial/api/testimonial.api.ts`                 |
| 74  | `testimonial` (Update)  | PUT    | `/testimonial/{id}`          | formdata   | same fields + `testimonial_status`, `_method: "PUT"`                                                                                                                                                            | `src/modules/dashboard/testimonial/components/TestimonialFormDialog.tsx`   |
| 75  | `testimonials status`   | PATCH  | `/testimonials/{id}/status`  | formdata   | `testimonial_status`, `_method: "PATCH"`                                                                                                                                                                        | `src/modules/dashboard/testimonial/components/TestimonialTable.tsx`        |
| 76  | `faq list`              | GET    | `/faq`                       | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/faq/components/FaqTable.tsx`                        |
| 77  | `faq` (Create)          | POST   | `/faq`                       | raw JSON   | `faq_for`, `subs: [{ faq_sort, faq_heading, faq_que, faq_ans }]`                                                                                                                                                | `src/modules/dashboard/faq/components/FaqFormDialog.tsx`                   |
| 78  | `faq by id`             | GET    | `/faq/{id}`                  | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/faq/api/faq.api.ts`                                 |
| 79  | `faq` (Update)          | PUT    | `/faq/{id}`                  | raw JSON   | `faq_for`, `faq_status`, `subs: [{ id, faq_sort, faq_heading, faq_que, faq_ans, faq_status: 1/0 (number) }]`                                                                                                    | `src/modules/dashboard/faq/components/FaqFormDialog.tsx`                   |
| 80  | `faqs status`           | PATCH  | `/faqs/{id}/status`          | formdata   | `faq_status`, `_method: "PATCH"`                                                                                                                                                                                | `src/modules/dashboard/faq/components/FaqTable.tsx`                        |
| 81  | `faq-sub` (Delete)      | DELETE | `/faq-sub/{id}`              | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/faq/api/faq.api.ts`                                 |
| 82  | `faq` (Delete)          | DELETE | `/faq/{id}`                  | none       | None                                                                                                                                                                                                            | `src/modules/dashboard/faq/components/FaqTable.tsx`                        |

---

## 5. 🧪 Automated Terminal cURL Verification Suite

Run this bash/zsh snippet directly in your terminal to authenticate and verify live endpoints using the provided credentials (`7892036268` / `123456`):

```bash
# ==========================================
# 1. AUTHENTICATE & EXTRACT TOKEN
# ==========================================
echo "Logging in..."
TOKEN=$(curl -s -X POST "https://kmrlive.in/crmapi/public/api/panel-login" \
  -F "username=7892036268" \
  -F "password=123456" | jq -r '.UserInfo.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo "❌ Login failed! Check credentials."
  exit 1
fi

echo "✅ Authenticated! Token: ${TOKEN:0:30}..."

# ==========================================
# 2. TEST LIVE ENDPOINTS
# ==========================================
echo -e "\n--- Checking Profile ---"
curl -s -H "Authorization: Bearer $TOKEN" "https://kmrlive.in/crmapi/public/api/panel-fetch-profile" | jq .

echo -e "\n--- Checking Vendors ---"
curl -s -H "Authorization: Bearer $TOKEN" "https://kmrlive.in/crmapi/public/api/vendor" | jq '.data.data[0]'

echo -e "\n--- Checking Active Vendors ---"
curl -s -H "Authorization: Bearer $TOKEN" "https://kmrlive.in/crmapi/public/api/activeVendors" | jq '.data[0]'

echo -e "\n--- Checking Vendor Spots ---"
curl -s -H "Authorization: Bearer $TOKEN" "https://kmrlive.in/crmapi/public/api/vendor-spot" | jq '.data.data[0]'

echo -e "\n--- Checking News Articles ---"
curl -s -H "Authorization: Bearer $TOKEN" "https://kmrlive.in/crmapi/public/api/news" | jq '.data.data[0]'

echo -e "\n--- Checking Sliders / Banners ---"
curl -s -H "Authorization: Bearer $TOKEN" "https://kmrlive.in/crmapi/public/api/slider" | jq '.data.data[0]'

echo -e "\n--- Checking Push Notifications ---"
curl -s -H "Authorization: Bearer $TOKEN" "https://kmrlive.in/crmapi/public/api/notification" | jq '.data.data[0]'

echo -e "\n--- Checking Page Placements (pageOne & pageTwo) ---"
curl -s -H "Authorization: Bearer $TOKEN" "https://kmrlive.in/crmapi/public/api/pageOne" | jq '.data'
curl -s -H "Authorization: Bearer $TOKEN" "https://kmrlive.in/crmapi/public/api/pageTwo" | jq '.data'

echo -e "\n--- Checking Blogs (Empty Array) ---"
curl -s -H "Authorization: Bearer $TOKEN" "https://kmrlive.in/crmapi/public/api/blog" | jq '.data.data'

echo -e "\n--- Checking Gallery (Empty Array) ---"
curl -s -H "Authorization: Bearer $TOKEN" "https://kmrlive.in/crmapi/public/api/gallery" | jq '.data'

echo -e "\n--- Checking Clients (Empty Array) ---"
curl -s -H "Authorization: Bearer $TOKEN" "https://kmrlive.in/crmapi/public/api/client" | jq '.data'

echo -e "\n--- Checking Testimonials (Empty Array) ---"
curl -s -H "Authorization: Bearer $TOKEN" "https://kmrlive.in/crmapi/public/api/testimonial" | jq '.data.data'

echo -e "\n--- Checking FAQs (Empty Array) ---"
curl -s -H "Authorization: Bearer $TOKEN" "https://kmrlive.in/crmapi/public/api/faq" | jq '.data.data'
```

---

## 6. 📌 Summary of Verified Server Health

- 🟢 **Operational 200 OK Endpoints:**
  - `panel-login`
  - `panel-fetch-dotenv`
  - `panel-fetch-profile`
  - `vendor`
  - `activeVendors`
  - `vendor-spot` (2 active live items)
  - `news` (1 active live article with PDF)
  - `slider` (2 active live banners)
  - `notification` (3 active scheduled broadcasts)
  - `pageOne` (4 active page slugs: `home`, `about-us`, `blogs`, `contacts`)
  - `pageTwo` (4 active page slugs: `home`, `about-us`, `blogs`, `contacts`)
  - `blog` (200 OK, empty dataset)
  - `gallery` (200 OK, empty dataset)
  - `client` (200 OK, empty dataset)
  - `testimonial` (200 OK, empty dataset)
  - `faq` (200 OK, empty dataset)

- ⚠️ **Server-Side Deficiencies (Defensively Handled in UI):**
  - `GET /category` & `GET /activeCategories`: Server reports `Class "App\Models\Categories" not found`.
  - `GET /enquiry`: Server reports `Target class [EnquiryController] does not exist`.
  - `GET /newsletter`: Server reports `Target class [NewsletterController] does not exist`.
  - `GET /vendor-live` & `GET /vendor-rate`: Server reports `Call to a member function first() on null` when no relationship records exist. Handled in UI with clear banner and working "+ Add Rate" forms.
