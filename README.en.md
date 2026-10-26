# Otenki Gurashi 🌤️

[日本語](README.md) | [English](README.en.md)

A new, soothing experience connected to your “right now.”

Otenki Gurashi is a new kind of raising web service that responds in real time to the actual weather and time where you are.

---

## ✨ Concept

**“The gentlest little charm for someone who never checks the forecast.”**

Checking the forecast is a hassle, but sudden rain and changes in air pressure can be difficult.

Otenki Gurashi was created for people who feel this way. Through a gentle, game-like world, it turns checking the weather from a chore into a positive experience: “Maybe I can do something special in the game because it’s raining?”

---

## 🚀 Main features

- **Real-time connection to weather and time**  
  The “right now” where you are appears directly in the character’s world. If it rains in Osaka, it rains in the game; when night falls, the character goes to sleep.

- **Walks**  
  Send the character for a walk. The scenery and items it finds change with the weather, giving you things to collect.

- **Collection and achievements**  
  There are no level-up quotas. A “Picture Book” lets you browse items collected on walks, and achievements record memories with the character, such as “Went for a walk on a rainy day for the first time,” adding color to your everyday life.

## 🛠️ Tech stack

This project is built with a modern JavaScript / TypeScript stack.

| Category | Technology | Role |
|---|---|---|
| **Framework** | Next.js (React) | UI and API server features |
| **Styling** | Tailwind CSS | Efficient, polished UI design |
| **Animation** | Framer Motion | Effects for a pleasant user experience |
| **Database** | Vercel Postgres + Prisma | Store user data and items |
| **Deployment** | Vercel | Fast hosting |
| **External API** | OpenWeatherMap API | Retrieve weather information |

---

## 🏁 Run locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nitr0yukkuri/otenkigurashi.git
   cd otenkigurashi
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create a `.env.local` file:**  
   Create the file in the project root and set the OpenWeatherMap API key used by server-side Route Handlers. Do not add the `NEXT_PUBLIC_` prefix; it exposes the value to the browser. Existing deployments can temporarily use the legacy variable name on the server, but new configuration should use this name.
   ```dotenv
   OPENWEATHERMAP_API_KEY="YOUR_API_KEY_HERE"
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.
