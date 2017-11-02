document.body.onload = () => {
//set the number that was requested
    let numZMAGwants = 10;
        //imported first API
    fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
            //took the data and made it usable
    .then((r) => {r.json().then((data) => {
            //created the array I will use to sort later
        let storiesObject = [];
        for (i = 0; i < numZMAGwants; i++) {
            //used this handy function I made to grab a random story 
            function getRandom() {return data[Math.floor(Math.random() * data.length)]}
            //called it
            let rando = getRandom()
            //imported second Api, using my rando ID and remaining in for loop
    fetch(`https://hacker-news.firebaseio.com/v0/item/${rando}.json`)
            //took the second set of data and made it usable
    .then((r2) => {r2.json().then((data1) => {
            //set my variables based on indexed stuff
        let authorID = data1.by
        let storyName = data1.title
        let storyURL = data1.url
        let timeStamp = data1.time
        let storyScore = data1.score
            //imported my third api using the author id gained from second fetch
    fetch(`https://hacker-news.firebaseio.com/v0/user/${authorID}.json`)
            //took the second set of data and made it usable
    .then((r3) => {r3.json().then((data2) => {
            //set my karma score for usage in appending
        let authorKarma = data2.karma
            //set future pushes for sorting
        storiesObject.push({storyScore, authorID, storyName, storyURL,timeStamp, authorKarma})
         
        //appended everything using object literals, still within same for loop
    $("#input").append(`
                        <div class="mainload" data-sort='${storyScore}'>
                        <div id="storydescription">Story: <strong>${storyName}</strong></div><br>
                        <div id="storytitle"><strong>User:</strong> ${authorID}</div>
                        <div class="storydescription2"><strong>Score:</strong> <h6>${storyScore}</h6></div><br><br>
                        <p class="storydescription3"><strong>Karma:</strong> ${authorKarma}
                        <br><strong>URL:</strong> ${storyURL}</p> 
                        </div>`)
                        //sorting function i used on a different project. Not curtailed to this to work, but can change when I have free time.
                        $('#input').sort((a, b) => {
                                  var contentA = parseInt($(a).attr('data-sort'));
                                  var contentB = parseInt($(b).attr('data-sort'));
                                  return (contentA < contentB) ? -1 : (contentA > contentB) ? 1 : 0;
                               })
                                        })
                                    })
                            })
                        })
                }

            })
        })

}