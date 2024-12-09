// When the document is fully loaded and ready
$(document).ready(function () {
    // create jQuery references for the calendar and related HTML elements
    const $calendar = $("#calendar");
    const $monthYear = $("#monthYear");
    const $taskList = $("#taskList");
    const $selectedDate = $("#selectedDate");

    // Function to fetch and group all tasks by their due date
    const GetTasks = () => {
        AMT.GetTasks(); // Fetch tasks from AMT
        let AllTasks = AMT.Tasks.map((value) => {
            // Map tasks into a simplified structure
            return {
                DueDate: value.DueDate,
                task: value.Name,
                time: "12:00pm", // Default task time (adjustable)
                Description: value.Description,
                Frequency: value.Frequency,
                Id: value.Id,
            };
        });
        // Group tasks by their due date using Object.groupBy
        return Object.groupBy(AllTasks, ({ DueDate }) => DueDate);
    };

    // Retrieve tasks grouped by date
    let tasks = GetTasks();

    // Save tasks to localStorage if available, otherwise retrieve from localStorage
    if (Object.keys(tasks).length > 0) {
        localStorage.setItem("AMT_Tasks", JSON.stringify(tasks));
    } else {
        tasks = JSON.parse(localStorage.getItem("AMT_Tasks"));
    }

    // Get the current date for the calendar
    let currentDate = new Date();

    // Function to generate the calendar for a given date
    function generateCalendar(date) {
        $calendar.empty(); // Clear the calendar container
        const year = date.getFullYear(); // Current year
        const month = date.getMonth(); // Current month (0-indexed)
        const firstDay = new Date(year, month, 1).getDay(); // Day of the week the month starts on
        const daysInMonth = new Date(year, month + 1, 0).getDate(); // Number of days in the month

        // Display the current month and year that is compatible with user's regional settings
        $monthYear.text(`${date.toLocaleString("default", { month: "long" })} ${year}`);

        // Add blank days for alignment of the first week
        for (let i = 0; i < firstDay; i++) {
            $calendar.append('<div class="blank-day"></div>');
        }

        // Create and append day cells
        for (let day = 1; day <= daysInMonth; day++) {
            //padStart ensures single digit numbers appear as 01, 05, etc, Format date as YYYY-MM-DD
            const fullDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`; 
            const $dayCell = $(`<div class="day">${day}</div>`); // Create a div for the day
            $dayCell.attr("data-date", fullDate); // Attach the date as a data attribute

            // Highlight days that have tasks
            if (tasks[fullDate]) {
                $dayCell.css({ backgroundColor: "#673ab7", color: "#fff" });
            }

            // Highlight the current day
            if (new Date().toDateString() === new Date(year, month, day).toDateString()) {
                $dayCell.addClass("today");
            }

            // Add click event to display tasks for the selected date
            $dayCell.on("click", function () {
                showTasks(fullDate);
            });

            // Append the day cell to the calendar
            $calendar.append($dayCell);
        }
    }

    // Function to display tasks for a selected date
    function showTasks(date) {
        $selectedDate.text(date); // Show the selected date
        $taskList.empty(); // Clear the task list

        if (tasks[date]) {
            // Add each task for the selected date
            tasks[date].forEach(({ task, time, Frequency, Description }) => {
                const taskItem = `<li>[Every ${Frequency} Days] ${task} @ ${time} - ${Description}</li>`;
                $taskList.append(taskItem); // Append task to the list
            });
        } else {
            // Show "No tasks" message if no tasks exist for the date
            $taskList.append("<li>No tasks</li>");
        }
    }

    // Event handler for navigating to the previous month
    $("#prevMonth").on("click", function () {
        currentDate.setMonth(currentDate.getMonth() - 1); // Move to the previous month
        generateCalendar(currentDate); // Regenerate the calendar
    });

    // Event handler for navigating to the next month
    $("#nextMonth").on("click", function () {
        currentDate.setMonth(currentDate.getMonth() + 1); // Move to the next month
        generateCalendar(currentDate); // Regenerate the calendar
    });

    // Initialize the calendar for the current date
    generateCalendar(currentDate);
});
