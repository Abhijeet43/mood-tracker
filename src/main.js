import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const elements = {
  moodContainer: document.querySelector("#mood-container"),
  calendarEl: document.querySelector("#calendar"),
};

const config = {
  moods: {
    "😊": "Happy",
    "😢": "Sad",
    "😐": "Neutral",
    "🤩": "Excited",
    "😴": "Tired",
    "😠": "Angry",
    "😌": "Relaxed",
    "🤔": "Thoughtful",
  },
};

const state = { moodsData: [] };

function showError(error) {
  console.error(error);
}

function getTodayDateString() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;
}

// Save mood to localStorage, replacing any existing entry for the same day
function saveToLocalStorage(emoji) {
  loadDataFromStorage();

  const dateString = getTodayDateString();

  const newEntry = {
    date: dateString,
    emoji: emoji,
    mood: config.moods[emoji],
    timestamp: new Date().toISOString(),
  };

  const existingEntryIndex = state.moodsData.findIndex(
    (entry) => entry.date === dateString
  );

  if (existingEntryIndex >= 0) {
    state.moodsData[existingEntryIndex] = newEntry;
  } else {
    state.moodsData.push(newEntry);
  }

  localStorage.setItem("moodEntries", JSON.stringify(state.moodsData));

  renderCalendar();
  renderEmojis();
}

function loadDataFromStorage() {
  const savedMoods = localStorage.getItem("moodEntries");
  if (savedMoods) {
    try {
      const parsedData = JSON.parse(savedMoods);

      if (Array.isArray(parsedData)) {
        state.moodsData = parsedData;
      } else if (typeof parsedData === "object" && parsedData !== null) {
        state.moodsData = [parsedData];
      } else {
        state.moodsData = [];
      }
    } catch (error) {
      showError("Error parsing mood data from localStorage: " + error);
      state.moodsData = [];
    }
  } else {
    state.moodsData = [];
  }
}

function createEmoji(emoji, label) {
  const button = document.createElement("button");
  button.className = `mood-button group relative rounded-full p-2 sm:p-4 cursor-pointer ${
    state.moodsData[0]?.emoji === emoji ? "bg-blue-50 ring-2 ring-blue-300" : ""
  }`;
  button.innerHTML = `<span class="text-4xl transition-transform duration-200 group-hover:scale-110">
              ${emoji}
            </span>
            <span class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              ${label}
            </span>`;
  button.onclick = () => saveToLocalStorage(emoji);
  return button;
}

function renderEventContent(eventInfo) {
  const emoji = eventInfo.event.title;
  const mood = config.moods[emoji] || eventInfo.event.extendedProps.mood || "";

  return {
    html: `<div class="flex items-center justify-center gap-1 px-1">
      <span class="text-lg">${emoji}</span>
      <span class="text-md hidden sm:inline text-white">${mood}</span>
    </div>`,
  };
}

function getEvents() {
  if (!Array.isArray(state.moodsData)) {
    showError("moodsData is not an array: " + state.moodsData);
    return [];
  }

  return state.moodsData.map((entry) => {
    return {
      title: entry.emoji,
      start: entry.date,
      allDay: true,
      extendedProps: {
        mood: entry.mood,
        timestamp: entry.timestamp,
      },
    };
  });
}

function renderCalendar() {
  if (elements.calendarEl.innerHTML !== "") {
    elements.calendarEl.innerHTML = "";
  }

  const calendar = new Calendar(elements.calendarEl, {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: "dayGridMonth",
    initialDate: new Date(), // Today's date
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },
    height: "auto",
    dayMaxEvents: 3,
    events: getEvents(),
    eventContent: renderEventContent,
    eventClick: function (info) {
      const emoji = info.event.title;
      const mood = info.event.extendedProps.mood;
      const timestamp = info.event.extendedProps.timestamp;
      const date = new Date(timestamp);

      alert(`Mood: ${mood} (${emoji})\nRecorded on: ${date.toLocaleString()}`);
    },
  });
  calendar.render();
}

function renderEmojis() {
  if (elements.moodContainer.innerHTML !== "") {
    elements.moodContainer.innerHTML = "";
  }

  Object.entries(config.moods).forEach(([emoji, label]) => {
    elements.moodContainer.append(createEmoji(emoji, label));
  });
}

function initializeApp() {
  loadDataFromStorage();
  renderEmojis();
  renderCalendar();
}

document.addEventListener("DOMContentLoaded", initializeApp);
