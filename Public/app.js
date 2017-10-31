fetch('https://hacker-news.firebaseio.com/v0/topstories.json', {method: 'get'})
    .then(function (response) {
        response.json().then(function (data) {
            for (i = 0; i < 10; i++) {
                let story = data[i]
                fetch(`https://hacker-news.firebaseio.com/v0/item/${data[i]}.json`, {method: 'get'})
                    .then(function (response1) {
                        response1.json().then(function (data1) {
                            let authorID = data1.by
                            // console.log(authorID)
                            fetch(`https://hacker-news.firebaseio.com/v0/user/${authorID}.json`, {method: 'get'})
                            .then(function (response2) {
                                response2.json().then(function (data2) {
                                    // let authorID = data1.by
                                    console.log(data2)



                        })})})
                    })
            }


        });

        // //get top stories then set ID's to var to pass in below
    })






// .then(fetch('https://hacker-news.firebaseio.com/v0/item/15596308.json', {method: 'get'})

// .then(function (response) {console.log(response)}



// ,fetch('https://hacker-news.firebaseio.com/v0/user/etblg.json', {method: 'get'})

// .then(function (response) {console.log(response)})


// ));