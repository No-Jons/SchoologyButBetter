(function calendarSetup() {
    setInterval(
        async function () {
            if (config.notifications.enabled === false)
                return;
            const current = sgyDate();
            const events = await fetchApiData(`/events/users/${userID}/events?start_date=${current}`);

            let event;
            for (let i = 0; i < events.event.length; i++) {
                event = events.event[i];
                let eventDate = Date.parse(event.start);
                let path;
                if (event.web_url) {
                    const regex = /\/assignments?\/\d+/g;
                    path = event.web_url.match(regex).join("");
                } else if (event.external_tool_id) {
                    path = `/external_tool/${event.id}/launch`;
                } else {
                    path = `/event/${event.id}/profile`;
                }
                if ((((eventDate - Date.now()) <= 3600000 && (eventDate - Date.now()) > 3000000) || (config.notifications.one_hour === false))
                    || (((eventDate - Date.now()) <= 600000 && (eventDate - Date.now()) > 0) || (config.notifications.ten_minutes === false))) {
                    Logger.log("Creating notification for: ", event.title);
                    chrome.runtime.sendMessage(
                        {
                            event: "notif",
                            notification: {
                                type: "basic",
                                iconUrl: "img/schoology.png",
                                title: `Upcoming event - ${event.title}`,
                                message: event.description
                            },
                            url: `${defaultDomain}${path}`,
                        }
                    );
                }
            }
        }, config.notifications.check_interval * 1000
    );
})();