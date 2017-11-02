document.body.onload = () => {

    let numZMAGwants = 10;
    fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
    .then((r) => {r.json().then((data) => {
        let storiesObject = [];
        for (i = 0; i < numZMAGwants; i++) {
            function getRandom() {return data[Math.floor(Math.random() * data.length)]}
            let rando = getRandom()
            console.log(rando)

    fetch(`https://hacker-news.firebaseio.com/v0/item/${rando}.json`)
    .then((r2) => {r2.json().then((data1) => {
        let authorID = data1.by
        let storyName = data1.title
        let storyURL = data1.url
        let timeStamp = data1.time
        let storyScore = data1.score

    fetch(`https://hacker-news.firebaseio.com/v0/user/${authorID}.json`)
    .then((r3) => {r3.json().then((data2) => {
        let authorKarma = data2.karma
        storiesObject.push({storyScore, authorID, storyName, storyURL,timeStamp})
         
        
    $("#input").append(`
                        <div class="mainload" data-sort='${storyScore}'>
                        <div id="storydescription">Story: <strong>${storyName}</strong></div><br>
                        <div id="storytitle"><strong>User:</strong> ${authorID}</div>
                        <div class="storydescription2"><strong>Score:</strong> <h6>${storyScore}</h6></div><br><br>
                        <p class="storydescription3"><strong>Karma:</strong> ${authorKarma}
                        <br><strong>URL:</strong> ${storyURL}</p> 
                        </div>`)

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