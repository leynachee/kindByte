<template>
  <main class="p-6">
    <header class="mb-6">
      <h1 class="text-2xl font-semibold">Staff Dashboard</h1>
      <p class="text-sm opacity-80">Track participant and volunteer counts per event.</p>
    </header>

    <section class="grid gap-4 md:grid-cols-3 mb-6">
      <div class="rounded-lg border p-4">
        <div class="text-sm opacity-70">Total Events</div>
        <div class="text-3xl font-semibold">{{ events.length }}</div>
      </div>

      <div class="rounded-lg border p-4">
        <div class="text-sm opacity-70">Total Participants</div>
        <div class="text-3xl font-semibold">{{ totalParticipants }}</div>
      </div>

      <div class="rounded-lg border p-4">
        <div class="text-sm opacity-70">Total Volunteers</div>
        <div class="text-3xl font-semibold">{{ totalVolunteers }}</div>
      </div>
    </section>

    <section class="rounded-lg border overflow-hidden">
      <div class="p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between border-b">
        <h2 class="font-semibold">Events</h2>
        <input
          v-model="query"
          type="text"
          placeholder="Search event name…"
          class="w-full md:w-80 rounded-md border px-3 py-2 text-sm"
        />
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr class="text-left">
              <th class="p-3">Event</th>
              <th class="p-3">Date</th>
              <th class="p-3">Participants</th>
              <th class="p-3">Volunteers</th>
              <th class="p-3">Capacity</th>
              <th class="p-3">Volunteer Slots</th>
              <th class="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="e in filteredEvents"
              :key="e.id"
              class="border-t"
            >
              <td class="p-3 font-medium">{{ e.title }}</td>
              <td class="p-3">{{ formatDate(e.startsAt) }}</td>
              <td class="p-3">
                {{ e.participantsCount }}
                <span class="opacity-60">/ {{ e.participantsCapacity }}</span>
              </td>
              <td class="p-3">
                {{ e.volunteersCount }}
                <span class="opacity-60">/ {{ e.volunteersCapacity }}</span>
              </td>
              <td class="p-3">
                <progress
                  class="w-40 align-middle"
                  :value="e.participantsCount"
                  :max="e.participantsCapacity"
                />
              </td>
              <td class="p-3">
                <progress
                  class="w-40 align-middle"
                  :value="e.volunteersCount"
                  :max="e.volunteersCapacity"
                />
              </td>
              <td class="p-3">
                <span
                  class="inline-flex items-center rounded-full px-2 py-1 text-xs border"
                  :class="statusClass(e)"
                >
                  {{ statusText(e) }}
                </span>
              </td>
            </tr>

            <tr v-if="filteredEvents.length === 0" class="border-t">
              <td class="p-6 opacity-70" colspan="7">No events found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="p-4 text-xs opacity-70 border-t">
        Demo data only — wire to API/store later.
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'

const query = ref('')

// Demo data (replace with API/store later)
const events = ref([
  {
    id: 'e1',
    title: 'Music & Movement (MTC)',
    startsAt: '2026-01-18T10:00:00+08:00',
    participantsCount: 14,
    participantsCapacity: 20,
    volunteersCount: 4,
    volunteersCapacity: 6,
  },
  {
    id: 'e2',
    title: 'Art Jam (MYG)',
    startsAt: '2026-01-19T14:00:00+08:00',
    participantsCount: 20,
    participantsCapacity: 20,
    volunteersCount: 2,
    volunteersCapacity: 5,
  },
  {
    id: 'e3',
    title: 'Community Outing',
    startsAt: '2026-01-22T09:00:00+08:00',
    participantsCount: 8,
    participantsCapacity: 15,
    volunteersCount: 1,
    volunteersCapacity: 4,
  },
])

const filteredEvents = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return events.value
  return events.value.filter((e) => e.title.toLowerCase().includes(q))
})

const totalParticipants = computed(() =>
  events.value.reduce((sum, e) => sum + e.participantsCount, 0)
)

const totalVolunteers = computed(() =>
  events.value.reduce((sum, e) => sum + e.volunteersCount, 0)
)

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleString('en-SG', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusText(e) {
  const pFull = e.participantsCount >= e.participantsCapacity
  const vLow = e.volunteersCount < Math.ceil(e.volunteersCapacity * 0.5)
  if (pFull && vLow) return 'Full + Low volunteers'
  if (pFull) return 'Participants full'
  if (vLow) return 'Low volunteers'
  return 'OK'
}

function statusClass(e) {
  const text = statusText(e)
  if (text.includes('Full')) return 'bg-red-50'
  if (text.includes('Low')) return 'bg-yellow-50'
  return 'bg-green-50'
}
</script>