let goal = 20;
let totalStudyhours = 0;

let session_cnt = 0;
function studyHours() {
    let sub_name = document.getElementById("sn").value;
    let sub_hours = Number(document.getElementById("sh").value);
    session_cnt++;
    totalStudyhours += sub_hours;
    let avg = studyHours / session_cnt;
    document.getElementById("DisplayArea").innerHTML = "Total Study hours" + totalStudyhours;
    document.getElementById("DisplayArea").innerHTML = "Average Study hours" + avg;
    document.getElementById("DisplayArea").innerHTML = "Subjects:" + sub_name;
    if (session_cnt == 7 && totalStudyhours < 20) {
        document.getElementById("DisplayArea").innerHTML = "Increase";
    }
    else if (totalStudyhours > 0 && totalStudyhours <= 5) {
        document.getElementById("DisplayArea").innerHTML = "Start Studying regularly!"

    }
    else if (totalStudyhours >= 6 && totalStudyhours <= 12) {
        document.getElementById("DisplayArea").innerHTML = "Good";
    }
    else if (totalStudyhours >= 13 && totalStudyhours <= 19) {
        document.getElementById("DisplayArea").innerHTML = "Almost"
    }
    else {
        document.getElementById("DisplayArea").innerHTML = "Weekly"
    }


}