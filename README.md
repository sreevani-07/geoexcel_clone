# GeoExcel Website Clone and Redesign

A redesigned, responsive business website for **GeoExcel**, built to
present the company's business verticals and product catalogue through a
modern interface. The project includes product discovery, product detail
pages, a browser-based shopping cart, a checkout demonstration flow,
theme switching, and responsive navigation.

```{=html}
<p align="center">
```
`<a href="https://geoexcelclone.vercel.app/">`{=html}`<strong>`{=html}Live
Website`</strong>`{=html}`</a>`{=html} ·
`<a href="https://github.com/sreevani-07/geoexcel_clone">`{=html}`<strong>`{=html}GitHub
Repository`</strong>`{=html}`</a>`{=html} ·
`<a href="https://www.geoexcel.group/">`{=html}`<strong>`{=html}Original
GeoExcel Website`</strong>`{=html}`</a>`{=html}
```{=html}
</p>
```

------------------------------------------------------------------------

## Table of Contents

-   [Project Overview](#project-overview)
-   [Objectives](#objectives)
-   [Features](#features)
-   [Technology Stack](#technology-stack)
-   [Project Structure](#project-structure)
-   [How It Works](#how-it-works)
-   [Local Setup](#local-setup)
-   [Configuration Notes](#configuration-notes)
-   [Deployment](#deployment)
-   [Testing Checklist](#testing-checklist)
-   [Limitations and Security Notes](#limitations-and-security-notes)
-   [Future Enhancements](#future-enhancements)
-   [Project Links](#project-links)

## Project Overview

The **GeoExcel Website Clone and Redesign** project is a frontend
redesign of the original GeoExcel business website. The original website
was reviewed to understand the company's business areas, products, and
visitor information needs. The redesigned site organises this
information into a clearer multi-page experience and adds interactive
product-shopping interfaces.

The website presents GeoExcel's business information and product
categories, and allows visitors to browse products, view product
details, manage a cart, and explore a checkout demonstration.

This project demonstrates business research, UI/UX redesign, frontend
development, client-side state management, responsive web design, and
static-site deployment.

## Objectives

-   Review the original GeoExcel website and understand its business
    context.
-   Improve the presentation and organisation of company and product
    information.
-   Build a modern, responsive multi-page website.
-   Make product categories and product details easier to explore.
-   Implement client-side cart and checkout interactions.
-   Provide light/dark theme options and mobile navigation.
-   Maintain the source code in GitHub and deploy the website using
    Vercel.

## Features

### Website pages and navigation

-   **Home:** Hero section, product-category links, company
    introduction, business verticals, process information, roadmap, and
    contact call to action.
-   **About:** Company story, heritage, business verticals, and roadmap
    content.
-   **Products:** Product catalogue organised by category with product
    cards.
-   **Product details:** Product descriptions, pack types, selectable
    sizes, prices, specifications, quantity controls, and add-to-cart
    action.
-   **Contact:** Business contact information and an enquiry form that
    opens a pre-addressed email in the visitor's email application.

### Product catalogue

The catalogue is maintained in `js/data.js` and includes five
categories:

1.  Rice
2.  Whole Spices
3.  Edible Oil & Ghee
4.  IQF Products
5.  Fashion & Lifestyle

Product records can contain identifiers, category information, names,
descriptions, packaging types, available sizes and prices, images, and
product specifications.

### Shopping cart

-   Add products to the cart.
-   Increase or decrease item quantities.
-   Remove items.
-   View the cart item count and subtotal.
-   Retain cart data in the same browser using `localStorage`.

### Checkout demonstration

-   Collect customer details.
-   Display an order summary.
-   Calculate shipping using the configured values.
-   Present online-payment and invoice-request options.
-   Store client-side order records in browser storage.

### Other interface features

-   Light and dark theme toggle, with the selected theme retained in
    browser storage.
-   Responsive navigation with a mobile menu.
-   Shared navigation and footer across pages.
-   Keyboard `Escape` handling for closing supported overlays or the
    mobile menu.
-   Product-packaging visuals generated with supporting Python
    utilities.

## Technology Stack

  ------------------------------------------------------------------------
  Technology                     Reported code share Role
  --------------------- ---------------------------- ---------------------
  JavaScript                                   33.2% Page interactions,
                                                     navigation, theme
                                                     switching, product
                                                     rendering, cart
                                                     calculations,
                                                     checkout, and
                                                     contact-form
                                                     behavior.

  Python                                       26.8% Supporting utilities
                                                     for generating
                                                     product-packaging
                                                     visual assets.

  CSS                                          24.7% Layout, visual
                                                     styling, responsive
                                                     behavior, themes,
                                                     cards, buttons, and
                                                     navigation.

  HTML                                         15.3% Page structure and
                                                     content.
  ------------------------------------------------------------------------

The percentages are the reported code-composition figures for the
project. They do not represent runtime usage or feature complexity.

## Project Structure

The principal files and folders identified in the project are:

``` text
geoexcel_clone/
├── index.html              # Homepage
├── about.html              # Company information
├── products.html           # Product catalogue
├── product.html            # Individual product details
├── checkout.html           # Checkout interface
├── contact.html            # Contact details and enquiry form
├── css/
│   └── styles.css          # Shared styling and responsive rules
├── js/
│   ├── app.js              # Shared and page-specific interactions
│   ├── data.js             # Product, category, and site configuration
│   └── pack.js             # Product-packaging visual logic
├── tools/
│   └── render/             # Python packaging-visual utilities
└── assets/                 # Logo, product photos, and visual assets
```

> This is a high-level representation of the main project files
> described in the project documentation. Retain any additional files
> and folders present in the repository.

## How It Works

The project uses a static, client-side architecture:

1.  A visitor opens the deployed website in a browser.
2.  The browser loads the relevant HTML page.
3.  CSS applies the layout, visual styling, and responsive behavior.
4.  JavaScript loads product and configuration data from `js/data.js`
    and handles page interactions.
5.  Browser `localStorage` retains selected client-side preferences and
    shopping data.
6.  GitHub stores the source code, and Vercel hosts the public website.

### Browser storage keys

  Key           Purpose
  ------------- -------------------------------------------------
  `gx-cart`     Stores cart data in the visitor's browser.
  `gx-theme`    Stores the selected theme preference.
  `gx-orders`   Stores client-side order demonstration records.

There is no dedicated application server or central database evidenced
in the reviewed implementation.

## Local Setup

The project is a static HTML/CSS/JavaScript website and does not require
a frontend build step according to the project documentation.

1.  Clone the repository:

    ``` bash
    git clone https://github.com/sreevani-07/geoexcel_clone.git
    ```

2.  Move into the project directory:

    ``` bash
    cd geoexcel_clone
    ```

3.  Open `index.html` in a browser, or use a local development server
    such as the VS Code Live Server extension.

4.  Open the relevant pages and test the navigation and product
    interactions.

### Python packaging utilities

Python utilities are included under `tools/render/` for generating
product-packaging visuals. The exact Python version and dependency
installation commands should be taken from the repository's own utility
files, if provided.

## Configuration Notes

The central project configuration and product catalogue are maintained
in `js/data.js`.

The reviewed configuration includes:

-   Locale: `en-IN`
-   Currency: INR
-   Product categories and product records
-   Contact information
-   Shipping settings
-   Payment gateway settings

The reviewed configuration specifies a flat shipping charge of **₹99**
and a free-shipping threshold of **₹2,000**. Confirm these values
against current business requirements before using them as live
commercial policy.

## Deployment

The website is deployed on **Vercel**, with source code maintained in
**GitHub**.

Deployment workflow:

1.  Develop and test the website locally.
2.  Commit and push the source code to GitHub.
3.  Connect the GitHub repository to a Vercel project.
4.  Configure the deployment settings for the static website.
5.  Deploy the project and obtain the public Vercel URL.
6.  Open the deployed website and verify its pages, links, product
    interactions, and responsive layout.

Live deployment: https://geoexcelclone.vercel.app/

Repository: https://github.com/sreevani-07/geoexcel_clone

Whether every GitHub push triggers an automatic Vercel deployment
depends on the Vercel project settings and should be confirmed in the
deployment dashboard.

## Testing Checklist

Run these checks on the deployed website and update the status based on
actual results:

-   [ ] Homepage loads and the main sections are visible.
-   [ ] Home, About, Products, and Contact navigation links work.
-   [ ] Product categories display the matching products.
-   [ ] Product detail pages show the correct information, sizes, and
    prices.
-   [ ] Adding an item updates the cart.
-   [ ] Cart quantity changes and item removal update the totals.
-   [ ] Shipping calculation follows the configured threshold.
-   [ ] Checkout validates required customer fields.
-   [ ] Invoice-request flow behaves as expected.
-   [ ] Payment demonstration behavior is displayed when no Razorpay key
    is configured.
-   [ ] Contact form validation opens the configured email link.
-   [ ] Theme preference is retained in the same browser.
-   [ ] Mobile navigation and page layouts are usable at narrow screen
    widths.
-   [ ] The public Vercel URL loads in a separate browser session.

Only mark a test as complete after personally running it.

## Limitations and Security Notes

This project is a **frontend demonstration**, not a complete production
e-commerce backend.

-   The reviewed Razorpay `gateway.keyId` configuration is empty. With
    an empty key, the project opens a demo payment sheet and does not
    charge a customer.
-   The presence of a payment gateway adapter does not mean live payment
    processing is enabled.
-   Production payments require trusted server-side order creation and
    payment-signature verification.
-   Cart and order demonstration records are stored in browser
    `localStorage`, not in a central database.
-   Client-side order records are not authoritative or secure records
    for real transactions.
-   The contact form uses a `mailto:` flow. It relies on the visitor
    having an email application configured and does not submit enquiries
    to a backend service.
-   Product prices, shipping values, and contact details should be
    checked before production use.
-   Browser compatibility, accessibility, performance, and actual device
    testing should be verified before making production-readiness
    claims.

## Future Enhancements

-   Add a secure backend and database for customers, orders, and
    inventory.
-   Implement production payment processing with server-side order
    creation and payment verification.
-   Connect the contact form to a backend or trusted form service.
-   Build an admin dashboard to manage products, prices, inventory, and
    orders.
-   Add customer accounts, order history, and order tracking.
-   Improve product search, sorting, and filtering.
-   Add automated tests for important user journeys.
-   Conduct accessibility, SEO, and performance audits.
-   Add analytics with appropriate privacy controls.

## Project Links

  Resource                    Link
  --------------------------- -----------------------------------------------
  Live redesigned website     https://geoexcelclone.vercel.app/
  GitHub repository           https://github.com/sreevani-07/geoexcel_clone
  Original GeoExcel website   https://www.geoexcel.group/
  Hosting platform            Vercel

------------------------------------------------------------------------

**Project:** GeoExcel Website Clone and Redesign\
**Status:** Completed\
**Focus areas:** Business research · UI/UX redesign · Frontend
development · Responsive design · Client-side e-commerce workflow ·
GitHub · Vercel
