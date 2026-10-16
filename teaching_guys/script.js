// let name = "SSD";
// let cgpa = 4.00;

// let courses = ["AI","DBMS","DLD","SPL","OOP"];
// let n = courses.length;
// courses.sort();
// courses.reverse();
// let res = courses.join("");

// for(let i=0;i<n;i++)
// {
//     console.log(courses[i]);
// }

// function calc(mark1, mark2)
// {
//     return mark1 + mark2;
// }

// let ans = calc(10,15);

// console.log(ans)

// function pressMe()
// {
//     let numb = Number(document.getElementById("info2").value);
//     numb += 0.5476874
//     numb = numb.toFixed(2);
//     document.getElementById("output").innerHTML = numb;
// }

let dailyGoal = 2000;
let total = 0;
let cnt = 0;

function calcCalories()
{
    cnt += 1;
    let cal = Number(document.getElementById("cal").value);
    total += cal;
    document.getElementById("output").innerHTML = "<br>";
    document.getElementById("output").innerHTML = "total calories consumed so far = " + total;

    // if(cnt >= 10)
    // {
    //     if(total <= 2000)
    //     {
    //         document.getElementById("output2").innerHTML = "Be cautious of frequent snacking!";
    //     }

    //     return;
    // }

    if(cnt >= 10 && total <= 2000)
    {
        document.getElementById("output2").innerHTML = "Be cautious of frequent snacking!";
    }
    else if(total >= 0 && total <= 800)
    {
        document.getElementById("output2").innerHTML = "You’re off to a healthy start!";
    }
    else if(total >= 801 && total <= 1600)
    {
        document.getElementById("output2").innerHTML = "Good progress, keep it balanced!";
    }
    else if(total >= 1601 && total <= 1999)
    {
        document.getElementById("output2").innerHTML = "Almost at your limit!";
    }
    else if(total >= 2000)
    {
        document.getElementById("output2").innerHTML = "Goal reached! Stay mindful!";
    }
    
}
