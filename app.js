class TemporalPosition {
    constructor() {
        this.eventsCache = null;
        this.eventsCacheDate = null;
        this.workMode = false;
        this.workStartHour = 9;
        this.workEndHour = 17;
        this.workDaysPerWeek = 5;
        this.workDaysPerMonth = 20;
        this.workDaysPerYear = 246;
        this.init();
    }

    init() {
        this.setupWorkModeToggle();
        this.updateAll();
        setInterval(() => this.updateAll(), 1000);
        this.fetchHistoricalEvents();
    }

    setupWorkModeToggle() {
        const buttons = document.querySelectorAll('.work-mode-btn');
        if (!buttons.length) {
            return;
        }

        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                const selectedWork = button.dataset.mode === 'work';
                if (selectedWork === this.workMode) {
                    return;
                }

                this.workMode = selectedWork;
                buttons.forEach((b) => b.classList.toggle('active', b.dataset.mode === button.dataset.mode));
                this.updateAll();
            });
        });
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
        let percentage, hoursRemaining, minutesRemaining, totalSegments, segmentsFilled, subtitle;

        if (this.workMode) {
            const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), this.workStartHour);
            const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), this.workEndHour);
            const total = end - start;
            const elapsed = Math.min(Math.max(now - start, 0), total);
            const ratio = elapsed / total;
            percentage = Math.floor(ratio * 100);
            totalSegments = this.workEndHour - this.workStartHour;
            segmentsFilled = this.getFilledSegments(ratio, totalSegments, percentage);
            const remaining = Math.max(0, total - elapsed);
            hoursRemaining = Math.floor(remaining / (1000 * 60 * 60));
            minutesRemaining = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            subtitle = `Work hours remaining: ${hoursRemaining}h ${minutesRemaining}m`;
        } else {
            const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            const total = end - start;
            const elapsed = now - start;
            const ratio = elapsed / total;
            percentage = Math.floor(ratio * 100);
            totalSegments = 24;
            segmentsFilled = this.getFilledSegments(ratio, totalSegments, percentage);
            const remaining = Math.max(0, total - elapsed);
            hoursRemaining = Math.floor(remaining / (1000 * 60 * 60));
            minutesRemaining = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            subtitle = `Cycles remaining: ${hoursRemaining}h ${minutesRemaining}m`;
        }

        document.getElementById('dayPercentage').textContent = `${percentage}%`;
        document.getElementById('dayCycles').textContent = subtitle;
        this.renderSegments('daySegments', totalSegments, segmentsFilled, 'filled-day');
    }

    updateWeekProgress() {
        const now = new Date();
        const weekNumber = this.getWeekNumber(now);
        const totalWeeksInYear = this.getIsoWeeksInYear(now.getFullYear());
        let percentage, totalSegments, segmentsFilled, subtitle;

        if (this.workMode) {
            const dayOfWeek = now.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const workDayIndex = isWeekend ? this.workDaysPerWeek : Math.max(0, dayOfWeek - 1);

            const monday = new Date(now);
            monday.setDate(now.getDate() - (isWeekend ? (dayOfWeek === 0 ? 6 : 5) : dayOfWeek - 1));
            monday.setHours(0, 0, 0, 0);
            const friday = new Date(monday);
            friday.setDate(monday.getDate() + 5);

            const total = friday - monday;
            const elapsed = Math.min(Math.max(now - monday, 0), total);
            const ratio = elapsed / total;
            percentage = Math.floor(ratio * 100);
            totalSegments = this.workDaysPerWeek;
            segmentsFilled = this.getFilledSegments(ratio, totalSegments, percentage);
            const daysLeft = Math.max(0, this.workDaysPerWeek - workDayIndex - (isWeekend ? 0 : 1));
            subtitle = `Work week: ${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`;
        } else {
            const dayOfWeek = now.getDay();
            const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - adjustedDay);
            startOfWeek.setHours(0, 0, 0, 0);
            const elapsed = now - startOfWeek;
            const weekInMs = 7 * 24 * 60 * 60 * 1000;
            const ratio = elapsed / weekInMs;
            percentage = Math.floor(ratio * 100);
            totalSegments = 7;
            segmentsFilled = this.getFilledSegments(ratio, totalSegments, percentage);
            subtitle = `Current: Week ${String(weekNumber).padStart(2, '0')} of ${totalWeeksInYear}`;
        }

        document.getElementById('weekPercentage').textContent = `${percentage}%`;
        document.getElementById('weekInfo').textContent = subtitle;
        this.renderSegments('weekSegments', totalSegments, segmentsFilled, 'filled-week');
    }

    updateMonthProgress() {
        const now = new Date();
        const monthName = now.toLocaleDateString('en-US', { month: 'short' });
        let percentage, totalSegments, segmentsFilled, subtitle;

        if (this.workMode) {
            const year = now.getFullYear();
            const month = now.getMonth();
            const today = now.getDate();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            let workDaysElapsed = 0;
            for (let d = 1; d < today; d++) {
                const dow = new Date(year, month, d).getDay();
                if (dow !== 0 && dow !== 6) workDaysElapsed++;
            }

            let workDaysRemaining = 0;
            for (let d = today; d <= daysInMonth; d++) {
                const dow = new Date(year, month, d).getDay();
                if (dow !== 0 && dow !== 6) workDaysRemaining++;
            }

            const totalWorkDaysInMonth = workDaysElapsed + workDaysRemaining;
            const ratio = totalWorkDaysInMonth === 0 ? 0 : workDaysElapsed / totalWorkDaysInMonth;
            percentage = Math.floor(ratio * 100);
            totalSegments = totalWorkDaysInMonth;
            segmentsFilled = this.getFilledSegments(ratio, totalSegments, percentage);
            subtitle = `Work days remaining: ${workDaysRemaining}`;
        } else {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const elapsed = now - startOfMonth;
            const total = startOfNextMonth - startOfMonth;
            const ratio = elapsed / total;
            percentage = Math.floor(ratio * 100);
            const daysInMonth = endOfMonth.getDate();
            totalSegments = daysInMonth;
            segmentsFilled = this.getFilledSegments(ratio, totalSegments, percentage);
            const phase = this.getMoonPhase(percentage);
            subtitle = `${monthName} Phase: ${phase}`;
        }

        document.getElementById('monthPercentage').textContent = `${percentage}%`;
        document.getElementById('monthPhase').textContent = subtitle;
        this.renderSegments('monthSegments', totalSegments, segmentsFilled, 'filled-month');
    }

    updateYearProgress() {
        const now = new Date();
        const year = now.getFullYear();
        const quarter = Math.ceil((now.getMonth() + 1) / 3);
        let percentage, totalSegments, segmentsFilled, subtitle;

        if (this.workMode) {
            const startOfYear = new Date(year, 0, 1);
            const endOfYear = new Date(year + 1, 0, 1);
            const calendarTotal = endOfYear - startOfYear;
            const calendarElapsed = now - startOfYear;
            const calendarRatio = calendarElapsed / calendarTotal;
            const workDaysElapsed = Math.floor(calendarRatio * this.workDaysPerYear);
            const ratio = workDaysElapsed / this.workDaysPerYear;
            percentage = Math.floor(ratio * 100);
            totalSegments = 12;
            segmentsFilled = this.getFilledSegments(ratio, totalSegments, percentage);
            const remaining = Math.max(0, this.workDaysPerYear - workDaysElapsed);
            subtitle = `Work days remaining: ${remaining} of ${this.workDaysPerYear}`;
        } else {
            const startOfYear = new Date(year, 0, 1);
            const endOfYear = new Date(year + 1, 0, 1);
            const elapsed = now - startOfYear;
            const total = endOfYear - startOfYear;
            const ratio = elapsed / total;
            percentage = Math.floor(ratio * 100);
            totalSegments = 12;
            segmentsFilled = this.getFilledSegments(ratio, totalSegments, percentage);
            subtitle = `Era: ${year} Quarter ${quarter}`;
        }

        document.getElementById('yearPercentage').textContent = `${percentage}%`;
        document.getElementById('yearEra').textContent = subtitle;
        this.renderSegments('yearSegments', totalSegments, segmentsFilled, 'filled-year');
    }

    getFilledSegments(progressRatio, totalSegments, percentage) {
        if (percentage <= 0) {
            return 0;
        }

        const rounded = Math.round(progressRatio * totalSegments);
        return Math.min(totalSegments, Math.max(1, rounded));
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

    getIsoWeeksInYear(year) {
        return this.getWeekNumber(new Date(Date.UTC(year, 11, 28)));
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
            const response = await fetch(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            
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
            
            const hasLink = event.pages && event.pages.length > 0;
            const title = document.createElement(hasLink ? 'a' : 'div');
            title.className = 'event-title';
            title.textContent = event.text;
            
            if (hasLink) {
                const page = event.pages[0];
                title.href = `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`;
                title.target = '_blank';
                title.rel = 'noopener noreferrer';
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
