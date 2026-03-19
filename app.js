class TemporalPosition {
    constructor() {
        this.eventsCache = null;
        this.eventsCacheDate = null;
        this.init();
    }

    init() {
        this.updateAll();
        setInterval(() => this.updateAll(), 1000);
        this.fetchHistoricalEvents();
    }

    updateAll() {
        this.updateTime();
        this.updateDate();
        this.updateDayProgress();
        this.updateWeekProgress();
        this.updateMonthProgress();
        this.updateYearProgress();
    }

    updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        document.getElementById('currentTime').textContent = `${hours}:${minutes}`;
        
        const offset = -now.getTimezoneOffset();
        const offsetHours = Math.floor(Math.abs(offset) / 60);
        const offsetMinutes = Math.abs(offset) % 60;
        const offsetSign = offset >= 0 ? '+' : '-';
        const offsetString = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;
        
        document.getElementById('timezone').textContent = `UTC ${offsetString}`;
    }

    updateDate() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateString = now.toLocaleDateString('en-US', options);
        document.getElementById('currentDate').textContent = dateString;
    }

    updateDayProgress() {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        
        const elapsed = now - startOfDay;
        const total = endOfDay - startOfDay;
        const percentage = Math.floor((elapsed / total) * 100);
        
        const remaining = total - elapsed;
        const hoursRemaining = Math.floor(remaining / (1000 * 60 * 60));
        const minutesRemaining = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        
        document.getElementById('dayPercentage').textContent = `${percentage}%`;
        document.getElementById('dayCycles').textContent = `Cycles remaining: ${hoursRemaining}h ${minutesRemaining}m`;
        
        this.renderSegments('daySegments', 24, percentage / 100 * 24, 'filled-day');
    }

    updateWeekProgress() {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - adjustedDay);
        startOfWeek.setHours(0, 0, 0, 0);
        
        const elapsed = now - startOfWeek;
        const weekInMs = 7 * 24 * 60 * 60 * 1000;
        const percentage = Math.floor((elapsed / weekInMs) * 100);
        
        const weekNumber = this.getWeekNumber(now);
        
        document.getElementById('weekPercentage').textContent = `${percentage}%`;
        document.getElementById('weekInfo').textContent = `Current: Week ${String(weekNumber).padStart(2, '0')} of 52`;
        
        this.renderSegments('weekSegments', 7, adjustedDay + (now.getHours() / 24), 'filled-week');
    }

    updateMonthProgress() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const elapsed = now - startOfMonth;
        const total = endOfMonth - startOfMonth;
        const percentage = Math.floor((elapsed / total) * 100);
        
        const daysInMonth = endOfMonth.getDate();
        const currentDay = now.getDate();
        const phase = this.getMoonPhase(percentage);
        
        const monthName = now.toLocaleDateString('en-US', { month: 'short' });
        
        document.getElementById('monthPercentage').textContent = `${percentage}%`;
        document.getElementById('monthPhase').textContent = `${monthName} Phase: ${phase}`;
        
        this.renderSegments('monthSegments', daysInMonth, currentDay + (now.getHours() / 24), 'filled-month');
    }

    updateYearProgress() {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
        
        const elapsed = now - startOfYear;
        const total = endOfYear - startOfYear;
        const percentage = Math.floor((elapsed / total) * 100);
        
        const quarter = Math.ceil((now.getMonth() + 1) / 3);
        const year = now.getFullYear();
        
        document.getElementById('yearPercentage').textContent = `${percentage}%`;
        document.getElementById('yearEra').textContent = `Era: ${year} Quarter ${quarter}`;
        
        this.renderSegments('yearSegments', 12, now.getMonth() + ((now.getDate() - 1) / new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()), 'filled-year');
    }

    renderSegments(containerId, totalSegments, filledCount, filledClass) {
        const container = document.getElementById(containerId);
        
        if (container.children.length !== totalSegments) {
            container.innerHTML = '';
            for (let i = 0; i < totalSegments; i++) {
                const segment = document.createElement('div');
                segment.className = 'segment';
                container.appendChild(segment);
            }
        }
        
        const segments = container.children;
        for (let i = 0; i < totalSegments; i++) {
            if (i < Math.floor(filledCount)) {
                segments[i].className = `segment ${filledClass}`;
            } else {
                segments[i].className = 'segment';
            }
        }
    }

    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    getMoonPhase(percentage) {
        if (percentage < 12.5) return 'New Moon';
        if (percentage < 25) return 'Waxing Crescent';
        if (percentage < 37.5) return 'First Quarter';
        if (percentage < 50) return 'Waxing Gibbous';
        if (percentage < 62.5) return 'Full Moon';
        if (percentage < 75) return 'Waning Gibbous';
        if (percentage < 87.5) return 'Last Quarter';
        return 'Waning Crescent';
    }

    async fetchHistoricalEvents() {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        
        const cacheKey = `${month}-${day}`;
        if (this.eventsCache && this.eventsCacheDate === cacheKey) {
            this.renderEvents(this.eventsCache);
            return;
        }
        
        try {
            const response = await fetch(`https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/events/${month}/${day}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }
            
            const data = await response.json();
            this.eventsCache = data.events;
            this.eventsCacheDate = cacheKey;
            
            this.renderEvents(data.events);
        } catch (error) {
            console.error('Error fetching historical events:', error);
            this.renderError();
        }
    }

    renderEvents(events) {
        const container = document.getElementById('eventsContainer');
        container.innerHTML = '';
        
        if (!events || events.length === 0) {
            container.innerHTML = '<div class="loading">No historical events found for today.</div>';
            return;
        }
        
        const significantEvents = events
            .filter(event => event.year && event.text)
            .sort((a, b) => {
                const aScore = this.getEventSignificance(a);
                const bScore = this.getEventSignificance(b);
                return bScore - aScore;
            })
            .slice(0, 3);
        
        significantEvents.forEach((event, index) => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            
            const year = document.createElement('div');
            year.className = 'event-year';
            year.textContent = event.year;
            
            const title = document.createElement('a');
            title.className = 'event-title';
            title.textContent = event.text;
            
            if (event.pages && event.pages.length > 0) {
                const page = event.pages[0];
                title.href = `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`;
                title.target = '_blank';
                title.rel = 'noopener noreferrer';
            } else {
                title.style.cursor = 'default';
            }
            
            const description = document.createElement('div');
            description.className = 'event-description';
            
            if (event.pages && event.pages.length > 0) {
                const page = event.pages[0];
                if (page.extract) {
                    description.textContent = page.extract;
                } else {
                    description.textContent = 'On this day in history, humanity achieved a monumental milestone in space exploration. This event is archived as a significant temporal anchor in our collective narrative.';
                }
            } else {
                description.textContent = 'On this day in history, humanity achieved a monumental milestone. This event is archived as a significant temporal anchor in our collective narrative.';
            }
            
            const source = document.createElement('div');
            source.className = 'event-source';
            const refId = `${event.year}${String(index).padStart(6, '0')}`;
            source.textContent = `SOURCE: WIKIPEDIA ARCHIVE • TEMPORAL ID: REF-${refId}`;
            
            eventCard.appendChild(year);
            eventCard.appendChild(title);
            eventCard.appendChild(description);
            eventCard.appendChild(source);
            
            container.appendChild(eventCard);
        });
    }

    getEventSignificance(event) {
        let score = 0;
        
        if (event.pages && event.pages.length > 0) {
            score += 10;
        }
        
        const keywords = ['first', 'discovered', 'invented', 'founded', 'war', 'peace', 'treaty', 'revolution', 'independence', 'moon', 'space', 'apollo'];
        const text = event.text.toLowerCase();
        keywords.forEach(keyword => {
            if (text.includes(keyword)) {
                score += 5;
            }
        });
        
        if (event.year < 1900) {
            score += 3;
        }
        
        return score;
    }

    renderError() {
        const container = document.getElementById('eventsContainer');
        container.innerHTML = '<div class="loading">Unable to load historical events. Please check your connection.</div>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TemporalPosition();
});
