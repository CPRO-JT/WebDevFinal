//When document is done loading
$(document).ready(function () {
    const $calendar = $("#calendar");
    const $monthYear = $("#monthYear");
    const $taskList = $("#taskList");
    const $selectedDate = $("#selectedDate");

    // map and group all tasks based on DueDate
    const GetTasks = () => {
        AMT.GetTasks();
        let AllTasks = AMT.Tasks.map((value) => {
            return {
                DueDate: value.DueDate,
                task: value.Name,
                time: "12:00pm",
                Description: value.Description,
                Frequency: value.Frequency,
                Id: value.Id,
            };
        });
        return Object.groupBy(AllTasks, ({ DueDate }) => DueDate);
    };

    // get task array
    const tasks = GetTasks();

    //gets current date
    let currentDate = new Date();

    //generates calendar and sets to current date
    function generateCalendar(date) {
        $calendar.empty();
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        $monthYear.text(`${date.toLocaleString("default", { month: "long" })} ${year}`);

        // Create blank days for the first week
        for (let i = 0; i < firstDay; i++) {
            $calendar.append('<div class="blank-day"></div>');
        }

        // Create day cells
        for (let day = 1; day <= daysInMonth; day++) {
            const fullDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const $dayCell = $(`<div class="day">${day}</div>`);
            $dayCell.attr("data-date", fullDate);

            if (tasks[fullDate]) {
                $dayCell.css({ backgroundColor: "#673ab7", color: "#fff" });
            }

            if (new Date().toDateString() === new Date(year, month, day).toDateString()) {
                $dayCell.addClass("today");
            }

            $dayCell.on("click", function () {
                showTasks(fullDate);
            });

            $calendar.append($dayCell);
        }
    }

    function showTasks(date) {
        // Ensure jQuery methods are used consistently
        $selectedDate.text(date);
        $taskList.empty(); // Clears the existing task list

        if (tasks[date]) {
            tasks[date].forEach(({ task, time, Frequency, Description }) => {
                const taskItem = `<li>[Every ${Frequency} Days] ${task} @ ${time} - ${Description}</li>`; // Create list item as HTML string
                $taskList.append(taskItem); // Append to task list using jQuery
            });
        } else {
            $taskList.append("<li>No tasks</li>"); // Add "No tasks" message
        }
    }

    $("#prevMonth").on("click", function () {
        currentDate.setMonth(currentDate.getMonth() - 1);
        generateCalendar(currentDate);
    });

    $("#nextMonth").on("click", function () {
        currentDate.setMonth(currentDate.getMonth() + 1);
        generateCalendar(currentDate);
    });

    generateCalendar(currentDate);
});
