<div align="center">

# Code à Cuisine

### AI-Powered Recipe Generator

*Got random stuff in your kitchen? Pop it in — we've got the perfect recipe waiting.*

---

![Angular](https://img.shields.io/badge/Angular-22-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![n8n](https://img.shields.io/badge/n8n-EA4B71?style=for-the-badge&logo=n8n&logoColor=white)
![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?style=for-the-badge&logo=reactivex&logoColor=white)

</div>

---

## What is Code à Cuisine?

**Code à Cuisine** is a web app that turns whatever ingredients you have at home into personalized recipes — powered by AI. No meal plan, no grocery list needed. Just type in what's in your kitchen and get three ready-to-cook recipes in seconds.

Beyond the generator, it's also a full **cookbook** with curated recipes organized by cuisine, a **favorites system**, and a **step-by-step cooking mode** designed for one or two people cooking together.

---

## How it works

```
Angular Frontend
      │
      │  sends ingredients + preferences
      ▼
  n8n Workflow  ──►  AI model  ──►  returns 3 recipes
      │
      │  stores & retrieves recipes
      ▼
   Firebase
```

The Angular frontend sends the user's ingredients to an **n8n automation workflow**. n8n handles the AI logic — it calls the model, formats the response and sends the recipes back. All recipes and favorites are persisted in **Firebase Firestore**.

> **Note on n8n:** n8n is self-hosted and runs locally in this project (free). To run the AI features you need a local n8n instance with the workflow imported. See the setup section below.

---

## Features

- **AI Recipe Generator** — enter your ingredients with quantities and let the AI suggest 3 matching recipes tailored to your pantry
- **Cuisine Preferences** — filter by dietary needs and cuisine style before generating
- **Interactive Cookbook** — browse recipes by cuisine: Italian, German, Japanese, Gourmet, Indian and Fusion
- **Two-Chef Cooking Mode** — directions split between Chef 1 and Chef 2 so two people can cook in parallel
- **Nutritional Info** — calories, protein, fat and carbs at a glance on every recipe
- **Favorites** — heart any recipe to save it; see the most liked ones in the cookbook
- **Fully Responsive** — designed and built for both desktop and mobile

---

## App Screens

### Home

![Home](../design/Desk/hero.jpg)

The starting point. Jump straight into the generator or browse the cookbook for inspiration.

---

### Generate Recipe

![Generate Recipe](../design/Desk/Step%201%20Generate%20recipe.jpg)

Add your ingredients one by one with amounts and units. They stack up into your ingredient list as you go.

---

### Preferences

![Preferences](../design/Desk/Step%202%20Preferences%20.jpg)

Set your cuisine style and dietary restrictions before hitting generate — so the results actually fit your needs.

---

### Recipe Results

![Results](../design/Desk/Rresults.jpg)

The AI returns 3 recipe options with title, cooking time and tags. Pick the one that sounds best and dive in.

---

### Full Recipe View

![Recipe](../design/Desk/One%20recipe%20view%20-%20one%20cook.jpg)

Every recipe includes a full ingredient list, step-by-step directions, nutritional breakdown and a heart button to save it. Directions are color-coded for Chef 1 and Chef 2 so two people can share the cooking.

---

### Cookbook

![Cookbook](../design/Desk/Cookbook.jpg)

A curated collection of all recipes, organized by cuisine category. The top of the page always surfaces the most-liked dishes from the community.

---

## Local Setup

To run the full app including the AI recipe generator, you need three things:

---

### 1. n8n — AI Workflow (local, free)

**a) Start n8n**

```bash
npx n8n
```

This opens n8n at `http://localhost:5678`. Create a free account on the first launch (stays local, no payment needed).

**b) Import the workflow**

1. In n8n, go to **Workflows → Import from file**
2. Select `n8n/workflow.json` from this repo
3. Click **Activate** to turn the workflow on

**c) Copy your webhook URL**

Open the imported workflow and click the **Webhook** node. You will see a URL like:

```
http://localhost:5678/webhook/abc123-your-unique-id
```

Copy that URL — you'll need it in the next step.

---

### 2. Configure the webhook URL in Angular

Open `src/environments/environment.ts` and paste your webhook URL:

```ts
export const environment = {
  production: false,
  n8nWebhookUrl: 'http://localhost:5678/webhook/abc123-your-unique-id', // ← paste here
  firebase: { ... }
};
```

> Every n8n instance generates a different webhook ID. That's why you need to paste your own URL — the one from the repo won't work on your machine.

---

### 3. Firebase

Create a Firebase project at [firebase.google.com](https://firebase.google.com), enable **Firestore**, and fill in your credentials in `src/environments/environment.ts`.

---

### 4. Run the app

```bash
npm install
ng serve
```

Open `http://localhost:4200`

> The cookbook, browsing, and favorites work without n8n. Only the **Generate Recipe** feature requires the n8n workflow to be running.

---

## Built With

| Tool | Role |
|---|---|
| Angular 22 | Frontend framework |
| TypeScript 6 | Language |
| RxJS 7.8 | Reactive state & async |
| n8n | AI automation workflow (self-hosted) |
| Firebase Firestore | Backend database |
| Vitest 4 | Unit testing |
| Prettier | Code formatting |

---

## Design

The visual identity is built around a warm, nature-inspired palette — deep forest greens on cream backgrounds — with custom food illustrations as decorative accents throughout the app. Designed in Figma, fully responsive across desktop and mobile.

| Color | Usage |
|---|---|
| `#2D5016` / `#396039` | Primary greens — buttons, headings, icons |
| `#FAF0E6` | Warm cream — backgrounds, light surfaces |
| `#10310B` | Near-black green — body text, dark elements |

---

<div align="center">

*Hungry for inspiration? Start cooking.*

</div>
